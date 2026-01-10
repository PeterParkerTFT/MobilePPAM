-- ==============================================================================
-- FINAL SECURITY FIX: PERMISSIONS & RLS (SENIOR LEVEL) 🛡️
-- ==============================================================================
-- This script addresses the entire security stack:
-- 1. Base Table Privileges (GRANT) - Often the hidden cause of 42501
-- 2. Row Level Security (RLS) - The logic to filter rows
-- 3. Robust Role Checking - Case-insensitive and recursion-safe
-- ==============================================================================

-- A) BASE PRIVILEGES (The Foundation)
-- Ensure 'authenticated' users have physical permission to touch these tables.
-- RLS cannot work if the user doesn't even have table access.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.turnos TO authenticated;
GRANT ALL ON TABLE public.sitios TO authenticated;
GRANT ALL ON TABLE public.turno_voluntarios TO authenticated;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.notificaciones TO authenticated;

-- B) ROBUST ROLE CHECKER (The Logic)
-- Using SECURITY DEFINER to bypass RLS recursion loops securely.
-- Added UPPER() to handle any case inconsistencies (e.g. 'Admin' vs 'ADMIN').
CREATE OR REPLACE FUNCTION public.auth_have_any_role(required_roles text[])
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  -- Fetch role safely
  SELECT UPPER(role) INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  -- Check intersection
  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  RETURN user_role = ANY(required_roles);
END;
$$;

-- C) CLEAN SLATE (Removes conflicts)
-- Drop ALL existing policies to ensure no legacy restrictive rules interfere.
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.turnos;
DROP POLICY IF EXISTS "Enable insert for Admins and Captains" ON public.turnos;
DROP POLICY IF EXISTS "Enable update for Admins and Captains" ON public.turnos;
DROP POLICY IF EXISTS "Enable delete for Admins" ON public.turnos;
-- Drop legacy naming variations
DROP POLICY IF EXISTS "Turnos View All" ON public.turnos;
DROP POLICY IF EXISTS "Turnos Insert Admin" ON public.turnos;

-- D) NEW POLICIES (Turnos)
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;

-- 1. SELECT (Universal Access)
CREATE POLICY "policy_turnos_select" ON public.turnos
FOR SELECT USING (auth.role() = 'authenticated');

-- 2. INSERT (Admin Global, Admin Local, Capitan)
-- Note: 'CAPITAN', 'ADMIN_GLOBAL' match the enum UPPERCASE values
CREATE POLICY "policy_turnos_insert" ON public.turnos
FOR INSERT WITH CHECK (
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL', 'CAPITAN'])
);

-- 3. UPDATE (Admin Global, Admin Local, Capitan)
CREATE POLICY "policy_turnos_update" ON public.turnos
FOR UPDATE USING (
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL', 'CAPITAN'])
);

-- 4. DELETE (Admins Only)
CREATE POLICY "policy_turnos_delete" ON public.turnos
FOR DELETE USING (
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])
);

-- E) SITES POLICIES (Allow Implicit Creation)
DROP POLICY IF EXISTS "policy_sitios_manage" ON public.sitios;
CREATE POLICY "policy_sitios_manage" ON public.sitios
FOR ALL USING (
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL', 'CAPITAN'])
);
-- Ensure read exists
DROP POLICY IF EXISTS "policy_sitios_read" ON public.sitios;
CREATE POLICY "policy_sitios_read" ON public.sitios
FOR SELECT USING (auth.role() = 'authenticated');

-- ==============================================================================
-- DONE.
-- If this fails, the user attempting the action is definitely NOT
-- one of the allowed roles in the 'public.users' table.
-- ==============================================================================
