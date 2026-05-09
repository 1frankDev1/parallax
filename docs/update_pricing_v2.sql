-- Add new columns for Closer and Discounts
ALTER TABLE pricing_packages
ADD COLUMN IF NOT EXISTS closer TEXT,
ADD COLUMN IF NOT EXISTS discount_setup NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_monthly NUMERIC DEFAULT 0;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
