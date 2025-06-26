'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useBusiness } from '../context/TransactionContext';

const LOW_STOCK_THRESHOLD = 5;

const LowStockAlertSummary: React.FC = () => {
  const { state } = useBusiness();
  const lowStockItems = state.inventory.filter(item => item.quantity <= LOW_STOCK_THRESHOLD);

  if (lowStockItems.length === 0) return null;

  return (
    <div className="w-full bg-red-100 border-b-2 border-red-400 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse flex-shrink-0" />
          <span className="text-red-800 font-semibold text-center sm:text-left">
            {lowStockItems.length} item{lowStockItems.length > 1 ? 's are' : ' is'} low in stock!
          </span>
        </div>
        <Link
          href="/low-stock"
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap flex-shrink-0"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default LowStockAlertSummary; 