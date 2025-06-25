'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, X, Package, DollarSign, Hash, Calendar, FileText, User } from 'lucide-react';
import { useBusiness } from '../context/TransactionContext';
import { getCategoryIcon, calculateProfit } from '../utils/formatCurrency';

const SalesEntryForm: React.FC = () => {
  const { state, addSale, userId } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    salePrice: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    notes: '',
    paymentStatus: 'paid' as 'paid' | 'pending',
  });

  const availableItems = state.inventory.filter(item => item.quantity > 0);
  const selectedItem = state.inventory.find(item => item.id === formData.itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId || !formData.quantity || !formData.salePrice || !selectedItem) return;
    if (!userId) return;

    const quantity = parseInt(formData.quantity);
    const salePrice = parseFloat(formData.salePrice);
    const costPrice = selectedItem.costPrice;
    const profit = calculateProfit(salePrice, costPrice, quantity);

    if (quantity > selectedItem.quantity) {
      alert('Not enough stock available!');
      return;
    }

    addSale({
      itemId: formData.itemId,
      itemName: selectedItem.name,
      category: selectedItem.category,
      quantity,
      salePrice,
      costPrice,
      profit,
      date: formData.date,
      customerName: formData.customerName,
      notes: formData.notes,
      paymentStatus: formData.paymentStatus,
    });

    setFormData({
      itemId: '',
      quantity: '',
      salePrice: '',
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      notes: '',
      paymentStatus: 'paid',
    });
    setIsOpen(false);
  };

  const totalSaleValue = selectedItem && formData.quantity && formData.salePrice
    ? parseFloat(formData.salePrice) * parseInt(formData.quantity)
    : 0;

  const totalProfit = selectedItem && formData.quantity && formData.salePrice
    ? calculateProfit(parseFloat(formData.salePrice), selectedItem.costPrice, parseInt(formData.quantity))
    : 0;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-20 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
      >
        <ShoppingCart className="w-6 h-6" />
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
              <h2 className="text-2xl font-bold text-gray-800">Record Sale</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-black/80 glass border border-luvora p-6 rounded-2xl text-white">
              {/* Select Item */}
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <select
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                >
                  <option value="">Select Item</option>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id} className="bg-black text-luvora">
                      {getCategoryIcon(item.category)} {item.name} ({item.quantity} in stock)
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Details */}
              {selectedItem && (
                <div className="bg-black/60 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{selectedItem.name}</span>
                    <span className="text-sm text-pink-200">{selectedItem.category}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-pink-200">Cost Price:</span>
                      <span className="ml-2 font-medium">${selectedItem.costPrice}</span>
                    </div>
                    <div>
                      <span className="text-pink-200">Available:</span>
                      <span className="ml-2 font-medium">{selectedItem.quantity}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                  min="1"
                />
              </div>

              {/* Sale Price */}
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="number"
                  placeholder="Sale price per unit"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Payment Status */}
              <div className="relative">
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'paid' | 'pending' })}
                  className="w-full px-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                >
                  <option value="paid">✅ Paid</option>
                  <option value="pending">⏳ Pending</option>
                </select>
              </div>

              {/* Sale Summary */}
              {totalSaleValue > 0 && (
                <div className="bg-black/60 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-pink-200">Total Sale:</span>
                      <span className="ml-2 font-medium text-luvora">${totalSaleValue.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-pink-200">Profit:</span>
                      <span className="ml-2 font-medium text-green-400">${totalProfit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                />
              </div>

              {/* Customer Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                  required
                />
              </div>

              {/* Notes */}
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-luvora rounded-lg bg-black/60 text-white focus:ring-2 focus:ring-luvora focus:border-luvora placeholder-pink-200"
                />
              </div>

              <button type="submit" className="w-full py-3 rounded-lg bg-luvora text-white font-bold shadow hover:bg-pink-700 transition">
                Record Sale
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default SalesEntryForm; 