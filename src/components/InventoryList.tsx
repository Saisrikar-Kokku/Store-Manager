'use client';
import React, { useState } from 'react';
import { useBusiness } from '../context/TransactionContext';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

const InventoryList: React.FC = () => {
  const { state, deleteInventoryItem } = useBusiness();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!state.inventory.length) {
    return (
      <div className="mt-8">
        <h2 className="font-luvora text-luvora text-xl mb-4">Inventory Items</h2>
        <div className="text-pink-100 mt-4">No inventory items yet.</div>
      </div>
    );
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all sales records associated with this item. This action cannot be undone.`)) return;
    
    try {
      setDeletingId(id);
      await deleteInventoryItem(id);
      toast.success('Item deleted successfully.');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="font-luvora text-luvora text-xl mb-4">Inventory Items</h2>
      <div className="bg-luvora glass rounded-xl p-4 border border-luvora">
        <ul className="divide-y divide-pink-900/30">
          {state.inventory.map(item => (
            <li key={item.id} className="flex items-center py-4 gap-4">
              {item.photo_url ? (
                <Image
                  src={item.photo_url}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded-lg border border-luvora"
                />
              ) : (
                <div className="w-12 h-12 bg-pink-900/20 rounded-lg border border-luvora flex items-center justify-center">
                  <span className="text-pink-300 text-xs">No image</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-white">{item.name}</h3>
                <div className="flex gap-4 text-sm text-pink-100">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>{item.quantity} in stock</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(item.id, item.name)}
                className={`p-2 rounded-lg hover:bg-red-700/80 transition-colors ${
                  deletingId === item.id 
                    ? 'bg-red-800/50 cursor-not-allowed' 
                    : 'bg-red-600'
                }`}
                disabled={deletingId === item.id}
                title="Delete item"
              >
                {deletingId === item.id ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <Trash2 className="w-5 h-5 text-white" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InventoryList; 