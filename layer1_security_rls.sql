-- Layer 1: The Vault (Security RLS)
-- Disables access to sensitive tables for users with 'PENDIENTE' status.

-- [PERFORMANCE] Index for RLS lookups (Crucial to avoid seq scans on every query)
CREATE INDEX IF NOT EXISTS idx_users_id_status ON public.users(id, status);

-- Helper function to check if the current user is active or admin
CREATE OR REPLACE FUNCTION public.is_active_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Admins (Global/Local) always pass
  IF public.auth_have_any_role(ARRAY['ADMIN_GLOBAL', 'ADMIN_LOCAL']) THEN
    RETURN TRUE;
  END IF;

  -- Check status of the current user
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
      AND status IN ('ACTIVO', 'APROBADO') -- Support both variants if legacy exists
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Table: Turnos
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active users can view turnos" ON public.turnos;

CREATE POLICY "Active users can view turnos"
ON public.turnos
FOR SELECT
USING (
  public.is_active_or_admin()
);

-- 2. Table: Sitios (Maps)
ALTER TABLE public.sitios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active users can view sitios" ON public.sitios;

CREATE POLICY "Active users can view sitios"
ON public.sitios
FOR SELECT
USING (
  public.is_active_or_admin()
);

-- 3. Table: Turno Voluntarios (Inscriptions)
-- Users can see their own inscriptions OR all inscriptions if they are active (to see who is in the turn)
ALTER TABLE public.turno_voluntarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active users can view inscriptions" ON public.turno_voluntarios;

CREATE POLICY "Active users can view inscriptions"
ON public.turno_voluntarios
FOR SELECT
USING (
  -- I can see my own irrelevant of status (maybe? no, let's block pending too)
  -- Or strictly rule: PENDING users see NOTHING.
  public.is_active_or_admin() 
);

-- 4. Table: Congregaciones (Usually public, but let's restrict if needed)
-- Leaving congregaciones visible for now to allow Signup form to work (it needs list of congregations)
-- If we lock congregaciones, Signup breaks.
