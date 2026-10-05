import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight, FiTag, FiXCircle } from 'react-icons/fi';
import { COUPONS } from '../data/mockData';

export default function Cart() {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
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
    showToast
  } = useCart();
  const { products } = useProducts();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    try {
      applyCoupon(couponInput.trim());
      showToast('Coupon applied successfully', 'success');
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleQuickApplyCoupon = (code) => {
    setCouponError('');
    try {
      applyCoupon(code);
      showToast('Coupon applied successfully', 'success');
    } catch (err) {
      setCouponError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleRemoveItem = (id, size, color) => {
    removeFromCart(id, size, color);
    showToast('Item removed from cart', 'info');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-ivory flex flex-col items-center justify-center p-6 text-center">
        <Helmet>
          <title>Shopping Cart | Chaitrika</title>
        </Helmet>
        <div className="w-16 h-16 bg-surface-subtle text-ink-faint rounded-lg flex items-center justify-center text-2xl mb-5">
          <FiShoppingBag />
        </div>
        <h2 className="font-display text-display-sm font-medium text-ink mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-body-sm text-ink-muted max-w-sm mb-8 leading-relaxed">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Link
          to="/products"
          className="btn-primary px-6 py-3 text-body-sm"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-8 lg:py-12">
      <Helmet>
        <title>Cart | Chaitrika</title>
      </Helmet>

      <div className="container-premium">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-5 mb-8">
          <div>
            <h1 className="font-display text-display-sm font-medium text-ink">
              Shopping Cart
            </h1>
            <p className="text-body-sm text-ink-muted mt-1">
              {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={() => {
              clearCart();
              showToast('Cart cleared', 'info');
            }}
            className="text-body-sm font-medium text-ink-faint hover:text-ink transition-colors duration-200 flex items-center gap-1"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => {
              const itemKey = `${item.id}-${item.selectedSize}-${item.selectedColor}`;
              const liveProduct = products.find((p) => String(p.id) === String(item.id) || p.slug === item.id);
              const productImage = item.image || item.image_url || liveProduct?.image_url || liveProduct?.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';

              return (
                <div
                  key={itemKey}
                  className="bg-white border border-border p-4 sm:p-5 rounded-lg flex gap-4 transition-all duration-200 hover:shadow-card"
                >
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-22 sm:h-22 bg-surface-subtle rounded overflow-hidden border border-border-subtle flex-shrink-0">
                    <img
                      src={liveProduct?.image_url || liveProduct?.image || productImage}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <Link
                          to={`/product/${item.id}`}
                          className="text-body-sm font-medium text-ink hover:text-accent-dark transition-colors duration-200 line-clamp-1 pr-4"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.selectedSize, item.selectedColor)}
                          className="text-ink-faint hover:text-ink transition-colors duration-200 p-1"
                          title="Remove"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Attributes */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {item.selectedSize && (
                          <span className="text-micro text-ink-muted bg-surface-subtle px-2 py-0.5 rounded">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <div className="flex items-center gap-1 bg-surface-subtle px-2 py-0.5 rounded text-micro text-ink-muted">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block border border-border"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-body-sm font-semibold text-ink">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-micro text-ink-faint line-through">
                            ₹{item.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between border-t border-border-subtle pt-3 mt-3">
                      <div className="flex items-center border border-border rounded bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink transition-colors duration-200"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-body-sm font-medium text-ink">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink transition-colors duration-200"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <span className="text-body-sm text-ink-muted">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            
            {/* Coupon */}
            <div className="bg-white border border-border p-5 rounded-lg">
              <h3 className="text-micro font-medium uppercase tracking-wider text-ink-faint mb-4 flex items-center gap-1.5">
                <FiTag className="w-3.5 h-3.5" /> Promo Code
              </h3>
              
              <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-body-sm bg-surface-subtle border border-border rounded focus:outline-none focus:border-accent transition-colors duration-200"
                />
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-dark text-white text-body-sm font-medium px-4 rounded transition-colors duration-200"
                >
                  Apply
                </button>
              </form>

              {couponError && <p className="text-micro font-medium text-red-500 mb-3">{couponError}</p>}

              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200/50 p-3 rounded flex items-center justify-between">
                  <div>
                    <p className="text-micro font-medium text-green-800 uppercase flex items-center gap-1">
                      ✓ {appliedCoupon.code}
                    </p>
                    <p className="text-micro text-green-600 mt-0.5">
                      {appliedCoupon.description}
                    </p>
                  </div>
                  <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 transition-colors duration-200">
                    <FiXCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                COUPONS && COUPONS.length > 0 && (
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-border-subtle">
                    <p className="text-micro font-medium text-ink-faint uppercase tracking-wider mb-2">Available</p>
                    {COUPONS.map((c) => {
                      const subtotal = getSubtotal();
                      const disabled = subtotal < c.minPurchase;
                      return (
                        <button
                          key={c.code}
                          onClick={() => !disabled && handleQuickApplyCoupon(c.code)}
                          disabled={disabled}
                          className={`w-full text-left p-2.5 border rounded flex flex-col transition-all duration-200 ${
                            disabled
                              ? 'bg-surface-subtle border-border-subtle opacity-40 cursor-not-allowed'
                              : 'border-border hover:border-accent bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-micro font-semibold text-accent-dark uppercase">
                              {c.code}
                            </span>
                            <span className="text-micro text-ink-faint">
                              Min: ₹{c.minPurchase}
                            </span>
                          </div>
                          <span className="text-micro text-ink-muted mt-0.5">{c.description}</span>
                        </button>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-ink text-white p-5 rounded-lg">
              <h3 className="font-display text-body-lg font-medium text-white mb-5 border-b border-white/10 pb-3">
                Order Summary
              </h3>

              <div className="space-y-3 mb-5 text-body-sm text-white/50">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span className="text-white font-medium">₹{getSubtotal().toLocaleString('en-IN')}</span>
                </div>
                
                {getCouponDiscount() > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-medium">−₹{getCouponDiscount().toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-green-400">
                  <span>Delivery</span>
                  <span className="font-medium">Free</span>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                  <span className="font-medium text-white text-body">Total</span>
                  <span className="text-heading font-semibold text-accent">
                    ₹{getGrandTotal().toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <Link to="/checkout" className="block w-full">
                <button className="w-full bg-white text-ink py-3 rounded-md font-medium text-body-sm flex items-center justify-center gap-1.5 hover:bg-white/90 transition-colors duration-200">
                  Checkout <FiArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <Link
                to="/products"
                className="block text-center text-body-sm text-white/40 hover:text-white/60 transition-colors duration-200 mt-4"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
