import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: 'Demo Supermarket',
    taxRate: 16,
    currency: 'KES',
    receiptHeader: 'Thank you for shopping with us!',
    receiptFooter: 'Returns accepted within 7 days with receipt',
    lowStockThreshold: 5
  });

  const handleSave = () => {
    // In a real app, this would save to IndexedDB
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setSettings({
      storeName: 'Demo Supermarket',
      taxRate: 16,
      currency: 'KES',
      receiptHeader: 'Thank you for shopping with us!',
      receiptFooter: 'Returns accepted within 7 days with receipt',
      lowStockThreshold: 5
    });
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure your POS system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Products with stock at or below this level will trigger alerts
              </p>
            </div>
          </div>
        </div>

        {/* Receipt Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Receipt Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Header
              </label>
              <textarea
                value={settings.receiptHeader}
                onChange={(e) => handleInputChange('receiptHeader', e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Text to appear at the top of receipts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Footer
              </label>
              <textarea
                value={settings.receiptFooter}
                onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Text to appear at the bottom of receipts"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Receipt Preview</h3>
              <div className="text-xs font-mono bg-white p-3 border border-gray-200 rounded">
                <div className="text-center mb-2">
                  <div className="font-bold">{settings.storeName}</div>
                  <div>{settings.receiptHeader}</div>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between">
                    <span>Item 1</span>
                    <span>100.00</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total:</span>
                    <span>100.00</span>
                  </div>
                </div>
                <div className="text-center mt-2 text-gray-600">
                  {settings.receiptFooter}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <div className="font-medium text-gray-800">Export Data</div>
            <div className="text-sm text-gray-500">Download all data as CSV</div>
          </button>
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <div className="font-medium text-gray-800">Backup Data</div>
            <div className="text-sm text-gray-500">Create system backup</div>
          </button>
          <button className="p-4 border border-red-300 rounded-lg hover:bg-red-50 text-left">
            <div className="font-medium text-red-800">Reset All Data</div>
            <div className="text-sm text-red-500">Clear all demo data</div>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;