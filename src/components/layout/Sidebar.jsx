import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(true); // For mobile toggle

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['cashier', 'manager', 'admin'] },
    { path: '/sales', label: 'Sales', icon: '🛒', roles: ['cashier', 'manager', 'admin'] },
    { path: '/products', label: 'Products', icon: '📦', roles: ['manager', 'admin'] },
    { path: '/insights', label: 'Insights', icon: '📈', roles: ['manager', 'admin'] },
    { path: '/employees', label: 'Employees', icon: '👥', roles: ['admin'] },
    { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasPermission(role))
  );

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile toggle button */}
      <div className="md:hidden flex justify-between items-center bg-gray-800 px-4 py-3 border-b border-gray-700">
        <h2 className="text-white font-bold">Menu</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-200 bg-gray-700 px-2 py-1 rounded-md hover:bg-gray-600 transition"
        >
          {isOpen ? 'Close' : 'Open'}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`bg-gray-800 text-white w-64 min-h-screen transition-transform transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:static top-0 left-0 z-50`}>
        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
