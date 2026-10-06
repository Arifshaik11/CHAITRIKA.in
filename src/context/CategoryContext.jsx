import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('chaitrika_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all categories from Supabase — the database is the source of truth
  const fetchCategories = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }

      console.log('Fetching categories from Supabase...');

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*');

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw fetchError;
      }

      // Supabase is the source of truth — even if data is empty, use it
      const freshCategories = data || [];
      console.log('Categories loaded from Supabase:', freshCategories.length, 'items');
      setCategories(freshCategories);
      localStorage.setItem('chaitrika_categories', JSON.stringify(freshCategories));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching from Supabase, trying localStorage:', err.message);
      
      const cached = localStorage.getItem('chaitrika_categories');
      if (cached) {
        setCategories(JSON.parse(cached));
      }
      setLoading(false);
    }
  };

  // Fetch single category by slug
  const getCategoryBySlug = async (slug) => {
    try {
      if (!supabase) return null;

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      console.error(`Error fetching category by slug (${slug}):`, err);
      return null;
    }
  };

  // Fetch category by ID
  const getCategoryById = async (id) => {
    try {
      if (!supabase) return null;

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      console.error(`Error fetching category by id (${id}):`, err);
      return null;
    }
  };

  // Admin: Create new category (with localStorage fallback)
  const createCategory = async (categoryData) => {
    try {
      // Generate slug from name if not provided
      const slug = categoryData.slug || 
        categoryData.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

      const newCategory = {
        id: `cat_${Date.now()}`, // Will be replaced by Supabase ID
        name: categoryData.name,
        slug,
        description: categoryData.description || null,
        image_url: categoryData.image_url || null,
        display_order: categoryData.display_order || 0,
        active: categoryData.active !== false,
        created_at: new Date().toISOString(),
      };

      // Try Supabase first (send without ID - Supabase will generate)
      if (supabase) {
        try {
          const { data, error: insertError } = await supabase
            .from('categories')
            .insert([{ name: newCategory.name, slug: newCategory.slug, active: newCategory.active, description: newCategory.description }])
            .select()
            .single();

          if (!insertError && data) {
            const updated = [...categories, data];
            setCategories(updated);
            localStorage.setItem('chaitrika_categories', JSON.stringify(updated));
            return data;
          }
        } catch (err) {
          console.warn('Supabase failed, using localStorage:', err.message);
        }
      }

      // Fallback to localStorage
      const updated = [...categories, newCategory];
      setCategories(updated);
      localStorage.setItem('chaitrika_categories', JSON.stringify(updated));
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  // Admin: Update category
  const updateCategory = async (id, updatedData) => {
    try {
      // If it's a localStorage ID (starts with "cat_"), just update localStorage
      if (id.startsWith('cat_')) {
        const updated = categories.map(c =>
          c.id === id ? { ...c, ...updatedData } : c
        );
        setCategories(updated);
        localStorage.setItem('chaitrika_categories', JSON.stringify(updated));
        return updated.find(c => c.id === id);
      }

      // Otherwise try Supabase
      if (supabase) {
        const updatePayload = {
          ...updatedData,
          updated_at: new Date().toISOString(),
        };

        const { data, error: updateError } = await supabase
          .from('categories')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (!updateError && data) {
          const updated = categories.map(c => (c.id === id ? data : c));
          setCategories(updated);
          localStorage.setItem('chaitrika_categories', JSON.stringify(updated));
          return data;
        }
      }

      // Fallback to localStorage
      const updated = categories.map(c =>
        c.id === id ? { ...c, ...updatedData } : c
      );
      setCategories(updated);
      localStorage.setItem('chaitrika_categories', JSON.stringify(updated));
      return updated.find(c => c.id === id);
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  // Admin: Delete category
  const deleteCategory = async (id) => {
    try {
      // IMPORTANT: Do NOT remove from state before confirming Supabase deletion
      
      // If it's a localStorage ID (starts with "cat_"), just delete from localStorage
      if (id.startsWith('cat_')) {
        const updated = categories.filter(c => c.id !== id);
        setCategories(updated);
        localStorage.setItem('chaitrika_categories', JSON.stringify(updated));
        return;
      }

      // For Supabase IDs, delete from database FIRST
      if (supabase) {
        console.log('Deleting category from Supabase:', id);

        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);

        // Check for explicit deletion error
        if (deleteError) {
          console.error('Supabase DELETE failed:', deleteError);
          throw new Error(`Delete failed: ${deleteError.message}`);
        }

        // VERIFY the row is actually gone (RLS can silently block deletes with no error)
        const { data: checkRow, error: checkError } = await supabase
          .from('categories')
          .select('id')
          .eq('id', id)
          .maybeSingle();

        if (checkError) {
          console.warn('Could not verify deletion:', checkError.message);
        } else if (checkRow) {
          // Row still exists — deletion was silently blocked (likely RLS)
          console.error('Category still exists after DELETE — RLS policy is blocking the delete');
          throw new Error('Delete was blocked by database permissions. Please check Supabase RLS policies for the categories table.');
        }

        console.log('Category successfully deleted from Supabase');
      }

      // Only remove from React state AFTER confirmed Supabase deletion
      const updated = categories.filter(c => c.id !== id);
      setCategories(updated);
      localStorage.setItem('chaitrika_categories', JSON.stringify(updated));
    } catch (err) {
      console.error('Error deleting category:', err);
      // Re-fetch to restore accurate state if deletion failed
      await fetchCategories();
      throw err;
    }
  };

  // Admin: Reorder categories
  const reorderCategories = async (categoryOrders) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      // categoryOrders should be: [{ id, display_order }, ...]
      const updates = categoryOrders.map(order => ({
        id: order.id,
        display_order: order.display_order,
        updated_at: new Date().toISOString(),
      }));

      // Update all categories in parallel
      const updatePromises = updates.map(update =>
        supabase
          .from('categories')
          .update({ display_order: update.display_order, updated_at: update.updated_at })
          .eq('id', update.id)
      );

      await Promise.all(updatePromises);

      // Refresh categories
      await fetchCategories();
    } catch (err) {
      console.error('Error reordering categories:', err);
      throw err;
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        fetchCategories,
        getCategoryBySlug,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};
