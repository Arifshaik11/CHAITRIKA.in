import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { FiMenu, FiX, FiLogOut, FiGrid, FiList, FiSettings, FiShoppingCart, FiImage, FiArrowRight } from 'react-icons/fi';
import AdminCategories from '../components/admin/AdminCategories';
import AdminProducts from '../components/admin/AdminProducts';
import AdminSettings from '../components/admin/AdminSettings';
import AdminOrders from '../components/admin/AdminOrders';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set active tab based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'dashboard';
    setActiveTab(tab);
  }, [location.search]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/admin/login');
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: FiGrid,
      description: 'Analytics & performance',
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: FiList,
      description: 'Frame collections',
    },
    {
      id: 'products',
      label: 'Products',
      icon: FiImage,
      description: 'Catalog management',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: FiShoppingCart,
      description: 'Customer requests',
    },
    {
      id: 'settings',
      label: 'Store Settings',
      icon: FiSettings,
      description: 'Preferences & WhatsApp',
    },
  ];

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/dashboard?tab=${tabId}`);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onNavigateTab={handleMenuClick} />;
      case 'categories':
        return <AdminCategories />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <DashboardOverview onNavigateTab={handleMenuClick} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F5F2] font-sans text-[#1C1917]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-[#181615] text-white flex flex-col transition-transform duration-300 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo / Brand Header */}
        <div className="p-6 border-b border-[#2C2825] flex items-center justify-between">
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">
              Chaitrika
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4988A] block mt-0.5">
              Admin Console
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#9A9590] hover:text-white p-1"
            aria-label="Close navigation"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-[#2E2926] text-white font-semibold shadow-xs border-l-3 border-[#B86B57]'
                    : 'text-[#B5B0AB] hover:bg-[#252220] hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#B86B57]' : 'text-[#8A8580]'}`} />
                <div>
                  <p className="text-xs font-semibold leading-tight">{item.label}</p>
                  <p className="text-[10px] text-[#7A7570] mt-0.5">{item.description}</p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sign Out Action */}
        <div className="p-4 border-t border-[#2C2825]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-[#B5B0AB] hover:text-white hover:bg-[#252220] transition-colors"
          >
            <FiLogOut className="w-4 h-4 text-[#8A8580]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#E7E2DC] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-[#1C1917] hover:bg-[#F3EFEA] transition-colors"
              aria-label="Open navigation menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
                {menuItems.find(item => item.id === activeTab)?.label || 'Overview'}
              </h1>
            </div>
          </div>

          {/* Admin User Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#1C1917]">Administrator</p>
              <p className="text-[11px] font-medium text-[#78716C]">chaitrika</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#1C1917] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Main Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF7F4]">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Overview Tab Component
const DashboardOverview = ({ onNavigateTab }) => {
  const [stats] = useState({
    totalOrders: 24,
    totalRevenue: 48500,
    pendingOrders: 5,
    totalProducts: 18,
  });

  const cards = [
    {
      title: 'Total Inquiries',
      value: stats.totalOrders,
      icon: FiShoppingCart,
      sub: 'All customer carts',
    },
    {
      title: 'Estimated Volume',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: FiGrid,
      sub: 'Total cart value',
    },
    {
      title: 'Pending WhatsApp',
      value: stats.pendingOrders,
      icon: FiShoppingCart,
      sub: 'Action required',
      highlight: true,
    },
    {
      title: 'Active Catalog',
      value: stats.totalProducts,
      icon: FiImage,
      sub: 'Frames published',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-white border rounded-xl p-6 shadow-xs flex flex-col justify-between ${
                card.highlight ? 'border-[#B86B57]/40 bg-[#FFFDFD]' : 'border-[#E7E2DC]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A5550]">
                  {card.title}
                </span>
                <div className="p-2 rounded-lg bg-[#FAF7F4] text-[#1C1917]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-[#1C1917] tracking-tight">
                  {card.value}
                </p>
                <p className="text-[11px] font-medium text-[#78716C] mt-1.5">
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white border border-[#E7E2DC] rounded-xl p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#1C1917] mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab('products')}
              className="w-full text-left p-4 bg-[#FAF7F4] hover:bg-[#F3EFEA] border border-[#E7E2DC] rounded-lg transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-[#1C1917]">+ Add New Frame Product</p>
                <p className="text-[11px] text-[#78716C] mt-0.5">Upload photo, set price and options</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-[#78716C] group-hover:text-[#1C1917] group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onNavigateTab('categories')}
              className="w-full text-left p-4 bg-[#FAF7F4] hover:bg-[#F3EFEA] border border-[#E7E2DC] rounded-lg transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-[#1C1917]">+ Manage Frame Categories</p>
                <p className="text-[11px] text-[#78716C] mt-0.5">Create, edit and organize collections</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-[#78716C] group-hover:text-[#1C1917] group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className="w-full text-left p-4 bg-[#FAF7F4] hover:bg-[#F3EFEA] border border-[#E7E2DC] rounded-lg transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-[#1C1917]">⚙ Store & WhatsApp Settings</p>
                <p className="text-[11px] text-[#78716C] mt-0.5">Configure recipient WhatsApp number</p>
              </div>
              <FiArrowRight className="w-4 h-4 text-[#78716C] group-hover:text-[#1C1917] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Recent Inquiries Card */}
        <div className="bg-white border border-[#E7E2DC] rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1C1917]">
              Recent Orders & Inquiries
            </h2>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#B86B57] hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-[#FAF7F4] border border-[#E7E2DC] rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1C1917]">Order #ORD-1025</p>
                <p className="text-[11px] text-[#5A5550] mt-0.5">₹1,400 • 2 Frames • Customer WhatsApp</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B86B57] bg-[#F9ECE8] px-2.5 py-1 rounded-md">
                Pending
              </span>
            </div>

            <div className="p-4 bg-[#FAF7F4] border border-[#E7E2DC] rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1C1917]">Order #ORD-1024</p>
                <p className="text-[11px] text-[#5A5550] mt-0.5">₹850 • 1 Acrylic Keychain Frame</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                Confirmed
              </span>
            </div>

            <div className="p-4 bg-[#FAF7F4] border border-[#E7E2DC] rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1C1917]">Order #ORD-1023</p>
                <p className="text-[11px] text-[#5A5550] mt-0.5">₹2,100 • 3 Magnetic Fridge Frames</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1917] bg-[#EFEBE6] px-2.5 py-1 rounded-md">
                Delivered
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
