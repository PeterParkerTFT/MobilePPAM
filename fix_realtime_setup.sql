-- ==============================================================================
-- 📡 FIX REALTIME: INFRAESTRUCTURA ROBUSTA
-- Garantiza que Supabase envíe TODOS los datos en los eventos de cambio
-- ==============================================================================

-- 1. REPLICA IDENTITY FULL
-- Obliga a la base de datos a enviar el registro COMPLETO en eventos DELETE/UPDATE.
-- Sin esto, en un DELETE solo recibirías el ID, lo cual limita futuras optimizaciones.
ALTER TABLE public.turnos REPLICA IDENTITY FULL;
ALTER TABLE public.turno_voluntarios REPLICA IDENTITY FULL;

-- 2. PUBLICACIÓN EN EL CANAL REALTIME
-- Asegura explícitamente que las tablas estén transmitiendo "en vivo".
-- Esto equivale a activar el switch en el Dashboard, pero vía código (más seguro).
ALTER PUBLICATION supabase_realtime ADD TABLE public.turnos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.turno_voluntarios;
