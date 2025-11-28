import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Start closed on mobile

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
      {/* Mobile toggle button - Always visible at top */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-800 px-4 py-2 border-b border-gray-700 z-50">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">POS Menu</h2>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-200 bg-gray-700 px-3 py-2 rounded-md hover:bg-gray-600 transition"
          >
            {isOpen ? '✕ Close' : '☰ Menu'}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`bg-gray-800 text-white w-64 min-h-screen transition-all duration-300 fixed md:static top-0 left-0 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`} style={{ marginTop: isOpen ? '56px' : '0' }}>
        <nav className="mt-4 md:mt-8">
          <ul className="space-y-2 px-4">
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)} // Close sidebar on mobile when item clicked
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
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" 
          onClick={() => setIsOpen(false)}
          style={{ top: '56px' }}
        ></div>
      )}
    </>
  );
};

export default Sidebar;