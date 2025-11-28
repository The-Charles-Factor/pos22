import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ReceiptTemplate = ({ sale, storeSettings }) => {
  if (!sale) return null;

  return (
    <div className="bg-white p-6 max-w-md mx-auto font-mono text-sm">
      {/* Store Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">{storeSettings.name}</h1>
        <p className="text-gray-600">POS System Demo</p>
        <p className="text-gray-600">{formatDate(new Date())}</p>
      </div>

      {/* Transaction Info */}
      <div className="border-b border-gray-300 pb-2 mb-2">
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span>{sale.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span>{sale.cashierName || 'Demo Cashier'}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="border-b border-gray-300 pb-2 mb-2">
        <div className="grid grid-cols-12 gap-1 mb-1 font-semibold">
          <div className="col-span-6">Item</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-4 text-right">Price</div>
        </div>
        
        {sale.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-1 mb-1">
            <div className="col-span-6">{item.name}</div>
            <div className="col-span-2 text-right">{item.quantity}</div>
            <div className="col-span-4 text-right">{formatCurrency(item.price)}</div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-b border-gray-300 pb-2 mb-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(sale.totals.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({Math.round(storeSettings.taxRate * 100)}%):</span>
          <span>{formatCurrency(sale.totals.taxAmount)}</span>
        </div>
        {sale.totals.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{formatCurrency(sale.totals.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold">
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.totals.totalAmount)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="border-b border-gray-300 pb-2 mb-2">
        <div className="flex justify-between">
          <span>Payment Method:</span>
          <span className="capitalize">{sale.paymentMethod}</span>
        </div>
        {sale.paymentMethod === 'cash' && sale.cashAmount && (
          <>
            <div className="flex justify-between">
              <span>Cash Received:</span>
              <span>{formatCurrency(sale.cashAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span>{formatCurrency(sale.cashAmount - sale.totals.totalAmount)}</span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-4">
        <p className="text-gray-600">Thank you for your business!</p>
        <p className="text-gray-500 text-xs mt-2">
          This is a demo receipt from POS System
        </p>
      </div>
    </div>
  );
};

export default ReceiptTemplate;