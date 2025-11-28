import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SalesProvider } from './context/SalesContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Insights from './pages/Insights';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import DebugStorage from './components/DebugStorage';
import './index.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

// Demo data initializer
const initializeDemoData = () => {
  const hasProducts = localStorage.getItem('pos_products');
  const hasEmployees = localStorage.getItem('pos_employees');
  const hasSales = localStorage.getItem('pos_sales');

  if (!hasProducts) {
    const demoProducts = [
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('pos_products', JSON.stringify(demoProducts));
  }

  if (!hasEmployees) {
    const demoEmployees = [
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
        hireDate: new Date('2023-01-15').toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('pos_employees', JSON.stringify(demoEmployees));
  }

  if (!hasSales) {
    localStorage.setItem('pos_sales', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('pos_payments')) {
    localStorage.setItem('pos_payments', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('pos_current_cart')) {
    localStorage.setItem('pos_current_cart', JSON.stringify([]));
  }
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/sales" element={
        <ProtectedRoute>
          <Layout>
            <Sales />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute>
          <Layout>
            <Products />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/insights" element={
        <ProtectedRoute>
          <Layout>
            <Insights />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/employees" element={
        <ProtectedRoute>
          <Layout>
            <Employees />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/debug" element={
        <ProtectedRoute>
          <Layout>
            <DebugStorage />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    initializeDemoData();
  }, []);

  return (
    <Router>
      <AppProvider>
        <AuthProvider>
          <SalesProvider>
            <AppRoutes />
          </SalesProvider>
        </AuthProvider>
      </AppProvider>
    </Router>
  );
}

export default App;
