# Implementation Plan: Soft Delete Pattern for Products

## Problem Statement
Deleting a product fails with a foreign key constraint error: 
> "update or delete on table 'products' violates foreign key constraint 'order_items_product_id_fkey' on table 'order_items'"

This occurs because order_items and uploaded_custom_images tables still reference products via product_id, creating referential integrity violations. The current workaround in deleteProduct pre-cleans these references, but these cleanup operations fail under Supabase RLS policies.

## Solution Overview
Implement a soft delete pattern: instead of hard-deleting products, mark them with an `is_deleted` flag (default false). This preserves referential integrity while hiding deleted products from public views. Admins retain visibility for auditing.

---

## Implementation Plan

- [ ] 1. Add soft delete column and index to products table in Supabase; update RLS policies.
      **Rationale:** The products table needs an is_deleted column (BOOLEAN DEFAULT false) to track deletions. A B-tree index on is_deleted improves query performance for filtering out deleted products. The public_read_products RLS policy must be updated to exclude soft-deleted products so customers never see them.
      
      **Files:** c:\Users\asifa\Downloads\CHAITRIKA.in\supabase_migrations.sql
      
      **Verify:** 
      - Open the SQL editor in Supabase dashboard and run the migration block.
      - Confirm the is_deleted column exists on products table: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products' AND column_name='is_deleted';`
      - Confirm the index exists: `SELECT indexname FROM pg_indexes WHERE tablename='products' AND indexname LIKE '%is_deleted%';`
      - Verify the policy updated: `SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename='products' AND policyname='public_read_products';`

- [ ] 2. Update fetchProducts in ProductContext to exclude soft-deleted products.
      **Rationale:** When loading products for public display, we query with .eq('is_deleted', false) to ensure only live products populate the products state. This is the primary filter preventing deleted items from appearing on the storefront.
      
      **Files:** c:\Users\asifa\Downloads\CHAITRIKA.in\src\context\ProductContext.jsx
      
      **Verify:** Search the file for `fetchProducts` and confirm the line `.eq('is_deleted', false)` is present in the Supabase query before `.select('*')`.

- [ ] 3. Update getProductById and getProductBySlug to exclude soft-deleted products.
      **Rationale:** Single product lookups must also filter by is_deleted = false. For getProductBySlug, the filter is added alongside the existing .eq('active', true) check as a second condition. This prevents individual product pages from exposing deleted items via direct URL access.
      
      **Files:** c:\Users\asifa\Downloads\CHAITRIKA.in\src\context\ProductContext.jsx
      
      **Verify:** Search for `getProductById` and `getProductBySlug` functions; confirm both have `.eq('is_deleted', false)` in their Supabase queries.

- [ ] 4. Replace deleteProduct function to perform soft delete instead of hard delete.
      **Rationale:** Instead of calling supabase.delete(), the function calls .update({ is_deleted: true }). This preserves all order history and referential integrity. The function then updates local state by filtering out the soft-deleted product (so it disappears from the shop UI immediately). Remove all pre-cleanup code (product_images delete, order_items/uploaded_custom_images update) from deleteProduct since soft delete eliminates the foreign key conflict.
      
      **Files:** c:\Users\asifa\Downloads\CHAITRIKA.in\src\context\ProductContext.jsx
      
      **Verify:** 
      - Locate the deleteProduct function (currently ~line 230).
      - Confirm it calls `.from('products').update({ is_deleted: true }).eq('id', id)` instead of `.delete()`.
      - Confirm product_images, order_items, and uploaded_custom_images cleanup code is removed.
      - Confirm the function filters the product from state after the update: `setProducts(prev => prev.filter(p => p.id !== id))`.

- [ ] 5. Add client-side safety filter to categoryProducts derived value in ProductContext.
      **Rationale:** In the useMemo block that computes categoryProducts, add `.filter(p => p.is_deleted !== true)` as a safety net. This prevents any soft-deleted products from leaking into category-filtered product lists, even if the query filter somehow misses one (defensive programming).
      
      **Files:** c:\Users\asifa\Downloads\CHAITRIKA.in\src\context\ProductContext.jsx
      
      **Verify:** Locate the categoryProducts useMemo block (near the end of ProductProvider), confirm it includes a filter excluding is_deleted products.

- [ ] 6. Update AdminProducts filteredProducts to show all products by default, with optional toggle to hide soft-deleted ones.
      **Rationale:** Admins must see soft-deleted products for audit purposes. The filteredProducts filter should load ALL products (including is_deleted: true), but a showDeleted boolean state (default false) lets admins hide deleted items if desired. When showDeleted is false, filter out products where is_deleted === true; when true, show all.
      
      **Files:** c:\Users\asifa\Downloads\CHAITRIKA.in\src\components\admin\AdminProducts.jsx
      
      **Verify:** 
      - Confirm useState hook adds `const [showDeleted, setShowDeleted] = useState(false);` near the top.
      - Confirm filteredProducts filter includes: `const matchesDeleted = showDeleted || product.is_deleted !== true;` (or similar logic).
      - Confirm a toggle button is rendered in the filter bar.

- [ ] 7. Add status badge styling for soft-deleted products in AdminProducts table.
      **Rationale:** The Status column (currently showing Active/Archived based on product.active) must also show a red "Deleted" badge when product.is_deleted === true, taking priority over the active/archived check. This gives admins immediate visual feedback on soft-deleted state.
      
      **Files:** c:\Users\asifa\Downloads\CHAITRIKA.in\src\components\admin\AdminProducts.jsx
      
      **Verify:** Locate the Status table cell (currently ~line 218). Confirm it includes logic like: `if (product.is_deleted) return 'Deleted badge'; else return active/archived badge;` Verify the CSS classes use red tones for deleted (e.g. text-red-700 bg-red-50).

- [ ] 8. Remove product_images deletion from handleDeleteProduct in AdminProducts.
      **Rationale:** The context's deleteProduct function now handles the soft delete logic entirely. AdminProducts' handleDeleteProduct should remove the supabase product_images delete call that was attempting cleanup. Only call deleteProduct from context; no pre-cleanup in the component.
      
      **Files:** c:\Users\asifa\Downloads\CHAITRIKA.in\src\components\admin\AdminProducts.jsx
      
      **Verify:** Locate handleDeleteProduct function (~line 160). Confirm the block that calls `supabase.from('product_images').delete()...` is removed; only the `deleteProduct(productId)` call remains.

- [ ] 9. No changes needed in Products.jsx — it already consumes products from context.
      **Rationale:** Products.jsx uses the products array from ProductContext.useProducts(). Because fetchProducts now filters is_deleted = false, the products state will never contain deleted items, so Products.jsx renders only live products without modification.
      
      **Verification:** No changes required. The fix is automatic when step 2 is complete.

---

## Summary of Changes

| File | Change Count | Brief Description |
|------|--------------|-------------------|
| supabase_migrations.sql | 1 | Add is_deleted column, index, and update public_read_products RLS policy |
| ProductContext.jsx | 4 | Filter deleted products in fetchProducts, getProductById, getProductBySlug; replace deleteProduct with soft delete; add client filter to categoryProducts |
| AdminProducts.jsx | 3 | Add showDeleted toggle state and filter; update status badge for deleted; remove product_images cleanup |
| Products.jsx | 0 | No changes needed (automatic via context) |

**Total items:** 9 implementation tasks
**Estimated complexity:** Medium (straightforward filtering + query updates; no schema migration required in app code)
**Risk level:** Low (soft delete is additive; hard delete logic is being replaced, not refactored)
