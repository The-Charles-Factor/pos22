// Validation functions
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9+\-\s()]{10,}$/;
  return re.test(phone);
};

export const validatePrice = (price) => {
  return !isNaN(price) && price >= 0;
};

export const validateQuantity = (quantity) => {
  return !isNaN(quantity) && quantity > 0 && Number.isInteger(Number(quantity));
};

export const validateProduct = (product) => {
  const errors = {};
  
  if (!product.name || product.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters';
  }
  
  if (!validatePrice(product.costPrice)) {
    errors.costPrice = 'Cost price must be a valid number';
  }
  
  if (!validatePrice(product.sellingPrice)) {
    errors.sellingPrice = 'Selling price must be a valid number';
  }
  
  if (product.sellingPrice < product.costPrice) {
    errors.sellingPrice = 'Selling price cannot be less than cost price';
  }
  
  if (!validateQuantity(product.stockQuantity)) {
    errors.stockQuantity = 'Stock quantity must be a positive integer';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};