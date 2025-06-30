import { BusinessProvider } from '@/context/TransactionContext';

export default function InventoryReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      {children}
    </BusinessProvider>
  );
} 