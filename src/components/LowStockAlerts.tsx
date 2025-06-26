'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Settings, CheckCircle } from 'lucide-react';
import { useBusiness } from '../context/TransactionContext';
import Image from 'next/image';

const LowStockAlerts: React.FC = () => {
  const { state } = useBusiness();
  const [showSettings, setShowSettings] = useState(false);
  const [threshold, setThreshold] = useState(5);

  const lowStockItems = state.inventory.filter(item => item.quantity <= threshold);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-luvora" />
            {lowStockItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {lowStockItems.length}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Low Stock Alerts</h2>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 bg-luvora text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-xl p-6 border border-luvora/20"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luvora focus:border-luvora"
              min="1"
            />
          </div>
        </motion.div>
      )}

      {/* Active Alerts */}
      {lowStockItems.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">
              Low Stock Alert ({lowStockItems.length} items)
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-4 border border-red-200 shadow-sm flex items-center gap-4"
              >
                {item.photo_url ? (
                  <Image
                    src={item.photo_url}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded border border-luvora"
                  />
                ) : null}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-2">{item.name}</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Category:</span> {item.category}</p>
                    <p><span className="font-medium">Current Stock:</span> 
                      <span className="text-red-600 font-semibold ml-1">{item.quantity}</span>
                    </p>
                    <p><span className="font-medium">Threshold:</span> {threshold}</p>
                    <p><span className="font-medium">Vendor:</span> {item.vendor}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
        >
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">All Items Well Stocked!</h3>
          <p className="text-green-700">
            No items are currently below the low stock threshold of {threshold} units.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default LowStockAlerts; 