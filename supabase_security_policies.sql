-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE congregaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE turno_voluntarios ENABLE ROW LEVEL SECURITY;

-- 1. USERS
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can view members of same congregation
CREATE POLICY "Users can view members of same congregation" ON users
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id::text FROM users WHERE congregacion::text = users.congregacion::text
    )
    OR 
    exists (select 1 from users where id::text = auth.uid()::text and role = 'ultraadmin')
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- 2. CONGREGACIONES
-- Readable by all authenticated users
CREATE POLICY "Congregaciones are viewable by everyone" ON congregaciones
  FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Ultra Admins can manage congregaciones" ON congregaciones
  FOR ALL USING (
    exists (select 1 from users where id::text = auth.uid()::text and role = 'ultraadmin')
  );

-- 3. SITIOS
-- Readable by all
CREATE POLICY "Sitios are viewable by everyone" ON sitios
  FOR SELECT USING (true);

-- Writable only by Admins/Captains of that congregation or Ultra Admin
CREATE POLICY "Admins/Captains can manage sitios of their congregation" ON sitios
  FOR ALL USING (
    exists (
      select 1 from users 
      where id::text = auth.uid()::text 
      and (role = 'admin' OR role = 'capitan' OR role = 'ultraadmin')
      and (congregacion::text = sitios.congregacion_id::text OR role = 'ultraadmin')
    )
  );

-- 4. TURNOS
-- View turnos of own congregation
CREATE POLICY "View turnos of own congregation" ON turnos
  FOR SELECT USING (
    exists (
      select 1 from sitios
      join users on users.congregacion::text = sitios.congregacion_id::text
      where sitios.id = turnos.sitio_id
      and users.id::text = auth.uid()::text
    )
    OR
    exists (select 1 from users where id::text = auth.uid()::text and role = 'ultraadmin')
  );

-- Captains/Admins manage turnos
CREATE POLICY "Captains/Admins manage turnos" ON turnos
  FOR ALL USING (
    exists (
      select 1 from users 
      where id::text = auth.uid()::text 
      and (role = 'admin' OR role = 'capitan' OR role = 'ultraadmin')
    )
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
      join users on users.congregacion::text = sitios.congregacion_id::text
      where turnos.id = turno_voluntarios.turno_id
      and users.id::text = auth.uid()::text
      and (users.role = 'admin' OR users.role = 'capitan' OR users.role = 'ultraadmin')
    )
  );

-- Users can join turnos
CREATE POLICY "Users can join turnos" ON turno_voluntarios
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can leave turnos
CREATE POLICY "Users can leave turnos" ON turno_voluntarios
  FOR DELETE USING (auth.uid()::text = user_id::text);
