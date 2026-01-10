-- ==============================================================================
-- FIX RLS POLICIES FOR TURNOS MODULE 🛡️
-- Addresses Error 42501 (RLS Violation) when creating/viewing turnos
-- ==============================================================================

-- 1. Ensure RLS is enabled on relevant tables
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sitios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turno_voluntarios ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- HELPERS (Inline logic to avoid dependency on other scripts)
-- ==============================================================================

-- ==============================================================================
-- 2. TURNOS TABLE POLICIES
-- ==============================================================================

-- READ: All authenticated users can see turnos (filtering is done via UI/Query usually)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.turnos;
CREATE POLICY "Enable read access for authenticated users" ON public.turnos
FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT: Only Admins and Captains can create turnos
DROP POLICY IF EXISTS "Enable insert for Admins and Captains" ON public.turnos;
CREATE POLICY "Enable insert for Admins and Captains" ON public.turnos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN_GLOBAL', 'ADMIN_LOCAL', 'CAPITAN')
  )
);

-- UPDATE: Admins and Captains can edit turnos
DROP POLICY IF EXISTS "Enable update for Admins and Captains" ON public.turnos;
CREATE POLICY "Enable update for Admins and Captains" ON public.turnos
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN_GLOBAL', 'ADMIN_LOCAL', 'CAPITAN')
  )
);

-- DELETE: Only Admins can delete turnos
DROP POLICY IF EXISTS "Enable delete for Admins" ON public.turnos;
CREATE POLICY "Enable delete for Admins" ON public.turnos
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN_GLOBAL', 'ADMIN_LOCAL')
  )
);

-- ==============================================================================
-- 3. SITIOS TABLE POLICIES
-- ==============================================================================

-- READ: All authenticated users
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.sitios;
CREATE POLICY "Enable read access for authenticated users" ON public.sitios
FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT/UPDATE: Admins and Captains (implicit creation from Turnos)
DROP POLICY IF EXISTS "Enable manage for Admins and Captains" ON public.sitios;
CREATE POLICY "Enable manage for Admins and Captains" ON public.sitios
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN_GLOBAL', 'ADMIN_LOCAL', 'CAPITAN')
  )
);

-- ==============================================================================
-- 4. TURNO_VOLUNTARIOS POLICIES (Signups)
-- ==============================================================================

-- READ: All authenticated users (to see who is in a shift)
DROP POLICY IF EXISTS "Enable read access on signups" ON public.turno_voluntarios;
CREATE POLICY "Enable read access on signups" ON public.turno_voluntarios
FOR SELECT USING (auth.role() = 'authenticated');

-- INSERT: Users can sign THEMSELVES up
DROP POLICY IF EXISTS "Enable self signup" ON public.turno_voluntarios;
CREATE POLICY "Enable self signup" ON public.turno_voluntarios
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- UPDATE: Users can update their own report (asistencia, comments)
DROP POLICY IF EXISTS "Enable self report update" ON public.turno_voluntarios;
CREATE POLICY "Enable self report update" ON public.turno_voluntarios
FOR UPDATE USING (
  auth.uid() = user_id
);

-- DELETE: Users can cancel own signup, Admins can remove others
DROP POLICY IF EXISTS "Enable cancel signup" ON public.turno_voluntarios;
CREATE POLICY "Enable cancel signup" ON public.turno_voluntarios
FOR DELETE USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('ADMIN_GLOBAL', 'ADMIN_LOCAL')
  )
);
