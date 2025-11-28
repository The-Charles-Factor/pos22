import React, { useState, useEffect } from 'react';
import { useSales } from '../context/SalesContext';
import { useProducts } from '../hooks/useProducts';
import ProductGrid from '../components/sales/ProductGrid';
import Cart from '../components/sales/Cart';
import ScannerSimulator from '../components/sales/ScannerSimulator';
import PaymentModal from '../components/sales/PaymentModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ReceiptTemplate from '../components/common/ReceiptTemplate';
import { simulatePaymentProcessing } from '../utils/simulations';
import { formatCurrency } from '../utils/formatters';

const Sales = () => {
  const { 
    cart, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    getCartTotals,
    processing 
  } = useSales();

  const { products, loading: productsLoading } = useProducts();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const [saleType, setSaleType] = useState('manual'); // 'manual' or 'scanning'
  const [scanning, setScanning] = useState(false);
  const [saleStatus, setSaleStatus] = useState('ready'); // 'ready', 'processing', 'completed'

  const totals = getCartTotals();

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pos_current_cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // Restore cart items by adding them back one by one
      parsedCart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          addToCart(product, item.quantity);
        }
      });
    }
  }, [products]);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('pos_current_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('pos_current_cart');
    }
  }, [cart]);

  const handleProcessPayment = async (paymentData) => {
    setSaleStatus('processing');
    
    const result = await simulatePaymentProcessing((step) => {
      console.log(step);
    });

    if (result.success) {
      const saleData = {
        id: result.transactionId,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          originalPrice: item.originalPrice,
          discount: item.originalPrice - item.price,
          totalPrice: item.price * item.quantity,
          costPrice: item.costPrice,
          profit: (item.price - item.costPrice) * item.quantity
        })),
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: 0,
        totalAmount: totals.totalAmount,
        totalProfit: totals.totalProfit,
        paymentMethod: paymentData.method,
        cashAmount: paymentData.cashAmount || 0,
        changeAmount: paymentData.cashAmount ? paymentData.cashAmount - totals.totalAmount : 0,
        cashierName: 'Demo Cashier',
        status: 'completed',
        createdAt: new Date().toISOString()
      };

      // Save sale to localStorage
      const existingSales = JSON.parse(localStorage.getItem('pos_sales') || '[]');
      localStorage.setItem('pos_sales', JSON.stringify([saleData, ...existingSales]));

      setCurrentSale(saleData);
      setShowPaymentModal(false);
      setShowReceipt(true);
      setSaleStatus('completed');
      
      // Clear cart and localStorage after successful sale
      setTimeout(() => {
        clearCart();
        localStorage.removeItem('pos_current_cart');
        setShowReceipt(false);
        setCurrentSale(null);
        setSaleStatus('ready');
      }, 5000);
    }
  };

  const handlePriceChange = (productId, updates) => {
    updateCartItem(productId, updates);
  };

  const handleScanProduct = async (productCode) => {
    setScanning(true);
    
    // Simulate scanner delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const product = products.find(p => 
      p.code === productCode || p.plu === productCode
    );

    setScanning(false);

    if (product) {
      if (product.stockQuantity > 0) {
        addToCart(product);
        return { success: true, product };
      } else {
        return { success: false, error: 'Product out of stock' };
      }
    } else {
      return { success: false, error: 'Product not found' };
    }
  };

  const handleQuickProductAdd = (productCode, quantity = 1) => {
    const product = products.find(p => p.code === productCode);
    if (product && product.stockQuantity > 0) {
      addToCart(product, quantity);
    }
  };

  const handleNewSale = () => {
    clearCart();
    localStorage.removeItem('pos_current_cart');
    setShowReceipt(false);
    setCurrentSale(null);
    setSaleStatus('ready');
  };

  const handleVoidItem = (productId) => {
    removeFromCart(productId);
  };

  const handleVoidLastItem = () => {
    if (cart.length > 0) {
      const lastItem = cart[cart.length - 1];
      removeFromCart(lastItem.id);
    }
  };

  if (showReceipt && currentSale) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-green-600">Sale Completed Successfully!</h2>
            <p className="text-gray-600">Transaction ID: {currentSale.id}</p>
          </div>
          
          <ReceiptTemplate 
            sale={currentSale} 
            storeSettings={{ name: 'Demo Store', taxRate: 0.16 }}
          />
          
          <div className="text-center mt-6 space-x-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Print Receipt
            </button>
            <button
              onClick={handleNewSale}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading products..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-gray-600">Process customer transactions</p>
        </div>
        
        {/* Sale Type Selector */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSaleType('manual')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              saleType === 'manual' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setSaleType('scanning')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              saleType === 'scanning' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Scanner Mode
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      {cart.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                Items: <strong>{cart.length}</strong>
              </span>
              <span className="text-sm font-medium text-gray-700">
                Total: <strong className="text-green-600">{formatCurrency(totals.totalAmount)}</strong>
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleVoidLastItem}
                disabled={cart.length === 0}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Void Last Item
              </button>
              <button
                onClick={clearCart}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0 || saleStatus === 'processing'}
                className="px-4 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
              >
                {saleStatus === 'processing' ? 'Processing...' : `Checkout ${formatCurrency(totals.totalAmount)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Product Codes */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Product Codes</h3>
        <div className="flex flex-wrap gap-2">
          {products.slice(0, 6).map(product => (
            <button
              key={product.id}
              onClick={() => handleQuickProductAdd(product.code)}
              disabled={product.stockQuantity === 0}
              className={`px-3 py-2 text-xs rounded border transition-colors ${
                product.stockQuantity > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {product.code} - {product.name}
              {product.stockQuantity === 0 && ' (Out of Stock)'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Products and Scanner */}
        <div className="lg:col-span-2 space-y-6">
          {saleType === 'scanning' && (
            <ScannerSimulator 
              onScan={handleScanProduct}
              products={products}
              scanning={scanning}
            />
          )}
          
          <ProductGrid 
            onAddToCart={addToCart}
            showStock={true}
          />
        </div>

        {/* Right Column - Cart */}
        <div className="lg:col-span-1">
          <Cart
            cart={cart}
            onUpdateQuantity={updateCartItem}
            onRemoveItem={handleVoidItem}
            onPriceChange={handlePriceChange}
            totals={totals}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onProcessPayment={handleProcessPayment}
        totalAmount={totals.totalAmount}
        processing={saleStatus === 'processing'}
      />

      {/* Current Sale Status */}
      {saleStatus === 'processing' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              <LoadingSpinner text="Processing payment..." />
              <p className="text-sm text-gray-600 mt-2">
                Please wait while we process your transaction
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;