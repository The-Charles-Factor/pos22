import { useState, useCallback } from 'react';
import { calculateCartTotals, applyBulkDiscount } from '../utils/calculations';

export const useSales = () => {
  const [cart, setCart] = useState([]);
  const [currentSale, setCurrentSale] = useState(null);

  const addToCart = useCallback((product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                price: applyBulkDiscount(product.sellingPrice, item.quantity + quantity)
              }
            : item
        );
      }
      
      return [
        ...prevCart,
        {
          ...product,
          quantity,
          price: applyBulkDiscount(product.sellingPrice, quantity),
          originalPrice: product.sellingPrice
        }
      ];
    });
  }, []);

  const updateCartItem = useCallback((productId, updates) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { 
              ...item, 
              ...updates,
              price: applyBulkDiscount(updates.price || item.price, updates.quantity || item.quantity)
            }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getCartTotals = useCallback(() => {
    return calculateCartTotals(cart);
  }, [cart]);

  const startNewSale = useCallback(() => {
    setCurrentSale({
      id: Date.now().toString(),
      startedAt: new Date(),
      items: [],
      status: 'active'
    });
    clearCart();
  }, [clearCart]);

  return {
    cart,
    currentSale,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotals,
    startNewSale,
    setCurrentSale
  };
};