import { supabase } from '../supabase';
import { uploadOrderImage } from './imageUpload';

/**
 * Generate unique order number
 */
export const generateOrderNumber = async (orderPrefix = 'ORD') => {
  try {
    if (!supabase) {
      // Fallback if Supabase not configured
      return `${orderPrefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    // Get current date for ordering
    const today = new Date().toISOString().split('T')[0];
    
    // Get latest order number
    const { data, error } = await supabase
      .from('orders')
      .select('order_number')
      .like('order_number', `${orderPrefix}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNumber = 1001; // Starting number

    if (data && data.length > 0) {
      const lastOrderNumber = data[0].order_number;
      const match = lastOrderNumber.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0]) + 1;
      }
    }

    return `${orderPrefix}-${nextNumber}`;
  } catch (err) {
    console.error('Error generating order number:', err);
    return `${orderPrefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
};

/**
 * Create order in database
 */
export const createOrder = async (orderData) => {
  const {
    orderNumber,
    customerName,
    customerPhone,
    customerWhatsapp,
    customerEmail,
    deliveryAddress,
    deliveryCity,
    deliveryState,
    deliveryPincode,
    customerNotes,
    subtotal,
    deliveryCharge,
    tax,
    totalAmount,
    orderItems,
  } = orderData;

  const fallbackOrder = {
    id: `ord_${Date.now()}`,
    order_number: orderNumber,
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_whatsapp: customerWhatsapp || customerPhone,
    customer_email: customerEmail,
    delivery_address: deliveryAddress,
    delivery_city: deliveryCity,
    delivery_state: deliveryState,
    delivery_pincode: deliveryPincode,
    customer_notes: customerNotes,
    subtotal: parseFloat(subtotal),
    delivery_charge: parseFloat(deliveryCharge) || 0,
    tax: parseFloat(tax) || 0,
    total_amount: parseFloat(totalAmount),
    status: 'pending_whatsapp',
    created_at: new Date().toISOString(),
    order_items: orderItems,
  };

  try {
    if (supabase) {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            order_number: orderNumber,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_whatsapp: customerWhatsapp || customerPhone,
            customer_email: customerEmail,
            delivery_address: deliveryAddress,
            delivery_city: deliveryCity,
            delivery_state: deliveryState,
            delivery_pincode: deliveryPincode,
            customer_notes: customerNotes,
            subtotal: parseFloat(subtotal),
            delivery_charge: parseFloat(deliveryCharge) || 0,
            tax: parseFloat(tax) || 0,
            total_amount: parseFloat(totalAmount),
            status: 'pending_whatsapp',
            payment_method: 'whatsapp',
          }
        ])
        .select()
        .single();

      if (!orderError && order) {
        if (orderItems && orderItems.length > 0) {
          const itemsToInsert = orderItems.map(item => ({
            order_id: order.id,
            product_id: item.productId,
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: parseFloat(item.unitPrice),
            selected_options: item.selectedOptions || {},
            subtotal: parseFloat(item.subtotal),
          }));

          await supabase.from('order_items').insert(itemsToInsert);
        }

        return { order, error: null };
      }
    }
  } catch (err) {
    console.warn('Supabase createOrder error, saving locally:', err);
  }

  // Save to local storage cache so admin and customer order history persists
  try {
    const existingOrders = JSON.parse(localStorage.getItem('chaitrika_orders') || '[]');
    localStorage.setItem('chaitrika_orders', JSON.stringify([fallbackOrder, ...existingOrders]));
  } catch (lsErr) {
    console.warn('Could not save to localStorage:', lsErr);
  }

  return { order: fallbackOrder, error: null };
};

/**
 * Upload custom image for order
 */
export const addCustomImageToOrder = async (orderId, orderItemId, productId, file) => {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Get order number for path
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Upload image to Supabase Storage
    const uploadResult = await uploadOrderImage(file, order.order_number);
    
    if (uploadResult.error) {
      throw new Error(uploadResult.error);
    }

    // Create database record
    const { data, error: dbError } = await supabase
      .from('uploaded_custom_images')
      .insert([
        {
          order_id: orderId,
          order_item_id: orderItemId,
          product_id: productId,
          image_url: uploadResult.url,
          image_original_name: file.name,
          file_size_bytes: file.size,
          image_type: file.type,
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      data,
      error: null,
    };
  } catch (err) {
    console.error('Error adding custom image:', err);
    return {
      data: null,
      error: err.message,
    };
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Add timestamp based on status
    if (newStatus === 'whatsapp_sent') {
      updateData.whatsapp_sent_at = new Date().toISOString();
    } else if (newStatus === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return {
      data,
      error: null,
    };
  } catch (err) {
    console.error('Error updating order status:', err);
    return {
      data: null,
      error: err.message,
    };
  }
};

/**
 * Get order with all details
 */
export const getOrderWithDetails = async (orderId) => {
  try {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        uploaded_custom_images (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return {
      data,
      error: null,
    };
  } catch (err) {
    console.error('Error fetching order:', err);
    return {
      data: null,
      error: err.message,
    };
  }
};

/**
 * Get store settings
 */
export const getStoreSettings = async () => {
  try {
    if (!supabase) {
      return {
        whatsappNumber: '+918499999498',
        deliveryCharge: 0,
        storeName: 'Chaitra',
        currency: 'INR',
        currencySymbol: '₹',
        taxPercent: 0,
        orderPrefix: 'ORD',
      };
    }

    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value');

    if (error) throw error;

    const settings = {};
    (data || []).forEach((setting) => {
      settings[setting.setting_key] = setting.setting_value;
    });

    return {
      whatsappNumber: '+918499999498',
      deliveryCharge: parseFloat(settings.delivery_charge) || 0,
      storeName: settings.store_name || 'Chaitra',
      currency: settings.currency || 'INR',
      currencySymbol: settings.currency_symbol || '₹',
      taxPercent: parseFloat(settings.tax_percent) || 0,
      orderPrefix: settings.order_prefix || 'ORD',
    };
  } catch (err) {
    console.error('Error fetching settings:', err);
    return {
      whatsappNumber: '+918499999498',
      deliveryCharge: 0,
      storeName: 'Chaitra',
      currency: 'INR',
      currencySymbol: '₹',
      taxPercent: 0,
      orderPrefix: 'ORD',
    };
  }
};

/**
 * Calculate order totals with tax and delivery
 */
export const calculateOrderTotals = (subtotal, deliveryCharge, taxPercent) => {
  const tax = (subtotal * taxPercent) / 100;
  const total = subtotal + deliveryCharge + tax;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    deliveryCharge: parseFloat(deliveryCharge.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};
