'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBusiness } from '../context/TransactionContext';
import { formatCurrency, getCategoryColor, getCategoryIcon } from '../utils/formatCurrency';
import { CategoryPerformance } from '../types';

const CategoryWiseBreakdown: React.FC = () => {
  const { state } = useBusiness();

  const generateCategoryData = (): CategoryPerformance[] => {
    const categoryMap = new Map<string, CategoryPerformance>();
    
    state.sales.forEach(sale => {
      const existing = categoryMap.get(sale.category) || {
        category: sale.category,
        totalSales: 0,
        totalProfit: 0,
        itemsSold: 0,
        color: getCategoryColor(sale.category),
      };
      
      existing.totalSales += sale.salePrice * sale.quantity;
      existing.totalProfit += sale.profit;
      existing.itemsSold += sale.quantity;
      
      categoryMap.set(sale.category, existing);
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 8);
  };

  const data = generateCategoryData();

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const categoryData = data.find(d => d.category === label);
      
      return (
        <div className="bg-black/90 p-4 rounded-lg shadow-lg border border-luvora text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getCategoryIcon(label || '')}</span>
            <p className="font-semibold text-pink-200">{label}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-pink-200">Sales:</span> {formatCurrency(entry.value)}
            </p>
            {categoryData && (
              <>
                <p className="text-sm">
                  <span className="text-pink-200">Profit:</span> {formatCurrency(categoryData.totalProfit)}
                </p>
                <p className="text-sm">
                  <span className="text-pink-200">Items Sold:</span> {categoryData.itemsSold}
                </p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/80 glass rounded-2xl shadow-xl p-6 border border-luvora text-white"
    >
      <h2 className="text-2xl font-bold text-luvora mb-6">Category Performance</h2>
      
      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p>No sales data yet</p>
          <p className="text-sm">Record some sales to see category performance</p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#f9fafb' }}
                tickFormatter={(value) => getCategoryIcon(value) + ' ' + value}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#f9fafb' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="totalSales" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Sales"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Summary */}
      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.slice(0, 6).map((category) => (
            <div key={category.category} className="bg-black/60 rounded-lg p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getCategoryIcon(category.category)}</span>
                <h3 className="font-semibold text-pink-200">{category.category}</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-luvora drop-shadow-lg" style={{textShadow: '0 0 6px #ff4ecd, 0 0 2px #fff'}}>Sales:</span>
                  <span className="font-medium">{formatCurrency(category.totalSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-luvora drop-shadow-lg" style={{textShadow: '0 0 6px #ff4ecd, 0 0 2px #fff'}}>Profit:</span>
                  <span className="font-medium text-green-400">{formatCurrency(category.totalProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-luvora drop-shadow-lg" style={{textShadow: '0 0 6px #ff4ecd, 0 0 2px #fff'}}>Items:</span>
                  <span className="font-medium">{category.itemsSold}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CategoryWiseBreakdown; 