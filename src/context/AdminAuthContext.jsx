import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if a user is an admin by querying the admin_users table
  const checkAdminStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data; // True if record exists
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          const isUserAdmin = await checkAdminStatus(session.user.id);
          
          if (mounted) {
            if (isUserAdmin) {
              setAdminUser(session.user);
              setIsAuthenticated(true);
            } else {
              // User is authenticated but NOT an admin.
              // We must not leave them logged in on the admin portal.
              await supabase.auth.signOut();
              setAdminUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        const isUserAdmin = await checkAdminStatus(session.user.id);
        
        if (mounted) {
          if (isUserAdmin) {
            setAdminUser(session.user);
            setIsAuthenticated(true);
            setError(null);
          } else {
            // Un-authorize non-admins immediately
            await supabase.auth.signOut();
            setAdminUser(null);
            setIsAuthenticated(false);
            setError('Admin access required. This account does not have administrator privileges.');
          }
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setAdminUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Admin login using Supabase Auth (Email/Password)
  const adminLogin = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // The onAuthStateChange listener will handle the admin check and set state
      // However, we wait here for a brief moment to let the listener complete
      // before returning success, or we do the check manually here to be safe.
      
      const isUserAdmin = await checkAdminStatus(data.user.id);
      
      if (!isUserAdmin) {
        await supabase.auth.signOut();
        throw new Error('Admin access required. This account does not have administrator privileges.');
      }

      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin logout
  const adminLogout = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    }
  };

  // Check if current user is admin (used by routes)
  const isAdmin = () => {
    return isAuthenticated && adminUser !== null;
  };

  const value = {
    adminUser,
    loading,
    error,
    isAuthenticated,
    adminLogin,
    adminLogout,
    isAdmin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
