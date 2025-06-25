'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Package, DollarSign, Hash, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useBusiness } from '../context/TransactionContext';
import { getCategoryIcon } from '../utils/formatCurrency';

const InventoryManager: React.FC = () => {
  const { state, addInventoryItem } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    costPrice: '',
    quantity: '',
    vendor: '',
    dateAdded: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const categories = [
    'Shirts', 'Pants', 'Dresses', 'Jackets', 'Shoes', 'Accessories',
    'Jeans', 'T-Shirts', 'Sweaters', 'Skirts', 'Suits', 'Activewear',
    'Formal Wear', 'Casual Wear', 'Winter Wear', 'Summer Wear', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.costPrice || !formData.quantity) return;

    addInventoryItem({
      name: formData.name,
      category: formData.category,
      costPrice: parseFloat(formData.costPrice),
      quantity: parseInt(formData.quantity),
      vendor: formData.vendor,
      dateAdded: formData.dateAdded,
      notes: formData.notes,
    });

    setFormData({
      name: '',
      category: '',
      costPrice: '',
      quantity: '',
      vendor: '',
      dateAdded: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsOpen(false);
  };

  const lowStockItems = state.inventory.filter(item => item.quantity <= 5);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Inventory Item</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-black/80 glass border border-luvora p-6 rounded-2xl text-white">
              {/* Item Name */}
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Item name (e.g., Blue Denim Jacket)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                />
              </div>

              {/* Category */}
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-black text-luvora">
                    {getCategoryIcon(category)} {category}
                  </option>
                ))}
              </select>

              {/* Cost Price */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Cost price per unit"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Quantity */}
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Quantity in stock"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                  min="1"
                />
              </div>

              {/* Vendor */}
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Vendor/Supplier name"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                />
              </div>

              {/* Date Added */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="date"
                  value={formData.dateAdded}
                  onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                />
              </div>

              {/* Notes */}
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <textarea
                  placeholder="Additional notes (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200 resize-none"
                  rows={3}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-lg bg-luvora text-white font-bold shadow hover:bg-pink-700 transition"
              >
                Add to Inventory
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
              <p className="text-sm text-red-600">
                {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low on stock
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {lowStockItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700">{item.name}</span>
                <span className="text-red-600 font-medium">{item.quantity} left</span>
              </div>
            ))}
            {lowStockItems.length > 3 && (
              <p className="text-xs text-red-500">+{lowStockItems.length - 3} more items</p>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default InventoryManager; 