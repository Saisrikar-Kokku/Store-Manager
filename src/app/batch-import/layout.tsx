'use client';
import { BusinessProvider } from '@/context/TransactionContext';
import ClerkAuthWrapper from '@/components/ClerkAuthWrapper';

export default function BatchImportLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkAuthWrapper>
      <BusinessProvider>
        {children}
      </BusinessProvider>
    </ClerkAuthWrapper>
  );
} 