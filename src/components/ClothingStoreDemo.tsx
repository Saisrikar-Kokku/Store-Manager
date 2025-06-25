'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useBusiness } from '../context/TransactionContext';

const ClothingStoreDemo: React.FC = () => {
  const { addInventoryItem, addSale, state } = useBusiness();

  const addDemoData = () => {
    // Add sample inventory items
    const demoInventory = [
      {
        name: 'Blue Denim Jacket',
        category: 'Jackets',
        costPrice: 45,
        quantity: 20,
        vendor: 'Fashion Wholesale Co.',
        dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Classic denim jacket, popular item',
      },
      {
        name: 'White Cotton T-Shirt',
        category: 'T-Shirts',
        costPrice: 8,
        quantity: 50,
        vendor: 'Basic Apparel Ltd.',
        dateAdded: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Essential basic t-shirt',
      },
      {
        name: 'Black Formal Shirt',
        category: 'Shirts',
        costPrice: 35,
        quantity: 15,
        vendor: 'Professional Wear Inc.',
        dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Office wear collection',
      },
      {
        name: 'Slim Fit Jeans',
        category: 'Jeans',
        costPrice: 28,
        quantity: 30,
        vendor: 'Denim Masters',
        dateAdded: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Trendy slim fit style',
      },
      {
        name: 'Summer Dress',
        category: 'Dresses',
        costPrice: 25,
        quantity: 12,
        vendor: 'Summer Collection',
        dateAdded: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Light summer dress',
      },
      {
        name: 'Running Shoes',
        category: 'Shoes',
        costPrice: 60,
        quantity: 8,
        vendor: 'Sports Gear Pro',
        dateAdded: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Comfortable running shoes',
      },
    ];

    // Add inventory items
    demoInventory.forEach(item => {
      addInventoryItem(item);
    });

    // Add sample sales (after a small delay to ensure inventory is added)
    setTimeout(() => {
      const demoSales = [
        {
          itemId: 'item-1',
          itemName: 'Blue Denim Jacket',
          category: 'Jackets',
          quantity: 2,
          salePrice: 75,
          costPrice: 45,
          profit: 60,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerName: 'John Smith',
          notes: 'Customer loved the fit',
          paymentStatus: 'paid',
          paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        } as const,
        {
          itemId: 'item-2',
          itemName: 'White Cotton T-Shirt',
          category: 'T-Shirts',
          quantity: 5,
          salePrice: 15,
          costPrice: 8,
          profit: 35,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerName: 'Sarah Johnson',
          notes: 'Bulk purchase for family',
          paymentStatus: 'paid',
          paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        } as const,
        {
          itemId: 'item-3',
          itemName: 'Black Formal Shirt',
          category: 'Shirts',
          quantity: 1,
          salePrice: 65,
          costPrice: 35,
          profit: 30,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerName: 'Mike Davis',
          notes: 'Job interview outfit',
          paymentStatus: 'paid',
          paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        } as const,
        {
          itemId: 'item-4',
          itemName: 'Slim Fit Jeans',
          category: 'Jeans',
          quantity: 3,
          salePrice: 40,
          costPrice: 28,
          profit: 36,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerName: 'Emily Clark',
          notes: 'Repeat customer',
          paymentStatus: 'paid',
          paymentDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        } as const,
        {
          itemId: 'item-5',
          itemName: 'Summer Dress',
          category: 'Dresses',
          quantity: 1,
          salePrice: 55,
          costPrice: 25,
          profit: 30,
          date: new Date().toISOString().split('T')[0],
          customerName: 'Anna Lee',
          notes: 'Gift purchase',
          paymentStatus: 'paid',
          paymentDate: new Date().toISOString().split('T')[0],
        } as const,
      ];

      demoSales.forEach(sale => {
        addSale(sale);
      });
    }, 100);
  };

  // Only show if no data exists
  if (state.inventory.length > 0 || state.sales.length > 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 mb-8"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to Your Clothing Store!</h3>
        <p className="text-gray-600 mb-4">
          Get started by adding inventory items and recording sales, or try our demo data to see the app in action.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addDemoData}
          className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
        >
          Load Demo Store Data
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ClothingStoreDemo; 