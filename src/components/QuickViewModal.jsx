import React, { useState } from 'react';
import { FiX, FiShoppingBag, FiHeart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart, showToast } = useCart();
  const { isInWishlist, toggleWishlist } = useProducts();
  
  const productImage = product?.image || product?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
  const [activeImage, setActiveImage] = useState(productImage);
  const [selectedSize, setSelectedSize] = useState(product?.sizes ? product.sizes[0] : 'Standard');
  const [selectedColor, setSelectedColor] = useState(product?.colors ? product.colors[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  if (!product) return null;

  const favorited = isInWishlist(product.id);
  const discountVal = product.discount !== undefined ? product.discount : (product.discount_percent || 0);
  const priceAfterDiscount = Math.round((product.price || 0) * (1 - discountVal / 100));

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast('Product is currently out of stock', 'error');
      return;
    }
    addToCart(product, quantity, selectedSize, selectedColor);
    showToast(`Added ${quantity}x ${product.name} to cart!`, 'success');
    onClose();
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    showToast(
      favorited ? 'Removed from wishlist' : 'Added to wishlist',
      favorited ? 'info' : 'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="relative bg-white w-full max-w-4xl border border-charcoal/10 shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2.5 bg-ivory text-charcoal/60 hover:text-charcoal hover:bg-ivory-sand transition-colors z-10 border border-charcoal/5"
          aria-label="Close dialog"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
          {/* Left Column: Images */}
          <div className="flex flex-col gap-4">
            {/* Active Image with zoom */}
            <div className="relative aspect-[4/5] w-full bg-ivory-warm overflow-hidden border border-charcoal/5">
              <img
                src={activeImage}
                alt={product.name}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500"
              />
              {/* Zoom Overlay */}
              <div
                className="absolute inset-0 pointer-events-none hidden md:block bg-no-repeat"
                style={{
                  ...zoomStyle,
                  backgroundColor: 'rgba(0,0,0,0.02)'
                }}
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 pb-1 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-20 overflow-hidden border flex-shrink-0 transition-all ${
                      activeImage === img ? 'border-charcoal' : 'border-charcoal/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-micro font-medium uppercase tracking-widest text-ink-muted mb-2 block">
                {product.brand || 'Artisan Frame'} • {product.category}
              </span>
              
              <h2 className="font-display text-2xl sm:text-3xl font-light text-charcoal mb-3 leading-snug">
                {product.name}
              </h2>

              {/* Ratings */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-accent">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-charcoal">
                    {product.rating}
                  </span>
                  {product.reviewsCount && (
                    <span className="text-xs text-ink-muted">
                      ({product.reviewsCount} reviews)
                    </span>
                  )}
                </div>
              )}

              {/* Price section */}
              <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-charcoal/10">
                <span className="text-2xl font-light text-charcoal">
                  ₹{priceAfterDiscount.toLocaleString('en-IN')}
                </span>
                {discountVal > 0 && (
                  <>
                    <span className="text-sm text-ink-muted line-through font-light">
                      ₹{(product.price || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-micro font-medium uppercase tracking-wider text-accent border border-accent/20 px-2 py-0.5">
                      {discountVal}% Off
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-ink-muted leading-relaxed mb-6 line-clamp-3">
                {product.description}
              </p>

              {/* Variant selections */}
              <div className="space-y-4 mb-6">
                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <h4 className="text-micro font-medium uppercase tracking-widest text-charcoal mb-2">
                      Color Finish
                    </h4>
                    <div className="flex items-center gap-2.5">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-7 h-7 rounded-full transition-all border ${
                            selectedColor === color
                              ? 'border-charcoal ring-2 ring-charcoal/20 scale-105'
                              : 'border-charcoal/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <h4 className="text-micro font-medium uppercase tracking-widest text-charcoal mb-2">
                      Dimensions / Size
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => {
                        const sizeLabel = typeof sz === 'object' ? sz.size : sz;
                        const isSelected = selectedSize === sizeLabel;
                        return (
                          <button
                            key={sizeLabel}
                            onClick={() => setSelectedSize(sizeLabel)}
                            className={`px-3.5 py-2 text-xs uppercase tracking-wider transition-all border ${
                              isSelected
                                ? 'bg-charcoal text-ivory border-charcoal'
                                : 'bg-transparent text-charcoal border-charcoal/15 hover:border-charcoal/40'
                            }`}
                          >
                            {typeof sz === 'object' ? `${sz.size} (₹${sz.price})` : sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <h4 className="text-micro font-medium uppercase tracking-widest text-charcoal mb-2">
                    Quantity
                  </h4>
                  <div className="inline-flex items-center border border-charcoal/15">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-ivory transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-medium text-charcoal">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal hover:bg-ivory transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-charcoal/10 mt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary py-3 px-6 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <FiShoppingBag className="w-3.5 h-3.5" />
                Add to Bag
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-3 border transition-colors ${
                  favorited
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-charcoal/20 text-charcoal/60 hover:text-charcoal hover:border-charcoal'
                }`}
                title="Wishlist"
              >
                <FiHeart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
