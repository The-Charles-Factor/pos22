import { useState, useEffect } from 'react';

// Simple localStorage-based hook for immediate functionality
export const useIndexedDB = (storeName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, [storeName]);

  const loadFromStorage = () => {
    try {
      setLoading(true);
      const savedData = localStorage.getItem(`pos_${storeName}`);
      if (savedData) {
        setData(JSON.parse(savedData));
      } else {
        // Initialize with empty array if no data exists
        setData([]);
        localStorage.setItem(`pos_${storeName}`, JSON.stringify([]));
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Storage load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (newData) => {
    try {
      localStorage.setItem(`pos_${storeName}`, JSON.stringify(newData));
      return true;
    } catch (err) {
      setError('Failed to save data');
      console.error('Storage save error:', err);
      return false;
    }
  };

  const add = async (item) => {
    const newItem = { ...item, id: item.id || Date.now().toString() };
    const newData = [...data, newItem];
    setData(newData);
    const success = saveToStorage(newData);
    return success ? newItem : null;
  };

  const update = async (id, updates) => {
    const newData = data.map(item => 
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    setData(newData);
    const success = saveToStorage(newData);
    return success ? updates : null;
  };

  const remove = async (id) => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    const success = saveToStorage(newData);
    return success;
  };

  const getAll = async () => {
    return data;
  };

  return {
    data,
    loading,
    error,
    add,
    update,
    remove,
    getAll,
    refresh: loadFromStorage
  };
};