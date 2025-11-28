import { mockProducts, mockEmployees, mockSales, mockSettings } from './mockData';

class POSDatabase {
  constructor() {
    this.db = null;
    this.dbName = 'POSDatabase';
    this.version = 1;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object stores
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('code', 'code', { unique: true });
          productsStore.createIndex('category', 'category', { unique: false });
          productsStore.createIndex('stockQuantity', 'stockQuantity', { unique: false });
        }

        if (!db.objectStoreNames.contains('employees')) {
          const employeesStore = db.createObjectStore('employees', { keyPath: 'id' });
          employeesStore.createIndex('employeeId', 'employeeId', { unique: true });
          employeesStore.createIndex('role', 'role', { unique: false });
        }

        if (!db.objectStoreNames.contains('sales')) {
          const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
          salesStore.createIndex('transactionId', 'transactionId', { unique: true });
          salesStore.createIndex('createdAt', 'createdAt', { unique: false });
          salesStore.createIndex('cashierId', 'cashierId', { unique: false });
        }

        if (!db.objectStoreNames.contains('payments')) {
          const paymentsStore = db.createObjectStore('payments', { keyPath: 'id' });
          paymentsStore.createIndex('employeeId', 'employeeId', { unique: false });
          paymentsStore.createIndex('paymentDate', 'paymentDate', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('username', 'username', { unique: true });
        }
      };
    });
  }

  async populateInitialData() {
    // Check if data already exists
    const productCount = await this.getCount('products');
    
    if (productCount === 0) {
      await this.addMultiple('products', mockProducts);
      await this.addMultiple('employees', mockEmployees);
      await this.addMultiple('sales', mockSales);
      await this.add('settings', { id: 'store', ...mockSettings });
      
      // Add demo users
      const demoUsers = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          fullName: 'System Administrator',
          email: 'admin@store.com',
          isActive: true,
          lastLogin: null,
          createdAt: new Date()
        },
        {
          id: '2',
          username: 'cashier',
          password: 'cashier123',
          role: 'cashier',
          fullName: 'Sarah Cashier',
          email: 'cashier@store.com',
          isActive: true,
          lastLogin: null,
          createdAt: new Date()
        },
        {
          id: '3',
          username: 'manager',
          password: 'manager123',
          role: 'manager',
          fullName: 'John Manager',
          email: 'manager@store.com',
          isActive: true,
          lastLogin: null,
          createdAt: new Date()
        }
      ];
      
      await this.addMultiple('users', demoUsers);
    }
  }

  // Generic CRUD operations
  async add(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  async addMultiple(storeName, items) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    items.forEach(item => {
      store.add(item);
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName, indexName = null, range = null) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      const target = indexName ? store.index(indexName) : store;
      const request = range ? target.getAll(range) : target.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName, key, updates) {
    return new Promise(async (resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // First get the current item
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (!item) {
          reject(new Error('Item not found'));
          return;
        }
        
        const updatedItem = { ...item, ...updates, updatedAt: new Date() };
        const putRequest = store.put(updatedItem);
        
        putRequest.onsuccess = () => resolve(updatedItem);
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCount(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Specific methods for POS operations
  async processSale(saleData) {
    const transaction = this.db.transaction(['sales', 'products'], 'readwrite');
    
    // Add sale record
    const salesStore = transaction.objectStore('sales');
    const saleRequest = salesStore.add(saleData);
    
    // Update product quantities
    const productsStore = transaction.objectStore('products');
    
    saleData.items.forEach(item => {
      const productRequest = productsStore.get(item.productId);
      productRequest.onsuccess = () => {
        const product = productRequest.result;
        if (product) {
          product.stockQuantity -= item.quantity;
          product.updatedAt = new Date();
          productsStore.put(product);
        }
      };
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(saleData);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getSalesByDateRange(startDate, endDate) {
    const sales = await this.getAll('sales');
    return sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  async getLowStockProducts() {
    const settings = await this.get('settings', 'store');
    const threshold = settings?.lowStockThreshold || 5;
    
    const products = await this.getAll('products');
    return products.filter(product => product.stockQuantity <= threshold);
  }

  async searchProducts(query) {
    const products = await this.getAll('products');
    const lowerQuery = query.toLowerCase();
    
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.code.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  }

  async getUserByUsername(username) {
    const users = await this.getAll('users', 'username');
    return users.find(user => user.username === username);
  }

  // Backup and restore methods
  async exportData() {
    const data = {
      products: await this.getAll('products'),
      employees: await this.getAll('employees'),
      sales: await this.getAll('sales'),
      payments: await this.getAll('payments'),
      settings: await this.getAll('settings'),
      users: await this.getAll('users'),
      exportDate: new Date()
    };
    
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData) {
    const data = JSON.parse(jsonData);
    const transaction = this.db.transaction(
      ['products', 'employees', 'sales', 'payments', 'settings', 'users'], 
      'readwrite'
    );

    // Clear existing data
    const stores = ['products', 'employees', 'sales', 'payments', 'settings', 'users'];
    stores.forEach(storeName => {
      const store = transaction.objectStore(storeName);
      store.clear();
    });

    // Add imported data
    if (data.products) {
      data.products.forEach(product => {
        transaction.objectStore('products').add(product);
      });
    }

    if (data.employees) {
      data.employees.forEach(employee => {
        transaction.objectStore('employees').add(employee);
      });
    }

    if (data.sales) {
      data.sales.forEach(sale => {
        transaction.objectStore('sales').add(sale);
      });
    }

    if (data.payments) {
      data.payments.forEach(payment => {
        transaction.objectStore('payments').add(payment);
      });
    }

    if (data.settings) {
      data.settings.forEach(setting => {
        transaction.objectStore('settings').add(setting);
      });
    }

    if (data.users) {
      data.users.forEach(user => {
        transaction.objectStore('users').add(user);
      });
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Create and export a singleton instance
const posDB = new POSDatabase();
export default posDB;