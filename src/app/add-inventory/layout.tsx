'use client';

import { BusinessProvider } from '@/context/TransactionContext';
import { Inter } from 'next/font/google';
import ClerkAuthWrapper from '@/components/ClerkAuthWrapper';

const inter = Inter({ subsets: ['latin'] });

export default function AddInventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkAuthWrapper>
      <BusinessProvider>
        <div className={inter.className}>
          {children}
        </div>
      </BusinessProvider>
    </ClerkAuthWrapper>
  );
} 