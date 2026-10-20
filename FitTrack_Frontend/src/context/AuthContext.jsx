import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    return user;
  };

  const adminLogin = async (email, password) => {
    const admin = await authService.adminLogin(email, password);
    setCurrentUser(admin);
    return admin;
  };

  const register = async (userData) => {
    const user = await authService.register(userData);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    user: currentUser,
    setUser: setCurrentUser,
    setCurrentUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: Boolean(currentUser && (currentUser.role === 'Admin' || currentUser.role === 'admin')),
    loading,
    login,
    adminLogin,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
