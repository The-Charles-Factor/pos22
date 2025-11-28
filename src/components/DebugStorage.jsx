import React from 'react';

const DebugStorage = () => {
  const checkStorage = () => {
    console.log('=== LOCALSTORAGE DEBUG ===');
    console.log('Products:', JSON.parse(localStorage.getItem('pos_products') || '[]'));
    console.log('Employees:', JSON.parse(localStorage.getItem('pos_employees') || '[]'));
    console.log('Sales:', JSON.parse(localStorage.getItem('pos_sales') || '[]'));
    console.log('Current Cart:', JSON.parse(localStorage.getItem('pos_current_cart') || '[]'));
    console.log('========================');
  };

  return (
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 1000 }}>
      <button 
        onClick={checkStorage}
        style={{ padding: '5px', background: '#f00', color: 'white', border: 'none', borderRadius: '3px' }}
      >
        Debug Storage
      </button>
    </div>
  );
};

export default DebugStorage;