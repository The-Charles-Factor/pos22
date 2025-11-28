import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onAddToCart,
  showActions = false,
  showAddToCart = false 
}) => {
  const profitMargin = ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100;
  const isLowStock = product.stockQuantity <= product.minStockLevel;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.code}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-gray-500">Cost:</span>
            <span className="ml-1 font-medium">{formatCurrency(product.costPrice)}</span>
          </div>
          <div>
            <span className="text-gray-500">Price:</span>
            <span className="ml-1 font-medium text-green-600">{formatCurrency(product.sellingPrice)}</span>
          </div>
          <div>
            <span className="text-gray-500">Margin:</span>
            <span className={`ml-1 font-medium ${profitMargin >= 30 ? 'text-green-600' : profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">Stock:</span>
            <span className={`ml-1 font-medium ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
              {product.stockQuantity}
              {isLowStock && ' (Low)'}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
          
          <div className="flex space-x-2">
            {showAddToCart && (
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stockQuantity === 0}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            )}
            
            {showActions && (
              <>
                <button
                  onClick={() => onEdit(product)}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;