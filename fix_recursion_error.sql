-- ==============================================================================
-- FIX INFINITE RECURSION ERROR (42P17) 🌀
-- Addresses: "infinite recursion detected in policy for relation users"
-- ==============================================================================

-- 1. Ensure the Helper Function Exists (SECURITY DEFINER is Key!)
-- This breaks the loop because it runs as Superuser/Owner, ignoring the RLS on 'users' 
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
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  RETURN user_role = ANY(required_roles);
END;
$$;

-- 2. FIX USERS TABLE POLICY (The Source of Recursion)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Ver usuarios" ON public.users;
DROP POLICY IF EXISTS "policy_users_select" ON public.users;

-- Create the Safe Policy
-- Uses the SECURITY DEFINER function for the Admin check instead of a direct subquery
CREATE POLICY "policy_users_select_safe" ON public.users
FOR SELECT USING (
  auth.uid() = id
  OR 
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])
);

-- 3. FIX CONGREGATIONS/SITIOS RECURSION (Safety Net)
-- Ensure other tables don't accidentally recurse back to users via bad policies

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.sitios;
CREATE POLICY "Enable read access for authenticated users" ON public.sitios
FOR SELECT USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 4. GRANT PERMISSIONS (Just in case)
-- ==============================================================================
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.turnos TO authenticated;
