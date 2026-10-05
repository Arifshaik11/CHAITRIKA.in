import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiInstagram, 
  FiFacebook, 
  FiYoutube, 
  FiArrowRight 
} from 'react-icons/fi';

export default function Footer() {
  const { activeStore } = useProducts();
  const { showToast } = useCart();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Thank you for subscribing to our newsletter!', 'success');
      setEmail('');
    }
  };

  const storeLinks = activeStore === 'frames' 
    ? [
        { label: 'Magnetic Photo Frames', to: '/products?category=magnetic-frames' },
        { label: 'Acrylic Frames', to: '/products?category=acrylic-frames' },
        { label: 'MDF Photo Frames', to: '/products?category=mdf-frames' },
        { label: 'Custom Keychains', to: '/products?category=keychains' }
      ]
    : [
        { label: 'Personalized Keychains', to: '/products?category=keychains' },
        { label: 'Photo Prints', to: '/products?category=photo-prints' },
        { label: 'Gift Sets', to: '/products?category=gift-sets' },
        { label: 'Accessories', to: '/products?category=accessories' }
      ];

  return (
    <footer id="contact" className="bg-[#181615] text-white/90 border-t border-white/10 font-sans">
      <div className="container-premium py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand and Description */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <div>
              <h3 className="font-display text-3xl font-bold text-white tracking-tight">
                Chaitrika
              </h3>
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#D4988A] mt-1.5">
                Wrap & Wear
              </p>
            </div>
            <p className="text-body-sm text-white/60 leading-relaxed max-w-sm">
              Providing premium personalized photo frames, keychains, and custom gifts. Preserve your precious memories with our handcrafted products.
            </p>
            <div className="flex flex-col gap-2.5 mt-1 text-body-sm text-white/70">
              <a href="tel:+918499999498" className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <FiPhone className="w-4 h-4 text-[#D4988A] flex-shrink-0" />
                <span>+91 8499999498</span>
              </a>
              <a href="mailto:support@chaitrika.com" className="flex items-center gap-3 hover:text-white transition-colors duration-200">
                <FiMail className="w-4 h-4 text-[#D4988A] flex-shrink-0" />
                <span>support@chaitrika.com</span>
              </a>
              <div className="flex items-center gap-3">
                <FiMapPin className="w-4 h-4 text-[#D4988A] flex-shrink-0" />
                <span>Handcrafted in India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-body-sm font-semibold tracking-wider uppercase text-white">
              Collections
            </h4>
            <ul className="space-y-2.5 text-body-sm text-white/60">
              {storeLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h4 className="text-body-sm font-semibold tracking-wider uppercase text-white">
              Stay Connected
            </h4>
            <p className="text-body-sm text-white/60">
              Subscribe for new collections, custom gifts, and artisan framing offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 mt-1">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="flex-1 bg-white/10 border border-white/20 rounded px-3.5 py-2.5 text-body-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4988A] transition-colors"
                required
              />
              <button 
                type="submit" 
                className="bg-[#B86B57] hover:bg-[#A05846] text-white px-4 py-2.5 rounded font-medium text-body-sm transition-colors duration-200 flex items-center justify-center shrink-0"
                aria-label="Subscribe"
              >
                <FiArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2 text-white/60">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
                <FiYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Chaitrika (Chaitra Wrap & Wear). All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/products" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/products" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/admin/login" className="hover:text-white transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
