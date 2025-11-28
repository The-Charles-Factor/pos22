import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-700 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center h-16 gap-2 sm:gap-0">
          
          {/* Brand */}
          <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
            POS System
          </h1>
          
          {/* User Info + Logout */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4">
            <div className="text-center sm:text-right">
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>

            <button
              onClick={logout}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
