-- ====================================================================
-- ESTRUCTURA Y TABLAS PARA EVALUADOR AUTOMÁTICO DE LLAMADAS CON GEMINI
-- Archivo: docs/setup_evaluador.sql
-- ====================================================================

-- 1. Tabla principal de evaluaciones de llamadas
CREATE TABLE IF NOT EXISTS call_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id TEXT NOT NULL,
    audio TEXT NOT NULL,
    call_date TIMESTAMPTZ DEFAULT now(),
    duration TEXT DEFAULT '00:00',
    total_score NUMERIC NOT NULL DEFAULT 0,
    script_version TEXT DEFAULT 'scriptVentas.pdf',
    points_total INTEGER DEFAULT 0,
    points_completed INTEGER DEFAULT 0,
    points_partial INTEGER DEFAULT 0,
    points_failed INTEGER DEFAULT 0,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    general_feedback TEXT DEFAULT '',
    order_observations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla detalle de cada punto evaluado en el guión/script
CREATE TABLE IF NOT EXISTS call_evaluation_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES call_evaluations(id) ON DELETE CASCADE,
    point_number INTEGER NOT NULL,
    point_name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'completed', 'partial', 'failed'
    score NUMERIC NOT NULL DEFAULT 0,
    timestamp TEXT DEFAULT '00:00',
    evidence TEXT DEFAULT '',
    feedback TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para mejorar rendimiento de consultas por vendedor y fechas
CREATE INDEX IF NOT EXISTS idx_call_evaluations_seller ON call_evaluations(seller_id);
CREATE INDEX IF NOT EXISTS idx_call_evaluations_created_at ON call_evaluations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_eval_points_eval_id ON call_evaluation_points(evaluation_id);

-- 3. Habilitar seguridad por filas (RLS)
ALTER TABLE call_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_evaluation_points ENABLE ROW LEVEL SECURITY;

-- Polìticas permisivas públicas para integración transparente con Supabase Client
DROP POLICY IF EXISTS "Permitir lectura publica call_evaluations" ON call_evaluations;
CREATE POLICY "Permitir lectura publica call_evaluations" ON call_evaluations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion publica call_evaluations" ON call_evaluations;
CREATE POLICY "Permitir insercion publica call_evaluations" ON call_evaluations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion publica call_evaluations" ON call_evaluations;
CREATE POLICY "Permitir actualizacion publica call_evaluations" ON call_evaluations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion publica call_evaluations" ON call_evaluations;
CREATE POLICY "Permitir eliminacion publica call_evaluations" ON call_evaluations FOR DELETE USING (true);

DROP POLICY IF EXISTS "Permitir lectura publica call_evaluation_points" ON call_evaluation_points;
CREATE POLICY "Permitir lectura publica call_evaluation_points" ON call_evaluation_points FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion publica call_evaluation_points" ON call_evaluation_points;
CREATE POLICY "Permitir insercion publica call_evaluation_points" ON call_evaluation_points FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion publica call_evaluation_points" ON call_evaluation_points;
CREATE POLICY "Permitir actualizacion publica call_evaluation_points" ON call_evaluation_points FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion publica call_evaluation_points" ON call_evaluation_points;
CREATE POLICY "Permitir eliminacion publica call_evaluation_points" ON call_evaluation_points FOR DELETE USING (true);

-- Notificar recarga de caché de esquema en PostgREST / Supabase
NOTIFY pgrst, 'reload schema';
