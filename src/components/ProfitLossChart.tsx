'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useBusiness } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatCurrency';
import { ProfitLossData } from '../types';

const ProfitLossChart: React.FC = () => {
  const { state } = useBusiness();
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('monthly');

  const generateChartData = (): ProfitLossData[] => {
    const now = new Date();
    const data: ProfitLossData[] = [];

    if (timeframe === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const daySales = state.sales.filter(s => s.date === dateStr);
        const dayTransactions = state.transactions.filter(t => t.date === dateStr);
        
        const sales = daySales.reduce((sum, sale) => sum + (sale.salePrice * sale.quantity), 0);
        const profit = daySales.reduce((sum, sale) => sum + sale.profit, 0);
        const investment = dayTransactions
          .filter(t => t.type === 'investment')
          .reduce((sum, t) => sum + t.amount, 0);

        data.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales,
          profit,
          investment,
        });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthSales = state.sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate.getMonth() === date.getMonth() && 
                 saleDate.getFullYear() === date.getFullYear();
        });
        
        const monthTransactions = state.transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === date.getMonth() && 
                 transactionDate.getFullYear() === date.getFullYear();
        });
        
        const sales = monthSales.reduce((sum, sale) => sum + (sale.salePrice * sale.quantity), 0);
        const profit = monthSales.reduce((sum, sale) => sum + sale.profit, 0);
        const investment = monthTransactions
          .filter(t => t.type === 'investment')
          .reduce((sum, t) => sum + t.amount, 0);

        data.push({
          date: monthStr,
          sales,
          profit,
          investment,
        });
      }
    }

    return data;
  };

  const chartData = generateChartData();

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-4 rounded-lg shadow-lg border border-luvora text-white">
          <p className="font-semibold text-pink-200">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-luvora">Profit & Loss Analysis</h2>
        <div className="flex gap-2">
          {(['weekly', 'monthly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-all border border-luvora ${
                timeframe === period
                  ? 'bg-luvora text-white'
                  : 'bg-black/60 text-pink-200 hover:bg-luvora/20'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#f9fafb' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#f9fafb' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone"
              dataKey="profit" 
              stackId="1"
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.6}
              name="Profit"
            />
            <Area 
              type="monotone"
              dataKey="sales" 
              stackId="2"
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Sales"
            />
            <Line 
              type="monotone"
              dataKey="investment" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              name="Investment"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-semibold text-luvora drop-shadow-lg" style={{textShadow: '0 0 6px #ff4ecd, 0 0 2px #fff'}}>Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-semibold text-luvora drop-shadow-lg" style={{textShadow: '0 0 6px #ff4ecd, 0 0 2px #fff'}}>Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm font-semibold text-luvora drop-shadow-lg" style={{textShadow: '0 0 6px #ff4ecd, 0 0 2px #fff'}}>Investment</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfitLossChart; 