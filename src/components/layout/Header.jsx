import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-700 text-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand - Hidden on mobile, shown on desktop */}
          <h1 className="hidden sm:block text-xl sm:text-2xl font-bold">
            POS System
          </h1>
          
          {/* Mobile Brand - Centered */}
          <h1 className="sm:hidden text-lg font-bold text-center flex-1">
            POS
          </h1>

          {/* User Info + Logout - Better mobile layout */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* User info - Hidden on small mobile, shown on larger screens */}
            <div className="hidden xs:flex flex-col text-right">
              <p className="text-sm font-medium truncate max-w-[120px]">{user?.fullName}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>

            {/* Compact user info for very small screens */}
            <div className="xs:hidden flex flex-col text-right">
              <p className="text-xs font-medium">User</p>
              <p className="text-xs text-gray-400">{user?.role?.charAt(0)}</p>
            </div>

            <button
              onClick={logout}
              className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors whitespace-nowrap"
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