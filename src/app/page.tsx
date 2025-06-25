'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BusinessProvider } from '../context/TransactionContext';
import InventoryDashboard from '../components/InventoryDashboard';
import InventoryManager from '../components/InventoryManager';
import SalesEntryForm from '../components/SalesEntryForm';
import ProfitLossChart from '../components/ProfitLossChart';
import CategoryWiseBreakdown from '../components/CategoryWiseBreakdown';
import ClothingStoreDemo from '../components/ClothingStoreDemo';
import PaymentSummaryCard from '../components/PaymentSummaryCard';
import PendingPaymentsTable from '../components/PendingPaymentsTable';
import ClerkAuthWrapper from '../components/ClerkAuthWrapper';
import InventoryList from '../components/InventoryList';

export default function Home() {
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

          {/* Floating Action Buttons */}
          <InventoryManager />
          <SalesEntryForm />
          <InventoryList />
        </div>
      </BusinessProvider>
    </ClerkAuthWrapper>
  );
}
