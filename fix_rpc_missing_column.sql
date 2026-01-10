-- ==============================================================================
-- FIX MISSING COLUMN ERROR ⚙️
-- Addresses: "column 'updated_at' of relation 'users' does not exist"
-- ==============================================================================

-- 1. ADD THE MISSING COLUMN
-- The RPC tries to set 'updated_at', so we must ensure it exists.
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- 2. RE-APPLY THE RPC (Just to be safe and ensure it uses the column correctly)
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
    -- Security Check
    SELECT role INTO current_user_role
    FROM public.users
    WHERE id = auth.uid();

    IF current_user_role NOT IN ('ADMIN_GLOBAL', 'ADMIN_LOCAL') THEN
        RAISE EXCEPTION 'Access Denied: Only Admins can perform this update.';
    END IF;

    -- Update Logic
    UPDATE public.users
    SET 
        role = COALESCE(new_role, role),
        status = COALESCE(new_status, status),
        congregacion = COALESCE(new_congregation, congregacion),
        congregacion_nombre = COALESCE(new_congregation_nombre, congregacion_nombre),
        updated_at = NOW() -- This line caused the error before the column existed
    WHERE id = target_user_id
    RETURNING * INTO updated_record;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found with ID %', target_user_id;
    END IF;

    -- Notification Logic (Robust)
    BEGIN
        IF new_status = 'ACTIVO' THEN
             IF NOT EXISTS (SELECT 1 FROM public.notificaciones WHERE user_id = target_user_id AND tipo = 'success' AND created_at > NOW() - interval '1 minute') THEN
                INSERT INTO public.notificaciones (user_id, titulo, mensaje, tipo)
                VALUES (target_user_id, '¡Tu cuenta ha sido aprobada! 🎉', 'Bienvenido a PPAM.', 'success');
             END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore notification errors
    END;

    RETURN to_jsonb(updated_record);
END;
$$;
