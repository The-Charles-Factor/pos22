import React, { useState, useEffect } from 'react';
import ProductCard from '../components/common/ProductCard';
import SearchBar from '../components/ui/SearchBar';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatsCard from '../components/ui/StatsCard';
import { useProducts } from '../hooks/useProducts';
import { validateProduct } from '../utils/validators';
import { formatCurrency } from '../utils/formatters';

const Products = () => {
  const {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    getCategories,
    addProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts
  } = useProducts();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    description: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    minStockLevel: '5',
    supplier: '',
    barcode: '',
    plu: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [bulkAction, setBulkAction] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  const categories = getCategories();
  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);

  // Calculate inventory metrics
  const inventoryValue = products.reduce((sum, product) => 
    sum + (product.costPrice * product.stockQuantity), 0
  );
  const potentialProfit = products.reduce((sum, product) => 
    sum + ((product.sellingPrice - product.costPrice) * product.stockQuantity), 0
  );

  // Load products from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('pos_products');
    if (savedProducts) {
      // Products are already loaded through useProducts hook
      console.log('Products loaded from localStorage');
    }
  }, []);

  // Save products to localStorage whenever products change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('pos_products', JSON.stringify(products));
    }
  }, [products]);

  const resetForm = () => {
    setProductForm({
      name: '',
      code: '',
      description: '',
      category: '',
      costPrice: '',
      sellingPrice: '',
      stockQuantity: '',
      minStockLevel: '5',
      supplier: '',
      barcode: '',
      plu: ''
    });
    setFormErrors({});
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      code: product.code,
      description: product.description || '',
      category: product.category,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel || '5',
      supplier: product.supplier || '',
      barcode: product.barcode || '',
      plu: product.plu || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (product) => {
    setEditingProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (editingProduct) {
      await deleteProduct(editingProduct.id);
      setShowDeleteDialog(false);
      setEditingProduct(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      ...productForm,
      costPrice: parseFloat(productForm.costPrice),
      sellingPrice: parseFloat(productForm.sellingPrice),
      stockQuantity: parseInt(productForm.stockQuantity),
      minStockLevel: parseInt(productForm.minStockLevel),
      profitMargin: ((parseFloat(productForm.sellingPrice) - parseFloat(productForm.costPrice)) / parseFloat(productForm.sellingPrice)) * 100,
      isActive: true,
      createdAt: editingProduct ? editingProduct.createdAt : new Date(),
      updatedAt: new Date()
    };

    const validation = validateProduct(productData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct({
        ...productData,
        id: Date.now().toString()
      });
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleInputChange = (field, value) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBulkAction = async () => {
    if (bulkAction === 'delete' && selectedProducts.size > 0) {
      for (const productId of selectedProducts) {
        await deleteProduct(productId);
      }
      setSelectedProducts(new Set());
      setBulkAction('');
    }
  };

  const toggleProductSelection = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const exportProducts = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importProducts = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedProducts = JSON.parse(e.target.result);
          // Validate and add imported products
          importedProducts.forEach(async (product) => {
            await addProduct({
              ...product,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
            });
          });
          setShowImportModal(false);
        } catch (error) {
          alert('Invalid file format. Please upload a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading products..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">
            Manage your product catalog, inventory, and stock levels
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
          <button
            onClick={exportProducts}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export Products
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Import Products
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Add New Product
          </button>
        </div>
      </div>

      {/* Inventory Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Products"
          value={products.length}
          subtitle="In catalog"
          color="blue"
        />
        <StatsCard
          title="Inventory Value"
          value={formatCurrency(inventoryValue)}
          subtitle="At cost price"
          color="green"
        />
        <StatsCard
          title="Potential Profit"
          value={formatCurrency(potentialProfit)}
          subtitle="If all sold"
          color="purple"
        />
        <StatsCard
          title="Stock Alerts"
          value={lowStockProducts.length + outOfStockProducts.length}
          subtitle="Need attention"
          color="red"
        />
      </div>

      {/* Stock Alerts Section */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">Stock Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outOfStockProducts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h4 className="font-medium text-red-800 mb-2">
                  Out of Stock ({outOfStockProducts.length})
                </h4>
                <div className="space-y-1">
                  {outOfStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-red-700">{product.name}</span>
                      <span className="text-red-600 font-medium">0 in stock</span>
                    </div>
                  ))}
                  {outOfStockProducts.length > 3 && (
                    <p className="text-xs text-red-600">
                      +{outOfStockProducts.length - 3} more products out of stock
                    </p>
                  )}
                </div>
              </div>
            )}
            {lowStockProducts.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <h4 className="font-medium text-orange-800 mb-2">
                  Low Stock ({lowStockProducts.length})
                </h4>
                <div className="space-y-1">
                  {lowStockProducts.slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-orange-700">{product.name}</span>
                      <span className="text-orange-600 font-medium">
                        {product.stockQuantity} left (min: {product.minStockLevel})
                      </span>
                    </div>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <p className="text-xs text-orange-600">
                      +{lowStockProducts.length - 3} more products with low stock
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-md">
              <SearchBar
                onSearch={setSearchTerm}
                placeholder="Search products by name, code, description..."
                className="w-full"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedProducts.size} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="">Bulk Actions</option>
                <option value="delete">Delete Selected</option>
              </select>
              <button
                onClick={handleBulkAction}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Product
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="relative">
              {selectedProducts.size > 0 && (
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => toggleProductSelection(product.id)}
                  className="absolute top-3 left-3 z-10 w-5 h-5"
                />
              )}
              <ProductCard
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={true}
                showStockLevel={true}
              />
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-700">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedProducts.size === products.length && products.length > 0}
                onChange={selectAllProducts}
                className="w-4 h-4"
              />
            </div>
            <div className="col-span-3">Product</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-1 text-right">Stock</div>
            <div className="col-span-2 text-right">Cost</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-gray-200">
            {products.map(product => (
              <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="w-4 h-4"
                  />
                </div>
                <div className="col-span-3">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.code}</div>
                </div>
                <div className="col-span-2">
                  <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {product.category}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    product.stockQuantity === 0 
                      ? 'bg-red-100 text-red-800'
                      : product.stockQuantity <= product.minStockLevel
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.stockQuantity}
                  </span>
                </div>
                <div className="col-span-2 text-right font-medium">
                  {formatCurrency(product.costPrice)}
                </div>
                <div className="col-span-2 text-right font-medium text-green-600">
                  {formatCurrency(product.sellingPrice)}
                </div>
                <div className="col-span-1 text-right">
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter product name"
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Code *
              </label>
              <input
                type="text"
                value={productForm.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g., PROD001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Product description"
              />
            </div>

            {/* Pricing & Inventory */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Inventory</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.costPrice}
                onChange={(e) => handleInputChange('costPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
              {formErrors.costPrice && (
                <p className="text-red-500 text-xs mt-1">{formErrors.costPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={productForm.sellingPrice}
                onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="0.00"
              />
              {formErrors.sellingPrice && (
                <p className="text-red-500 text-xs mt-1">{formErrors.sellingPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={productForm.stockQuantity}
                onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
              {formErrors.stockQuantity && (
                <p className="text-red-500 text-xs mt-1">{formErrors.stockQuantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={productForm.minStockLevel}
                onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="5"
              />
            </div>

            {/* Additional Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                value={productForm.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g., Tools, Electronics"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <input
                type="text"
                value={productForm.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Supplier name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode
              </label>
              <input
                type="text"
                value={productForm.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Barcode number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PLU Code
              </label>
              <input
                type="text"
                value={productForm.plu}
                onChange={(e) => handleInputChange('plu', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Price Look-Up code"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Products Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Products"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Upload a JSON file containing your products data. The file should be in the same format as exported products.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={importProducts}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setEditingProduct(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${editingProduct?.name}"? This action cannot be undone and will affect sales data.`}
        confirmText="Delete Product"
        cancelText="Keep Product"
        type="danger"
      />
    </div>
  );
};

export default Products;