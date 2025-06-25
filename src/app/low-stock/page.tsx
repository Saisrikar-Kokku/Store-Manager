'use client';

import React from 'react';
import LowStockItems from '@/components/LowStockItems';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LowStockPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <LowStockItems />
      </div>
    </div>
  );
} 