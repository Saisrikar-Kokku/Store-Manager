import React from 'react';
import { useBusiness } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatCurrency';
import { motion } from 'framer-motion';

const PaymentSummaryCard: React.FC = () => {
  const { state } = useBusiness();
  const { paymentSummary } = state;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6 mb-6"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Revenue</div>
          <div className="text-lg font-bold text-blue-700">{formatCurrency(paymentSummary.totalRevenue)}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Pending Dues</div>
          <div className="text-lg font-bold text-yellow-700">{formatCurrency(paymentSummary.pendingDues)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Collected Cash</div>
          <div className="text-lg font-bold text-green-700">{formatCurrency(paymentSummary.collectedCash)}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Paid vs Pending</div>
          <div className="text-lg font-bold text-purple-700">
            {paymentSummary.paidVsPendingRatio.toFixed(0)}%
            <span className="text-xs text-gray-500 ml-1">paid</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentSummaryCard; 