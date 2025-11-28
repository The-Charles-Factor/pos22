import React, { useState, useEffect } from 'react';
import StatsCard from '../components/ui/StatsCard';
import { formatCurrency, formatDate } from '../utils/formatters';

const Insights = () => {
  const [insightsData, setInsightsData] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    averageTransaction: 0,
    totalTransactions: 0,
    bestSellingProduct: 'None',
    worstSellingProduct: 'None',
    topCategory: 'None'
  });

  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [timeRange, setTimeRange] = useState('7days'); // '7days', '30days', 'alltime'
  const [loading, setLoading] = useState(true);

  // Load and calculate insights data
  useEffect(() => {
    calculateInsights();
  }, [timeRange]);

  const calculateInsights = () => {
    setLoading(true);
    
    // Load sales data from localStorage
    const savedSales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
    const savedProducts = JSON.parse(localStorage.getItem('pos_products') || '[]');
    
    // Filter sales by time range
    const filteredSales = filterSalesByTimeRange(savedSales, timeRange);
    
    // Calculate basic metrics
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.totalProfit, 0);
    const totalTransactions = filteredSales.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate product performance
    const productPerformance = calculateProductPerformance(filteredSales, savedProducts);
    const bestSellingProduct = productPerformance.length > 0 ? productPerformance[0].name : 'None';
    const worstSellingProduct = productPerformance.length > 0 ? productPerformance[productPerformance.length - 1].name : 'None';

    // Calculate sales trend
    const salesTrend = calculateSalesTrend(filteredSales, timeRange);
    
    // Calculate category performance
    const topCategory = calculateTopCategory(filteredSales, savedProducts);

    setInsightsData({
      totalRevenue,
      totalProfit,
      averageTransaction,
      totalTransactions,
      bestSellingProduct,
      worstSellingProduct,
      topCategory
    });

    setSalesData(salesTrend);
    setTopProducts(productPerformance.slice(0, 5)); // Top 5 products
    setLoading(false);
  };

  const filterSalesByTimeRange = (sales, range) => {
    const now = new Date();
    let startDate;

    switch (range) {
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'alltime':
      default:
        return sales; // Return all sales
    }

    return sales.filter(sale => new Date(sale.createdAt) >= startDate);
  };

  const calculateProductPerformance = (sales, products) => {
    const productSales = {};
    
    // Aggregate sales by product
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          const product = products.find(p => p.id === item.productId);
          productSales[item.productId] = {
            id: item.productId,
            name: product ? product.name : item.name,
            totalSales: 0,
            totalRevenue: 0,
            totalQuantity: 0,
            totalProfit: 0
          };
        }
        
        productSales[item.productId].totalSales += 1;
        productSales[item.productId].totalRevenue += item.totalPrice;
        productSales[item.productId].totalQuantity += item.quantity;
        productSales[item.productId].totalProfit += item.profit;
      });
    });

    // Convert to array and sort by revenue
    return Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  };

  const calculateSalesTrend = (sales, range) => {
    const days = range === '7days' ? 7 : 30;
    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toDateString();

      const daySales = sales.filter(sale => 
        new Date(sale.createdAt).toDateString() === dateStr
      );

      const dayRevenue = daySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const dayProfit = daySales.reduce((sum, sale) => sum + sale.totalProfit, 0);

      trend.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        sales: dayRevenue,
        profit: dayProfit,
        transactions: daySales.length
      });
    }

    return trend;
  };

  const calculateTopCategory = (sales, products) => {
    const categoryRevenue = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const category = product.category;
          categoryRevenue[category] = (categoryRevenue[category] || 0) + item.totalPrice;
        }
      });
    });

    const categories = Object.entries(categoryRevenue);
    if (categories.length === 0) return 'None';
    
    return categories.sort((a, b) => b[1] - a[1])[0][0];
  };

  const getTrendDirection = (current, previous) => {
    if (current > previous) return { direction: 'up', value: `+${(((current - previous) / previous) * 100).toFixed(1)}%` };
    if (current < previous) return { direction: 'down', value: `-${(((previous - current) / previous) * 100).toFixed(1)}%` };
    return { direction: 'neutral', value: '0%' };
  };

  const calculateTrends = () => {
    const currentSales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
    const previousPeriodSales = filterSalesByTimeRange(currentSales, timeRange === '7days' ? '30days' : 'alltime');
    
    const currentRevenue = insightsData.totalRevenue;
    const previousRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const currentProfit = insightsData.totalProfit;
    const previousProfit = previousPeriodSales.reduce((sum, sale) => sum + sale.totalProfit, 0);
    
    const currentTransactions = insightsData.totalTransactions;
    const previousTransactions = previousPeriodSales.length;

    return {
      revenueTrend: getTrendDirection(currentRevenue, previousRevenue),
      profitTrend: getTrendDirection(currentProfit, previousProfit),
      transactionTrend: getTrendDirection(currentTransactions, previousTransactions)
    };
  };

  const trends = calculateTrends();

  // Simple bar chart component
  const SalesBarChart = ({ data }) => {
    const maxSales = Math.max(...data.map(item => item.sales), 1);
    const maxProfit = Math.max(...data.map(item => item.profit), 1);

    return (
      <div className="space-y-4">
        {data.map((day, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600 w-12">{day.day}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-600">
                    Sales: {formatCurrency(day.sales)}
                  </span>
                  <span className="text-green-600">
                    Profit: {formatCurrency(day.profit)}
                  </span>
                  <span className="text-gray-500">
                    {day.transactions} transactions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(day.sales / maxSales) * 100}%` }}
                  ></div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(day.profit / maxProfit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Calculating insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Insights</h1>
          <p className="text-gray-600">
            Real-time analytics and performance metrics based on your actual sales data
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="alltime">All Time</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(insightsData.totalRevenue)}
          subtitle={`${timeRange === '7days' ? '7 Days' : timeRange === '30days' ? '30 Days' : 'All Time'}`}
          trend={trends.revenueTrend}
          color="green"
        />
        <StatsCard
          title="Total Profit"
          value={formatCurrency(insightsData.totalProfit)}
          subtitle="Net profit"
          trend={trends.profitTrend}
          color="blue"
        />
        <StatsCard
          title="Avg Transaction"
          value={formatCurrency(insightsData.averageTransaction)}
          subtitle="Per sale"
          trend={trends.transactionTrend}
          color="purple"
        />
        <StatsCard
          title="Transactions"
          value={insightsData.totalTransactions}
          subtitle="Completed sales"
          trend={trends.transactionTrend}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              {timeRange === '7days' ? '7-Day' : timeRange === '30days' ? '30-Day' : 'All Time'} Sales Trend
            </h2>
            <span className="text-sm text-gray-500">
              {salesData.length} days of data
            </span>
          </div>
          {salesData.some(day => day.sales > 0) ? (
            <SalesBarChart data={salesData} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-gray-500 text-lg">No sales data available</p>
              <p className="text-gray-400">Sales will appear here once transactions are made</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Products</h2>
          <div className="space-y-3">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.totalQuantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(product.totalRevenue)}</p>
                    <p className="text-xs text-gray-500">Profit: {formatCurrency(product.totalProfit)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No product data available</p>
                <p className="text-sm text-gray-400">Product performance will appear after sales</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Highlights</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Best Seller</p>
                <p className="text-sm text-green-600">{insightsData.bestSellingProduct}</p>
              </div>
              <div className="text-right">
                <span className="text-green-600 text-lg">🏆</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Top Category</p>
                <p className="text-sm text-blue-600">{insightsData.topCategory}</p>
              </div>
              <div className="text-right">
                <span className="text-blue-600 text-lg">📈</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-yellow-800">Avg Profit Margin</p>
                <p className="text-sm text-yellow-600">
                  {insightsData.totalRevenue > 0 
                    ? `${((insightsData.totalProfit / insightsData.totalRevenue) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="text-right">
                <span className="text-yellow-600 text-lg">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sales Distribution</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Sales Value</span>
              <span className="font-semibold">{formatCurrency(insightsData.totalRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Total Profit</span>
              <span className="font-semibold text-green-600">{formatCurrency(insightsData.totalProfit)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Operating Costs</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(insightsData.totalRevenue - insightsData.totalProfit)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between text-sm font-medium">
                <span>Profit Margin</span>
                <span className={
                  ((insightsData.totalProfit / insightsData.totalRevenue) * 100) > 30 
                    ? 'text-green-600' 
                    : ((insightsData.totalProfit / insightsData.totalRevenue) * 100) > 15 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }>
                  {insightsData.totalRevenue > 0 
                    ? `${((insightsData.totalProfit / insightsData.totalRevenue) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h2>
          <div className="space-y-4">
            {insightsData.worstSellingProduct !== 'None' && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-800">Lowest Performer</p>
                    <p className="text-sm text-red-600">{insightsData.worstSellingProduct}</p>
                  </div>
                  <span className="text-red-600">⚠️</span>
                </div>
              </div>
            )}
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-purple-800">Transaction Efficiency</p>
                  <p className="text-sm text-purple-600">
                    {insightsData.totalTransactions} sales
                  </p>
                </div>
                <span className="text-purple-600">⚡</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-indigo-800">Data Coverage</p>
                  <p className="text-sm text-indigo-600">
                    {timeRange === '7days' ? '7 Days' : timeRange === '30days' ? '30 Days' : 'All Time'}
                  </p>
                </div>
                <span className="text-indigo-600">📅</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary Footer */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Data Source: Local Storage</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Last Updated: {formatDate(new Date())}</span>
            </div>
          </div>
          <div className="mt-2 sm:mt-0">
            <button
              onClick={calculateInsights}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;