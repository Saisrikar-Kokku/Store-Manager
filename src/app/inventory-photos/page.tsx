"use client";
import React from "react";
import { useBusiness } from "@/context/TransactionContext";

const InventoryPhotosPage: React.FC = () => {
  const { state } = useBusiness();
  const itemsWithPhotos = state.inventory.filter(item => item.photo_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-luvora">Inventory Photo Gallery</h1>
        {itemsWithPhotos.length === 0 ? (
          <div className="text-pink-100">No inventory items have photos yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {itemsWithPhotos.map(item => (
              <div key={item.id} className="bg-black/70 rounded-xl p-4 border border-luvora flex flex-col items-center">
                <img
                  src={item.photo_url}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded mb-3 border border-luvora"
                  style={{ maxWidth: 240 }}
                />
                <div className="font-semibold text-lg text-white mb-1 text-center">{item.name}</div>
                <div className="text-pink-200 text-sm text-center">{item.category}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPhotosPage; 