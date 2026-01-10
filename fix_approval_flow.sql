-- ==============================================================================
-- FIX APPROVAL FLOW & NOTIFICATIONS 📨
-- Addresses:
-- 1. Error 406/PGRST116 (Cannot update user due to missing Permissions/RLS)
-- 2. Auto-notification when a user is Approved
-- ==============================================================================

-- A) FIX PERMISSIONS (Allow Admins to UPDATE users) 🔓
-- ----------------------------------------------------
-- Required to change status from 'PENDIENTE' to 'ACTIVO'

-- 1. Grant Update Permission specifically
GRANT UPDATE ON TABLE public.users TO authenticated;

-- 2. Create RLS Policy for Updates
-- Uses our trusted Security Definer function to check for Admin role
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
CREATE POLICY "Admins can update users" ON public.users
FOR UPDATE USING (
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])
);

-- B) AUTO-NOTIFICATION TRIGGER 🔔
-- ----------------------------------------------------
-- Automatically sends an in-app notification when status changes to 'ACTIVO'

CREATE OR REPLACE FUNCTION public.notify_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if status changed to 'ACTIVO' (Aprobado)
  IF (OLD.status <> 'ACTIVO' AND NEW.status = 'ACTIVO') THEN
    INSERT INTO public.notificaciones (user_id, titulo, mensaje, tipo)
    VALUES (
      NEW.id, 
      '¡Tu cuenta ha sido aprobada! 🎉', 
      'Bienvenido a PPAM. Ya puedes inscribirte a turnos y ver los mapas.', 
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

-- C) ENSURE NOTIFICATIONS ARE WRITABLE
-- ----------------------------------------------------
GRANT ALL ON TABLE public.notificaciones TO authenticated;
GRANT ALL ON TABLE public.notificaciones TO service_role;

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notificaciones;
CREATE POLICY "Admins can create notifications" ON public.notificaciones
FOR INSERT WITH CHECK (
  -- Allow Trigger (which runs as definer) or Admins
  true 
);
