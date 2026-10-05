import React from 'react';
import { FiX, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

export default function ComparisonModal() {
  const { comparisonList, removeFromComparison, clearComparison } = useProducts();
  const { addToCart, showToast } = useCart();

  if (comparisonList.length === 0) return null;

  // Extract all unique specification keys from compared products
  const allSpecKeys = Array.from(
    new Set(
      comparisonList.reduce((acc, prod) => {
        if (prod.specs) {
          acc.push(...Object.keys(prod.specs));
        }
        return acc;
      }, [])
    )
  );

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      showToast('Out of stock', 'error');
      return;
    }
    const defaultSize = product.sizes ? product.sizes[0] : 'Standard';
    const defaultColor = product.colors ? product.colors[0] : null;
    addToCart(product, 1, defaultSize, defaultColor);
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-charcoal/10 shadow-2xl max-h-[65vh] overflow-y-auto animate-fade-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-charcoal/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="bg-charcoal text-ivory text-micro font-medium px-2.5 py-0.5 tracking-wider uppercase">
              {comparisonList.length} Selected
            </span>
            <h3 className="font-display text-lg text-charcoal tracking-wide">
              Compare Frames
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={clearComparison}
              className="text-xs font-medium uppercase tracking-wider text-ink-muted hover:text-charcoal flex items-center gap-1.5 transition-colors"
            >
              <FiTrash2 className="w-3.5 h-3.5" /> Clear All
            </button>
            <button
              onClick={clearComparison}
              className="p-1.5 bg-ivory text-charcoal/60 hover:text-charcoal border border-charcoal/10 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-4 gap-4 overflow-x-auto min-w-[700px] pb-4">
          {/* Attributes Column */}
          <div className="flex flex-col gap-5 text-micro font-medium text-ink-muted uppercase tracking-widest justify-end pb-3 border-r border-charcoal/10 pr-4">
            <div className="h-32 flex items-end">Product</div>
            <div className="h-8 flex items-center">Name</div>
            <div className="h-8 flex items-center">Price</div>
            <div className="h-8 flex items-center">Rating</div>
            <div className="h-8 flex items-center">Material</div>
            <div className="h-8 flex items-center">Category</div>
            <div className="h-8 flex items-center">Status</div>
            {allSpecKeys.map((key) => (
              <div key={key} className="h-8 flex items-center line-clamp-1">{key}</div>
            ))}
            <div className="h-10">Action</div>
          </div>

          {/* Product Columns */}
          {comparisonList.map((product) => {
            const priceAfterDiscount = Math.round(product.price * (1 - (product.discount || 0) / 100));
            return (
              <div key={product.id} className="relative flex flex-col gap-5 text-sm border-r border-charcoal/10 last:border-0 pr-4">
                {/* Remove button */}
                <button
                  onClick={() => removeFromComparison(product.id)}
                  className="absolute top-1 right-2 p-1.5 bg-ivory hover:bg-ivory-sand text-charcoal/50 hover:text-charcoal border border-charcoal/10 transition-colors z-10"
                  title="Remove"
                >
                  <FiX className="w-3 h-3" />
                </button>

                {/* Product Image */}
                <div className="h-32 w-full overflow-hidden bg-ivory-warm border border-charcoal/5">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* Product Name */}
                <div className="h-8 font-display text-base text-charcoal line-clamp-1 leading-tight">
                  {product.name}
                </div>

                {/* Price */}
                <div className="h-8 flex items-center gap-2">
                  <span className="font-light text-charcoal text-base">
                    ₹{priceAfterDiscount.toLocaleString('en-IN')}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-xs text-ink-muted line-through">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="h-8 flex items-center text-xs text-charcoal">
                  ★ {product.rating || '4.9'} <span className="text-ink-muted ml-1 font-light">({product.reviewsCount || '12'})</span>
                </div>

                {/* Brand */}
                <div className="h-8 flex items-center text-ink-muted text-xs uppercase tracking-wider">
                  {product.brand || 'Artisan'}
                </div>

                {/* Category */}
                <div className="h-8 flex items-center text-charcoal text-xs">
                  {product.category}
                </div>

                {/* Availability */}
                <div className="h-8 flex items-center">
                  {product.stock > 0 ? (
                    <span className="text-micro font-medium text-emerald-800 uppercase tracking-widest">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-micro font-medium text-accent uppercase tracking-widest">
                      Made to Order
                    </span>
                  )}
                </div>

                {/* Specifications */}
                {allSpecKeys.map((key) => {
                  const val = product.specs ? product.specs[key] : '-';
                  return (
                    <div key={key} className="h-8 flex items-center text-ink-muted text-xs line-clamp-1">
                      {val || '-'}
                    </div>
                  );
                })}

                {/* Actions */}
                <div className="h-10 mt-auto">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full btn-primary text-micro uppercase tracking-widest py-2 flex items-center justify-center gap-1.5"
                  >
                    <FiShoppingBag className="w-3 h-3" /> Add to Bag
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add item placeholder if list is less than 3 */}
          {[...Array(Math.max(0, 3 - comparisonList.length))].map((_, i) => (
            <div key={i} className="border border-dashed border-charcoal/15 flex flex-col items-center justify-center p-6 text-center text-ink-muted bg-ivory/40">
              <span className="text-xs uppercase tracking-widest font-medium">Empty Slot</span>
              <span className="text-micro text-ink-muted mt-1">Select frame to compare</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
