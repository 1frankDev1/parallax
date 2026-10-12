-- ====================================================================
-- CONFIGURACIÓN OPCIONAL PARA ALMACENAR COORDINADAS EN SUPABASE
-- ====================================================================
-- Este script es completamente opcional.
-- El archivo `mapa.html` geocodifica automáticamente las direcciones
-- de la tabla `restaurantes` utilizando Nominatim y guarda el caché
-- en localStorage del navegador.
--
-- Si deseas guardar de forma permanente las coordenadas (lat, lng)
-- directamente en tu base de datos Supabase para acelerar aún más
-- las cargas de datos, ejecuta las siguientes instrucciones SQL en
-- el editor SQL de Supabase (SQL Editor):

-- 1. Agregar columnas para Latitud y Longitud
ALTER TABLE public.restaurantes
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- 2. Crear índice para optimizar consultas por ubicación si fuera necesario
CREATE INDEX IF NOT EXISTS idx_restaurantes_coords
ON public.restaurantes (lat, lng);

-- 3. Recargar la caché del esquema de Supabase para evitar errores de API
NOTIFY pgrst, 'reload schema';
