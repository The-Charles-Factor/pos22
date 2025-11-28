import { useState, useCallback } from 'react';
import { useIndexedDB } from './useIndexedDB';

export const useProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: products, loading, error, add, update, remove, refresh } = useIndexedDB('products');

  const addProduct = useCallback(async (productData) => {
    const product = {
      ...productData,
      id: productData.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profitMargin: ((productData.sellingPrice - productData.costPrice) / productData.sellingPrice) * 100
    };
    return await add(product);
  }, [add]);

  const updateProduct = useCallback(async (productId, updates) => {
    const updatedProduct = {
      ...updates,
      updatedAt: new Date().toISOString(),
      profitMargin: updates.sellingPrice && updates.costPrice 
        ? ((updates.sellingPrice - updates.costPrice) / updates.sellingPrice) * 100
        : undefined
    };
    return await update(productId, updatedProduct);
  }, [update]);

  const deleteProduct = useCallback(async (productId) => {
    return await remove(productId);
  }, [remove]);

  const getProductById = useCallback((productId) => {
    return products.find(product => product.id === productId);
  }, [products]);

  const getFilteredProducts = useCallback(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  const getCategories = useCallback(() => {
    const categories = [...new Set(products.map(product => product.category).filter(Boolean))];
    return categories.sort();
  }, [products]);

  const getLowStockProducts = useCallback(() => {
    return products.filter(product => product.stockQuantity <= (product.minStockLevel || 5));
  }, [products]);

  return {
    products: getFilteredProducts(),
    allProducts: products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getCategories,
    getLowStockProducts,
    refresh
  };
};