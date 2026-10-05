import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiLogOut, FiList, FiGrid, FiPackage } from 'react-icons/fi';
import AdminCategories from '../components/admin/AdminCategories';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';

export default function AdminPanel() {
  const { isAdmin, logout } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('categories');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/admin/login');
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-ivory">
      <Helmet>
        <title>Admin Panel — Chaitrika</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-charcoal/10 gap-4">
          <div>
            <span className="text-micro font-medium uppercase tracking-[0.25em] text-accent block mb-1">
              Store Administration
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-charcoal">
              Management Portal
            </h1>
            <p className="text-xs text-ink-muted mt-1 font-light">
              Manage frame categories, catalog products, and customer orders
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-micro uppercase tracking-widest"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-charcoal/10 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-charcoal text-charcoal font-medium'
                : 'border-transparent text-ink-muted hover:text-charcoal'
            }`}
          >
            <FiList className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-charcoal text-charcoal font-medium'
                : 'border-transparent text-ink-muted hover:text-charcoal'
            }`}
          >
            <FiGrid className="w-4 h-4" />
            Products & Frames
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-charcoal text-charcoal font-medium'
                : 'border-transparent text-ink-muted hover:text-charcoal'
            }`}
          >
            <FiPackage className="w-4 h-4" />
            Orders & Inquiries
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-charcoal/10 p-6 md:p-8 shadow-sm">
          {activeTab === 'categories' && <AdminCategories />}
          {activeTab === 'products' && <AdminProducts />}
          {activeTab === 'orders' && <AdminOrders />}
        </div>
      </div>
    </div>
  );
}
