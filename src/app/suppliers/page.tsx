'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import SupplierManagement from '../../components/SupplierManagement';
import Link from 'next/link';
import { BusinessProvider } from '../../context/TransactionContext';
import ClerkAuthWrapper from '../../components/ClerkAuthWrapper';

export default function SuppliersPage() {
  return (
    <ClerkAuthWrapper>
      <BusinessProvider>
        <div className="min-h-screen bg-gradient-to-br from-luvora/5 via-white to-pink-50/30">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <Link
                  href="/"
                  className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-luvora/10 rounded-xl">
                    <Users className="w-8 h-8 text-luvora" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Supplier Management</h1>
                    <p className="text-gray-600">Manage your vendors and contact information</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SupplierManagement />
            </motion.div>
          </div>
        </div>
      </BusinessProvider>
    </ClerkAuthWrapper>
  );
} 