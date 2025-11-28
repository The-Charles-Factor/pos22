import React, { createContext, useContext, useReducer } from 'react';
import { calculateCartTotals, applyBulkDiscount } from '../utils/calculations';

const SalesContext = createContext();

const salesReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.product.id);
      
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.product.id
              ? {
                  ...item,
                  quantity: item.quantity + (action.payload.quantity || 1),
                  price: applyBulkDiscount(action.payload.product.sellingPrice, item.quantity + (action.payload.quantity || 1))
                }
              : item
          )
        };
      }
      
      return {
        ...state,
        cart: [
          ...state.cart,
          {
            ...action.payload.product,
            quantity: action.payload.quantity || 1,
            price: applyBulkDiscount(action.payload.product.sellingPrice, action.payload.quantity || 1),
            originalPrice: action.payload.product.sellingPrice
          }
        ]
      };

    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.productId
            ? {
                ...item,
                ...action.payload.updates,
                price: applyBulkDiscount(
                  action.payload.updates.price || item.originalPrice,
                  action.payload.updates.quantity || item.quantity
                )
              }
            : item
        )
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload.productId)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
      };

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload
      };

    case 'SET_CASH_AMOUNT':
      return {
        ...state,
        cashAmount: action.payload
      };

    case 'PROCESS_SALE_START':
      return {
        ...state,
        processing: true,
        saleError: null
      };

    case 'PROCESS_SALE_SUCCESS':
      return {
        ...state,
        processing: false,
        cart: [],
        cashAmount: 0,
        paymentMethod: null,
        recentSale: action.payload
      };

    case 'PROCESS_SALE_ERROR':
      return {
        ...state,
        processing: false,
        saleError: action.payload
      };

    default:
      return state;
  }
};

const initialState = {
  cart: [],
  paymentMethod: null,
  cashAmount: 0,
  processing: false,
  saleError: null,
  recentSale: null
};

export const SalesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(salesReducer, initialState);

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const updateCartItem = (productId, updates) => {
    dispatch({ type: 'UPDATE_CART_ITEM', payload: { productId, updates } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setPaymentMethod = (method) => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });
  };

  const setCashAmount = (amount) => {
    dispatch({ type: 'SET_CASH_AMOUNT', payload: amount });
  };

  const processSale = async () => {
    dispatch({ type: 'PROCESS_SALE_START' });
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const saleData = {
        id: Date.now().toString(),
        items: state.cart,
        totals: calculateCartTotals(state.cart),
        paymentMethod: state.paymentMethod,
        cashAmount: state.cashAmount,
        timestamp: new Date()
      };
      
      dispatch({ type: 'PROCESS_SALE_SUCCESS', payload: saleData });
      return { success: true, sale: saleData };
    } catch (error) {
      dispatch({ type: 'PROCESS_SALE_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const getCartTotals = () => {
    return calculateCartTotals(state.cart);
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    setPaymentMethod,
    setCashAmount,
    processSale,
    getCartTotals
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};