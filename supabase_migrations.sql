-- ============================================
-- CHAITRIKA DYNAMIC PRODUCT MANAGEMENT SYSTEM
-- Supabase Migration Script
-- ============================================

-- ============================================
-- 1. CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percent INT DEFAULT 0,
  moq INT DEFAULT 1,
  image_url TEXT,
  customization_enabled BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 3. PRODUCT_OPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_name VARCHAR(255) NOT NULL,
  option_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, option_name)
);

-- ============================================
-- 4. PRODUCT_OPTION_VALUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value VARCHAR(255) NOT NULL,
  display_label VARCHAR(255),
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_option_id, value)
);

-- ============================================
-- 5. PRODUCT_IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_whatsapp VARCHAR(20),
  customer_email VARCHAR(255),
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(100) NOT NULL,
  delivery_state VARCHAR(100) NOT NULL,
  delivery_pincode VARCHAR(10) NOT NULL,
  customer_notes TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_charge DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_whatsapp',
  payment_method VARCHAR(50) DEFAULT 'whatsapp',
  whatsapp_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  selected_options JSONB NOT NULL DEFAULT '{}',
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. UPLOADED_CUSTOM_IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS uploaded_custom_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  image_original_name VARCHAR(255),
  file_size_bytes INT,
  image_type VARCHAR(50),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. ADMIN_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value TEXT,
  value_type VARCHAR(50) DEFAULT 'string',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- 10. AUDIT_LOGS TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON product_options(product_id);

CREATE INDEX IF NOT EXISTS idx_product_option_values_option_id ON product_option_values(product_option_id);

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_uploaded_images_order_id ON uploaded_custom_images(order_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_images_product_id ON uploaded_custom_images(product_id);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_custom_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADMIN USERS TABLE & AUTHORIZATION FUNCTION
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CATEGORIES - PUBLIC READ, ADMIN WRITE
-- ============================================
CREATE POLICY "public_read_categories" ON categories
  FOR SELECT USING (active = true);

CREATE POLICY "admin_manage_categories" ON categories
  FOR ALL USING (public.is_admin());

-- ============================================
-- PRODUCTS - PUBLIC READ, ADMIN WRITE
-- ============================================
CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (active = true AND 
    category_id IN (SELECT id FROM categories WHERE active = true));

CREATE POLICY "admin_manage_products" ON products
  FOR ALL USING (public.is_admin());

-- ============================================
-- PRODUCT_OPTIONS - PUBLIC READ, ADMIN WRITE
-- ============================================
CREATE POLICY "public_read_product_options" ON product_options
  FOR SELECT USING (product_id IN (SELECT id FROM products WHERE active = true));

CREATE POLICY "admin_manage_product_options" ON product_options
  FOR ALL USING (public.is_admin());

-- ============================================
-- PRODUCT_OPTION_VALUES - PUBLIC READ, ADMIN WRITE
-- ============================================
CREATE POLICY "public_read_option_values" ON product_option_values
  FOR SELECT USING (active = true);

CREATE POLICY "admin_manage_option_values" ON product_option_values
  FOR ALL USING (public.is_admin());

-- ============================================
-- PRODUCT_IMAGES - PUBLIC READ, ADMIN WRITE
-- ============================================
CREATE POLICY "public_read_product_images" ON product_images
  FOR SELECT USING (product_id IN (SELECT id FROM products WHERE active = true));

CREATE POLICY "admin_manage_product_images" ON product_images
  FOR ALL USING (public.is_admin());

-- ============================================
-- ORDERS - ADMIN READ, AUTHENTICATED INSERT
-- ============================================
CREATE POLICY "admin_read_orders" ON orders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "customers_create_orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "customers_read_own_orders" ON orders
  FOR SELECT USING (
    customer_phone = current_setting('request.jwt.claims', true)::jsonb ->> 'phone' OR
    customer_email = current_setting('request.jwt.claims', true)::jsonb ->> 'email'
  );

CREATE POLICY "admin_update_orders" ON orders
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- ORDER_ITEMS - SAME AS ORDERS
-- ============================================
CREATE POLICY "admin_read_order_items" ON order_items
  FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE public.is_admin()));

CREATE POLICY "customers_create_order_items" ON order_items
  FOR INSERT WITH CHECK (true);

-- ============================================
-- UPLOADED_CUSTOM_IMAGES - ADMIN READ, CUSTOMER UPLOAD
-- ============================================
CREATE POLICY "admin_read_images" ON uploaded_custom_images
  FOR SELECT USING (public.is_admin());

CREATE POLICY "customers_upload_images" ON uploaded_custom_images
  FOR INSERT WITH CHECK (true);

-- ============================================
-- ADMIN_SETTINGS - ADMIN ONLY
-- ============================================
CREATE POLICY "admin_manage_settings" ON admin_settings
  FOR ALL USING (public.is_admin());

CREATE POLICY "public_read_settings" ON admin_settings
  FOR SELECT USING (setting_key IN (
    'store_name', 'currency', 'currency_symbol'
  ));

-- ============================================
-- AUDIT_LOGS - ADMIN READ, SYSTEM WRITE
-- ============================================
CREATE POLICY "admin_read_audit" ON audit_logs
  FOR SELECT USING (public.is_admin());

-- ============================================
-- DEFAULT SETTINGS
-- ============================================
INSERT INTO admin_settings (setting_key, setting_value, value_type, description)
VALUES
  ('whatsapp_number', '+919876543210', 'string', 'Admin WhatsApp number for receiving orders'),
  ('delivery_charge', '100', 'number', 'Default delivery charge in INR'),
  ('store_name', 'Chaitra', 'string', 'Store/brand name'),
  ('currency', 'INR', 'string', 'Currency code'),
  ('currency_symbol', '₹', 'string', 'Currency symbol'),
  ('tax_percent', '0', 'number', 'Tax percentage (GST)'),
  ('order_prefix', 'ORD', 'string', 'Order ID prefix')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- SEED DATA (OPTIONAL - Remove for production)
-- ============================================

-- Sample Categories
INSERT INTO categories (name, slug, description, display_order, active)
VALUES
  ('Frames', 'frames', 'Photo frames and displays', 1, true),
  ('Jewelry', 'jewelry', 'Custom jewelry and accessories', 2, true),
  ('Clothing', 'clothing', 'Personalized clothing items', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- END OF MIGRATION
-- ============================================

-- ============================================
-- FIX FOR PRODUCT DELETION FOREIGN KEY ISSUE
-- Run this block in Supabase SQL Editor to apply:
-- 1. Go to https://supabase.com/dashboard → your project → SQL Editor
-- 2. Paste and run this entire block
-- This changes order_items and uploaded_custom_images product_id FK
-- to CASCADE DELETE so deleting a product also deletes its order items.
-- ============================================

-- Fix order_items: cascade delete when product is deleted
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Fix uploaded_custom_images: cascade delete when product is deleted  
ALTER TABLE uploaded_custom_images ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE uploaded_custom_images DROP CONSTRAINT IF EXISTS uploaded_custom_images_product_id_fkey;
ALTER TABLE uploaded_custom_images ADD CONSTRAINT uploaded_custom_images_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

