import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Admin credentials from environment variables
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'chaitrika',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'chaitrika@wrap0'
};

console.log('Admin credentials loaded:', {
  username: ADMIN_CREDENTIALS.username,
  password: ADMIN_CREDENTIALS.password ? '***set***' : 'not set'
});

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize admin session on mount
  useEffect(() => {
    const initializeAdminSession = async () => {
      try {
        // Check if there's a stored admin session
        const storedAdmin = localStorage.getItem('adminUser');
        const loginTime = localStorage.getItem('adminLoginTime');
        const currentTime = new Date().getTime();
        
        if (storedAdmin && loginTime) {
          // Session expires after 24 hours
          const timeDiff = currentTime - parseInt(loginTime);
          if (timeDiff < 24 * 60 * 60 * 1000) {
            setAdminUser(JSON.parse(storedAdmin));
            setIsAuthenticated(true);
            setError(null);
          } else {
            // Session expired
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminLoginTime');
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Error initializing admin session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAdminSession();
  }, []);

  // Admin login with username and password
  const adminLogin = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      console.log('Login attempt with:', username);
      console.log('Expected username:', ADMIN_CREDENTIALS.username);
      console.log('Match:', username.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase());

      // Validate credentials
      const isValidUsername = username.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase();
      const isValidPassword = password === ADMIN_CREDENTIALS.password;

      console.log('Username valid:', isValidUsername);
      console.log('Password valid:', isValidPassword);

      if (!isValidUsername || !isValidPassword) {
        const msg = !isValidUsername ? 'Invalid username' : 'Invalid password';
        setError('Invalid admin username or password');
        return false;
      }

      // Create admin user object
      const user = {
        id: 'admin-' + Date.now(),
        username: ADMIN_CREDENTIALS.username,
        role: 'admin',
        loginTime: new Date().toISOString()
      };

      // Store admin session
      localStorage.setItem('adminUser', JSON.stringify(user));
      localStorage.setItem('adminLoginTime', new Date().getTime().toString());

      setAdminUser(user);
      setIsAuthenticated(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin logout
  const adminLogout = async () => {
    try {
      setError(null);
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminLoginTime');
      setAdminUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    }
  };

  // Check if current user is admin
  const isAdmin = () => {
    return isAuthenticated && adminUser?.role === 'admin';
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
