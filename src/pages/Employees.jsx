import React, { useState, useEffect } from 'react';
import EmployeeCard from '../components/common/EmployeeCard';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatsCard from '../components/ui/StatsCard';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { simulateSalaryPayment } from '../utils/simulations';
import { formatCurrency, formatDate } from '../utils/formatters';

const Employees = () => {
  // Use useIndexedDB hooks for automatic localStorage persistence
  const { data: employees, loading: employeesLoading, add: addEmployee, update: updateEmployee, remove: removeEmployee } = useIndexedDB('employees');
  const { data: payments, loading: paymentsLoading, add: addPayment } = useIndexedDB('payments');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [filterRole, setFilterRole] = useState('all');

  const [employeeForm, setEmployeeForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'cashier',
    monthlySalary: '',
    bankName: '',
    accountNumber: '',
    employeeId: '',
    department: '',
    position: ''
  });

  const [advanceForm, setAdvanceForm] = useState({
    employeeId: '',
    amount: '',
    percentage: '40',
    reason: ''
  });

  // Combine loading states
  const loading = employeesLoading || paymentsLoading;

  // Initialize demo data if no employees exist
  useEffect(() => {
    const initializeDemoData = async () => {
      if (employees.length === 0 && !employeesLoading) {
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
            department: 'Management',
            position: 'Store Manager',
            isActive: true,
            hireDate: new Date('2023-01-15').toISOString(),
            createdAt: new Date().toISOString()
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
            department: 'Sales',
            position: 'Senior Cashier',
            isActive: true,
            hireDate: new Date('2023-03-20').toISOString(),
            createdAt: new Date().toISOString()
          }
        ];
        
        // Add demo employees to the database
        for (const employee of demoEmployees) {
          await addEmployee(employee);
        }
      }
    };

    initializeDemoData();
  }, [employees.length, employeesLoading, addEmployee]);

  const resetForm = () => {
    setEmployeeForm({
      fullName: '',
      email: '',
      phone: '',
      role: 'cashier',
      monthlySalary: '',
      bankName: '',
      accountNumber: '',
      employeeId: '',
      department: '',
      position: ''
    });
    setEditingEmployee(null);
  };

  const resetAdvanceForm = () => {
    setAdvanceForm({
      employeeId: '',
      amount: '',
      percentage: '40',
      reason: ''
    });
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
      monthlySalary: employee.monthlySalary,
      bankName: employee.bankName || '',
      accountNumber: employee.accountNumber || '',
      employeeId: employee.employeeId,
      department: employee.department || '',
      position: employee.position || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (employee) => {
    setEditingEmployee(employee);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (editingEmployee) {
      await removeEmployee(editingEmployee.id);
      setShowDeleteDialog(false);
      setEditingEmployee(null);
    }
  };

  const handlePay = (employee) => {
    setSelectedEmployees(new Set([employee.id]));
    setShowPaymentDialog(true);
  };

  const handleAdvance = (employee) => {
    setEditingEmployee(employee);
    setAdvanceForm(prev => ({
      ...prev,
      employeeId: employee.id,
      amount: (employee.monthlySalary * 0.4).toFixed(2)
    }));
    setShowAdvanceModal(true);
  };

  const handlePayAll = () => {
    const activeEmployees = employees.filter(emp => emp.isActive);
    const allEmployeeIds = new Set(activeEmployees.map(emp => emp.id));
    setSelectedEmployees(allEmployeeIds);
    setShowPaymentDialog(true);
  };

  const handlePaySelected = () => {
    if (selectedEmployees.size === 0) {
      alert('Please select employees to pay');
      return;
    }
    setShowPaymentDialog(true);
  };

  const processPayment = async () => {
    setPaymentProcessing(true);
    
    const selectedEmployeesList = employees.filter(emp => 
      selectedEmployees.has(emp.id)
    );

    const result = await simulateSalaryPayment(selectedEmployeesList, (step) => {
      setPaymentProgress(step);
    });

    if (result.success) {
      // Record payments using addPayment from useIndexedDB
      for (const emp of selectedEmployeesList) {
        await addPayment({
          id: `pay_${Date.now()}_${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.fullName,
          paymentDate: new Date().toISOString(),
          amount: emp.monthlySalary,
          type: 'full',
          status: 'completed',
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          notes: 'Monthly salary payment',
          createdAt: new Date().toISOString()
        });
      }
      
      alert(`Successfully processed payments for ${result.count} employees. Total: ${formatCurrency(result.totalAmount)}`);
      setShowPaymentDialog(false);
      setSelectedEmployees(new Set());
    }

    setPaymentProcessing(false);
    setPaymentProgress('');
  };

  const processAdvance = async () => {
    if (!editingEmployee) return;

    const advanceAmount = parseFloat(advanceForm.amount);
    await addPayment({
      id: `adv_${Date.now()}_${editingEmployee.id}`,
      employeeId: editingEmployee.id,
      employeeName: editingEmployee.fullName,
      paymentDate: new Date().toISOString(),
      amount: advanceAmount,
      type: 'advance',
      status: 'completed',
      transactionId: `ADV${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      notes: `Salary advance (${advanceForm.percentage}%) - ${advanceForm.reason || 'No reason provided'}`,
      createdAt: new Date().toISOString()
    });

    setShowAdvanceModal(false);
    resetAdvanceForm();
    
    alert(`Salary advance of ${formatCurrency(advanceAmount)} processed for ${editingEmployee.fullName}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const employeeData = {
      ...employeeForm,
      monthlySalary: parseFloat(employeeForm.monthlySalary),
      isActive: true,
      hireDate: editingEmployee ? editingEmployee.hireDate : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, employeeData);
    } else {
      await addEmployee({
        ...employeeData,
        id: Date.now().toString(),
        employeeId: employeeForm.employeeId || `EMP${Date.now()}`,
        createdAt: new Date().toISOString()
      });
    }

    resetForm();
    setShowAddModal(false);
  };

  const handleInputChange = (field, value) => {
    setEmployeeForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAdvanceInputChange = (field, value) => {
    setAdvanceForm(prev => ({ ...prev, [field]: value }));
    
    if (field === 'percentage' && editingEmployee) {
      const amount = (editingEmployee.monthlySalary * (parseFloat(value) / 100)).toFixed(2);
      setAdvanceForm(prev => ({ ...prev, amount }));
    }
  };

  const toggleEmployeeSelection = (employeeId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const selectAllEmployees = () => {
    const activeEmployees = employees.filter(emp => emp.isActive);
    if (selectedEmployees.size === activeEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(activeEmployees.map(emp => emp.id)));
    }
  };

  // Calculate payroll metrics
  // FIXED: Parse salaries as numbers to prevent string concatenation
  const totalMonthlyPayroll = employees.reduce((sum, emp) => sum + (parseFloat(emp.monthlySalary) || 0), 0);
  const activeEmployeesCount = employees.filter(emp => emp.isActive).length;
  const recentPayments = payments.slice(0, 5);
  const totalPaidThisMonth = payments
    .filter(pay => new Date(pay.paymentDate).getMonth() === new Date().getMonth())
    .reduce((sum, pay) => sum + (parseFloat(pay.amount) || 0), 0);

  // Filter employees by role
  const filteredEmployees = employees.filter(emp => 
    filterRole === 'all' || emp.role === filterRole
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading employees..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage staff, process payroll, and track payments</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
          <button
            onClick={() => setShowPaymentHistory(true)}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Payment History
          </button>
          <button
            onClick={handlePayAll}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Pay All Active
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Payroll Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Employees"
          value={employees.length}
          subtitle={`${activeEmployeesCount} active`}
          color="blue"
        />
        <StatsCard
          title="Monthly Payroll"
          value={formatCurrency(totalMonthlyPayroll)}
          subtitle="Total salary budget"
          color="green"
        />
        <StatsCard
          title="Paid This Month"
          value={formatCurrency(totalPaidThisMonth)}
          subtitle="Processed payments"
          color="purple"
        />
        <StatsCard
          title="Pending Payments"
          value={selectedEmployees.size}
          subtitle="Selected for payment"
          color="yellow"
        />
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
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
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List View
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedEmployees.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedEmployees.size} selected
              </span>
              <button
                onClick={handlePaySelected}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Pay Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Employees Grid/List */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500 mb-4">
              {filterRole !== 'all' 
                ? `No ${filterRole} employees found` 
                : 'Get started by adding your first employee'
              }
            </p>
            {filterRole === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Your First Employee
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="relative">
              <input
                type="checkbox"
                checked={selectedEmployees.has(employee.id)}
                onChange={() => toggleEmployeeSelection(employee.id)}
                className="absolute top-4 left-4 z-10 w-5 h-5"
              />
              <EmployeeCard
                employee={employee}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPay={handlePay}
                onAdvance={handleAdvance}
                showActions={true}
              />
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-700 text-sm">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedEmployees.size === employees.filter(emp => emp.isActive).length && employees.filter(emp => emp.isActive).length > 0}
                onChange={selectAllEmployees}
                className="w-4 h-4"
              />
            </div>
            <div className="col-span-3">Employee</div>
            <div className="col-span-2">Role/Department</div>
            <div className="col-span-2 text-right">Salary</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 text-sm">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.has(employee.id)}
                    onChange={() => toggleEmployeeSelection(employee.id)}
                    className="w-4 h-4"
                    disabled={!employee.isActive}
                  />
                </div>
                <div className="col-span-3">
                  <div className="font-medium text-gray-900">{employee.fullName}</div>
                  <div className="text-gray-500">{employee.email}</div>
                </div>
                <div className="col-span-2">
                  <div className="font-medium capitalize">{employee.role}</div>
                  <div className="text-gray-500 text-xs">{employee.department}</div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="font-semibold text-green-600">{formatCurrency(employee.monthlySalary)}</div>
                  <div className="text-gray-500 text-xs">Monthly</div>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    employee.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => handlePay(employee)}
                      disabled={!employee.isActive}
                      className="text-green-600 hover:text-green-800 text-sm disabled:text-gray-400"
                    >
                      Pay
                    </button>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
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

      {/* Add/Edit Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={employeeForm.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={employeeForm.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={employeeForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="email@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={employeeForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Phone number"
              />
            </div>

            {/* Employment Details */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={employeeForm.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                value={employeeForm.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g., Sales, Management"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                value={employeeForm.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g., Senior Cashier, Store Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Salary *
              </label>
              <input
                type="number"
                step="0.01"
                value={employeeForm.monthlySalary}
                onChange={(e) => handleInputChange('monthlySalary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            {/* Bank Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                value={employeeForm.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Bank name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={employeeForm.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Account number"
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
              {editingEmployee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Salary Advance Modal */}
      <Modal
        isOpen={showAdvanceModal}
        onClose={() => {
          setShowAdvanceModal(false);
          resetAdvanceForm();
        }}
        title="Process Salary Advance"
        size="md"
      >
        <div className="space-y-4">
          {editingEmployee && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Employee Details</h4>
                <p className="text-blue-700">{editingEmployee.fullName}</p>
                <p className="text-blue-600 text-sm">Monthly Salary: {formatCurrency(editingEmployee.monthlySalary)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Percentage
                </label>
                <select
                  value={advanceForm.percentage}
                  onChange={(e) => handleAdvanceInputChange('percentage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="40">40%</option>
                  <option value="50">50%</option>
                  <option value="60">60%</option>
                  <option value="70">70%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={advanceForm.amount}
                  onChange={(e) => handleAdvanceInputChange('amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={advanceForm.reason}
                  onChange={(e) => handleAdvanceInputChange('reason', e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Reason for salary advance"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAdvanceModal(false);
                    resetAdvanceForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={processAdvance}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg"
                >
                  Process Advance
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Payment History Modal */}
      <Modal
        isOpen={showPaymentHistory}
        onClose={() => setShowPaymentHistory(false)}
        title="Payment History"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">Recent Payments</h3>
            {payments.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {payments.map(payment => (
                  <div key={payment.id} className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <p className="font-medium text-gray-800">{payment.employeeName}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(payment.paymentDate)} • {payment.type === 'advance' ? 'Advance' : 'Salary'}
                      </p>
                      {payment.notes && (
                        <p className="text-xs text-gray-400">{payment.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-gray-500">{payment.transactionId}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No payment records found</p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowPaymentHistory(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
{/* totalMonthlyPayroll */}
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setEditingEmployee(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete "${editingEmployee?.fullName}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Employee"
        cancelText="Keep Employee"
        type="danger"
      />

      {/* Payment Processing Dialog */}
      <Modal
        isOpen={showPaymentDialog}
        onClose={() => !paymentProcessing && setShowPaymentDialog(false)}
        title="Process Salary Payments"
        size="md"
      >
        <div className="space-y-4">
          {paymentProcessing ? (
            <div className="text-center py-6">
              <LoadingSpinner text={paymentProgress} />
              <p className="text-sm text-gray-600 mt-4">
                Processing payments for {selectedEmployees.size} employees...
              </p>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  You are about to process salary payments for <strong>{selectedEmployees.size}</strong> employees.
                  This is a simulation - no actual payments will be made.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Selected Employees:</h3>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {employees
                    .filter(emp => selectedEmployees.has(emp.id))
                    .map(emp => (
                      <div key={emp.id} className="flex justify-between text-sm">
                        <span>{emp.fullName}</span>
                        <span className="text-green-600">{formatCurrency(emp.monthlySalary)}</span>
                      </div>
                    ))
                  }
                </div>
                <div className="flex justify-between font-semibold border-t border-gray-200 mt-2 pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatCurrency(
                      employees
                        .filter(emp => selectedEmployees.has(emp.id))
                        .reduce((sum, emp) => sum + emp.monthlySalary, 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowPaymentDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
                >
                  Process Payments
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Employees;