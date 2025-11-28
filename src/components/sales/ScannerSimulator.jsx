import React, { useState } from 'react';

const ScannerSimulator = ({ onScan, products }) => {
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState(null);

  const handleScan = async (e) => {
    if (e.key === 'Enter' && scanInput.trim()) {
      setIsScanning(true);
      setLastScanResult(null);

      // Simulate scanner delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const scannedCode = scanInput.trim();
      const product = products.find(p => 
        p.code === scannedCode || p.plu === scannedCode
      );

      if (product) {
        setLastScanResult({ success: true, product });
        onScan(product);
        setScanInput('');
      } else {
        setLastScanResult({ 
          success: false, 
          error: `No product found with code: ${scannedCode}` 
        });
      }

      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Simulated Scanner</h3>
      
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyPress={handleScan}
            placeholder="Enter product code and press Enter..."
            disabled={isScanning}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
          {isScanning && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {lastScanResult && (
          <div className={`p-3 rounded-lg text-sm ${
            lastScanResult.success 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {lastScanResult.success ? (
              <div className="flex items-center">
                <span className="mr-2">✅</span>
                <span>
                  Scanned: <strong>{lastScanResult.product.name}</strong> - 
                  {lastScanResult.product.code}
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <span className="mr-2">❌</span>
                <span>{lastScanResult.error}</span>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>💡 Tip: Enter product codes like "PROD001" or PLU numbers to simulate scanning</p>
        </div>
      </div>
    </div>
  );
};

export default ScannerSimulator;