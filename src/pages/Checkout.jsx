import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import ProductOptionsRenderer from '../components/ProductOptionsRenderer';
import { FiArrowLeft, FiAlertCircle, FiCheck } from 'react-icons/fi';
import {
  generateOrderNumber,
  createOrder,
  addCustomImageToOrder,
  getStoreSettings,
  calculateOrderTotals,
} from '../utils/orderProcessing';
import { generateWhatsAppMessage, openWhatsApp, formatPhoneNumber, validateWhatsAppPhone } from '../utils/whatsappMessage';
import { uploadOrderImage } from '../utils/imageUpload';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getSubtotal, getGrandTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [uploadedImages, setUploadedImages] = useState({});
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);
  const [errors, setErrors] = useState({});

  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerWhatsapp: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryPincode: '',
    customerNotes: '',
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const storeSettings = await getStoreSettings();
        setSettings(storeSettings);
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Redirect if no cart items
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      navigate('/products');
    }
  }, [cartItems, loading, navigate]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (file, optionId, optionName) => {
    if (!file) {
      setUploadedImages(prev => {
        const newImages = { ...prev };
        delete newImages[optionName];
        return newImages;
      });
      return;
    }

    try {
      setProcessingOrder(true);
      const result = await uploadOrderImage(file, 'temp');
      
      if (result.error) {
        setErrors(prev => ({ ...prev, imageUpload: result.error }));
      } else {
        setUploadedImages(prev => ({
          ...prev,
          [optionName]: {
            url: result.url,
            path: result.path,
            name: file.name,
            preview: URL.createObjectURL(file),
          },
        }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, imageUpload: err.message }));
    } finally {
      setProcessingOrder(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Name is required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Phone is required';
    if (!validateWhatsAppPhone(formData.customerPhone)) {
      newErrors.customerPhone = 'Invalid phone number';
    }
    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email address';
    }
    if (!formData.deliveryAddress.trim()) newErrors.deliveryAddress = 'Address is required';
    if (!formData.deliveryCity.trim()) newErrors.deliveryCity = 'City is required';
    if (!formData.deliveryState.trim()) newErrors.deliveryState = 'State is required';
    if (!formData.deliveryPincode.trim()) newErrors.deliveryPincode = 'Pincode is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setProcessingOrder(true);

      // Generate order number
      const orderNumber = await generateOrderNumber(settings.orderPrefix);

      // Prepare order data
      const subtotal = getSubtotal();
      const total = getGrandTotal();
      const deliveryCharge = 0;
      const tax = 0;

      const orderItems = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        selectedOptions: item.selectedOptions || {},
        subtotal: item.price * item.quantity,
      }));

      // Create order in database
      const { order, error: orderError } = await createOrder({
        orderNumber,
        customerName: formData.customerName,
        customerPhone: formatPhoneNumber(formData.customerPhone),
        customerWhatsapp: formData.customerWhatsapp ? formatPhoneNumber(formData.customerWhatsapp) : null,
        customerEmail: formData.customerEmail,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity,
        deliveryState: formData.deliveryState,
        deliveryPincode: formData.deliveryPincode,
        customerNotes: formData.customerNotes,
        subtotal,
        deliveryCharge,
        tax,
        totalAmount: total,
        orderItems,
      });

      if (orderError) {
        throw new Error(orderError);
      }

      // Upload custom images if any
      if (Object.keys(uploadedImages).length > 0) {
        for (const [optionName, imageData] of Object.entries(uploadedImages)) {
          const orderItem = order.order_items?.[0]; // Associate with first item for now
          if (orderItem && imageData.file) {
            await addCustomImageToOrder(order.id, orderItem.id, orderItem.product_id, imageData.file);
          }
        }
      }

      setOrderCreated({
        orderNumber,
        subtotal,
        deliveryCharge,
        tax,
        total,
        customerPhone: formData.customerPhone,
      });

      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage(
        {
          orderNumber,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
          deliveryAddress: formData.deliveryAddress,
          deliveryCity: formData.deliveryCity,
          deliveryState: formData.deliveryState,
          deliveryPincode: formData.deliveryPincode,
          orderItems,
          customImages: Object.keys(uploadedImages).map((key) => ({
            productName: key,
          })),
          subtotal,
          deliveryCharge,
          tax,
          totalAmount: total,
          customerNotes: formData.customerNotes,
        },
        {
          storeName: settings.storeName,
          currencySymbol: settings.currencySymbol,
        }
      );

      // Open WhatsApp
      setTimeout(() => {
        openWhatsApp(settings.whatsappNumber, whatsappMessage);
        clearCart();
      }, 1000);
    } catch (err) {
      console.error('Error placing order:', err);
      setErrors(prev => ({ ...prev, submit: err.message }));
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ivory">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border border-ink-faint border-t-accent rounded-full animate-spin"></div>
          <p className="mt-4 text-body-sm text-ink-muted">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-ivory py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-body text-ink-muted mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const total = getGrandTotal();

  // Input styling helper
  const inputClass = (field) => `w-full px-4 py-2.5 border rounded-md bg-white text-ink text-body-sm focus:outline-none focus:border-accent transition-colors duration-200 ${
    errors[field] ? 'border-red-400' : 'border-border'
  }`;

  return (
    <div className="min-h-screen bg-ivory py-8 lg:py-12">
      <Helmet>
        <title>Checkout — {settings.storeName}</title>
      </Helmet>

      <div className="container-premium max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-surface-subtle rounded transition-colors duration-200"
          >
            <FiArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <h1 className="font-display text-display-sm font-medium text-ink">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg border border-border p-5 lg:p-6">
              <h2 className="text-body-lg font-medium text-ink mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between items-start py-2.5 border-b border-border-subtle last:border-0">
                    <div className="flex-1">
                      <p className="text-body-sm font-medium text-ink">{item.name}</p>
                      <p className="text-micro text-ink-muted">Qty: {item.quantity}</p>
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <p className="text-micro text-ink-faint mt-0.5">
                          {Object.entries(item.selectedOptions).map(([key, val]) => `${key}: ${val}`).join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="text-body-sm font-medium text-ink">{settings.currencySymbol}{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-lg border border-border p-5 lg:p-6">
              <h2 className="text-body-lg font-medium text-ink mb-4">Customer Details</h2>
              
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex gap-2">
                  <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-body-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium text-ink mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => handleFormChange('customerName', e.target.value)}
                    className={inputClass('customerName')}
                  />
                  {errors.customerName && <p className="text-micro text-red-500 mt-1">{errors.customerName}</p>}
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-ink mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleFormChange('customerPhone', e.target.value)}
                    placeholder="10 digit number"
                    className={inputClass('customerPhone')}
                  />
                  {errors.customerPhone && <p className="text-micro text-red-500 mt-1">{errors.customerPhone}</p>}
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-ink mb-1.5">WhatsApp (if different)</label>
                  <input
                    type="tel"
                    value={formData.customerWhatsapp}
                    onChange={(e) => handleFormChange('customerWhatsapp', e.target.value)}
                    placeholder="Leave blank if same as phone"
                    className={inputClass('customerWhatsapp')}
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-ink mb-1.5">Email (optional)</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleFormChange('customerEmail', e.target.value)}
                    className={inputClass('customerEmail')}
                  />
                  {errors.customerEmail && <p className="text-micro text-red-500 mt-1">{errors.customerEmail}</p>}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg border border-border p-5 lg:p-6">
              <h2 className="text-body-lg font-medium text-ink mb-4">Delivery Address</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium text-ink mb-1.5">Address *</label>
                  <textarea
                    value={formData.deliveryAddress}
                    onChange={(e) => handleFormChange('deliveryAddress', e.target.value)}
                    placeholder="Street address, building name, etc."
                    rows="3"
                    className={inputClass('deliveryAddress')}
                  />
                  {errors.deliveryAddress && <p className="text-micro text-red-500 mt-1">{errors.deliveryAddress}</p>}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-body-sm font-medium text-ink mb-1.5">City *</label>
                    <input
                      type="text"
                      value={formData.deliveryCity}
                      onChange={(e) => handleFormChange('deliveryCity', e.target.value)}
                      className={inputClass('deliveryCity')}
                    />
                    {errors.deliveryCity && <p className="text-micro text-red-500 mt-1">{errors.deliveryCity}</p>}
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-ink mb-1.5">State *</label>
                    <input
                      type="text"
                      value={formData.deliveryState}
                      onChange={(e) => handleFormChange('deliveryState', e.target.value)}
                      className={inputClass('deliveryState')}
                    />
                    {errors.deliveryState && <p className="text-micro text-red-500 mt-1">{errors.deliveryState}</p>}
                  </div>

                  <div>
                    <label className="block text-body-sm font-medium text-ink mb-1.5">Pincode *</label>
                    <input
                      type="text"
                      value={formData.deliveryPincode}
                      onChange={(e) => handleFormChange('deliveryPincode', e.target.value)}
                      className={inputClass('deliveryPincode')}
                    />
                    {errors.deliveryPincode && <p className="text-micro text-red-500 mt-1">{errors.deliveryPincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg border border-border p-5 lg:p-6">
              <h2 className="text-body-lg font-medium text-ink mb-4">Special Instructions</h2>
              <textarea
                value={formData.customerNotes}
                onChange={(e) => handleFormChange('customerNotes', e.target.value)}
                placeholder="Any special delivery instructions or customization notes..."
                rows="3"
                className="w-full px-4 py-2.5 border border-border rounded-md bg-white text-ink text-body-sm focus:outline-none focus:border-accent transition-colors duration-200"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-border p-5 sticky top-20">
              <h3 className="text-body-lg font-medium text-ink mb-4">Price Summary</h3>

              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-body-sm">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="font-medium text-ink">{settings.currencySymbol}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-body-sm text-green-600">
                  <span>Delivery</span>
                  <span className="font-medium">Free</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-body font-medium text-ink">Total</span>
                <span className="text-heading font-semibold text-accent">{settings.currencySymbol}{subtotal.toLocaleString()}</span>
              </div>

              {errors.imageUpload && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-micro text-red-700">
                  {errors.imageUpload}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={processingOrder}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingOrder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Place Order via WhatsApp
                  </>
                )}
              </button>

              <p className="text-micro text-ink-faint mt-4 text-center">
                Your order details will be sent to WhatsApp for confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
