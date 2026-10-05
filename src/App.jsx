import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { ProductVariantProvider } from './context/ProductVariantContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import ComparisonModal from './components/ComparisonModal';
import ScrollProgressBar from './components/ScrollProgressBar';
import ElegantLogoIntro from './components/ElegantLogoIntro';
import AdminRoute from './components/AdminRoute';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Fallback loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-ivory">
    <div className="text-center">
      <div className="inline-block w-8 h-8 border border-ink-faint border-t-accent rounded-full animate-spin"></div>
      <p className="mt-4 text-micro font-medium tracking-widest uppercase text-ink-muted">Loading</p>
    </div>
  </div>
);

// AppContent handles rendering with context access
const AppContent = () => {
  const { toast, setToast } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-ivory transition-colors duration-300">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            
            {/* Admin Routes - Hidden from public */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminRoute element={<AdminDashboard />} />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      
      {/* Global overlays */}
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ComparisonModal />
    </div>
  );
};

function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // Check if intro has been shown in this session
    const hasSeenIntro = sessionStorage.getItem('hasSeenElegantIntro');
    if (!hasSeenIntro) {
      setShowIntro(true);
    } else {
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenElegantIntro', 'true');
    setShowIntro(false);
    setIntroComplete(true);
  };

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CategoryProvider>
          <ProductVariantProvider>
            <ProductProvider>
              <CartProvider>
                <ScrollProgressBar />
                {showIntro && !introComplete && (
                  <ElegantLogoIntro onComplete={handleIntroComplete} />
                )}
                <AppContent />
              </CartProvider>
            </ProductProvider>
          </ProductVariantProvider>
        </CategoryProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
