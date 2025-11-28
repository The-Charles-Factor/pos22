import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSales } from '../context/SalesContext';
import { useProducts } from '../hooks/useProducts';
import StatsCard from '../components/ui/StatsCard';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateCartTotals } from '../utils/calculations';

const Dashboard = () => {
  const { user } = useAuth();
  const { cart, recentSale } = useSales();
  const { products, getLowStockProducts } = useProducts();
  
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    todayProfit: 0,
    totalTransactions: 0,
    lowStockItems: 0,
    averageTransaction: 0,
    bestSellingProduct: 'None'
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadDashboardData();
    loadRecentActivities();
    generateSalesTrend();
  }, [products, recentSale]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveDashboardData();
  }, [dashboardData]);

  useEffect(() => {
    saveRecentActivities();
  }, [recentActivities]);

  const loadDashboardData = () => {
    const savedData = localStorage.getItem('pos_dashboard_data');
    if (savedData) {
      setDashboardData(JSON.parse(savedData));
    } else {
      calculateRealTimeData();
    }
  };

  const saveDashboardData = () => {
    localStorage.setItem('pos_dashboard_data', JSON.stringify(dashboardData));
  };

  const loadRecentActivities = () => {
    const savedActivities = localStorage.getItem('pos_recent_activities');
    if (savedActivities) {
      setRecentActivities(JSON.parse(savedActivities));
    } else {
      // Initialize with empty array if no data exists
      setRecentActivities([]);
    }
  };

  const saveRecentActivities = () => {
    localStorage.setItem('pos_recent_activities', JSON.stringify(recentActivities));
  };

  const calculateRealTimeData = () => {
    // Calculate today's sales from localStorage
    const savedSales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
    const today = new Date().toDateString();
    
    const todaySalesData = savedSales.filter(sale => 
      new Date(sale.createdAt).toDateString() === today
    );

    const todaySales = todaySalesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const todayProfit = todaySalesData.reduce((sum, sale) => sum + sale.totalProfit, 0);
    
    const lowStockItems = getLowStockProducts().length;
    
    // Find best selling product
    const productSales = {};
    savedSales.forEach(sale => {
      sale.items.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });
    
    const bestSeller = Object.keys(productSales).length > 0 
      ? Object.keys(productSales).reduce((a, b) => productSales[a] > productSales[b] ? a : b)
      : 'None';

    setDashboardData({
      todaySales,
      todayProfit,
      totalTransactions: savedSales.length,
      lowStockItems,
      averageTransaction: savedSales.length > 0 ? todaySales / savedSales.length : 0,
      bestSellingProduct: bestSeller
    });
  };

  const generateSalesTrend = () => {
    const savedSales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
    
    // Generate last 7 days sales data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const daySales = savedSales.filter(sale => 
        new Date(sale.createdAt).toDateString() === dateStr
      );
      
      const dayTotal = daySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: dayTotal,
        profit: daySales.reduce((sum, sale) => sum + sale.totalProfit, 0)
      });
    }
    
    setSalesTrend(last7Days);
  };

  // Add new activity when a sale is completed
  useEffect(() => {
    if (recentSale) {
      const newActivity = {
        id: Date.now(),
        type: 'sale',
        title: `Sale #${recentSale.id}`,
        amount: recentSale.totalAmount,
        items: recentSale.items.length,
        timestamp: new Date().toISOString()
      };
      
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only last 10 activities
    }
  }, [recentSale]);

  // Simple bar chart component
  const SalesBarChart = ({ data }) => {
    const maxSales = Math.max(...data.map(item => item.sales), 1); // Avoid division by zero
    
    return (
      <div className="space-y-2">
        {data.map((day, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-xs font-medium text-gray-600 w-8">{day.day}</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Sales: {formatCurrency(day.sales)}</span>
                <span className="text-green-600">Profit: {formatCurrency(day.profit)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(day.sales / maxSales) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Inventory status component
  const InventoryStatus = () => {
    const lowStockProducts = getLowStockProducts();
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stockQuantity === 0).length;
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Products</span>
          <span className="font-semibold">{totalProducts}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-yellow-600">Low Stock</span>
          <span className="font-semibold text-yellow-600">{lowStockProducts.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-red-600">Out of Stock</span>
          <span className="font-semibold text-red-600">{outOfStock}</span>
        </div>
        
        {lowStockProducts.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs font-medium text-yellow-800 mb-1">Low Stock Alert:</p>
            {lowStockProducts.slice(0, 2).map(product => (
              <p key={product.id} className="text-xs text-yellow-700">
                {product.name} ({product.stockQuantity} left)
              </p>
            ))}
            {lowStockProducts.length > 2 && (
              <p className="text-xs text-yellow-600 mt-1">
                +{lowStockProducts.length - 2} more...
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Quick action handler
  const handleQuickAction = (action) => {
    // These would navigate to different pages in a real app
    const actions = {
      newSale: () => window.location.href = '/sales',
      products: () => window.location.href = '/products',
      reports: () => window.location.href = '/insights',
      employees: () => window.location.href = '/employees'
    };
    
    if (actions[action]) {
      actions[action]();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.fullName}! Here's your store overview.
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <button
            onClick={() => {
              calculateRealTimeData();
              generateSalesTrend();
            }}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Today's Sales"
          value={formatCurrency(dashboardData.todaySales)}
          subtitle={dashboardData.totalTransactions > 0 ? `${dashboardData.totalTransactions} transactions` : "No sales today"}
          trend={{ 
            direction: dashboardData.todaySales > 0 ? 'up' : 'neutral', 
            value: dashboardData.todaySales > 0 ? '+Active' : 'No sales' 
          }}
          color="green"
        />
        <StatsCard
          title="Today's Profit"
          value={formatCurrency(dashboardData.todayProfit)}
          subtitle="Net profit"
          trend={{ 
            direction: dashboardData.todayProfit > 0 ? 'up' : 'neutral', 
            value: dashboardData.todayProfit > 0 ? '+Profit' : 'No profit' 
          }}
          color="blue"
        />
        <StatsCard
          title="Total Transactions"
          value={dashboardData.totalTransactions}
          subtitle="All-time sales"
          trend={{ 
            direction: dashboardData.totalTransactions > 0 ? 'up' : 'neutral', 
            value: dashboardData.totalTransactions > 0 ? '+Active' : 'No sales' 
          }}
          color="purple"
        />
        <StatsCard
          title="Stock Alerts"
          value={dashboardData.lowStockItems}
          subtitle="Need restocking"
          trend={{ 
            direction: dashboardData.lowStockItems > 0 ? 'down' : 'up', 
            value: dashboardData.lowStockItems > 0 ? 'Attention needed' : 'All good' 
          }}
          color={dashboardData.lowStockItems > 0 ? "red" : "green"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">7-Day Sales Trend</h2>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          {salesTrend.some(day => day.sales > 0) ? (
            <SalesBarChart data={salesTrend} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales data available</p>
              <p className="text-sm text-gray-400">Sales will appear here once transactions are made</p>
            </div>
          )}
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Inventory Status</h2>
          <InventoryStatus />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            <span className="text-sm text-gray-500">Last 10 activities</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">💰</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(activity.timestamp)} • {activity.items} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(activity.amount)}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">Activities will appear here after sales</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Performance */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleQuickAction('newSale')}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
              >
                <span className="block text-lg mb-1">🛒</span>
                <span className="font-medium text-blue-700 text-sm">New Sale</span>
              </button>
              <button 
                onClick={() => handleQuickAction('products')}
                className="p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
              >
                <span className="block text-lg mb-1">📦</span>
                <span className="font-medium text-green-700 text-sm">Manage Products</span>
              </button>
              <button 
                onClick={() => handleQuickAction('reports')}
                className="p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <span className="block text-lg mb-1">📈</span>
                <span className="font-medium text-purple-700 text-sm">View Reports</span>
              </button>
              <button 
                onClick={() => handleQuickAction('employees')}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left"
              >
                <span className="block text-lg mb-1">👥</span>
                <span className="font-medium text-yellow-700 text-sm">Employees</span>
              </button>
            </div>
          </div>

          {/* Best Performing Product */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-800">Best Seller</p>
                  <p className="text-sm text-gray-500">{dashboardData.bestSellingProduct}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">Top Product</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-800">Avg Transaction</p>
                  <p className="text-sm text-gray-500">Per sale</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">
                    {formatCurrency(dashboardData.averageTransaction)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">System Online</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Data Synced</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-0">
            <span className="text-gray-500">
              Last updated: {formatDate(new Date())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;