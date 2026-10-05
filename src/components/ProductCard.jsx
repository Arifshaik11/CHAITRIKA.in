import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import { FiHeart, FiEye, FiShoppingBag } from 'react-icons/fi';
import { MdCompareArrows } from 'react-icons/md';

export default function ProductCard({ product, onQuickView }) {
  const { isInWishlist, toggleWishlist, addToComparison, comparisonList } = useProducts();
  const { categories } = useCategories();
  const { addToCart, showToast } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const favorited = isInWishlist(product.id);
  const isCompared = comparisonList.some((item) => item.id === product.id);

  const matchedCat = categories.find(
    (c) => c.id === product.category_id || String(c.id) === String(product.category_id) || c.slug === product.category_id
  );
  const displayCategory = matchedCat?.name || product.category || product.subcategory || product.brand || '';

  const discountVal = product.discount !== undefined ? product.discount : (product.discount_percent || 0);
  const priceAfterDiscount = Math.round((product.price || 0) * (1 - discountVal / 100));
  const productImage = product.image || product.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
  const stockCount = product.stock !== undefined ? product.stock : 10;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    showToast(
      favorited ? 'Removed from wishlist' : 'Added to wishlist',
      favorited ? 'info' : 'success'
    );
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isCompared) {
        showToast('Already added to comparison', 'info');
      } else {
        addToComparison(product);
        showToast('Added to comparison', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (stockCount <= 0) {
      showToast('Product is currently out of stock', 'error');
      return;
    }
    const defaultSize = product.sizes ? product.sizes[0] : 'Standard';
    const defaultColor = product.colors ? product.colors[0] : null;
    addToCart(product, 1, defaultSize, defaultColor);
    showToast(`Added ${product.name} to cart`, 'success');
  };

  // Stock Badge Logic
  const getStockBadge = () => {
    if (stockCount <= 0) {
      return (
        <span className="absolute top-3 left-3 bg-ink text-white text-micro font-medium px-2 py-0.5 rounded z-10">
          Sold Out
        </span>
      );
    } else if (stockCount <= 5) {
      return (
        <span className="absolute top-3 left-3 bg-accent text-white text-micro font-medium px-2 py-0.5 rounded z-10">
          Only {stockCount} Left
        </span>
      );
    }
    return null;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white border border-border rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-card-hover"
    >
      {/* Badges */}
      {getStockBadge()}
      
      {discountVal > 0 && (
        <span className="absolute top-3 right-3 bg-ink text-white text-micro font-medium px-2 py-0.5 rounded z-10">
          -{discountVal}%
        </span>
      )}

      {/* Image Container */}
      <div className="relative w-full aspect-[4/5] bg-surface-subtle overflow-hidden img-hover-zoom">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Quick action overlay */}
        <div className={`absolute inset-0 bg-ink/20 flex items-center justify-center gap-2.5 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Wishlist */}
          <button
            onClick={handleWishlistClick}
            className={`p-2.5 rounded-md shadow-sm transition-all duration-200 ${
              favorited 
                ? 'bg-accent text-white' 
                : 'bg-white text-ink hover:bg-surface-subtle'
            }`}
            title="Wishlist"
          >
            <FiHeart className="w-4 h-4" />
          </button>
          
          {/* Quick View */}
          <button
            onClick={() => onQuickView(product)}
            className="p-2.5 bg-white text-ink hover:bg-surface-subtle rounded-md shadow-sm transition-all duration-200"
            title="Quick View"
          >
            <FiEye className="w-4 h-4" />
          </button>

          {/* Compare */}
          <button
            onClick={handleCompareClick}
            className={`p-2.5 rounded-md shadow-sm transition-all duration-200 ${
              isCompared 
                ? 'bg-accent text-white' 
                : 'bg-white text-ink hover:bg-surface-subtle'
            }`}
            title="Compare"
          >
            <MdCompareArrows className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        {displayCategory && (
          <span className="text-micro font-medium tracking-wider uppercase text-ink-faint mb-1.5">
            {displayCategory}
          </span>
        )}

        {/* Product Title */}
        <Link 
          to={`/product/${product.id}`}
          className="text-body-sm font-medium text-ink hover:text-accent-dark transition-colors duration-200 line-clamp-1 mb-2"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto mb-3">
          <span className="text-body font-semibold text-ink">
            ₹{priceAfterDiscount.toLocaleString('en-IN')}
          </span>
          {discountVal > 0 && (
            <span className="text-micro text-ink-faint line-through">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={stockCount <= 0}
          className={`w-full py-2.5 rounded-md text-body-sm font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
            stockCount <= 0
              ? 'bg-surface-subtle text-ink-faint cursor-not-allowed'
              : 'bg-ink text-white hover:bg-ink/90'
          }`}
        >
          <FiShoppingBag className="w-3.5 h-3.5" />
          {stockCount <= 0 ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
