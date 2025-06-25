'use client';
import React from 'react';
import { useBusiness } from '../context/TransactionContext';

const InventoryList: React.FC = () => {
  const { state } = useBusiness();
  if (!state.inventory.length) {
    return <div className="text-pink-100 mt-4">No inventory items yet.</div>;
  }
  return (
    <div className="mt-8">
      <h2 className="font-luvora text-luvora text-xl mb-4">Inventory Items</h2>
      <div className="bg-luvora glass rounded-xl p-4 border border-luvora">
        <ul>
          {state.inventory.map(item => (
            <li key={item.id} className="flex justify-between py-2 border-b border-pink-900/30 last:border-b-0">
              <span className="font-semibold text-white">{item.name}</span>
              <span className="text-pink-100">{item.category}</span>
              <span className="text-white">{item.quantity} in stock</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InventoryList; 