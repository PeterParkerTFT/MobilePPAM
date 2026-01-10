-- ==========================================
-- SCRIPT DE SEGURIDAD "BLINDAJE TOTAL" 🛡️
-- ==========================================
-- Ejecuta este script en el editor SQL de Supabase para aplicar las reglas.

-- 1. Habilitar RLS en todas las tablas claves (por si acaso)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Bloquear tabla legacy (ya no se usa)
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lock pending_users" ON public.pending_users;
CREATE POLICY "Lock pending_users" ON public.pending_users FOR ALL USING (false);

-- ==========================================
-- FUNCIONES HELPER (Seguridad)
-- ==========================================
-- Estas funciones evitan recursión infinita y permiten reglas limpias

CREATE OR REPLACE FUNCTION public.is_admin_global()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN_GLOBAL'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_local()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'ADMIN_LOCAL'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_congregation_id()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT congregacion FROM public.users WHERE id = auth.uid();
$$;

-- ==========================================
-- POLÍTICAS: PUBLIC.USERS
-- ==========================================

-- A) LECTURA (SELECT)
DROP POLICY IF EXISTS "Ver usuarios" ON public.users;
CREATE POLICY "Ver usuarios" ON public.users
FOR SELECT USING (
  -- 1. Un usuario siempre puede verse a sí mismo
  auth.uid() = id
  OR
  -- 2. Admin Global ve a TODOS (para poder aprobar)
  public.is_admin_global()
  OR
  -- 3. Usuarios ven a otros de SU MISMMA congregación (incluye Admin Local viendo los suyos)
  congregacion = public.get_my_congregation_id()
);

-- B) ACTUALIZACIÓN (UPDATE)
DROP POLICY IF EXISTS "Actualizar usuarios" ON public.users;
CREATE POLICY "Actualizar usuarios" ON public.users
FOR UPDATE USING (
  -- 1. Un usuario puede editar su propio perfil (nombre, telefono)
  auth.uid() = id
  OR
  -- 2. Admin Global puede editar CUALQUIERA (aprobar, cambiar rol, borrar)
  public.is_admin_global()
  OR
  -- 3. Admin Local puede editar SOLO a los de su congregación
  (public.is_admin_local() AND congregacion = public.get_my_congregation_id())
);

-- C) INSERCIÓN (INSERT)
-- Generalmente Supabase Auth maneja esto via triggers, pero permitimos insert propio
DROP POLICY IF EXISTS "Insertar usuarios" ON public.users;
CREATE POLICY "Insertar usuarios" ON public.users
FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- ==========================================
-- POLÍTICAS: NOTIFICACIONES
-- ==========================================

-- A) LECTURA
DROP POLICY IF EXISTS "Leer mis notificaciones" ON public.notificaciones;
CREATE POLICY "Leer mis notificaciones" ON public.notificaciones
FOR SELECT USING (
  user_id = auth.uid()
);

-- B) INSERCIÓN (Sistema/Admins)
-- Permitimos que admins inserten notificaciones para otros
DROP POLICY IF EXISTS "Crear notificaciones" ON public.notificaciones;
CREATE POLICY "Crear notificaciones" ON public.notificaciones
FOR INSERT WITH CHECK (
  -- Un usuario normal solo puede crear notificaciones para sí mismo (si aplica)
  user_id = auth.uid()
  OR
  -- Admins pueden crear notificaciones para cualquiera
  public.is_admin_global()
  OR
  public.is_admin_local()
);

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================
