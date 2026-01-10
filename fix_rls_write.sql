-- ==============================================================================
-- FIX RLS: WRITE PERMISSIONS PATCH 🔓
-- Run this to allow Active Users to Create Turns and Sites
-- ==============================================================================

-- 1. Permitir CREAR (Insertar) Turnos
DROP POLICY IF EXISTS "Active users can create turnos" ON public.turnos;
CREATE POLICY "Active users can create turnos"
ON public.turnos
FOR INSERT
WITH CHECK (
  public.is_active_or_admin()
);

-- 2. Permitir CREAR (Insertar) Sitios
-- Esto es CRÍTICO porque tu código crea sitios nuevos automáticamente
DROP POLICY IF EXISTS "Active users can create sitios" ON public.sitios;
CREATE POLICY "Active users can create sitios"
ON public.sitios
FOR INSERT
WITH CHECK (
  public.is_active_or_admin()
);

-- 3. (Opcional pero recomendado) Permitir EDITAR y BORRAR a los Admins
-- Para que puedas corregir errores o borrar turnos cancelados
DROP POLICY IF EXISTS "Admins can manage turnos" ON public.turnos;
CREATE POLICY "Admins can manage turnos"
ON public.turnos
FOR ALL
USING (
  public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL'])
);
