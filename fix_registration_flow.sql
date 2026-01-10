-- ==========================================
-- FIX REGISTRATION FLOW: SERVER-SIDE TRIGGER
-- ==========================================
-- Este script soluciona los errores de RLS (401/403) al registrar usuarios.
-- Mueve la lógica de creación de perfil al lado del servidor (Trigger).
--
-- INSTRUCCIONES:
-- 1. Ejecuta este script en el Editor SQL de Supabase.
-- 2. Asegúrate de que tu cliente envíe los metadatos correctos en signUp().

-- 1. Función para manejar la creación de usuarios nuevos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_cong_nombre text;
BEGIN
  -- Intentar obtener el nombre de la congregación si se proporcionó un ID
  IF new.raw_user_meta_data->>'congregacion' IS NOT NULL AND (new.raw_user_meta_data->>'congregacion')::text != '' THEN
    BEGIN
      SELECT nombre INTO v_cong_nombre
      FROM public.congregaciones
      WHERE id = (new.raw_user_meta_data->>'congregacion')::uuid;
    EXCEPTION WHEN OTHERS THEN
      v_cong_nombre := NULL;
    END;
  END IF;

  -- Insertar el perfil público
  INSERT INTO public.users (
    id,
    email,
    nombre,
    telefono,
    role,
    status,
    congregacion,
    congregacion_nombre
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'nombre',
    new.raw_user_meta_data->>'telefono',
    new.raw_user_meta_data->>'role',
    COALESCE(new.raw_user_meta_data->>'status', 'PENDIENTE'),
    NULLIF(new.raw_user_meta_data->>'congregacion', '')::uuid,
    v_cong_nombre
  );

  RETURN new;
END;
$$;

-- 2. Crear el Trigger (borrar anterior si existe para evitar duplicados)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
