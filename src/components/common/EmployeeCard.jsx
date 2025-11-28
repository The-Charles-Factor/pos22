import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const EmployeeCard = ({ 
  employee, 
  onEdit, 
  onDelete, 
  onPay,
  onAdvance,
  showActions = false 
}) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'cashier': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">{employee.fullName}</h3>
          <p className="text-gray-600 text-sm">{employee.email}</p>
          {employee.phone && (
            <p className="text-gray-500 text-sm">{employee.phone}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleColor(employee.role)}`}>
          {employee.role}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div>
          <span className="text-gray-500">Salary:</span>
          <span className="ml-1 font-medium text-green-600">
            {formatCurrency(employee.monthlySalary)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">ID:</span>
          <span className="ml-1 font-medium">{employee.employeeId}</span>
        </div>
        {employee.bankName && (
          <div className="col-span-2">
            <span className="text-gray-500">Bank:</span>
            <span className="ml-1 font-medium">{employee.bankName}</span>
          </div>
        )}
        {employee.accountNumber && (
          <div className="col-span-2">
            <span className="text-gray-500">Account:</span>
            <span className="ml-1 font-medium">{employee.accountNumber}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex justify-between space-x-2">
          <div className="flex space-x-2">
            <button
              onClick={() => onPay(employee)}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex-1"
            >
              Pay
            </button>
            <button
              onClick={() => onAdvance(employee)}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 flex-1"
            >
              Advance
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(employee)}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(employee)}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCard;