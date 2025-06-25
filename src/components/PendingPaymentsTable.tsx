import React from 'react';
import { useBusiness } from '../context/TransactionContext';
import { formatCurrency, getPaymentStatusColor, getPaymentStatusIcon } from '../utils/formatCurrency';
import { motion } from 'framer-motion';

const PendingPaymentsTable: React.FC = () => {
  const { state, updatePaymentStatus } = useBusiness();
  const { pendingPayments } = state;

  if (pendingPayments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
        <p>No pending payments! 🎉</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Payments</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 px-3">Item</th>
              <th className="py-2 px-3">Customer</th>
              <th className="py-2 px-3">Qty</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Days Pending</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {pendingPayments.map(payment => (
              <tr key={payment.id} className="border-b last:border-none">
                <td className="py-2 px-3 font-medium text-gray-800">{payment.itemName}</td>
                <td className="py-2 px-3">{payment.customerName}</td>
                <td className="py-2 px-3">{payment.quantity}</td>
                <td className="py-2 px-3">{formatCurrency(payment.totalAmount)}</td>
                <td className="py-2 px-3">{payment.daysPending}</td>
                <td className={`py-2 px-3 font-semibold ${getPaymentStatusColor('pending')}`}>{getPaymentStatusIcon('pending')} Pending</td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => updatePaymentStatus(payment.saleId, 'paid')}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow"
                  >
                    Mark as Paid
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default PendingPaymentsTable; 