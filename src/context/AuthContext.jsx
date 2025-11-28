import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'System Administrator',
    email: 'admin@store.com',
    isActive: true
  },
  {
    id: '2',
    username: 'cashier',
    password: 'cashier123',
    role: 'cashier',
    fullName: 'John Cashier',
    email: 'cashier@store.com',
    isActive: true
  },
  {
    id: '3',
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    fullName: 'Sarah Manager',
    email: 'manager@store.com',
    isActive: true
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password && u.isActive
    );
    
    setLoading(false);
    
    if (foundUser) {
      const userData = { ...foundUser };
      delete userData.password; // Don't store password in state
      setUser(userData);
      localStorage.setItem('pos_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } else {
      return { success: false, error: 'Invalid username or password' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = {
      cashier: ['cashier'],
      manager: ['cashier', 'manager'],
      admin: ['cashier', 'manager', 'admin']
    };
    
    return roleHierarchy[requiredRole]?.includes(user.role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};