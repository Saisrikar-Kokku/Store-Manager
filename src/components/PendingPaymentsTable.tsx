import React from 'react';
import { useBusiness } from '../context/TransactionContext';
import { formatCurrency, getPaymentStatusColor, getPaymentStatusIcon } from '../utils/formatCurrency';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

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
      className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl shadow-xl p-6 mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-7 h-7 text-yellow-500" />
        <h2 className="text-2xl font-extrabold text-yellow-800 tracking-wide">Pending Payments</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-base">
          <thead>
            <tr className="text-left text-yellow-900 bg-yellow-200/60">
              <th className="py-3 px-4 font-bold">Item</th>
              <th className="py-3 px-4 font-bold">Customer</th>
              <th className="py-3 px-4 font-bold">Qty</th>
              <th className="py-3 px-4 font-bold">Amount</th>
              <th className="py-3 px-4 font-bold">Days Pending</th>
              <th className="py-3 px-4 font-bold">Status</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {pendingPayments.map(payment => (
              <tr key={payment.id} className="border-b last:border-none bg-yellow-100/80 hover:bg-yellow-200 transition">
                <td className="py-3 px-4 font-extrabold text-yellow-900 text-lg" title={payment.itemName}>{payment.itemName}</td>
                <td className="py-3 px-4">
                  <span className="block text-xl font-extrabold text-yellow-900" title={payment.customerName}>{payment.customerName}</span>
                  <span className="block text-xs text-yellow-700" title={payment.saleId}>Sale ID: {payment.saleId}</span>
                </td>
                <td className="py-3 px-4 font-bold text-yellow-800 text-lg">{payment.quantity}</td>
                <td className="py-3 px-4 font-extrabold text-green-700 text-lg" title={formatCurrency(payment.totalAmount)}>{formatCurrency(payment.totalAmount)}</td>
                <td className="py-3 px-4 font-bold text-red-700 text-lg" title={`${payment.daysPending} days`}>{payment.daysPending}</td>
                <td className={`py-3 px-4 font-bold text-yellow-900 text-lg ${getPaymentStatusColor('pending')}`}>{getPaymentStatusIcon('pending')} Pending</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => updatePaymentStatus(payment.saleId, 'paid')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-base font-bold shadow-lg"
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