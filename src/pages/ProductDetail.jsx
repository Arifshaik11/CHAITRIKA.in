import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { 
  FiStar, 
  FiHeart, 
  FiShoppingCart, 
  FiTruck, 
  FiShield, 
  FiRotateCcw, 
  FiChevronRight,
  FiUploadCloud,
  FiCheckCircle
} from 'react-icons/fi';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, toggleWishlist, isInWishlist } = useProducts();
  const { categories } = useCategories();
  const { addToCart, showToast } = useCart();

  const product = products.find((p) => String(p.id) === String(id) || p.slug === id) || products[0];
  const matchedCat = categories.find(
    (c) => c.id === product?.category_id || String(c.id) === String(product?.category_id) || c.slug === product?.category_id
  );
  const displayCategory = matchedCat?.name || product?.category || product?.subcategory || 'Custom Gifts';

  const productImage = product?.image || product?.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
  const [selectedImage, setSelectedImage] = useState(productImage);
  const [selectedSize, setSelectedSize] = useState(
    Array.isArray(product?.sizes) && product.sizes.length > 0 ? product.sizes[0] : ''
  );
  const [selectedColor, setSelectedColor] = useState(
    Array.isArray(product?.colors) && product.colors.length > 0 ? product.colors[0] : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [customImage, setCustomImage] = useState(null);
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image || product.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80');
      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (Array.isArray(product.colors) && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <h2 className="text-display-sm font-display font-medium text-ink mb-4">Product Not Found</h2>
          <Link to="/products" className="btn-primary px-6 py-2.5 text-body-sm">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const discountVal = product.discount !== undefined ? product.discount : (product.discount_percent || 0);
  const discountedPrice = Math.round((product.price || 0) * (1 - discountVal / 100));
  const inWishlist = isInWishlist(product.id);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result);
        showToast('Photo uploaded for personalization', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedSize,
      selectedColor,
      customImage,
      customText,
      quantity
    });
    showToast(`Added ${quantity}× ${product.name} to cart`, 'success');
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-ivory py-8 lg:py-12">
      <Helmet>
        <title>{`${product.name} | Chaitrika`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="container-premium">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-micro font-medium text-ink-faint">
          <Link to="/" className="hover:text-accent-dark transition-colors duration-200">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-accent-dark transition-colors duration-200">Catalog</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-ink-soft truncate max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-surface-subtle border border-border">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {customImage && (
                <div className="absolute inset-0 bg-ink/30 flex items-center justify-center p-4">
                  <div className="relative border-2 border-white/80 rounded-lg overflow-hidden shadow-elevated max-w-[60%] max-h-[60%]">
                    <img src={customImage} alt="Custom upload preview" className="w-full h-full object-contain" />
                    <span className="absolute bottom-2 left-2 bg-ink/70 text-white text-micro font-medium px-2 py-0.5 rounded">
                      Your Photo Preview
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail previews */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded overflow-hidden border flex-shrink-0 transition-all duration-200 ${
                      selectedImage === img
                        ? 'border-accent ring-1 ring-accent'
                        : 'border-border opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="lg:col-span-5 flex flex-col">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-micro font-medium tracking-wider uppercase text-accent-dark">
                  {displayCategory}
                </span>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 rounded border transition-all duration-200 ${
                    inWishlist
                      ? 'bg-accent/10 text-accent border-accent/20'
                      : 'border-border text-ink-faint hover:text-accent'
                  }`}
                >
                  <FiHeart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h1 className="font-display text-heading md:text-display-sm font-medium text-ink mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-accent text-sm">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-ink-lightest'}`}
                    />
                  ))}
                </div>
                <span className="text-micro text-ink-muted">
                  {product.rating} ({product.reviewsCount || 45} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-heading font-semibold text-ink">
                  ₹{discountedPrice}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-body text-ink-faint line-through">
                      ₹{product.price}
                    </span>
                    <span className="text-micro font-medium text-accent-dark bg-accent-light px-2 py-0.5 rounded">
                      Save {product.discount}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-body-sm text-ink-soft leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Personalization */}
              <div className="p-5 bg-blush border border-border-subtle rounded-lg mb-6">
                <h3 className="text-micro font-medium uppercase tracking-wider text-accent-dark flex items-center gap-2 mb-4">
                  <FiUploadCloud className="w-4 h-4" /> Personalize Your Product
                </h3>

                {/* Photo Upload */}
                <div className="mb-4">
                  <label className="block text-micro font-medium text-ink-soft mb-1.5">
                    Upload Custom Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-micro text-ink-muted file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-micro file:font-medium file:bg-accent file:text-white hover:file:bg-accent-dark cursor-pointer"
                  />
                  {customImage && (
                    <p className="text-micro text-accent-dark font-medium mt-1.5 flex items-center gap-1">
                      <FiCheckCircle className="w-3.5 h-3.5" /> Photo attached
                    </p>
                  )}
                </div>

                {/* Custom Text */}
                <div>
                  <label className="block text-micro font-medium text-ink-soft mb-1.5">
                    Custom Engraving / Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Happy Anniversary Priya & Rahul"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full px-3.5 py-2 text-body-sm bg-white border border-border rounded focus:outline-none focus:border-accent transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Size Selectors */}
              {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                <div className="mb-5">
                  <label className="block text-micro font-medium uppercase tracking-wider text-ink-faint mb-2.5">
                    Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => {
                      const label = typeof s === 'object' ? s.size : s;
                      return (
                        <button
                          key={label}
                          onClick={() => setSelectedSize(label)}
                          className={`px-3.5 py-2 rounded text-body-sm font-medium border transition-all duration-200 ${
                            selectedSize === label
                              ? 'bg-ink text-white border-ink'
                              : 'border-border text-ink-soft hover:border-ink-lightest'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6 flex items-center gap-4">
                <label className="text-micro font-medium uppercase tracking-wider text-ink-faint">
                  Quantity
                </label>
                <div className="flex items-center border border-border rounded bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-body-sm text-ink-muted hover:text-ink transition-colors duration-200"
                  >
                    −
                  </button>
                  <span className="px-3 py-1.5 text-body-sm font-medium text-ink min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-body-sm text-ink-muted hover:text-ink transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary py-3 text-body-sm flex items-center justify-center gap-2"
              >
                <FiShoppingCart className="w-4 h-4" /> Add to Cart
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
                className="flex-1 btn-secondary py-3 text-body-sm flex items-center justify-center"
              >
                Buy Now
              </button>
            </div>

            {/* Shipping Info */}
            <div className="pt-5 border-t border-border grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <FiTruck className="w-4 h-4 text-accent" />
                <span className="text-micro text-ink-muted">Express Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <FiShield className="w-4 h-4 text-accent" />
                <span className="text-micro text-ink-muted">Quality Checked</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <FiRotateCcw className="w-4 h-4 text-accent" />
                <span className="text-micro text-ink-muted">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
