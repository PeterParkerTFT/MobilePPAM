-- ==============================================================================
-- MASTER DEPLOY SCRIPT - MOBILE PPAM
-- ==============================================================================
-- 1. Schema Extensions (Columns & Tables)
-- 2. Triggers (User Registration)
-- 3. RPCs (Admin Actions)
-- 4. Security Policies (RLS - The Vault)
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: SCHEMA EXTENSIONS
-- ==============================================================================

-- 1. Support for Contextual Turn Types
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS tipo text; 

-- 2. Support for Territory Notes
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS territorios text;

-- 3. Support for Site Categories
ALTER TABLE sitios ADD COLUMN IF NOT EXISTS event_type text;

-- 4. Support for Captain Assignment
ALTER TABLE turnos ADD COLUMN IF NOT EXISTS capitan_id uuid references auth.users(id);

-- 5. Denormalization for Performance
ALTER TABLE users ADD COLUMN IF NOT EXISTS congregacion_nombre text;

-- 6. Notifications Table (Fixes 404 Error)
create table if not exists public.notificaciones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  mensaje text not null,
  leido boolean default false,
  tipo text default 'info'::text,
  metadata jsonb default '{}'::jsonb
);

-- ==============================================================================
-- SECTION 2: TRIGGERS (REGISTRATION)
-- ==============================================================================

-- Function: Handle New User (Registration Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, nombre, role, congregacion, telefono, status, created_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nombre',
    COALESCE(new.raw_user_meta_data->>'role', 'VOLUNTARIO'),
    new.raw_user_meta_data->>'congregacion',
    new.raw_user_meta_data->>'telefono',
    COALESCE(new.raw_user_meta_data->>'status', 'PENDIENTE'),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Idempotency check
  RETURN new;
END;
$$;

-- Trigger: Bind to Auth Table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- SECTION 3: RPCs (ADMIN POWER)
-- ==============================================================================

-- Function 1: Is Active or Admin (Helper for RLS)
-- [CRITICAL] Prevents Recursion by checking role in separate query if needed, 
-- but straightforward logic with SECURITY DEFINER is usually safe. 
-- We optimize with EXIST(SELECT 1).
CREATE OR REPLACE FUNCTION public.is_active_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Admins (Global/Local) always pass
  IF public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL']) THEN
    RETURN TRUE;
  END IF;

  -- Check status of the current user
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
      AND status IN ('ACTIVO', 'APROBADO')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: Admin Update User (Approvals)
CREATE OR REPLACE FUNCTION public.admin_update_user_profile(
    target_user_id uuid,
    new_role text DEFAULT NULL,
    new_status text DEFAULT NULL,
    new_congregation text DEFAULT NULL,
    new_congregation_nombre text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_role text;
    updated_record record;
BEGIN
    SELECT role INTO current_user_role FROM public.users WHERE id = auth.uid();

    IF current_user_role NOT IN ('ADMIN_GLOBAL', 'ADMIN_LOCAL') THEN
        RAISE EXCEPTION 'Access Denied: Only Admins can perform this update.';
    END IF;

    UPDATE public.users
    SET 
        role = COALESCE(new_role, role),
        status = COALESCE(new_status, status),
        congregacion = COALESCE(new_congregation, congregacion),
        congregacion_nombre = COALESCE(new_congregation_nombre, congregacion_nombre),
        updated_at = NOW()
    WHERE id = target_user_id
    RETURNING * INTO updated_record;

    IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;

    -- Notification Logic
    BEGIN
        IF new_status = 'ACTIVO' OR new_status = 'APROBADO' THEN
             INSERT INTO public.notificaciones (user_id, titulo, mensaje, tipo)
             VALUES (target_user_id, '¡Tu cuenta ha sido aprobada! 🎉', 'Bienvenido. Ya puedes acceder al sistema.', 'success');
        END IF;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    RETURN to_jsonb(updated_record);
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_update_user_profile TO authenticated;

-- ==============================================================================
-- SECTION 4: SECURITY POLICIES (THE VAULT)
-- ==============================================================================

-- [PERFORMANCE] Index for RLS lookups
CREATE INDEX IF NOT EXISTS idx_users_id_status ON public.users(id, status);

-- Enable RLS on all tables
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turno_voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. TURNOS (Locked for PENDING)
DROP POLICY IF EXISTS "Active users can view turnos" ON public.turnos;
CREATE POLICY "Active users can view turnos" ON public.turnos
FOR SELECT USING ( public.is_active_or_admin() );

DROP POLICY IF EXISTS "Active users can create turnos" ON public.turnos;
CREATE POLICY "Active users can create turnos" ON public.turnos
FOR INSERT WITH CHECK ( public.is_active_or_admin() );

DROP POLICY IF EXISTS "Admins can manage turnos" ON public.turnos;
CREATE POLICY "Admins can manage turnos" ON public.turnos
FOR ALL USING ( public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL']) );

-- 2. SITIOS (Locked for PENDING)
DROP POLICY IF EXISTS "Active users can view sitios" ON public.sitios;
CREATE POLICY "Active users can view sitios" ON public.sitios
FOR SELECT USING ( public.is_active_or_admin() );

DROP POLICY IF EXISTS "Active users can create sitios" ON public.sitios;
CREATE POLICY "Active users can create sitios" ON public.sitios
FOR INSERT WITH CHECK ( public.is_active_or_admin() );

-- 3. INSCRIPTIONS
DROP POLICY IF EXISTS "Active users can view inscriptions" ON public.turno_voluntarios;
CREATE POLICY "Active users can view inscriptions" ON public.turno_voluntarios
FOR SELECT USING ( public.is_active_or_admin() );

-- 4. NOTIFICATIONS (Own only)
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notificaciones;
CREATE POLICY "Users can view their own notifications" ON public.notificaciones
FOR SELECT USING ( auth.uid() = user_id );

-- 5. USERS (Profile visibility)
-- [CRITICAL] Prevents Infinite Recursion
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT USING (
  id = auth.uid() -- Can always see self
  OR 
  (public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])) -- Admins can see all (using helper function which doesn't recurse on auth.users directly in a dangerous way if defined correctly, or we use direct role check here)
);
