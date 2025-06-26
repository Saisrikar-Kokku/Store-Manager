import React from 'react';
import { useBusiness } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatCurrency';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const SalesList: React.FC = () => {
  const { state } = useBusiness();
  const { sales } = state;

  if (!sales.length) {
    return (
      <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500 mt-8">
        <p>No sales recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
        <ShoppingCart className="w-7 h-7 text-blue-500" /> Sales History
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 px-3">Item</th>
              <th className="py-2 px-3">Customer</th>
              <th className="py-2 px-3">Qty</th>
              <th className="py-2 px-3">Amount</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id} className="border-b last:border-none">
                <td className="py-2 px-3 font-medium text-gray-800">{sale.itemName}</td>
                <td className="py-2 px-3">
                  <span className="block text-base font-bold text-blue-900">{sale.customerName || 'Unknown'}</span>
                  <span className="block text-xs text-blue-700">Sale ID: {sale.id}</span>
                </td>
                <td className="py-2 px-3">{sale.quantity}</td>
                <td className="py-2 px-3">{formatCurrency(sale.salePrice * sale.quantity)}</td>
                <td className="py-2 px-3">{sale.date}</td>
                <td className="py-2 px-3">
                  {sale.paymentStatus === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4" /> Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                      <CheckCircle className="w-4 h-4" /> Paid
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import { ShoppingCart } from 'lucide-react';
export default SalesList; 