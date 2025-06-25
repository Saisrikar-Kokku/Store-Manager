'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTransactions } from '../context/TransactionContext';

const DemoData: React.FC = () => {
  const { addTransaction, state } = useTransactions();

  const addDemoData = () => {
    const demoTransactions = [
      {
        amount: 2500,
        type: 'income' as const,
        category: 'Salary',
        date: new Date().toISOString().split('T')[0],
        notes: 'Monthly salary',
      },
      {
        amount: 800,
        type: 'income' as const,
        category: 'Freelance',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Web design project',
      },
      {
        amount: 150,
        type: 'expense' as const,
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0],
        notes: 'Grocery shopping',
      },
      {
        amount: 80,
        type: 'expense' as const,
        category: 'Transportation',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Gas and parking',
      },
      {
        amount: 200,
        type: 'expense' as const,
        category: 'Shopping',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'New clothes',
      },
      {
        amount: 120,
        type: 'expense' as const,
        category: 'Entertainment',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Movie and dinner',
      },
      {
        amount: 300,
        type: 'expense' as const,
        category: 'Housing',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Utility bills',
      },
      {
        amount: 500,
        type: 'income' as const,
        category: 'Investment',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Stock dividends',
      },
    ];

    demoTransactions.forEach(transaction => {
      addTransaction(transaction);
    });
  };

  // Only show if no transactions exist
  if (state.transactions.length > 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Expense Tracker!</h3>
        <p className="text-gray-600 mb-4">
          Get started by adding your first transaction, or try our demo data to see the app in action.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addDemoData}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
        >
          Load Demo Data
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DemoData; 