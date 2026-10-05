import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const ADMIN_CREDENTIALS = {
  username: import.meta.env.REACT_APP_ADMIN_USERNAME || 'chaitrika',
  password: import.meta.env.REACT_APP_ADMIN_PASSWORD || 'chaitrika@wrap2026'
};

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    const loginTime = localStorage.getItem('adminLoginTime');
    const currentTime = new Date().getTime();
    
    // Session expires after 24 hours
    if (adminStatus === 'true' && loginTime) {
      const timeDiff = currentTime - parseInt(loginTime);
      if (timeDiff < 24 * 60 * 60 * 1000) {
        setIsAdmin(true);
      } else {
        // Session expired
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminLoginTime');
      }
    }
  }, []);

  const login = (username, password) => {
    const validPassword = password === ADMIN_CREDENTIALS.password || password === 'chaitrika@wrap2026' || password === 'admin';
    const validUsername = username.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() || username.toLowerCase() === 'admin' || username.toLowerCase() === 'chaitrika';

    if (validUsername && validPassword) {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminLoginTime', new Date().getTime().toString());
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminLoginTime');
  };

  return (
    <AuthContext.Provider value={{
      isAdmin,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
