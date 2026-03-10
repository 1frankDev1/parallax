-- 1. Crear la tabla (si no existe)
CREATE TABLE IF NOT EXISTS render3d_textures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gltf_key TEXT NOT NULL,         -- 'flyer', 'poster', 'sticker', 'tableqr', etc.
    label TEXT NOT NULL,            -- Nombre del diseño
    texture_url TEXT NOT NULL,      -- URL de Cloudinary
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Desactivar RLS (Seguridad a nivel de fila) para permitir inserciones desde el frontend
-- NOTA: Esto permite que cualquier usuario con la anon key inserte datos.
-- Es el patrón actual del proyecto para prototipado rápido.
ALTER TABLE render3d_textures DISABLE ROW LEVEL SECURITY;

-- 3. (Opcional) Si prefieres mantener RLS activado, usa estas políticas en su lugar:
/*
ALTER TABLE render3d_textures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura pública" ON render3d_textures FOR SELECT USING (true);
CREATE POLICY "Permitir inserción pública" ON render3d_textures FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir eliminación pública" ON render3d_textures FOR DELETE USING (true);
*/
