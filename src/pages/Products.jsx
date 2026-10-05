import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { FiChevronRight, FiFilter, FiX, FiInbox } from 'react-icons/fi';

export default function Products() {
  const { products, wishlist, isInWishlist } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { showToast } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Route parameters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const categoryParam = queryParams.get('category') || 'all';
  const searchParam = queryParams.get('search') || '';
  const filterParam = queryParams.get('filter') || ''; // e.g. 'wishlist'

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  // Dynamically calculate the maximum price across all loaded products
  const maxProductPrice = useMemo(() => {
    if (!products || products.length === 0) return 100000000;
    const maxInDb = Math.max(...products.map((p) => parseFloat(p.price) || 0));
    return Math.max(maxInDb, 1000000);
  }, [products]);

  const [priceRange, setPriceRange] = useState(100000000);

  // Sync priceRange max when products load if priceRange was at default high value
  useEffect(() => {
    if (priceRange < maxProductPrice && priceRange === 1000000) {
      setPriceRange(maxProductPrice);
    }
  }, [maxProductPrice]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync inputs with URL params
  useEffect(() => {
    setSearchQuery(searchParam);
    setSelectedCategory(categoryParam);
  }, [searchParam, categoryParam]);

  // Loading skeleton simulation on category changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [selectedCategory, location.search]);

  // Extract unique brands, colors, materials, sizes from products
  const { brands, colors, materials, sizes } = useMemo(() => {
    const brandsSet = new Set();
    const colorsSet = new Set();
    const materialsSet = new Set();
    const sizesSet = new Set();

    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
      if (p.colors) p.colors.forEach((c) => colorsSet.add(c));
      if (p.materials) p.materials.forEach((m) => materialsSet.add(m));
      if (p.sizes) p.sizes.forEach((s) => sizesSet.add(typeof s === 'object' ? s.size : s));
    });

    return {
      brands: Array.from(brandsSet),
      colors: Array.from(colorsSet),
      materials: Array.from(materialsSet),
      sizes: Array.from(sizesSet),
    };
  }, [products]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Wishlist Only Filter
    if (filterParam === 'wishlist') {
      result = result.filter((p) => wishlist.includes(p.id));
    }

    // Category Filter
    if (selectedCategory && selectedCategory !== 'all') {
      const selStr = String(selectedCategory).toLowerCase().trim();
      const selCatTokens = new Set([selStr]);
      const matchedCat = categories.find(
        (c) =>
          String(c.id).toLowerCase() === selStr ||
          (c.slug && c.slug.toLowerCase() === selStr) ||
          (c.name && c.name.toLowerCase() === selStr)
      );
      if (matchedCat) {
        selCatTokens.add(String(matchedCat.id).toLowerCase().trim());
        if (matchedCat.slug) selCatTokens.add(matchedCat.slug.toLowerCase().trim());
        if (matchedCat.name) selCatTokens.add(matchedCat.name.toLowerCase().trim());
      }

      result = result.filter((p) => {
        const pCatId = p.category_id ? String(p.category_id).toLowerCase().trim() : '';
        const pCatName = p.category ? String(p.category).toLowerCase().trim() : '';
        const pSubCat = p.subcategory ? String(p.subcategory).toLowerCase().trim() : '';
        return (
          (pCatId && selCatTokens.has(pCatId)) ||
          (pCatName && selCatTokens.has(pCatName)) ||
          (pSubCat && selCatTokens.has(pSubCat))
        );
      });
    }

    // Search query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }

    // Price Filter
    result = result.filter((p) => {
      const priceNum = parseFloat(p.price) || 0;
      const discountVal = p.discount !== undefined ? p.discount : (p.discount_percent || 0);
      const discountedPrice = Math.round(priceNum * (1 - (discountVal || 0) / 100));
      return discountedPrice <= priceRange;
    });

    // Brands Filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Colors Filter
    if (selectedColors.length > 0) {
      result = result.filter((p) => p.colors && p.colors.some((c) => selectedColors.includes(c)));
    }

    // Materials Filter
    if (selectedMaterials.length > 0) {
      result = result.filter(
        (p) => p.materials && p.materials.some((m) => selectedMaterials.includes(m))
      );
    }

    // Sizes Filter
    if (selectedSizes.length > 0) {
      result = result.filter(
        (p) =>
          p.sizes &&
          p.sizes.some((s) => selectedSizes.includes(typeof s === 'object' ? s.size : s))
      );
    }

    // Ratings Filter
    if (minRating > 0) {
      result = result.filter((p) => (p.rating || 0) >= minRating);
    }

    // Stock Filter
    if (onlyInStock) {
      result = result.filter((p) => (p.stock ?? 1) > 0);
    }

    // Sorting
    if (sortBy === 'popularity') {
      result.sort((a, b) => {
        const ratingA = parseFloat(a.rating) || 0;
        const ratingB = parseFloat(b.rating) || 0;
        const reviewsA = parseInt(a.reviewsCount) || 0;
        const reviewsB = parseInt(b.reviewsCount) || 0;
        return ratingB - ratingA || reviewsB - reviewsA;
      });
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => {
        const dateA = new Date(a.created_at || a.dateAdded || 0).getTime() || 0;
        const dateB = new Date(b.created_at || b.dateAdded || 0).getTime() || 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [
    products, categories, filterParam, wishlist, selectedCategory,
    searchQuery, priceRange, selectedBrands, selectedColors,
    selectedMaterials, selectedSizes, minRating, onlyInStock, sortBy,
  ]);

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleColorChange = (col) => {
    setSelectedColors((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const resetFilters = () => {
    setPriceRange(maxProductPrice);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedSizes([]);
    setMinRating(0);
    setOnlyInStock(false);
    setSearchQuery('');
    showToast('Filters cleared', 'info');
  };

  // Render Skeleton Placeholders
  const renderSkeletons = () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-lg p-4 animate-pulse flex flex-col gap-3">
          <div className="w-full aspect-[4/5] bg-surface-subtle rounded" />
          <div className="h-3 bg-surface-subtle rounded w-1/3" />
          <div className="h-4 bg-surface-subtle rounded w-3/4" />
          <div className="h-3 bg-surface-subtle rounded w-1/2" />
          <div className="h-10 bg-surface-subtle rounded mt-auto" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory">
      <Helmet>
        <title>Shop Products | Chaitrika</title>
      </Helmet>

      {/* Page Header */}
      <div className="bg-cream border-b border-border py-10 lg:py-12">
        <div className="container-premium">
          <div className="flex items-center gap-1.5 text-micro text-ink-faint font-medium mb-3">
            <Link to="/" className="hover:text-accent-dark transition-colors duration-200">Home</Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-ink-soft capitalize">
              {filterParam === 'wishlist' ? 'Wishlist' : 'Products'}
            </span>
          </div>
          
          <h1 className="font-display text-display-sm md:text-display font-medium text-ink">
            {filterParam === 'wishlist'
              ? 'My Wishlist'
              : selectedCategory === 'all'
              ? 'All Products'
              : `${(categories.find(c => c.slug === selectedCategory)?.name || selectedCategory).replace('-', ' ')}`}
          </h1>
        </div>
      </div>

      <div className="container-premium py-8 lg:py-10">
        {/* Category Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => {
              setSelectedCategory('all');
              navigate('/products');
            }}
            className={`px-4 py-2 rounded-md text-body-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-ink text-white'
                : 'bg-white text-ink-soft border border-border hover:border-ink-lightest'
            }`}
          >
            All
            <span className="text-micro opacity-60">({products.length})</span>
          </button>
          {categories.map((cat) => {
            const catIdStr = String(cat.id).toLowerCase().trim();
            const catSlugStr = cat.slug ? cat.slug.toLowerCase().trim() : '';
            const catNameStr = cat.name ? cat.name.toLowerCase().trim() : '';

            const catCount = products.filter((p) => {
              const pCatId = p.category_id ? String(p.category_id).toLowerCase().trim() : '';
              const pCatName = p.category ? String(p.category).toLowerCase().trim() : '';
              const pSubCat = p.subcategory ? String(p.subcategory).toLowerCase().trim() : '';
              return (
                (pCatId && (pCatId === catIdStr || pCatId === catSlugStr || pCatId === catNameStr)) ||
                (pCatName && (pCatName === catIdStr || pCatName === catSlugStr || pCatName === catNameStr)) ||
                (pSubCat && (pSubCat === catIdStr || pSubCat === catSlugStr || pSubCat === catNameStr))
              );
            }).length;

            const selStr = String(selectedCategory).toLowerCase().trim();
            const isSelected =
              selStr === catIdStr ||
              (catSlugStr && selStr === catSlugStr) ||
              (catNameStr && selStr === catNameStr);
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug || cat.id);
                  navigate(`/products?category=${cat.slug || cat.id}`);
                }}
                className={`px-4 py-2 rounded-md text-body-sm font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-ink text-white'
                    : 'bg-white text-ink-soft border border-border hover:border-ink-lightest'
                }`}
              >
                {cat.name}
                <span className="text-micro opacity-60">({catCount})</span>
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border-subtle">
          <p className="text-body-sm text-ink-muted">
            <span className="font-medium text-ink">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden py-2 px-4 bg-white border border-border rounded-md text-body-sm font-medium flex items-center gap-1.5 hover:border-ink-lightest transition-colors duration-200"
            >
              <FiFilter className="w-3.5 h-3.5" /> Filters
            </button>
            <div className="flex items-center gap-2">
              <span className="text-micro font-medium text-ink-faint uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-border bg-white rounded-md py-1.5 px-3 text-body-sm text-ink focus:outline-none focus:border-accent"
              >
                <option value="popularity">Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <main className="w-full">
          {loading ? (
            renderSkeletons()
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg p-16 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-surface-subtle text-ink-faint rounded-lg flex items-center justify-center text-2xl mb-4">
                <FiInbox />
              </div>
              <h3 className="text-body-lg font-medium text-ink mb-2">
                No Products Found
              </h3>
              <p className="text-body-sm text-ink-muted max-w-sm mb-6">
                We couldn't find products matching your criteria. Try adjusting your filters.
              </p>
              <button
                onClick={resetFilters}
                className="btn-primary px-5 py-2.5 text-body-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-ivory h-full p-6 overflow-y-auto shadow-elevated flex flex-col animate-fade-in">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5 flex-shrink-0">
              <h3 className="text-body font-medium text-ink flex items-center gap-1.5">
                <FiFilter className="w-4 h-4" /> Filters
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={resetFilters} className="text-micro font-medium text-accent-dark hover:underline">
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded bg-surface-subtle text-ink-muted hover:text-ink"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex-1 space-y-6">
              {/* Price */}
              <div>
                <h4 className="text-micro font-medium uppercase tracking-wider text-ink-faint mb-3">
                  Max Price: ₹{priceRange.toLocaleString('en-IN')}
                </h4>
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  step="1000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Category */}
              <div>
                <h4 className="text-micro font-medium uppercase tracking-wider text-ink-faint mb-3">
                  Category
                </h4>
                <div className="flex flex-col gap-2 text-body-sm text-ink-soft">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="subcat-mob"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="accent-accent w-3.5 h-3.5"
                    />
                    <span>All Products</span>
                  </label>
                  {(categories || []).map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="subcat-mob"
                        checked={selectedCategory === cat.slug}
                        onChange={() => setSelectedCategory(cat.slug)}
                        className="accent-accent w-3.5 h-3.5"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h4 className="text-micro font-medium uppercase tracking-wider text-ink-faint mb-3">
                    Brand
                  </h4>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer text-body-sm text-ink-soft">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandChange(brand)}
                          className="accent-accent rounded w-3.5 h-3.5"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {colors.length > 0 && (
                <div>
                  <h4 className="text-micro font-medium uppercase tracking-wider text-ink-faint mb-3">
                    Colors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                          selectedColors.includes(color)
                            ? 'border-accent scale-110'
                            : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stock */}
              <div className="pt-2 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer text-body-sm text-ink">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="accent-accent rounded w-3.5 h-3.5"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full btn-primary py-3 mt-4"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
