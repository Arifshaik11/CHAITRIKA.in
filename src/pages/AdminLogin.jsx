import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '../context/AdminAuthContext';
import { FiUser, FiLock, FiShield, FiAlertCircle, FiInfo } from 'react-icons/fi';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { adminLogin, isAuthenticated, error: authError, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = await adminLogin(email, password);
    
    setLoading(false);

    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 bg-[#FAF7F4] font-sans">
      <Helmet>
        <title>Administrator Sign In — Chaitrika</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-[#1C1917] text-white flex items-center justify-center text-xl mx-auto mb-4 rounded-xl shadow-md">
            <FiShield className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B86B57] block mb-1">
            Store Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
            Admin Sign In
          </h1>
          <p className="text-xs text-[#5A5550] mt-1.5">
            Access store administration panel
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-white border border-[#E7E2DC] rounded-xl p-8 shadow-sm">
          {authError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex gap-2.5 items-start">
              <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8580] w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || authLoading}
                  className="w-full pl-10 pr-4 py-3 bg-[#FCFAF8] border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] focus:bg-white transition-colors placeholder:text-[#9A9590] disabled:opacity-50"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#1C1917] block mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8580] w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || authLoading}
                  className="w-full pl-10 pr-4 py-3 bg-[#FCFAF8] border border-[#DCD6CE] rounded-lg text-sm font-medium text-[#1C1917] focus:outline-none focus:border-[#1C1917] focus:bg-white transition-colors placeholder:text-[#9A9590] disabled:opacity-50"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full bg-[#1C1917] hover:bg-[#332E2A] text-white font-bold py-3.5 px-4 rounded-lg text-xs uppercase tracking-widest transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading || authLoading ? 'Authenticating...' : 'Sign In Securely'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
