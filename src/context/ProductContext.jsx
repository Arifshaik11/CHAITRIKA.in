import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { defaultProducts } from '../data/mockData';
import { useCategories } from './CategoryContext';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const { categories } = useCategories();

  // Active Category (instead of store)
  const [activeCategory, setActiveCategory] = useState(() => {
    const saved = localStorage.getItem('activeCategory');
    return saved || 'all';
  });

  // Product Catalog
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('chaitrika_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) return parsed;
      }
      return defaultProducts;
    } catch {
      return defaultProducts;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('chaitrika_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Recently Viewed
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('chaitrika_recently_viewed');
    return saved ? JSON.parse(saved) : [];
  });

  // Product Comparison (Max 3)
  const [comparisonList, setComparisonList] = useState([]);

  // Dark/Light Mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('chaitrika_dark_mode');
    if (saved) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Fetch ALL products from Supabase with localStorage & defaultProducts fallback
  const fetchProducts = async () => {
    try {
      if (!supabase) {
        const cached = localStorage.getItem('chaitrika_products');
        setProducts(cached ? JSON.parse(cached) : defaultProducts);
        return;
      }

      console.log('Fetching all products from Supabase...');

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*');

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw fetchError;
      }

      if (data) {
        console.log('Products loaded from Supabase:', data.length, 'items');
        setProducts(data);
        localStorage.setItem('chaitrika_products', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('chaitrika_products');
        setProducts(cached ? JSON.parse(cached) : defaultProducts);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching from Supabase, trying localStorage/defaultProducts:', err.message);
      
      const cached = localStorage.getItem('chaitrika_products');
      setProducts(cached ? JSON.parse(cached) : defaultProducts);
      setLoading(false);
    }
  };

  // Get single product by ID with all details
  const getProductById = async (productId) => {
    try {
      if (!supabase) {
        return defaultProducts.find(p => p.id === productId);
      }

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*)
        `)
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      console.error(`Error fetching product ${productId}:`, err);
      return defaultProducts.find(p => p.id === productId);
    }
  };

  // Get product by slug
  const getProductBySlug = async (slug) => {
    try {
      if (!supabase) {
        return defaultProducts.find(p => p.slug === slug);
      }

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*)
        `)
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      console.error(`Error fetching product by slug ${slug}:`, err);
      return defaultProducts.find(p => p.slug === slug);
    }
  };

  // Sync products to local storage (optional)
  useEffect(() => {
    localStorage.setItem('chaitrika_products', JSON.stringify(products));
  }, [products]);

  // Fetch all products on mount — always refresh from Supabase
  useEffect(() => {
    fetchProducts();
  }, []);

  // Sync category selection to localStorage
  useEffect(() => {
    localStorage.setItem('activeCategory', activeCategory);
  }, [activeCategory]);

  // Sync wishlist
  useEffect(() => {
    localStorage.setItem('chaitrika_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync recently viewed
  useEffect(() => {
    localStorage.setItem('chaitrika_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Sync dark mode class
  useEffect(() => {
    localStorage.setItem('chaitrika_dark_mode', darkMode.toString());
    const body = document.body;
    if (darkMode) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }, [darkMode]);

  // Wishlist actions
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  // Recently viewed actions
  const addToRecentlyViewed = (productId) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 10);
    });
  };

  // Comparison actions
  const addToComparison = (product) => {
    setComparisonList((prev) => {
      if (prev.length > 0 && prev[0].store !== product.store) {
        throw new Error('You can only compare products from the same store.');
      }
      if (prev.find((item) => item.id === product.id)) return prev;
      if (prev.length >= 3) {
        return [...prev.slice(0, 2), product];
      }
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId) => {
    setComparisonList((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Helper: resolve a local category ID (cat_...) to a real Supabase UUID
  const resolveLocalCategoryId = async (categoryId) => {
    if (!categoryId || !String(categoryId).startsWith('cat_')) {
      return categoryId; // Already a valid UUID
    }

    // Find the category in localStorage
    const cachedCategories = JSON.parse(localStorage.getItem('chaitrika_categories') || '[]');
    const localCat = cachedCategories.find(c => c.id === categoryId);

    if (!localCat) {
      throw new Error('Category not found. Please create the category again.');
    }

    // Sync to Supabase
    const slug = localCat.slug || localCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const { data, error: insertError } = await supabase
      .from('categories')
      .insert([{ name: localCat.name, slug, active: localCat.active !== false, description: localCat.description || null }])
      .select()
      .single();

    if (insertError) throw new Error(`Failed to sync category "${localCat.name}" to database: ${insertError.message}`);

    // Update localStorage with the real Supabase ID
    const updatedCategories = cachedCategories.map(c =>
      c.id === categoryId ? { ...c, id: data.id } : c
    );
    localStorage.setItem('chaitrika_categories', JSON.stringify(updatedCategories));

    return data.id;
  };

  // CRUD Actions for Supabase
  const addProduct = async (productData) => {
    try {
      const baseSlug = (productData.name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') || 'product';
      const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

      let resolvedCategoryId = productData.category_id;
      try {
        resolvedCategoryId = await resolveLocalCategoryId(productData.category_id);
      } catch (catErr) {
        console.warn('Could not resolve category ID:', catErr);
      }

      const newProduct = {
        name: productData.name,
        slug: uniqueSlug,
        category_id: resolvedCategoryId,
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        discount_percent: parseInt(productData.discount_percent) || 0,
        moq: parseInt(productData.moq) || 1,
        image_url: productData.image_url || '',
        active: productData.active !== false,
        display_order: 0,
      };

      if (supabase) {
        try {
          const { data, error: insertError } = await supabase
            .from('products')
            .insert([newProduct])
            .select()
            .single();

          if (!insertError && data) {
            setProducts((prev) => {
              const updated = [data, ...prev.filter((p) => p.id !== data.id)];
              localStorage.setItem('chaitrika_products', JSON.stringify(updated));
              return updated;
            });
            return data;
          }
          if (insertError) {
            console.warn('Supabase insert failed, using local storage:', insertError.message);
          }
        } catch (supaErr) {
          console.warn('Supabase insert error, falling back locally:', supaErr);
        }
      }

      // Local fallback
      const localProduct = {
        ...newProduct,
        id: `prod_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      setProducts((prev) => {
        const updated = [localProduct, ...prev];
        localStorage.setItem('chaitrika_products', JSON.stringify(updated));
        return updated;
      });
      return localProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const imgUrl = updatedData.image_url || updatedData.image || '';

      let resolvedCategoryId = updatedData.category_id;
      if (updatedData.category_id) {
        try {
          resolvedCategoryId = await resolveLocalCategoryId(updatedData.category_id);
        } catch (catErr) {
          console.warn('Could not resolve category ID in updateProduct:', catErr);
        }
      }

      // Clean payload containing only valid columns for Supabase 'products' table
      const dbPayload = {
        updated_at: new Date().toISOString(),
      };
      if (updatedData.name !== undefined) dbPayload.name = updatedData.name;
      if (updatedData.description !== undefined) dbPayload.description = updatedData.description;
      if (updatedData.price !== undefined) dbPayload.price = parseFloat(updatedData.price) || 0;
      if (updatedData.discount_percent !== undefined) dbPayload.discount_percent = parseInt(updatedData.discount_percent) || 0;
      if (updatedData.moq !== undefined) dbPayload.moq = parseInt(updatedData.moq) || 1;
      if (imgUrl) dbPayload.image_url = imgUrl;
      if (updatedData.active !== undefined) dbPayload.active = updatedData.active !== false;
      if (resolvedCategoryId) dbPayload.category_id = resolvedCategoryId;

      const mergedPayload = {
        ...updatedData,
        ...dbPayload,
        image_url: imgUrl,
        image: imgUrl,
      };

      if (supabase && !String(id).startsWith('prod_')) {
        try {
          const { data, error: updateError } = await supabase
            .from('products')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .single();

          if (updateError) {
            console.warn('Supabase product update error:', updateError.message);
          } else if (data) {
            // Re-fetch all products to ensure local state is perfectly in sync with Supabase
            const { data: allProducts, error: fetchErr } = await supabase.from('products').select('*');
            if (!fetchErr && allProducts && allProducts.length > 0) {
              setProducts(allProducts);
              localStorage.setItem('chaitrika_products', JSON.stringify(allProducts));
            } else {
              setProducts((prev) => {
                const updated = prev.map((p) =>
                  String(p.id) === String(id) ? { ...p, ...mergedPayload, ...data } : p
                );
                localStorage.setItem('chaitrika_products', JSON.stringify(updated));
                return updated;
              });
            }
            return { ...mergedPayload, ...data };
          }
        } catch (supaErr) {
          console.warn('Supabase update exception, saving locally:', supaErr);
        }
      }

      // Local fallback
      setProducts((prev) => {
        const updated = prev.map((p) =>
          String(p.id) === String(id) ? { ...p, ...mergedPayload } : p
        );
        localStorage.setItem('chaitrika_products', JSON.stringify(updated));
        return updated;
      });
      return { id, ...mergedPayload };
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      // IMPORTANT: Do NOT remove from state before confirming Supabase deletion
      // This is the root cause of the bug: items disappear from UI but stay in DB
      
      if (supabase && !String(id).startsWith('prod_')) {
        console.log('Deleting product from Supabase:', id);

        // Delete the main product record FIRST (cascade will handle related tables)
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        // Check for deletion error BEFORE updating React state
        if (deleteError) {
          console.error('Supabase DELETE failed:', deleteError);
          throw new Error(`Delete failed: ${deleteError.message}`);
        }

        console.log('Product successfully deleted from Supabase');
      }

      // Only remove from React state AFTER successful Supabase deletion
      setProducts((prev) => {
        const updated = prev.filter((product) => String(product.id) !== String(id));
        localStorage.setItem('chaitrika_products', JSON.stringify(updated));
        return updated;
      });
      setWishlist((prev) => prev.filter((item) => String(item) !== String(id)));
      setComparisonList((prev) => prev.filter((item) => String(item.id) !== String(id)));

      console.log('Product removed from React state and localStorage');
    } catch (err) {
      console.error('Error deleting product:', err);
      // Re-fetch to restore accurate state if deletion failed
      await fetchProducts();
      throw err;
    }
  };

  // Resolve activeCategory (which may be a slug like 'frames' or a UUID or 'all')
  // to the matching category UUID(s) for filtering
  const categoryProducts = (() => {
    if (!activeCategory || activeCategory === 'all') {
      return products; // Show all products
    }
    // Find category by slug or by ID
    const matchedCat = categories.find(
      (c) => c.slug === activeCategory || c.id === activeCategory
    );
    if (matchedCat) {
      return products.filter((p) => p.category_id === matchedCat.id);
    }
    // Fallback: try direct match on category_id
    return products.filter(
      (p) => p.category_id === activeCategory || p.category === activeCategory
    );
  })();

  // Maintain backward compatibility with activeStore for now
  const activeStore = activeCategory;
  const storeProducts = categoryProducts;

  return (
    <ProductContext.Provider
      value={{
        activeCategory,
        setActiveCategory,
        activeStore, // for backward compatibility
        setActiveStore: setActiveCategory, // alias
        products,
        storeProducts,
        categoryProducts,
        loading,
        error,
        fetchProducts,
        getProductById,
        getProductBySlug,
        wishlist,
        toggleWishlist,
        isInWishlist,
        recentlyViewed,
        addToRecentlyViewed,
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        darkMode,
        toggleDarkMode,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
