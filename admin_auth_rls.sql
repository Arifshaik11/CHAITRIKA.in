-- ============================================
-- ADMIN AUTHORIZATION & RLS OVERHAUL
-- ============================================
-- 1. Create admin_users table for true authorization
-- 2. Create helper function to check admin status
-- 3. Update RLS policies to require true admin role
-- 4. Remove insecure anon policies
-- ============================================

-- Create the admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admin_users table
CREATE POLICY "admin_read_admin_users" ON admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Helper function to check if the current user is an admin
-- Using SECURITY DEFINER so it can run during RLS checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CLEANUP: Remove insecure anon policies
-- ============================================
DROP POLICY IF EXISTS "anon_select_all_categories" ON categories;
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;

DROP POLICY IF EXISTS "anon_select_all_products" ON products;
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
DROP POLICY IF EXISTS "anon_delete_products" ON products;

-- ============================================
-- RE-CREATE ADMIN POLICIES USING TRUE ADMIN ROLE
-- ============================================

-- CATEGORIES
DROP POLICY IF EXISTS "admin_manage_categories" ON categories;
CREATE POLICY "admin_manage_categories" ON categories
  FOR ALL USING (public.is_admin());

-- PRODUCTS
DROP POLICY IF EXISTS "admin_manage_products" ON products;
CREATE POLICY "admin_manage_products" ON products
  FOR ALL USING (public.is_admin());

-- PRODUCT OPTIONS
DROP POLICY IF EXISTS "admin_manage_product_options" ON product_options;
CREATE POLICY "admin_manage_product_options" ON product_options
  FOR ALL USING (public.is_admin());

-- PRODUCT OPTION VALUES
DROP POLICY IF EXISTS "admin_manage_option_values" ON product_option_values;
CREATE POLICY "admin_manage_option_values" ON product_option_values
  FOR ALL USING (public.is_admin());

-- PRODUCT IMAGES
DROP POLICY IF EXISTS "admin_manage_product_images" ON product_images;
CREATE POLICY "admin_manage_product_images" ON product_images
  FOR ALL USING (public.is_admin());

-- ORDERS
DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders
  FOR UPDATE USING (public.is_admin());

-- ORDER ITEMS
DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
CREATE POLICY "admin_read_order_items" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE public.is_admin())
  );

-- ADMIN SETTINGS
DROP POLICY IF EXISTS "admin_manage_settings" ON admin_settings;
CREATE POLICY "admin_manage_settings" ON admin_settings
  FOR ALL USING (public.is_admin());

-- AUDIT LOGS
DROP POLICY IF EXISTS "admin_read_audit" ON audit_logs;
CREATE POLICY "admin_read_audit" ON audit_logs
  FOR SELECT USING (public.is_admin());
