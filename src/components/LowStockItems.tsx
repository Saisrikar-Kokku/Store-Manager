'use client';

import React, { useState } from 'react';
import { useBusiness } from '../context/TransactionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, X, Plus, Minus } from 'lucide-react';
import { InventoryItem } from '@/types';

const glassStyle = {
  background: 'rgba(255,255,255,0.15)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  backdropFilter: 'blur(8px)',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.18)',
};

const LowStockItems: React.FC = () => {
  const { state, updateInventoryItem } = useBusiness();
  const lowStockItems = state.inventory.filter(item => item.quantity <= 5);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get the latest quantity from state for the selected item
  const latestSelectedItem = selectedItem
    ? state.inventory.find(item => item.id === selectedItem.id) || selectedItem
    : null;

  const handleAddStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantity(0);
    setIsModalOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedItem || quantity <= 0) return;
    console.log('Updating item:', selectedItem);
    console.log('Current inventory:', state.inventory.map(i => i.id));
    setIsUpdating(true);
    const updatedItem = {
      ...selectedItem,
      quantity: selectedItem.quantity + quantity
    };
    try {
      await updateInventoryItem(updatedItem); // This should update global state
      setIsUpdating(false);
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setQuantity(0);
        setSuccess(false);
      }, 1000);
    } catch {
      setIsUpdating(false);
      alert("Failed to update stock. Please try again.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-black/80 glass w-full max-w-3xl mx-auto mt-8 border border-luvora text-white"
      >
        <div className="mb-6 flex items-center gap-3">
          <AlertTriangle className="text-white w-7 h-7" />
          <h2 className="text-2xl font-bold font-luvora text-white tracking-tight bg-clip-text">
            Low Stock Items
          </h2>
        </div>
        {lowStockItems.length === 0 ? (
          <div style={glassStyle} className="bg-luvora glass p-8 text-center text-lg text-white border border-luvora">
            <span className="opacity-80">🎉 All items are well stocked!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {lowStockItems.map(item => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.03, boxShadow: '0 4px 32px 0 rgba(255, 193, 7, 0.18)' }}
                style={glassStyle}
                className="bg-luvora glass p-6 flex flex-col gap-3 border border-luvora relative overflow-hidden text-white"
              >
                <div className="flex items-center gap-3">
                  <Package className="text-white w-8 h-8" />
                  <div>
                    <div className="font-semibold text-lg text-white font-luvora">
                      {item.name}
                    </div>
                    <div className="text-xs text-pink-100 mt-1">
                      Category: <span className="font-medium text-white">{item.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium text-white">Quantity:</span>
                  <span className="text-xl font-bold text-white">{item.quantity}</span>
                  {item.quantity === 0 && <span className="ml-2 text-xs text-pink-100 font-semibold">Out of Stock</span>}
                </div>
                <button
                  onClick={() => handleAddStock(item)}
                  className="mt-4 px-4 py-2 rounded-lg bg-white text-luvora font-semibold shadow border border-luvora hover:bg-pink-100 hover:text-luvora transition"
                >
                  Add Stock
                </button>
                <div className="absolute right-4 top-4">
                  <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={glassStyle}
              className="bg-luvora glass w-full max-w-md p-6 relative border border-luvora text-white"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-pink-100 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-bold text-white font-luvora mb-4">
                Add Stock - {selectedItem.name}
              </h3>
              
              <div className="mb-4">
                <p className="text-pink-100 mb-2">Current Stock: {latestSelectedItem ? latestSelectedItem.quantity : 0}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(0, quantity - 1))}
                    className="p-2 rounded-lg bg-white text-luvora hover:bg-pink-100 hover:text-luvora"
                    disabled={isUpdating || success}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 px-3 py-2 rounded-lg bg-white text-luvora text-center"
                    min="0"
                    disabled={isUpdating || success}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg bg-white text-luvora hover:bg-pink-100 hover:text-luvora"
                    disabled={isUpdating || success}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {isUpdating ? (
                <div className="w-full flex justify-center py-2">
                  <svg className="animate-spin h-6 w-6 text-luvora" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span className="ml-2 text-luvora font-semibold">Updating...</span>
                </div>
              ) : success ? (
                <div className="w-full flex justify-center py-2">
                  <span className="text-green-400 font-bold">Stock updated successfully!</span>
                </div>
              ) : (
                <button
                  onClick={handleUpdateStock}
                  disabled={quantity <= 0 || isUpdating || success}
                  className={`w-full px-4 py-2 rounded-lg bg-white text-luvora font-semibold shadow border border-luvora 
                    ${quantity <= 0 || isUpdating || success ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-100 hover:text-luvora'} transition`}
                >
                  Update Stock
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LowStockItems; 