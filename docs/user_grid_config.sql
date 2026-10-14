-- SQL Migration Script for User Grid Customization
-- Stores customizable grid slot layouts per user (colSpan, rowSpan, colors, order, visible)

CREATE TABLE IF NOT EXISTS public.user_grid_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    grid_config JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_grid_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if present and recreate
DROP POLICY IF EXISTS "Allow full access on user_grid_configs" ON public.user_grid_configs;

CREATE POLICY "Allow full access on user_grid_configs"
    ON public.user_grid_configs
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Notify PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
