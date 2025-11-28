import React, { useState } from 'react';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search...", 
  className = "",
  delay = 300 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (delay > 0) {
      setTimeout(() => {
        onSearch(value);
      }, delay);
    } else {
      onSearch(value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-400">🔍</span>
      </div>
    </div>
  );
};

export default SearchBar;