-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE congregaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE turno_voluntarios ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS (To avoid infinite recursion)
-- Defined in PUBLIC schema because users cannot create in AUTH schema
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public -- Secure search path
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_congregation()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public -- Secure search path
AS $$
  SELECT congregacion FROM public.users WHERE id = auth.uid();
$$;

-- 1. USERS
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can view members of same congregation
DROP POLICY IF EXISTS "Users can view members of same congregation" ON users;
CREATE POLICY "Users can view members of same congregation" ON users
  FOR SELECT USING (
    congregacion::text = public.get_my_congregation()::text
    OR 
    public.get_my_role() = 'ADMIN_GLOBAL'
  );

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 2. CONGREGACIONES
-- Readable by all authenticated users
CREATE POLICY "Congregaciones are viewable by everyone" ON congregaciones
  FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Ultra Admins can manage congregaciones" ON congregaciones
  FOR ALL USING (
    public.get_my_role() = 'ADMIN_GLOBAL'
  );

-- 3. SITIOS
-- Readable by all
CREATE POLICY "Sitios are viewable by everyone" ON sitios
  FOR SELECT USING (true);

-- Writable only by Admins/Captains of that congregation or Ultra Admin
CREATE POLICY "Admins/Captains can manage sitios of their congregation" ON sitios
  FOR ALL USING (
    (
      (public.get_my_role() IN ('ADMIN_LOCAL', 'CAPITAN', 'ADMIN_GLOBAL'))
      AND 
      (congregacion_id::text = public.get_my_congregation()::text)
    )
    OR
    public.get_my_role() = 'ADMIN_GLOBAL'
  );

-- 4. TURNOS
-- View turnos of own congregation OR global admins
CREATE POLICY "View turnos of own congregation" ON turnos
  FOR SELECT USING (
    exists (
      select 1 from sitios
      where sitios.id = turnos.sitio_id
      and (
        sitios.congregacion_id::text = public.get_my_congregation()::text
        OR
        public.get_my_role() = 'ADMIN_GLOBAL'
      )
    )
  );

-- Captains/Admins manage turnos
CREATE POLICY "Captains/Admins manage turnos" ON turnos
  FOR ALL USING (
    public.get_my_role() IN ('ADMIN_LOCAL', 'CAPITAN', 'ADMIN_GLOBAL')
  );

-- 5. TURNO_VOLUNTARIOS (Inscripciones)
-- Users can see their own assignments
CREATE POLICY "View own assignments" ON turno_voluntarios
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- Admins/Captains can see all assignments for their congregation's turns
CREATE POLICY "Admins view assignments" ON turno_voluntarios
  FOR SELECT USING (
    exists (
      select 1 from turnos
      join sitios on sitios.id = turnos.sitio_id
      where turnos.id = turno_voluntarios.turno_id
      and (
        sitios.congregacion_id::text = public.get_my_congregation()::text
        OR
        public.get_my_role() = 'ADMIN_GLOBAL'
      )
      and public.get_my_role() IN ('ADMIN_LOCAL', 'CAPITAN', 'ADMIN_GLOBAL')
    )
  );

-- Users can join turnos
CREATE POLICY "Users can join turnos" ON turno_voluntarios
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can leave turnos
CREATE POLICY "Users can leave turnos" ON turno_voluntarios
  FOR DELETE USING (auth.uid()::text = user_id::text);
