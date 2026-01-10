-- ==============================================================================
-- FINAL ROBUST FIX: SAFE APPROVALS 🛡️
-- Addresses: Error when changing status (Trigger Crash) & Ghost Users
-- ==============================================================================

-- 1. ENSURE NOTIFICATIONS TABLE EXISTS
-- If this table was missing, the trigger would crash the whole update.
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid not null, -- Removed FK constraint temporarily to prevent crashing on ghost users
  titulo text not null,
  mensaje text not null,
  leido boolean default false,
  tipo text default 'info'::text,
  metadata jsonb default '{}'::jsonb
);

-- Ensure permissions on notifications
GRANT ALL ON TABLE public.notificaciones TO authenticated;
GRANT ALL ON TABLE public.notificaciones TO service_role;

-- 2. SAFE TRIGGER (EXCEPTION HANDLING)
-- Wraps the notification logic in a "Safety Block".
-- If sending the notification fails for ANY reason, it ignores the error 
-- and allows the User Update to proceed successfully.
CREATE OR REPLACE FUNCTION public.notify_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    -- Only run if status changes to ACTIVO
    IF (OLD.status <> 'ACTIVO' AND NEW.status = 'ACTIVO') THEN
      INSERT INTO public.notificaciones (user_id, titulo, mensaje, tipo)
      VALUES (
        NEW.id, 
        '¡Tu cuenta ha sido aprobada! 🎉', 
        'Bienvenido a PPAM. Ya puedes inscribirte a turnos.', 
        'success'
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- If error occurs (e.g. user not found in auth), Log it but DO NOT FAIL
    RAISE WARNING 'Error sending notification for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- 3. RE-BIND TRIGGER
DROP TRIGGER IF EXISTS on_user_approval ON public.users;
CREATE TRIGGER on_user_approval
AFTER UPDATE ON public.users
FOR EACH ROW
EXECUTE PROCEDURE public.notify_on_approval();

-- 4. CLEANUP GHOST USERS (Aggressive)
-- Removes any user from the public list that doesn't verify against the Auth system.
DELETE FROM public.users 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 5. FINAL PERMISSION CHECK
-- Grant Update on users specifically to avoid any ambiguity
GRANT UPDATE ON TABLE public.users TO authenticated;
