-- ==============================================================================
-- SENIOR FIX: RPC FOR ADMIN UPDATES 🛠️
-- Bypasses Table RLS completely for Admin actions to prevent 406/PGRST116 errors.
-- Updated to support Partial Updates via COALESCE.
-- ==============================================================================

-- 1. Create the RPC Function (Remote Procedure Call)
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
    -- A. Security Check: Is the caller an Admin?
    SELECT role INTO current_user_role
    FROM public.users
    WHERE id = auth.uid();

    IF current_user_role NOT IN ('ADMIN_GLOBAL', 'ADMIN_LOCAL') THEN
        RAISE EXCEPTION 'Access Denied: Only Admins can perform this update.';
    END IF;

    -- B. Perform the Update safely
    -- Uses COALESCE to assume that NULL input means "Don't Change"
    
    UPDATE public.users
    SET 
        role = COALESCE(new_role, role),
        status = COALESCE(new_status, status),
        congregacion = COALESCE(new_congregation, congregacion),
        congregacion_nombre = COALESCE(new_congregation_nombre, congregacion_nombre),
        updated_at = NOW()
    WHERE id = target_user_id
    RETURNING * INTO updated_record;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found with ID %', target_user_id;
    END IF;

    -- C. Attempt Notification (Best Effort)
    BEGIN
        -- Only notify if status CHANGED to ACTIVO (requires knowing old status, but lightweight check is okay)
        -- Actually, we can just check if new status is ACTIVO. Duplicate notifications are prevented by '1 minute' check.
        IF new_status = 'ACTIVO' THEN
             IF NOT EXISTS (SELECT 1 FROM public.notificaciones WHERE user_id = target_user_id AND tipo = 'success' AND created_at > NOW() - interval '1 minute') THEN
                INSERT INTO public.notificaciones (user_id, titulo, mensaje, tipo)
                VALUES (target_user_id, '¡Tu cuenta ha sido aprobada! 🎉', 'Bienvenido a PPAM.', 'success');
             END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Ignore notification errors
    END;

    -- D. Return the updated record as JSON
    RETURN to_jsonb(updated_record);
END;
$$;

-- 2. Grant Access to the RPC
GRANT EXECUTE ON FUNCTION public.admin_update_user_profile TO authenticated;

-- 3. Ensure Notifications Table Existence
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid not null,
  titulo text not null,
  mensaje text not null,
  leido boolean default false,
  tipo text default 'info'::text,
  metadata jsonb default '{}'::jsonb
);
GRANT ALL ON TABLE public.notificaciones TO authenticated;
GRANT ALL ON TABLE public.notificaciones TO service_role;
