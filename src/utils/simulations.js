// Simulation functions for demo purposes
export const simulateApiCall = (delay = 1000) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const simulatePaymentProcessing = async (onProgress) => {
  const steps = [
    'Validating transaction...',
    'Processing payment...',
    'Updating inventory...',
    'Generating receipt...'
  ];
  
  for (let i = 0; i < steps.length; i++) {
    onProgress?.(steps[i]);
    await simulateApiCall(2000);
  }
  
  return {
    success: true,
    transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  };
};

export const simulateSalaryPayment = async (employees, onProgress) => {
  const steps = [
    'Connecting to bank gateway...',
    'Validating employee accounts...',
    'Processing bulk transactions...',
    'Updating payment records...'
  ];
  
  for (let i = 0; i < steps.length; i++) {
    onProgress?.(steps[i]);
    await simulateApiCall(3000);
  }
  
  return {
    success: true,
    count: employees.length,
    totalAmount: employees.reduce((sum, emp) => sum + emp.monthlySalary, 0)
  };
};

export const simulateScanner = async (productCode) => {
  await simulateApiCall(500);
  // This will be integrated with actual product lookup
  return { success: true, code: productCode };
};