import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import QuickViewModal from '../components/QuickViewModal';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { defaultProducts } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { products } = useProducts();
  const { showToast } = useCart();
  
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Use dynamic products from Supabase, or fallback to defaultProducts
  const featuredProducts = products && products.length > 0 ? products.slice(0, 8) : defaultProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-ivory">
      <Helmet>
        <title>Chaitrika — Premium Photo Frames & Custom Keychains</title>
        <meta name="description" content="Personalized photo frames, magnetic frames, acrylic displays & custom keychains at Chaitrika." />
      </Helmet>

      {/* Hero Section — Editorial style */}
      <section className="py-16 md:py-24 lg:py-28">
        <div className="container-premium">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column — Text */}
            <div className="lg:col-span-6 space-y-6">
              
              <motion.p 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-micro font-medium tracking-[0.2em] uppercase text-accent-dark"
              >
                Personalized Gifts
              </motion.p>

              <motion.h1 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-display-lg md:text-[4.5rem] font-medium text-ink leading-[1.05] tracking-tight"
              >
                Make Every{' '}
                <em className="italic text-accent-dark">Memory</em>{' '}
                Last Forever
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-body-lg text-ink-soft max-w-md"
              >
                Personalized photo frames, acrylic gifts, and keepsakes crafted with care — just for you.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-4 pt-2"
              >
                <Link
                  to="/products"
                  className="btn-primary inline-flex items-center gap-2 group"
                >
                  Shop Collection 
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
                <a
                  href="#about"
                  className="btn-secondary"
                >
                  Learn More
                </a>
              </motion.div>
            </div>

            {/* Right Column — Visual */}
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="bg-blush rounded-lg p-10 sm:p-14 relative flex items-center justify-center min-h-[420px] lg:min-h-[480px] border border-border-subtle overflow-hidden"
              >
                {/* Subtle decorative element */}
                <div className="absolute top-8 left-8 w-20 h-20 bg-rose-pale rounded-full blur-sm opacity-50" />

                {/* Product Preview Card */}
                <div className="w-72 sm:w-80 bg-white rounded-lg p-6 shadow-elevated border border-border flex flex-col justify-between relative z-10" style={{ minHeight: '340px' }}>
                  {/* Inner visual area */}
                  <div className="flex-1 bg-surface-subtle rounded flex items-center justify-center border border-border-subtle relative overflow-hidden mb-4">
                    <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center">
                      <svg className="w-8 h-8 text-accent fill-none stroke-current stroke-[1.5]" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </div>
                  </div>

                  {/* Card Bottom */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-body-sm font-medium text-ink">Custom Photo Frame</h4>
                      <p className="text-micro text-accent mt-0.5">Starting ₹299</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div 
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="absolute bottom-6 right-6 sm:right-8 bg-ink text-white text-micro font-medium px-3.5 py-2 rounded-md flex items-center gap-1.5 z-20"
                >
                  <span className="text-accent">✦</span> Crafted for you
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 lg:py-20">
        <div className="container-premium">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-micro font-medium tracking-[0.2em] uppercase text-accent-dark mb-2">
                Our Collection
              </p>
              <h2 className="font-display text-display-sm md:text-display font-medium text-ink">
                Featured Products
              </h2>
            </div>
            <Link to="/products" className="text-body-sm font-medium text-ink-soft hover:text-ink flex items-center gap-1.5 transition-colors duration-200">
              View all <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* The Chaitra Difference Section */}
      <section id="about" className="py-16 lg:py-20 bg-cream">
        <div className="container-premium">
          <div className="text-center mb-12">
            <p className="text-micro font-medium tracking-[0.2em] uppercase text-accent-dark mb-2">
              Why Choose Us
            </p>
            <h2 className="font-display text-display-sm md:text-display font-medium text-ink">
              The Chaitrika Difference
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Crafted to Order */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-pale rounded-lg mb-5">
                <svg className="w-5 h-5 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-body-lg font-medium text-ink mb-2">
                Crafted to Order
              </h3>
              <p className="text-body-sm text-ink-muted leading-relaxed max-w-xs mx-auto">
                Every piece is made uniquely for you — no mass production, no compromise on quality.
              </p>
            </div>

            {/* Premium Materials */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-pale rounded-lg mb-5">
                <svg className="w-5 h-5 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-body-lg font-medium text-ink mb-2">
                Premium Materials
              </h3>
              <p className="text-body-sm text-ink-muted leading-relaxed max-w-xs mx-auto">
                Acrylic, MDF, magnetic — only quality materials that last a lifetime.
              </p>
            </div>

            {/* Delivered with Care */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-pale rounded-lg mb-5">
                <svg className="w-5 h-5 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-body-lg font-medium text-ink mb-2">
                Delivered with Care
              </h3>
              <p className="text-body-sm text-ink-muted leading-relaxed max-w-xs mx-auto">
                Carefully packaged and delivered fast, right to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ink text-white py-20 lg:py-26">
        <div className="container-premium text-center max-w-2xl mx-auto">
          <h2 className="font-display text-display-sm md:text-display font-medium leading-tight mb-4">
            Ready to Create Something{' '}
            <em className="italic">Special?</em>
          </h2>
          <p className="text-body text-white/50 mb-8 max-w-md mx-auto">
            Browse our collection and let us help you craft a memory that lasts forever.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-ink px-7 py-3 rounded-md font-medium text-body-sm hover:bg-white/90 transition-all duration-200 group"
          >
            Shop Collection <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </section>

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
