import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const ProductVariantContext = createContext();

export const useProductVariants = () => {
  const context = useContext(ProductVariantContext);
  if (!context) {
    throw new Error('useProductVariants must be used within a ProductVariantProvider');
  }
  return context;
};

export const ProductVariantProvider = ({ children }) => {
  const [productOptions, setProductOptions] = useState({});
  const [optionValues, setOptionValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache for product options
  const cacheKey = (productId) => `product_options_${productId}`;

  // Fetch all options for a product
  const getProductOptions = async (productId) => {
    try {
      if (!supabase) return [];

      // Check cache first
      if (productOptions[productId]) {
        return productOptions[productId];
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('product_options')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      // Fetch option values for each option
      const optionsWithValues = await Promise.all(
        (data || []).map(async (option) => {
          const values = await getOptionValues(option.id);
          return { ...option, values };
        })
      );

      // Cache the options
      setProductOptions(prev => ({
        ...prev,
        [productId]: optionsWithValues,
      }));

      return optionsWithValues;
    } catch (err) {
      console.error(`Error fetching options for product ${productId}:`, err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get values for a specific option
  const getOptionValues = async (optionId) => {
    try {
      if (!supabase) return [];

      // Check cache
      if (optionValues[optionId]) {
        return optionValues[optionId];
      }

      const { data, error: fetchError } = await supabase
        .from('product_option_values')
        .select('*')
        .eq('product_option_id', optionId)
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      // Cache the values
      setOptionValues(prev => ({
        ...prev,
        [optionId]: data || [],
      }));

      return data || [];
    } catch (err) {
      console.error(`Error fetching option values for option ${optionId}:`, err);
      return [];
    }
  };

  // Calculate total price with modifiers
  const calculatePrice = async (basePrice, selectedOptions, productId) => {
    try {
      if (!supabase || !selectedOptions || Object.keys(selectedOptions).length === 0) {
        return basePrice;
      }

      let totalPrice = basePrice;

      // Get product options to find option IDs
      const options = await getProductOptions(productId);

      for (const option of options) {
        const selectedValue = selectedOptions[option.option_name];
        if (!selectedValue) continue;

        // Find the option value and get its price modifier
        const values = await getOptionValues(option.id);
        const valueData = values.find(v => v.value === selectedValue);

        if (valueData && valueData.price_modifier) {
          totalPrice += parseFloat(valueData.price_modifier);
        }
      }

      return totalPrice;
    } catch (err) {
      console.error('Error calculating price:', err);
      return basePrice;
    }
  };

  // Admin: Create product option
  const createOption = async (productId, optionData) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const newOption = {
        product_id: productId,
        option_name: optionData.option_name,
        option_type: optionData.option_type,
        is_required: optionData.is_required !== false,
        display_order: optionData.display_order || 0,
      };

      const { data, error: insertError } = await supabase
        .from('product_options')
        .insert([newOption])
        .select()
        .single();

      if (insertError) throw insertError;

      // Invalidate cache
      setProductOptions(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });

      return data;
    } catch (err) {
      console.error('Error creating option:', err);
      throw err;
    }
  };

  // Admin: Create option value
  const createOptionValue = async (productOptionId, valueData) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const newValue = {
        product_option_id: productOptionId,
        value: valueData.value,
        display_label: valueData.display_label || valueData.value,
        price_modifier: valueData.price_modifier || 0,
        display_order: valueData.display_order || 0,
        active: valueData.active !== false,
      };

      const { data, error: insertError } = await supabase
        .from('product_option_values')
        .insert([newValue])
        .select()
        .single();

      if (insertError) throw insertError;

      // Invalidate cache
      setOptionValues(prev => {
        const updated = { ...prev };
        delete updated[productOptionId];
        return updated;
      });

      return data;
    } catch (err) {
      console.error('Error creating option value:', err);
      throw err;
    }
  };

  // Admin: Update option
  const updateOption = async (optionId, updatedData) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error: updateError } = await supabase
        .from('product_options')
        .update(updatedData)
        .eq('id', optionId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Invalidate cache
      setProductOptions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => delete updated[key]);
        return updated;
      });

      return data;
    } catch (err) {
      console.error('Error updating option:', err);
      throw err;
    }
  };

  // Admin: Update option value
  const updateOptionValue = async (optionValueId, updatedData) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error: updateError } = await supabase
        .from('product_option_values')
        .update(updatedData)
        .eq('id', optionValueId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Invalidate cache
      setOptionValues(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => delete updated[key]);
        return updated;
      });

      return data;
    } catch (err) {
      console.error('Error updating option value:', err);
      throw err;
    }
  };

  // Admin: Delete option (cascades to values)
  const deleteOption = async (optionId) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const { error: deleteError } = await supabase
        .from('product_options')
        .delete()
        .eq('id', optionId);

      if (deleteError) throw deleteError;

      // Invalidate cache
      setProductOptions(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => delete updated[key]);
        return updated;
      });

      setOptionValues(prev => {
        const updated = { ...prev };
        delete updated[optionId];
        return updated;
      });
    } catch (err) {
      console.error('Error deleting option:', err);
      throw err;
    }
  };

  // Admin: Delete option value
  const deleteOptionValue = async (optionValueId) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const { error: deleteError } = await supabase
        .from('product_option_values')
        .delete()
        .eq('id', optionValueId);

      if (deleteError) throw deleteError;

      // Invalidate cache
      setOptionValues(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => delete updated[key]);
        return updated;
      });
    } catch (err) {
      console.error('Error deleting option value:', err);
      throw err;
    }
  };

  return (
    <ProductVariantContext.Provider
      value={{
        productOptions,
        optionValues,
        loading,
        error,
        getProductOptions,
        getOptionValues,
        calculatePrice,
        createOption,
        createOptionValue,
        updateOption,
        updateOptionValue,
        deleteOption,
        deleteOptionValue,
      }}
    >
      {children}
    </ProductVariantContext.Provider>
  );
};
