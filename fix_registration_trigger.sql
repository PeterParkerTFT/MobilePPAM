-- ==============================================================================
-- FIX REGISTRATION & LOGIN (MISSING PROFILE ISSUE) 🩺
-- Addresses Error: 406 Not Acceptable / "Usuario no encontrado"
-- Trigger-based User Creation Logic
-- ==============================================================================

-- 1. Ensure the trigger function exists
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
  );
  RETURN new;
END;
$$;

-- 2. Bind the trigger to the Auth table
-- Drop first to avoid duplicates/errors if it exists but is broken
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. [CRITICAL] Backfill for existing users (If they registered while trigger was broken)
-- Use DO block to insert missing profiles based on Auth data
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
        user_rec.raw_user_meta_data->>'nombre',
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

-- 4. Ensure Permissions (Grant Access to Users table)
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- 5. RLS Policy for Users (Ensure they can READ their own profile)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT USING (
  auth.uid() = id
  OR 
  -- Allow Admins to see all (using our helper if available, or simplified logic)
  EXISTS (
    SELECT 1 FROM public.users AS u_admin
    WHERE u_admin.id = auth.uid() 
    AND u_admin.role IN ('ADMIN_GLOBAL', 'ADMIN_LOCAL')
  )
);
