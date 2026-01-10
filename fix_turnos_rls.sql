-- ==============================================================================
-- FIX RLS POLICIES FOR TURNOS MODULE (ROBUST VERSION) 🛡️
-- Addresses Error 42501 by using SECURITY DEFINER functions to bypass cross-table RLS issues
-- ==============================================================================

-- 1. Ensure RLS is enabled
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turno_voluntarios ENABLE ROW LEVEL SECURITY;

-- 2. Create Helper Function (SECURITY DEFINER)
-- This function runs with the privileges of the creator (postgres/superuser), 
-- allowing it to check the user's role in public.users without being blocked by RLS policies on public.users.
CREATE OR REPLACE FUNCTION public.auth_has_role(valid_roles text[])
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get the role of the current authenticated user
  SELECT role INTO current_user_role
  FROM public.users
  WHERE id = auth.uid();
  
  -- Check if the role is in the list of valid roles
  RETURN current_user_role = ANY(valid_roles);
END;
$$;

-- ==============================================================================
-- 3. TURNOS TABLE POLICIES (Using Helper)
-- ==============================================================================

-- READ: All authenticated users
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.turnos;
CREATE POLICY "Enable read access for authenticated users" ON public.turnos
FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT: Admins and Captains
DROP POLICY IF EXISTS "Enable insert for Admins and Captains" ON public.turnos;
CREATE POLICY "Enable insert for Admins and Captains" ON public.turnos
FOR INSERT WITH CHECK (
  public.auth_has_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL', 'CAPITAN'])
);

-- UPDATE: Admins and Captains
DROP POLICY IF EXISTS "Enable update for Admins and Captains" ON public.turnos;
CREATE POLICY "Enable update for Admins and Captains" ON public.turnos
FOR UPDATE USING (
  public.auth_has_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL', 'CAPITAN'])
);

-- DELETE: Only Admins
DROP POLICY IF EXISTS "Enable delete for Admins" ON public.turnos;
CREATE POLICY "Enable delete for Admins" ON public.turnos
FOR DELETE USING (
  public.auth_has_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])
);

-- ==============================================================================
-- 4. SITIOS TABLE POLICIES
-- ==============================================================================

-- READ: All authenticated
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.sitios;
CREATE POLICY "Enable read access for authenticated users" ON public.sitios
FOR SELECT USING (auth.role() = 'authenticated');

-- MANAGE: Admins and Captains
DROP POLICY IF EXISTS "Enable manage for Admins and Captains" ON public.sitios;
CREATE POLICY "Enable manage for Admins and Captains" ON public.sitios
FOR ALL USING (
  public.auth_has_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL', 'CAPITAN'])
);

-- ==============================================================================
-- 5. TURNO_VOLUNTARIOS POLICIES
-- ==============================================================================

-- READ
DROP POLICY IF EXISTS "Enable read access on signups" ON public.turno_voluntarios;
CREATE POLICY "Enable read access on signups" ON public.turno_voluntarios
FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT (Self signup)
DROP POLICY IF EXISTS "Enable self signup" ON public.turno_voluntarios;
CREATE POLICY "Enable self signup" ON public.turno_voluntarios
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- UPDATE (Self report)
DROP POLICY IF EXISTS "Enable self report update" ON public.turno_voluntarios;
CREATE POLICY "Enable self report update" ON public.turno_voluntarios
FOR UPDATE USING (
  auth.uid() = user_id
);

-- DELETE (Self cancel OR Admin remove)
DROP POLICY IF EXISTS "Enable cancel signup" ON public.turno_voluntarios;
CREATE POLICY "Enable cancel signup" ON public.turno_voluntarios
FOR DELETE USING (
  auth.uid() = user_id 
  OR 
  public.auth_has_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])
);
