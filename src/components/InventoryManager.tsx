'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Package, DollarSign, Hash, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useBusiness } from '../context/TransactionContext';
import { getCategoryIcon } from '../utils/formatCurrency';
import { supabase } from '../utils/supabaseClient';

interface InventoryManagerProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ forceOpen, onClose }) => {
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
    photoFile: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categories = [
    'Shirts', 'Pants', 'Dresses', 'Jackets', 'Shoes', 'Accessories',
    'Jeans', 'T-Shirts', 'Sweaters', 'Skirts', 'Suits', 'Activewear',
    'Formal Wear', 'Casual Wear', 'Winter Wear', 'Summer Wear', 'Other'
  ];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setFormData((prev) => ({ ...prev, photoFile: file || null }));
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.costPrice || !formData.quantity) return;
    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);
    let photo_url = '';
    if (formData.photoFile) {
      const fileExt = formData.photoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { error } = await supabase.storage
        .from('inventory-photos')
        .upload(fileName, formData.photoFile, { upsert: false });
      if (error) {
        setUploadError('Failed to upload image: ' + error.message);
        setUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from('inventory-photos')
        .getPublicUrl(fileName);
      photo_url = publicUrlData?.publicUrl || '';
    }
    await addInventoryItem({
      name: formData.name,
      category: formData.category,
      costPrice: parseFloat(formData.costPrice),
      quantity: parseInt(formData.quantity),
      vendor: formData.vendor,
      dateAdded: formData.dateAdded,
      notes: formData.notes,
      photo_url,
    });
    setFormData({
      name: '',
      category: '',
      costPrice: '',
      quantity: '',
      vendor: '',
      dateAdded: new Date().toISOString().split('T')[0],
      notes: '',
      photoFile: null,
    });
    setPhotoPreview(null);
    setUploading(false);
    setSuccessMessage('Inventory item added successfully!');
    setTimeout(() => setSuccessMessage(null), 2500);
    setIsOpen(false);
  };

  const lowStockItems = state.inventory.filter(item => item.quantity <= 5);

  const modalOpen = forceOpen !== undefined ? forceOpen : isOpen;
  const closeModal = () => {
    if (onClose) onClose();
    else setIsOpen(false);
  };

  return (
    <>
      {forceOpen === undefined && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      )}

      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={closeModal}
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
                onClick={closeModal}
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

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-pink-200 mb-1">Inventory Photo (optional)</label>
                <div className="flex items-center gap-4">
                  <label htmlFor="photo-upload" className="px-4 py-2 bg-luvora text-white rounded-lg cursor-pointer hover:bg-pink-700 transition-colors font-semibold shadow">
                    {formData.photoFile ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="rounded-lg max-h-16 border border-luvora" />
                  )}
                </div>
                {uploadError && <div className="text-red-400 text-xs mt-1">{uploadError}</div>}
              </div>
              {successMessage && (
                <div className="text-green-400 text-center font-semibold mb-2 animate-fade-in">{successMessage}</div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-lg bg-luvora text-white font-bold shadow hover:bg-pink-700 transition"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Add to Inventory'}
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