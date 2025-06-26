import React, { useState } from 'react';
import InventoryManager from './InventoryManager';
import SalesEntryForm from './SalesEntryForm';
import { Plus, ShoppingCart } from 'lucide-react';

const InventoryActions: React.FC = () => {
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 my-8">
      <button
        onClick={() => setShowInventoryModal(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow hover:shadow-xl transition"
      >
        <Plus className="w-5 h-5" /> Add Inventory
      </button>
      <button
        onClick={() => setShowSalesModal(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow hover:shadow-xl transition"
      >
        <ShoppingCart className="w-5 h-5" /> Record Sale
      </button>
      {/* Modals */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowInventoryModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <InventoryManager forceOpen={true} onClose={() => setShowInventoryModal(false)} />
          </div>
        </div>
      )}
      {showSalesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSalesModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <SalesEntryForm forceOpen={true} onClose={() => setShowSalesModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryActions; 