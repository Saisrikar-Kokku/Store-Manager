'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatCurrency';

const DashboardOverview: React.FC = () => {
  const { state } = useTransactions();
  const { stats } = state;

  const cards = [
    {
      title: 'Total Balance',
      value: stats.totalBalance,
      icon: DollarSign,
      color: 'from-blue-500 to-purple-600',
      textColor: 'text-white',
      trend: stats.totalBalance >= 0 ? 'positive' : 'negative',
    },
    {
      title: 'Total Income',
      value: stats.totalIncome,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-white',
      trend: 'positive',
    },
    {
      title: 'Total Expenses',
      value: stats.totalExpenses,
      icon: TrendingDown,
      color: 'from-red-500 to-pink-600',
      textColor: 'text-white',
      trend: 'negative',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-6 shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium opacity-90 ${card.textColor}`}>
                {card.title}
              </p>
              <p className={`text-3xl font-bold ${card.textColor} mt-2`}>
                {formatCurrency(card.value)}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`p-3 rounded-full bg-white/20 backdrop-blur-sm`}
            >
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </motion.div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardOverview; 