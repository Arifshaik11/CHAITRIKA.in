import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

/**
 * Protected route component for admin-only pages
 * - If user is authenticated admin: renders the element
 * - If user is not authenticated: redirects to /admin/login
 * - If user is authenticated but not admin: redirects to /access-denied
 */
export default function AdminRoute({ element }) {
  const { isAdmin, loading } = useAdminAuth();

  // While loading auth state, show nothing (prevent flashing)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and has admin role
  if (isAdmin && isAdmin()) {
    return element;
  }

  // User is not authenticated, redirect to login
  return <Navigate to="/admin/login" replace />;
}
