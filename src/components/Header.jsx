import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import { 
  FiHeart, 
  FiShoppingBag, 
  FiMenu, 
  FiX, 
  FiChevronDown
} from 'react-icons/fi';

export default function Header() {
  const { wishlist } = useProducts();
  const { categories } = useCategories();
  const { getTotalItems } = useCart();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update state when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
  }, [location]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Build dynamic filter options from Supabase categories
  const filterOptions = [
    { label: 'All Products', value: '' },
    ...categories
      .filter((cat) => cat.active !== false)
      .map((cat) => ({ label: cat.name, value: cat.slug || cat.id })),
  ];

  const handleFilterClick = (value) => {
    if (value) {
      navigate(`/products?category=${value}`);
    } else {
      navigate('/products');
    }
    setShopDropdownOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-ivory/95 backdrop-blur-md shadow-nav' 
        : 'bg-ivory'
    }`}>
      <div className="container-premium">
        <div className="flex items-center justify-between h-18 md:h-20">
          
          {/* Logo with prominent Wrap & Wear subtitle */}
          <Link to="/" className="flex flex-col group py-1">
            <span className="font-display text-2xl md:text-[28px] font-bold tracking-tight text-ink leading-tight group-hover:text-accent-dark transition-colors">
              Chaitrika
            </span>
            <span className="text-[10px] md:text-[11px] font-bold tracking-[0.25em] uppercase text-accent font-sans leading-none mt-1">
              Wrap & Wear
            </span>
          </Link>

          {/* Main Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-body-sm font-medium transition-colors duration-200 ${
                isActive('/') ? 'text-accent-dark' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Home
            </Link>
            
            {/* Shop with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                className={`text-body-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                  isActive('/products') ? 'text-accent-dark' : 'text-ink-soft hover:text-ink'
                }`}
              >
                Shop
                <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${shopDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {shopDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-52 bg-white border border-border rounded-lg shadow-elevated py-1.5 z-50 animate-fade-in">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterClick(option.value)}
                      className="w-full text-left px-4 py-2 text-body-sm text-ink-soft hover:text-ink hover:bg-surface-subtle transition-colors duration-150"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link 
              to="/products" 
              className={`text-body-sm font-medium transition-colors duration-200 ${
                isActive('/products') ? 'text-accent-dark' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Collection
            </Link>
            <a 
              href="#contact" 
              className="text-body-sm font-medium text-ink-soft hover:text-ink transition-colors duration-200"
            >
              Contact
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 md:gap-5">
            {/* Wishlist */}
            <Link
              to="/products"
              className="relative p-2 text-ink-soft hover:text-ink transition-colors duration-200"
              aria-label="Wishlist"
            >
              <FiHeart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-ink-soft hover:text-ink transition-colors duration-200"
              aria-label="Shopping Cart"
            >
              <FiShoppingBag className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-ink text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-ink-soft hover:text-ink transition-colors duration-200"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border-subtle py-4 animate-fade-in bg-ivory">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-body font-medium py-2.5 px-1 ${
                  isActive('/') 
                    ? 'text-accent-dark' 
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                Home
              </Link>
              
              {/* Mobile Category Section */}
              <div className="py-2 border-t border-border-subtle mt-1">
                <p className="text-micro font-medium tracking-widest uppercase text-ink-faint mb-3 px-1">Shop by Category</p>
                <div className="space-y-0.5">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleFilterClick(option.value);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left text-body-sm text-ink-soft hover:text-ink py-2 px-1 transition-colors duration-150"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-body font-medium py-2.5 px-1 border-t border-border-subtle ${
                  isActive('/products') 
                    ? 'text-accent-dark' 
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                Collection
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="text-body font-medium text-ink-soft hover:text-ink py-2.5 px-1 flex items-center justify-between"
              >
                <span>Cart</span>
                {getTotalItems() > 0 && (
                  <span className="bg-accent text-white text-micro font-medium px-2 py-0.5 rounded">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
              <a 
                href="#contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-body font-medium text-ink-soft hover:text-ink py-2.5 px-1"
              >
                Contact
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
