// Utility functions for calculations
export const calculateProfit = (sellingPrice, costPrice) => {
  return sellingPrice - costPrice;
};

export const calculateProfitMargin = (sellingPrice, costPrice) => {
  if (costPrice === 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
};

export const calculateCartTotals = (items, taxRate = 0.16) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  const totalProfit = items.reduce((sum, item) => sum + ((item.price - item.costPrice) * item.quantity), 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100
  };
};

export const applyBulkDiscount = (price, quantity) => {
  if (quantity >= 10) return price * 0.9; // 10% discount for 10+ items
  if (quantity >= 5) return price * 0.95; // 5% discount for 5+ items
  return price;
};

// REMOVED: calculateChange function moved to formatters.js

export const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};