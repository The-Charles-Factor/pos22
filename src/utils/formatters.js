// Utility functions for formatting
export const formatCurrency = (amount, currency = 'KES') => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

export const calculateChange = (totalAmount, cashReceived) => {
  if (!cashReceived || cashReceived === 0) return 0;
  return Math.max(0, parseFloat(cashReceived) - parseFloat(totalAmount));
};