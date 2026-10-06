-- ============================================
-- FIX: RLS POLICIES FOR PRODUCT/CATEGORY DELETION
-- ============================================
-- PROBLEM: The admin panel authenticates via simple username/password
-- (not Supabase Auth), so auth.uid() is always NULL when using the
-- anon key. The existing "admin_manage_*" policies require
-- auth.uid() IS NOT NULL, which silently blocks all DELETE/INSERT/UPDATE
-- operations. Supabase returns no error — it just affects 0 rows.
--
-- SOLUTION: Add explicit policies for the anon role to allow
-- INSERT, UPDATE, DELETE, and unrestricted SELECT on products
-- and categories tables.
--
-- HOW TO RUN:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Paste this entire script and click "Run"
-- ============================================

-- Drop existing conflicting policies (if they exist) to avoid errors
DROP POLICY IF EXISTS "anon_select_all_categories" ON categories;
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;

DROP POLICY IF EXISTS "anon_select_all_products" ON products;
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
DROP POLICY IF EXISTS "anon_delete_products" ON products;

-- ============================================
-- CATEGORIES: Allow anon role full access
-- ============================================
CREATE POLICY "anon_select_all_categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "anon_insert_categories" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update_categories" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "anon_delete_categories" ON categories
  FOR DELETE USING (true);

-- ============================================
-- PRODUCTS: Allow anon role full access
-- ============================================
CREATE POLICY "anon_select_all_products" ON products
  FOR SELECT USING (true);

CREATE POLICY "anon_insert_products" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_update_products" ON products
  FOR UPDATE USING (true);

CREATE POLICY "anon_delete_products" ON products
  FOR DELETE USING (true);

-- ============================================
-- VERIFY: Check that policies were created
-- ============================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('products', 'categories')
ORDER BY tablename, policyname;
