// Mock data for initial demo setup
export const mockProducts = [
  {
    id: '1',
    code: 'PROD001',
    name: 'Premium Hammer',
    description: '20oz Steel Claw Hammer with Fiberglass Handle',
    category: 'Tools',
    costPrice: 8.50,
    sellingPrice: 15.99,
    stockQuantity: 24,
    minStockLevel: 5,
    supplier: 'ToolMaster Inc',
    plu: '1001',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    code: 'PROD002',
    name: 'Power Drill',
    description: '18V Cordless Drill with 2 Batteries',
    category: 'Power Tools',
    costPrice: 45.00,
    sellingPrice: 89.99,
    stockQuantity: 12,
    minStockLevel: 3,
    supplier: 'PowerTools Co',
    plu: '1002',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    code: 'PROD003',
    name: 'Screw Set',
    description: 'Assorted Screws 100pcs Various Sizes',
    category: 'Hardware',
    costPrice: 2.50,
    sellingPrice: 4.99,
    stockQuantity: 150,
    minStockLevel: 20,
    supplier: 'Fasteners Ltd',
    plu: '1003',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    code: 'PROD004',
    name: 'Paint Brush Set',
    description: 'Professional Paint Brushes 5pcs',
    category: 'Painting',
    costPrice: 6.80,
    sellingPrice: 12.50,
    stockQuantity: 8,
    minStockLevel: 5,
    supplier: 'PaintPro',
    plu: '1004',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '5',
    code: 'PROD005',
    name: 'Measuring Tape',
    description: '25ft Retractable Measuring Tape',
    category: 'Measuring Tools',
    costPrice: 3.20,
    sellingPrice: 6.99,
    stockQuantity: 35,
    minStockLevel: 10,
    supplier: 'MeasureRight',
    plu: '1005',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '6',
    code: 'PROD006',
    name: 'Safety Gloves',
    description: 'Heavy Duty Work Gloves Pair',
    category: 'Safety',
    costPrice: 4.00,
    sellingPrice: 7.50,
    stockQuantity: 2,
    minStockLevel: 5,
    supplier: 'SafetyFirst',
    plu: '1006',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '7',
    code: 'PROD007',
    name: 'LED Light Bulb',
    description: '10W LED Bulb Equivalent to 60W',
    category: 'Electrical',
    costPrice: 2.80,
    sellingPrice: 5.99,
    stockQuantity: 60,
    minStockLevel: 15,
    supplier: 'BrightLights',
    plu: '1007',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '8',
    code: 'PROD008',
    name: 'Pipe Wrench',
    description: '10-inch Adjustable Pipe Wrench',
    category: 'Plumbing',
    costPrice: 12.50,
    sellingPrice: 24.99,
    stockQuantity: 18,
    minStockLevel: 5,
    supplier: 'PlumbRight',
    plu: '1008',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockEmployees = [
  {
    id: '1',
    employeeId: 'EMP001',
    fullName: 'John Manager',
    email: 'john.manager@store.com',
    phone: '+254712345678',
    role: 'manager',
    monthlySalary: 45000,
    bankName: 'Equity Bank',
    accountNumber: '1234567890',
    isActive: true,
    hireDate: new Date('2023-01-15')
  },
  {
    id: '2',
    employeeId: 'EMP002',
    fullName: 'Sarah Cashier',
    email: 'sarah.cashier@store.com',
    phone: '+254723456789',
    role: 'cashier',
    monthlySalary: 25000,
    bankName: 'KCB Bank',
    accountNumber: '0987654321',
    isActive: true,
    hireDate: new Date('2023-03-20')
  },
  {
    id: '3',
    employeeId: 'EMP003',
    fullName: 'Mike Stocker',
    email: 'mike.stocker@store.com',
    phone: '+254734567890',
    role: 'cashier',
    monthlySalary: 22000,
    bankName: 'Cooperative Bank',
    accountNumber: '1122334455',
    isActive: true,
    hireDate: new Date('2023-06-10')
  }
];

export const mockSales = [
  {
    id: '1',
    transactionId: 'TXN001',
    items: [
      {
        productId: '1',
        name: 'Premium Hammer',
        quantity: 2,
        unitPrice: 15.99,
        originalPrice: 15.99,
        discount: 0,
        totalPrice: 31.98,
        costPrice: 8.50,
        profit: 14.98
      },
      {
        productId: '3',
        name: 'Screw Set',
        quantity: 1,
        unitPrice: 4.99,
        originalPrice: 4.99,
        discount: 0,
        totalPrice: 4.99,
        costPrice: 2.50,
        profit: 2.49
      }
    ],
    subtotal: 36.97,
    taxAmount: 5.92,
    discountAmount: 0,
    totalAmount: 42.89,
    totalProfit: 17.47,
    paymentMethod: 'cash',
    cashAmount: 50.00,
    changeAmount: 7.11,
    cashierId: '2',
    cashierName: 'Sarah Cashier',
    status: 'completed',
    createdAt: new Date('2024-01-20T10:30:00')
  },
  {
    id: '2',
    transactionId: 'TXN002',
    items: [
      {
        productId: '2',
        name: 'Power Drill',
        quantity: 1,
        unitPrice: 89.99,
        originalPrice: 89.99,
        discount: 0,
        totalPrice: 89.99,
        costPrice: 45.00,
        profit: 44.99
      }
    ],
    subtotal: 89.99,
    taxAmount: 14.40,
    discountAmount: 0,
    totalAmount: 104.39,
    totalProfit: 44.99,
    paymentMethod: 'card',
    cashAmount: 0,
    changeAmount: 0,
    cashierId: '2',
    cashierName: 'Sarah Cashier',
    status: 'completed',
    createdAt: new Date('2024-01-20T14:15:00')
  }
];

export const mockSettings = {
  storeName: 'Demo Hardware Store',
  taxRate: 0.16,
  currency: 'KES',
  receiptHeader: 'Thank you for shopping with us!',
  receiptFooter: 'Quality products, quality service.',
  lowStockThreshold: 5
};