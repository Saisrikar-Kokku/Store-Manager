'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useBusiness } from '@/context/TransactionContext';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  cost_price: number;
  quantity: number;
  vendor?: string;
  date_added?: string;
  notes?: string;
  photo_url?: string;
}

export default function InventoryReportsPage() {
  const { userId } = useBusiness();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .then(({ data }) => {
        setItems((data as InventoryItem[]) || []);
        setLoading(false);
      });
  }, [userId]);

  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.cost_price || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-luvora">Inventory Reports</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/60 rounded-xl p-6 border border-luvora text-center">
            <div className="text-lg text-pink-300 font-semibold mb-2">Total Items</div>
            <div className="text-2xl font-bold">{totalItems}</div>
          </div>
          <div className="bg-black/60 rounded-xl p-6 border border-luvora text-center">
            <div className="text-lg text-pink-300 font-semibold mb-2">Total Stock</div>
            <div className="text-2xl font-bold">{totalStock}</div>
          </div>
          <div className="bg-black/60 rounded-xl p-6 border border-luvora text-center">
            <div className="text-lg text-pink-300 font-semibold mb-2">Total Value</div>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-black/60 rounded-xl p-6 border border-luvora">
          <h2 className="text-xl font-bold mb-4 text-luvora">Inventory Table</h2>
          {loading ? (
            <div className="text-pink-200">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-pink-200">No inventory items found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-luvora/10">
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Cost Price</th>
                    <th className="px-4 py-2">Vendor</th>
                    <th className="px-4 py-2">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-luvora/20 hover:bg-luvora/5">
                      <td className="px-4 py-2">{item.name}</td>
                      <td className="px-4 py-2">{item.category}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">₹{item.cost_price}</td>
                      <td className="px-4 py-2">{item.vendor || '-'}</td>
                      <td className="px-4 py-2">{item.date_added ? new Date(item.date_added).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 