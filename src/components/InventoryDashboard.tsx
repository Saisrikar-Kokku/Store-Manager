'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useBusiness } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatCurrency';
import Link from 'next/link';

const InventoryDashboard: React.FC = () => {
  const { state } = useBusiness();
  const { stats } = state;

  const metrics = [
    {
      title: 'Total Investment',
      value: formatCurrency(stats.totalInvestment),
      icon: <DollarSign className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-400',
      description: 'Total amount invested in inventory'
    },
    {
      title: 'Total Sales',
      value: formatCurrency(stats.totalSales),
      icon: <ShoppingCart className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-400',
      description: 'Total revenue from all sales'
    },
    {
      title: 'Total Profit',
      value: formatCurrency(stats.totalProfit),
      icon: <TrendingUp className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-400',
      description: 'Net profit from all sales'
    },
    {
      title: 'Stock Value',
      value: formatCurrency(stats.stockValue),
      icon: <Package className="w-6 h-6" />,
      gradient: 'from-orange-500 to-yellow-400',
      description: 'Current value of inventory'
    },
    {
      title: 'Stock Quantity',
      value: stats.stockQuantity.toString(),
      icon: <Package className="w-6 h-6" />,
      gradient: 'from-teal-500 to-green-400',
      description: 'Total items in stock'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems.toString(),
      icon: <AlertTriangle className="w-6 h-6" />,
      gradient: 'from-red-500 to-orange-400',
      description: 'Items with quantity ≤ 5',
      action: stats.lowStockItems > 0 ? (
        <Link href="/low-stock" className="mt-2 inline-block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            View All
          </motion.button>
        </Link>
      ) : null
    }
  ];

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/80 glass grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 border border-luvora text-white"
      >
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className={`rounded-2xl p-6 shadow-lg flex flex-col gap-2 border border-luvora bg-black/60 glass text-white`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 rounded-full bg-luvora/20 text-luvora">{metric.icon}</span>
              <h3 className="text-lg font-bold text-luvora">{metric.title}</h3>
            </div>
            <div className="text-2xl font-extrabold text-luvora">{metric.value}</div>
            <div className="text-sm font-semibold text-luvora drop-shadow-lg mb-2" style={{textShadow: '0 0 6px #ff4ecd, 0 0 2px #fff'}}>{metric.description}</div>
            {metric.action}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default InventoryDashboard; 