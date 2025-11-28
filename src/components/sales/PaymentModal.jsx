import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { formatCurrency, calculateChange } from '../../utils/formatters';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onProcessPayment, 
  totalAmount,
  processing = false 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  const changeAmount = paymentMethod === 'cash' && cashAmount 
    ? calculateChange(totalAmount, parseFloat(cashAmount))
    : 0;

  const handleProcessPayment = () => {
    const paymentData = {
      method: paymentMethod,
      cashAmount: paymentMethod === 'cash' ? parseFloat(cashAmount) : null,
      cardDetails: paymentMethod === 'card' ? cardDetails : null
    };
    
    onProcessPayment(paymentData);
  };

  const resetForm = () => {
    setPaymentMethod('cash');
    setCashAmount('');
    setCardDetails({ number: '', expiry: '', cvv: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Process Payment"
      size="md"
    >
      <div className="space-y-6">
        {/* Total Amount */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-blue-600">Total Amount</p>
            <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['cash', 'card', 'mobile_money'].map(method => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                  paymentMethod === method
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {method === 'cash' && '💵 Cash'}
                {method === 'card' && '💳 Card'}
                {method === 'mobile_money' && '📱 Mobile'}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        {paymentMethod === 'cash' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cash Received
            </label>
            <input
              type="number"
              step="0.01"
              min={totalAmount}
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter amount received"
            />
            {cashAmount && changeAmount >= 0 && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700">
                  Change: <strong>{formatCurrency(changeAmount)}</strong>
                </p>
              </div>
            )}
            {cashAmount && changeAmount < 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700">
                  Insufficient amount. Need additional {formatCurrency(-changeAmount)}
                </p>
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'mobile_money' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700 text-center">
              Mobile Money payment would be processed through integrated payment gateway
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={processing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessPayment}
            disabled={
              processing || 
              (paymentMethod === 'cash' && (!cashAmount || changeAmount < 0)) ||
              (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv))
            }
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;