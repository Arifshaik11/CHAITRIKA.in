import React, { createContext, useContext, useState, useEffect } from 'react';
import { COUPONS } from '../data/mockData';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('chaitrika_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem('chaitrika_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('chaitrika_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync coupon to local storage
  useEffect(() => {
    localStorage.setItem('chaitrika_coupon', JSON.stringify(appliedCoupon));
  }, [appliedCoupon]);

  const addToCart = (product, quantity = 1, selectedSize = 'Standard', selectedColor = null) => {
    setCartItems((prev) => {
      // Find matching item with same id, size and color
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      const discountVal = product.discount !== undefined ? product.discount : (product.discount_percent || 0);
      const priceNum = parseFloat(product.price) || 0;
      const priceAfterDiscount = Math.round(priceNum * (1 - discountVal / 100));
      const productImage = product.image || product.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            store: product.store || '',
            category: product.category || product.subcategory || '',
            price: priceAfterDiscount,
            originalPrice: priceNum,
            discount: discountVal,
            image: productImage,
            image_url: productImage,
            selectedSize,
            selectedColor,
            quantity,
            stock: product.stock !== undefined ? product.stock : 10
          }
        ];
      }
    });
  };

  const removeFromCart = (id, selectedSize, selectedColor) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      )
    );
  };

  const updateQuantity = (id, selectedSize, selectedColor, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id, selectedSize, selectedColor);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const applyCoupon = (code) => {
    const couponMatch = COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!couponMatch) {
      throw new Error('Invalid coupon code.');
    }

    const subtotal = getSubtotal();
    if (subtotal < couponMatch.minPurchase) {
      throw new Error(`Minimum purchase of ₹${couponMatch.minPurchase} required for this coupon.`);
    }

    // Specific coupon logic (e.g. KEYCHAIN15 requires keychains in the cart)
    if (couponMatch.code === 'KEYCHAIN15') {
      const keychainTotal = cartItems
        .filter((item) => item.store === 'keychains')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      if (keychainTotal < 1000) {
        throw new Error('This coupon requires at least ₹1,000 worth of keychains in the cart.');
      }
    }

    setAppliedCoupon(couponMatch);
    return couponMatch;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const getCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getSubtotal();
    
    // Check if subtotal fell below minPurchase after quantity changes
    if (subtotal < appliedCoupon.minPurchase) {
      return 0; // automatically inactive
    }

    if (appliedCoupon.code === 'FREESHIP') {
      // FREESHIP grants free shipping (simulated by discounting shipping cost up to 100)
      return 0; // Handled separately in shipping
    }

    if (appliedCoupon.code === 'KEYCHAIN15') {
      const keychainTotal = cartItems
        .filter((item) => item.store === 'keychains')
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      return Math.round(keychainTotal * 0.15);
    }

    // Default percentage discount (CHAITRA10)
    return Math.round(subtotal * (appliedCoupon.discount / 100));
  };

  const getShippingFee = () => {
    return 0; // Free delivery
  };

  const getTaxAmount = () => {
    return 0; // No tax added
  };

  const getGrandTotal = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    const discount = getCouponDiscount();
    return Math.max(0, subtotal - discount);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getSubtotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        getCouponDiscount,
        getShippingFee,
        getTaxAmount,
        getGrandTotal,
        getTotalItems,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
