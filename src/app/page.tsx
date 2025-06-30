'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BusinessProvider } from '../context/TransactionContext';
import InventoryDashboard from '../components/InventoryDashboard';
import ProfitLossChart from '../components/ProfitLossChart';
import CategoryWiseBreakdown from '../components/CategoryWiseBreakdown';
import ClothingStoreDemo from '../components/ClothingStoreDemo';
import PaymentSummaryCard from '../components/PaymentSummaryCard';
import PendingPaymentsTable from '../components/PendingPaymentsTable';
import InventoryList from '../components/InventoryList';
import Link from 'next/link';
import { Bell, Users, Camera, FileText, Settings } from 'lucide-react';
import LowStockAlertSummary from '../components/LowStockAlertSummary';
import InventoryActions from '../components/InventoryActions';
import ClerkAuthWrapper from '../components/ClerkAuthWrapper';
import { isSupabaseConfigured, testSupabaseConnection, pingSupabase } from '../utils/supabaseClient';

export default function Home() {
  // Test Supabase connection on page load
  useEffect(() => {
    const testConnection = async () => {
      if (isSupabaseConfigured()) {
        console.log('=== SUPABASE CONNECTION TEST ===');
        const result = await testSupabaseConnection();
        console.log('Connection test result:', result);
        
        // Also try a simple ping
        const pingResult = await pingSupabase();
        console.log('Ping test result:', pingResult);
      } else {
        console.error('Supabase not configured');
      }
    };
    
    testConnection();
  }, []);

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-luvora text-luvora mb-4">LUVORA</h1>
            <h2 className="text-xl font-bold text-red-500 mb-4">Configuration Required</h2>
            <p className="text-gray-400 mb-4">
              Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
            </p>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-left text-sm">
            <p className="text-gray-300 mb-2">Required environment variables:</p>
            <code className="text-pink-300 block mb-1">NEXT_PUBLIC_SUPABASE_URL</code>
            <code className="text-pink-300 block">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkAuthWrapper>
      <BusinessProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass bg-black/80 shadow-sm border-b border-luvora/30"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-luvora rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold font-luvora text-luvora drop-shadow-lg">
                    LUVORA Store Manager
                  </h1>
                </div>
                <div className="text-sm text-pink-100 font-medium">
                  Let Aura Wear Our Love
                </div>
              </div>
            </div>
          </motion.header>

          {/* Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white shadow-sm border-b border-gray-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-8 py-4 overflow-x-auto">
                <Link
                  href="/low-stock"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-luvora hover:bg-luvora/5 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Bell className="w-4 h-4" />
                  <span>Low Stock Alerts</span>
                </Link>
                <Link
                  href="/suppliers"
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-luvora hover:bg-luvora/5 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Users className="w-4 h-4" />
                  <span>Suppliers</span>
                </Link>
                <Link
                  href="/inventory-photos"
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-luvora hover:bg-luvora/5 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Camera className="w-4 h-4" />
                  <span>Inventory Photos</span>
                </Link>
                <Link
                  href="/batch-import"
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-luvora hover:bg-luvora/5 rounded-lg transition-colors whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  <span>Batch Import/Export</span>
                </Link>
                <Link
                  href="/inventory-reports"
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-luvora hover:bg-luvora/5 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Settings className="w-4 h-4" />
                  <span>Reports</span>
                </Link>
              </div>
            </div>
          </motion.nav>

          {/* Low Stock Alert Banner */}
          <LowStockAlertSummary />

          {/* Inventory Actions */}
          <InventoryActions />

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Demo Data */}
            <ClothingStoreDemo />

            {/* Payment Summary */}
            <PaymentSummaryCard />

            {/* Pending Payments Table */}
            <PendingPaymentsTable />
            
            {/* Business Dashboard */}
            <InventoryDashboard />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <ProfitLossChart />
              <CategoryWiseBreakdown />
            </div>
          </main>

          <InventoryList />
        </div>
      </BusinessProvider>
    </ClerkAuthWrapper>
  );
}
