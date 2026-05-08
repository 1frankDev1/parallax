-- Tabla para almacenar los paquetes dinámicos creados
CREATE TABLE IF NOT EXISTS pricing_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    client_name TEXT NOT NULL,
    package_type TEXT, -- 'Starter', 'Premium', 'Deluxe' o 'Custom'
    services JSONB,    -- Lista de servicios seleccionados [{id, name}, ...]
    total_setup NUMERIC,
    total_monthly NUMERIC,
    image_url TEXT     -- URL de la imagen generada en Cloudinary
);

-- Habilitar acceso público (ajustar RLS según sea necesario)
ALTER TABLE pricing_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública" ON pricing_packages FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública" ON pricing_packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualización pública" ON pricing_packages FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminación pública" ON pricing_packages FOR DELETE USING (true);

-- Forzar recarga del caché de PostgREST para reconocer las nuevas columnas
NOTIFY pgrst, 'reload schema';
