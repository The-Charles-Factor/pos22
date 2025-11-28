import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const Cart = ({ cart, onUpdateQuantity, onRemoveItem, onPriceChange, totals }) => {
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    onUpdateQuantity(productId, { quantity: parseInt(newQuantity) });
  };

  const handlePriceChange = (productId, newPrice) => {
    if (newPrice < 0) return;
    onPriceChange(productId, { price: parseFloat(newPrice) });
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">Cart is empty</p>
        <p className="text-gray-400">Add products to start a sale</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Current Sale</h2>
      </div>

      {/* Cart Items */}
      <div className="max-h-96 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.code}</p>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-red-600 hover:text-red-800 ml-2"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-12 gap-2 items-center text-sm">
              <div className="col-span-3">
                <label className="text-gray-500 text-xs">Qty</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                />
              </div>

              <div className="col-span-5">
                <label className="text-gray-500 text-xs">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.price}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </div>

              <div className="col-span-4 text-right">
                <div className="text-gray-500 text-xs">Total</div>
                <div className="font-semibold text-green-600">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            </div>

            {item.price !== item.originalPrice && (
              <div className="text-xs text-yellow-600 mt-1">
                Original: {formatCurrency(item.originalPrice)} 
                (Save: {formatCurrency((item.originalPrice - item.price) * item.quantity)})
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (16%):</span>
            <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
            <span className="text-gray-800">Total:</span>
            <span className="text-green-600">{formatCurrency(totals.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated Profit:</span>
            <span className="font-medium text-blue-600">{formatCurrency(totals.totalProfit)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;