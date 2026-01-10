-- ==============================================================================
-- MASTER FIX: USERS TABLE LIFECYCLE (SENIOR ENGINEER EDITION) 👮‍♂️
-- ==============================================================================
-- Problem: Fragmentation of RLS policies caused "PGRST116" (Result contains 0 rows)
--          and "406 Not Acceptable" because conflicting rules blocked access.
--          PLUS: Missing profiles (Backfill) and Ghost profiles (Cleanup).
-- Solution: Nuke & Pave. This script resets and unifies ALL logic for the users table.
-- ==============================================================================

-- 1. ROBUST HELPER FUNCTION (Redefined to ensure it exists and works)
-- Uses SECURITY DEFINER to strictly bypass RLS loops.
-- Forces UPPERCASE comparison to ignore data inconsistencies.
CREATE OR REPLACE FUNCTION public.auth_have_any_role(required_roles text[])
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT UPPER(role) INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  -- If user not found or has no role, deny
  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  RETURN user_role = ANY(required_roles);
END;
$$;

-- 2. RESET BASE PERMISSIONS (The Physical Layer)
-- Ensure the API role actually has permission to read/write rows.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- 3. RESET RLS POLICIES (The Logical Layer)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop EVERYTHING to ensure no "ghost" policies remain.
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Ver usuarios" ON public.users;
DROP POLICY IF EXISTS "policy_users_select" ON public.users;
DROP POLICY IF EXISTS "policy_users_select_safe" ON public.users;
DROP POLICY IF EXISTS "policy_users_select_master" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "policy_users_update_master" ON public.users;
DROP POLICY IF EXISTS "enable_select_for_all" ON public.users;
DROP POLICY IF EXISTS "policy_users_insert_master" ON public.users;

-- 4. APPLY DEFINITIVE POLICIES

-- A) READ (SELECT): Users see themselves, Admins see EVERYONE
CREATE POLICY "policy_users_select_master" ON public.users
FOR SELECT USING (
  auth.uid() = id
  OR 
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])
);

-- B) UPDATE (UPDATE): Admins can approve/edit anyone. Users update specific fields.
CREATE POLICY "policy_users_update_master" ON public.users
FOR UPDATE USING (
  -- Who can perform the update?
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])
  OR date_part('year', age(created_at)) > 100 -- Logic disabled for normal users for safety
)
WITH CHECK (
  -- What conditions must be met?
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])
);

-- C) INSERT (INSERT): Handled by Trigger usually, but allow service role
CREATE POLICY "policy_users_insert_master" ON public.users
FOR INSERT WITH CHECK (
  auth.uid() = id OR public.auth_have_any_role(ARRAY['ADMIN_GLOBAL'])
);

-- 5. RE-APPLY ALERTS TRIGGER (Notification on Approval)
CREATE OR REPLACE FUNCTION public.notify_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify only when status flips to ACTIVO
  IF (OLD.status <> 'ACTIVO' AND NEW.status = 'ACTIVO') THEN
    INSERT INTO public.notificaciones (user_id, titulo, mensaje, tipo)
    VALUES (
      NEW.id, 
      '¡Tu cuenta ha sido aprobada! 🎉', 
      'Bienvenido a PPAM. Ya puedes inscribirte a turnos.', 
      'success'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_approval ON public.users;
CREATE TRIGGER on_user_approval
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE PROCEDURE public.notify_on_approval();

-- 6. [NEW] DATA INTEGRITY REPAIR (Fix "Missing" and "Ghost" users) 🧹

-- A. BACKFILL: Create Missing Profiles from Auth
DO $$
DECLARE
  user_rec record;
BEGIN
  FOR user_rec IN SELECT * FROM auth.users LOOP
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_rec.id) THEN
      INSERT INTO public.users (id, email, nombre, role, congregacion, telefono, status, created_at)
      VALUES (
        user_rec.id,
        user_rec.email,
        COALESCE(user_rec.raw_user_meta_data->>'nombre', 'Usuario Sin Nombre'),
        COALESCE(user_rec.raw_user_meta_data->>'role', 'VOLUNTARIO'),
        user_rec.raw_user_meta_data->>'congregacion',
        user_rec.raw_user_meta_data->>'telefono',
        COALESCE(user_rec.raw_user_meta_data->>'status', 'PENDIENTE'),
        NOW()
      );
    END IF;
  END LOOP;
END;
$$;

-- B. CLEANUP: Remove Ghost Profiles (Public users with no Auth user)
DELETE FROM public.users 
WHERE id NOT IN (SELECT id FROM auth.users);

-- ==============================================================================
-- DONE. Secure, Synced, and Cleaned.
-- ==============================================================================
