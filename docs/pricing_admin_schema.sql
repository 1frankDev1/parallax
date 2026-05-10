-- Pricing Services Table
CREATE TABLE IF NOT EXISTS pricing_services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    setup NUMERIC DEFAULT 0,
    monthly NUMERIC DEFAULT 0,
    image TEXT,
    description TEXT,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Pricing Presets Table
CREATE TABLE IF NOT EXISTS pricing_presets (
    tier TEXT PRIMARY KEY, -- 'starter', 'premium', 'deluxe'
    service_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Pricing Settings Table
CREATE TABLE IF NOT EXISTS pricing_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE pricing_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public Select Services" ON pricing_services;
CREATE POLICY "Public Select Services" ON pricing_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Services" ON pricing_services;
CREATE POLICY "Public Insert Services" ON pricing_services FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Services" ON pricing_services;
CREATE POLICY "Public Update Services" ON pricing_services FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public Delete Services" ON pricing_services;
CREATE POLICY "Public Delete Services" ON pricing_services FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public Select Presets" ON pricing_presets;
CREATE POLICY "Public Select Presets" ON pricing_presets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Presets" ON pricing_presets;
CREATE POLICY "Public Insert Presets" ON pricing_presets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Presets" ON pricing_presets;
CREATE POLICY "Public Update Presets" ON pricing_presets FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public Delete Presets" ON pricing_presets;
CREATE POLICY "Public Delete Presets" ON pricing_presets FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public Select Settings" ON pricing_settings;
CREATE POLICY "Public Select Settings" ON pricing_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Insert Settings" ON pricing_settings;
CREATE POLICY "Public Insert Settings" ON pricing_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public Update Settings" ON pricing_settings;
CREATE POLICY "Public Update Settings" ON pricing_settings FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Public Delete Settings" ON pricing_settings;
CREATE POLICY "Public Delete Settings" ON pricing_settings FOR DELETE USING (true);

-- Initial Data: Services
INSERT INTO pricing_services (id, name, setup, monthly, image, description) VALUES
('online_orders', 'Online Orders', 322.92, 96.12, 'https://menutech.xyz/assets/img/onlineOrders.jpg', 'Platform admin, website template, ordering button, mobile ordering, menu build, cash orders, etc.'),
('local_listing', 'Local Listing', 279.72, 85.32, 'https://menutech.xyz/assets/img/localListing.jpg', 'Google My Business, Apple iMap, Food Booking, Tripadvisor, Facebook, Instagram, more listings.'),
('social_media', 'Facebook / Instagram / Threads', 214.92, 52.92, 'https://menutech.xyz/assets/img/socialMedia.jpg', 'Social Media package 4 post per Month.'),
('smm', 'Social Media Marketing', 106.92, 33.48, 'https://menutech.xyz/assets/img/smm.jpg', 'Inviting Blast Through Email, SMS or both.'),
('online_payment', 'Online Payment', 106.92, 48.6, 'https://menutech.xyz/assets/img/onlinePayment.jpg', 'Online Payment Orders (unlimited).'),
('promotions', 'Promotions and Offers', 139.32, 63.72, 'https://menutech.xyz/assets/img/promotionsoffers.jpg', '8 Integrated promotions and offers (unlimited).'),
('fb_ads', 'Facebook Ads', 0, 20, 'https://menutech.xyz/assets/img/adfb.jpg', 'Ad management on Facebook and Instagram.'),
('branded_app', 'Branded Mobile App', 189.92, 49.62, 'https://menutech.xyz/assets/img/brandedapp.jpg', 'Personalized ordering app for Android and IOS.'),
('website_seo', 'Website / SEO / Google Ads', 366.12, 85.32, 'https://menutech.xyz/assets/img/wsg.jpg', 'Personalized website, hosting, SEO, Domain registry.'),
('physical_marketing', 'Fisical Marketing Kit', 399, 0, 'https://menutech.xyz/assets/img/fmk.jpg', 'Table QR Codes, Sheet size Posters, Stickers, Flyers.'),
('delivery_service', 'Delivery Service', 214.92, 85.32, 'https://menutech.xyz/assets/img/deliveryservices.jpg', 'Delivery Service setup and management.'),
('pos_integration', 'POS Platforms Integration', 430.92, 74.52, 'https://menutech.xyz/assets/img/POSpi.jpg', 'Integration with many POS platforms.'),
('delivery_shipday', 'Delivery Services (Shipday)', 290.52, 132, 'https://menutech.xyz/assets/img/deliveryservices.jpg', 'Shipday Delivery With Doordash & Uber Drivers.'),
('restaurant_pos', 'Individual Restaurant POS', 2498, 106.92, 'https://menutech.xyz/assets/img/posu.jpg', 'Menutech POS Cloud base, Tablet, Printer, Credit card device.')
ON CONFLICT (id) DO NOTHING;

-- Initial Data: Presets
INSERT INTO pricing_presets (tier, service_ids) VALUES
('starter', ARRAY['online_orders', 'local_listing']),
('premium', ARRAY['online_orders', 'local_listing', 'social_media', 'smm', 'online_payment', 'promotions', 'fb_ads', 'branded_app']),
('deluxe', ARRAY['online_orders', 'local_listing', 'social_media', 'smm', 'online_payment', 'promotions', 'fb_ads', 'branded_app', 'website_seo', 'physical_marketing', 'delivery_service', 'pos_integration', 'delivery_shipday', 'restaurant_pos'])
ON CONFLICT (tier) DO NOTHING;

-- Initial Data: Settings
INSERT INTO pricing_settings (key, value) VALUES
('specialists', '["Carmona 1", "Carmona 2", "Carmona 3", "Carmona 4"]'::jsonb),
('discount_range', '{"min": 1, "max": 18}'::jsonb)
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
