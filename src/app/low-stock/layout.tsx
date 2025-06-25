'use client';

import { BusinessProvider } from '@/context/TransactionContext';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function LowStockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <BusinessProvider>
        <div className={inter.className}>
          {children}
        </div>
      </BusinessProvider>
    </ClerkProvider>
  );
} 