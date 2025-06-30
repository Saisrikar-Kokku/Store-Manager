'use client';

import React, { createContext, useContext } from 'react';
import { Transaction, BusinessStats, InventoryItem, Sale, PendingPayment, PaymentSummary } from '../types';
import { calculateDaysPending } from '../utils/formatCurrency';
import { useUser } from '@clerk/nextjs';
import { supabase, testRLSAccess, diagnoseRLSIssue } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

interface BusinessState {
  transactions: Transaction[];
  inventory: InventoryItem[];
  sales: Sale[];
  stats: BusinessStats;
  pendingPayments: PendingPayment[];
  paymentSummary: PaymentSummary;
}

interface BusinessContextType {
  state: BusinessState;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  updatePaymentStatus: (saleId: string, status: 'paid' | 'pending') => void;
  deleteTransaction: (id: string) => void;
  getInventoryItem: (id: string) => InventoryItem | undefined;
  userId: string | null;
  deleteInventoryItem: (id: string) => void;
  refetchAllData: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const userId = user?.id ?? null;
  const [state, setState] = React.useState<BusinessState>({
    transactions: [],
    inventory: [],
    sales: [],
    stats: {
      totalInvestment: 0,
      totalSales: 0,
      totalProfit: 0,
      stockValue: 0,
      stockQuantity: 0,
      monthlySales: 0,
      monthlyProfit: 0,
      lowStockItems: 0,
      pendingPayments: 0,
      totalPendingAmount: 0,
    },
    pendingPayments: [],
    paymentSummary: {
      totalRevenue: 0,
      pendingDues: 0,
      collectedCash: 0,
      paidVsPendingRatio: 0,
      totalSales: 0,
      pendingSales: 0,
    },
  });
  const [isReady, setIsReady] = React.useState(false);

  // Fetch all data from Supabase on login
  React.useEffect(() => {
    if (!isLoaded) {
      // Still loading Clerk authentication
      return;
    }
    
    if (!userId) {
      // User is not authenticated, set ready to true to show sign-in
      setIsReady(true);
      return;
    }
    
    const fetchData = async () => {
      setIsReady(false);
      try {
        // Fetch inventory
        const { data: inventory, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', userId);
          
        if (inventoryError) {
          console.error('Error fetching inventory:', inventoryError);
          toast.error('Failed to load inventory data');
        }
        
        // Fix costPrice and quantity types
        const inventoryFixed = (inventory || []).map(item => ({
          ...item,
          costPrice: Number(item.cost_price ?? 0),
          quantity: Number(item.quantity ?? 0),
        }));
        
        // Fetch sales
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .eq('user_id', userId);
          
        if (salesError) {
          console.error('Error fetching sales:', salesError);
          toast.error('Failed to load sales data');
        }
        
        // Fix sales types and keys
        const salesFixed = (sales || []).map(sale => ({
          ...sale,
          quantity: Number(sale.quantity ?? 0),
          salePrice: Number(sale.sale_price ?? 0),
          costPrice: Number(sale.cost_price ?? 0),
          profit: Number(sale.profit ?? 0),
          paymentStatus: sale.payment_status,
          paymentDate: sale.payment_date,
          itemId: sale.item_id,
          itemName: sale.item_name,
          customerName: sale.customer_name,
          createdAt: sale.created_at ? new Date(sale.created_at) : undefined,
        }));
        
        // Fetch transactions
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId);
          
        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
          toast.error('Failed to load transaction data');
        }
        
        setState(prev => ({
          ...prev,
          inventory: inventoryFixed,
          sales: salesFixed,
          transactions: transactions || [],
          stats: calculateBusinessStats(inventoryFixed, salesFixed, transactions || []),
          pendingPayments: calculatePendingPayments(salesFixed),
          paymentSummary: calculatePaymentSummary(salesFixed),
        }));
        
        setIsReady(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load business data');
        setIsReady(true); // Set ready even on error to prevent infinite loading
      }
    };
    
    fetchData();
  }, [isLoaded, userId]);

  // Helper to refetch all data for the user
  const refetchAllData = async () => {
    if (!userId) return;
    // Fetch inventory
    const { data: inventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId);
    const inventoryFixed = (inventory || []).map(item => ({
      ...item,
      costPrice: Number(item.cost_price ?? 0),
      quantity: Number(item.quantity ?? 0),
    }));
    // Fetch sales
    const { data: sales } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId);
    const salesFixed = (sales || []).map(sale => ({
      ...sale,
      quantity: Number(sale.quantity ?? 0),
      salePrice: Number(sale.sale_price ?? 0),
      costPrice: Number(sale.cost_price ?? 0),
      profit: Number(sale.profit ?? 0),
      paymentStatus: sale.payment_status,
      paymentDate: sale.payment_date,
      itemId: sale.item_id,
      itemName: sale.item_name,
      customerName: sale.customer_name,
      createdAt: sale.created_at ? new Date(sale.created_at) : undefined,
      // add more mappings as needed
    }));
    // Fetch transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);
    setState(prev => ({
      ...prev,
      inventory: inventoryFixed,
      sales: salesFixed,
      transactions: transactions || [],
      stats: calculateBusinessStats(inventoryFixed, salesFixed, transactions || []),
      pendingPayments: calculatePendingPayments(salesFixed),
      paymentSummary: calculatePaymentSummary(salesFixed),
    }));
  };

  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id'>) => {
    if (!userId) {
      toast.error('User not authenticated. Please sign in again.');
      return;
    }
    
    const { name, category, costPrice, quantity, vendor, dateAdded, notes, photo_url } = itemData;
    const payload = {
      user_id: userId,
      name: name || 'Unnamed',
      category: category || 'Uncategorized',
      cost_price: typeof costPrice === 'number' ? costPrice : 0,
      quantity: typeof quantity === 'number' ? quantity : 0,
      vendor: vendor || '',
      date_added: dateAdded || null,
      notes: notes || '',
      photo_url: photo_url || null,
    };
    
    try {
      const { error } = await supabase
        .from('inventory')
        .insert([payload])
        .select();
        
      if (error) {
        toast.error(`Failed to add inventory: ${error.message}`);
        return;
      }
      
      toast.success('Inventory item added successfully!');
      await refetchAllData();
    } catch (error) {
      toast.error('An unexpected error occurred while adding inventory.');
      console.error('Error adding inventory:', error);
    }
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    if (!userId) return;
    // Optimistically update local state
    setState(prev => {
      const updatedInventory = prev.inventory.map(inv =>
        inv.id === item.id ? { ...inv, ...item } : inv
      );
      return {
        ...prev,
        inventory: updatedInventory,
        stats: calculateBusinessStats(updatedInventory, prev.sales, prev.transactions),
      };
    });

    // Prepare payload with only valid fields (snake_case)
    const payload = {
      name: item.name,
      category: item.category,
      cost_price: item.costPrice,
      quantity: item.quantity,
      vendor: item.vendor,
      date_added: item.dateAdded,
      notes: item.notes || '',
    };

    // Sync with backend
    const { error } = await supabase
      .from('inventory')
      .update(payload)
      .eq('id', item.id)
      .eq('user_id', userId)
      .select();

    if (error) {
      // Roll back or ensure consistency
      await refetchAllData();
      // Optionally show a toast or alert
    }
  };

  const addSale = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    if (!userId) return;
    
    try {
      // 1. Find the inventory item
      const inventoryItem = state.inventory.find(item => item.id === saleData.itemId);
      if (!inventoryItem) {
        console.error('Sale failed: Inventory item not found');
        toast.error('Sale failed: Inventory item not found');
        return;
      }
      
      // 2. Validate input
      if (saleData.quantity <= 0 || saleData.salePrice < 0 || saleData.costPrice < 0) {
        console.error('Sale failed: Invalid input values');
        toast.error('Sale failed: Invalid input values');
        return;
      }
      
      // 3. Prevent overselling
      if (saleData.quantity > inventoryItem.quantity) {
        console.error('Sale failed: Not enough stock');
        toast.error('Sale failed: Not enough stock');
        return;
      }
      
      const {
        itemId, itemName, category, quantity, salePrice, costPrice, profit, date,
        customerName, notes, paymentStatus, paymentDate
      } = saleData;
      
      console.log('Adding sale with data:', {
        userId,
        itemId,
        quantity,
        salePrice,
        costPrice,
        profit
      });
      
      const { data, error } = await supabase
        .from('sales')
        .insert([{
          user_id: userId,
          item_id: itemId,
          item_name: itemName,
          category,
          quantity,
          sale_price: salePrice,
          cost_price: costPrice,
          profit,
          date,
          customer_name: customerName,
          notes,
          payment_status: paymentStatus,
          payment_date: paymentDate,
          created_at: new Date().toISOString()
        }])
        .select();
        
      console.log('Sale insert result:', { data, error });
      
      if (error) {
        console.error('Error adding sale:', error);
        toast.error(`Could not add sale: ${error.message || 'Unknown error'}`);
        return;
      }
      
      if (!data || data.length === 0) {
        console.error('No data returned from sale insert');
        toast.error('Sale was not recorded properly');
        return;
      }
      
      toast.success('Sale recorded successfully.');
      
      // Map all fields to camelCase for local state
      const newSale = {
        id: data[0].id,
        itemId: data[0].item_id,
        itemName: data[0].item_name,
        category: data[0].category,
        quantity: Number(data[0].quantity ?? 0),
        salePrice: Number(data[0].sale_price ?? 0),
        costPrice: Number(data[0].cost_price ?? 0),
        profit: Number(data[0].profit ?? 0),
        date: data[0].date,
        customerName: data[0].customer_name,
        notes: data[0].notes,
        paymentStatus: data[0].payment_status,
        paymentDate: data[0].payment_date,
        createdAt: data[0].created_at ? new Date(data[0].created_at) : new Date(),
        userId: data[0].user_id,
      };
      
      const soldItemId = data[0].item_id;
      const soldQuantity = Number(data[0].quantity ?? 0);
      
      // Update inventory in Supabase with the new quantity
      const newQuantity = Math.max(0, inventoryItem.quantity - soldQuantity);
      
      console.log('Updating inventory:', {
        soldItemId,
        newQuantity,
        userId
      });
      
      const { error: invError, data: invData } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', soldItemId)
        .eq('user_id', userId)
        .select();
        
      console.log('Inventory update result:', { invData, invError });
      
      if (invError) {
        console.error('Error updating inventory quantity:', invError);
        toast.error(`Could not update inventory after sale: ${invError.message || 'Unknown error'}`);
        // Optionally, you could roll back the sale here
        return;
      }
      
      // Only update local state after both DB operations succeed
      setState(prev => {
        // Update inventory quantity locally
        const updatedInventory = prev.inventory.map(item =>
          item.id === soldItemId
            ? { ...item, quantity: newQuantity }
            : item
        );
        const newSales = [...prev.sales, newSale];
        return {
          ...prev,
          inventory: updatedInventory,
          sales: newSales,
          stats: calculateBusinessStats(updatedInventory, newSales, prev.transactions),
          pendingPayments: calculatePendingPayments(newSales),
          paymentSummary: calculatePaymentSummary(newSales),
        };
      });
      
    } catch (error) {
      console.error('Unexpected error in addSale:', error);
      toast.error('An unexpected error occurred while recording the sale');
    }
  };

  const updatePaymentStatus = async (saleId: string, status: 'paid' | 'pending') => {
    if (!userId) {
      console.error('No user ID available for payment status update');
      toast.error('User authentication required');
      return;
    }

    try {
      console.log('Updating payment status:', {
        saleId,
        status,
        userId,
        timestamp: new Date().toISOString()
      });

      // Test RLS policy access first
      console.log('Testing RLS policy access...');
      const rlsTestResult = await testRLSAccess(userId);
      console.log('RLS test result:', rlsTestResult);
      
      // Diagnose RLS issue
      const rlsDiagnosis = await diagnoseRLSIssue(userId);
      console.log('RLS diagnosis:', rlsDiagnosis);
      
      const { data: testData, error: testError } = await supabase
        .from('sales')
        .select('id, payment_status')
        .eq('user_id', userId)
        .limit(1);

      console.log('RLS test result:', { testData, testError });

      // First, let's verify the sale exists and get current data
      console.log('Attempting to fetch sale with ID:', saleId, 'for user:', userId);
      
      const { data: existingSale, error: fetchError, status: fetchStatus } = await supabase
        .from('sales')
        .select('*')
        .eq('id', saleId)
        .eq('user_id', userId)
        .single();

      console.log('Fetch sale response:', {
        data: existingSale,
        error: fetchError,
        status: fetchStatus,
        errorDetails: fetchError ? {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
          error: fetchError
        } : null
      });

      if (fetchError) {
        console.error('Error fetching sale for payment update:', {
          error: fetchError,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
          message: fetchError.message,
          fullError: JSON.stringify(fetchError, null, 2)
        });
        
        // Check if it's an RLS policy issue
        if (fetchError.code === 'PGRST116' || fetchError.message?.includes('policy')) {
          toast.error('Access denied - Row Level Security policy issue. Please check database permissions.');
        } else {
          toast.error(`Could not find sale: ${fetchError.message || 'Sale not found'}`);
        }
        return;
      }

      if (!existingSale) {
        console.error('Sale not found for payment update:', { saleId, userId });
        toast.error('Sale not found');
        return;
      }

      console.log('Found existing sale:', existingSale);

      // Prepare update data
      const updateData = {
        payment_status: status,
        payment_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null
      };

      console.log('Update data:', updateData);

      // Perform the update
      const { data, error, status: updateStatus } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', saleId)
        .eq('user_id', userId)
        .select();

      console.log('Payment status update response:', {
        data,
        error,
        status: updateStatus,
        errorDetails: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null
      });

      if (error) {
        console.error('Error updating payment status:', {
          error,
          details: error.details,
          hint: error.hint,
          code: error.code,
          message: error.message
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to update payment status';
        if (error.code === '23505') {
          errorMessage = 'Payment status update conflict - please try again';
        } else if (error.code === '23503') {
          errorMessage = 'Invalid sale reference';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        return;
      }

      if (!data || data.length === 0) {
        console.error('No data returned from payment status update');
        toast.error('Payment status update failed - no data returned');
        return;
      }

      console.log('Successfully updated payment status:', data[0]);

      // Update local state
      setState(prev => {
        const newSales = prev.sales.map(s => (s.id === saleId ? {
          ...data[0],
          quantity: Number(data[0].quantity ?? 0),
          salePrice: Number(data[0].sale_price ?? 0),
          costPrice: Number(data[0].cost_price ?? 0),
          profit: Number(data[0].profit ?? 0),
          paymentStatus: data[0].payment_status,
          paymentDate: data[0].payment_date,
          itemId: data[0].item_id,
          itemName: data[0].item_name,
          customerName: data[0].customer_name,
          createdAt: data[0].created_at ? new Date(data[0].created_at) : undefined,
        } : s));
        
        return {
          ...prev,
          sales: newSales,
          stats: calculateBusinessStats(prev.inventory, newSales, prev.transactions),
          pendingPayments: calculatePendingPayments(newSales),
          paymentSummary: calculatePaymentSummary(newSales),
        };
      });

      toast.success(`Payment marked as ${status}`);
      
    } catch (error) {
      console.error('Unexpected error in updatePaymentStatus:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('An unexpected error occurred while updating payment status');
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!userId) return;
    await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
    setState(prev => {
      const updatedTransactions = prev.transactions.filter(t => t.id !== id);
      // Recalculate all derived state after delete
      return {
        ...prev,
        transactions: updatedTransactions,
        stats: calculateBusinessStats(prev.inventory, prev.sales, updatedTransactions),
        pendingPayments: calculatePendingPayments(prev.sales),
        paymentSummary: calculatePaymentSummary(prev.sales),
      };
    });
    // TODO: Show success/error message in UI
  };

  const getInventoryItem = (id: string) => {
    return state.inventory.find(item => item.id === id);
  };

  const deleteInventoryItem = async (id: string) => {
    if (!userId) return;

    try {
      // First, get the item to check if it has a photo
      const item = state.inventory.find(i => i.id === id);
      
      // Delete from Supabase - this will cascade delete related sales
      const { error, status } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      // Status 204 means success for DELETE operations
      if (error || (status !== 200 && status !== 204)) {
        console.error('Supabase delete response:', { error, status });
        throw new Error(
          error?.message || `Failed to delete inventory item (status: ${status})`
        );
      }

      // If item had a photo, delete it from storage
      if (item?.photo_url) {
        const fileName = item.photo_url.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('inventory-photos')
            .remove([fileName]);
          if (storageError) {
            console.error('Error deleting photo from storage:', storageError);
          }
        }
      }

      // Update local state - remove the item from inventory and related sales
      setState(prev => {
        const updatedInventory = prev.inventory.filter(item => item.id !== id);
        const updatedSales = prev.sales.filter(sale => sale.itemId !== id);
        return {
          ...prev,
          inventory: updatedInventory,
          sales: updatedSales,
          stats: calculateBusinessStats(updatedInventory, updatedSales, prev.transactions),
          pendingPayments: calculatePendingPayments(updatedSales),
          paymentSummary: calculatePaymentSummary(updatedSales)
        };
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error; // Re-throw to handle in the component
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-luvora mx-auto mb-4"></div>
          <p className="text-gray-500">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-luvora mb-4">Welcome to LUVORA</h2>
          <p className="text-gray-500 mb-6">Please sign in to access your inventory management dashboard</p>
          <div className="flex justify-center">
            <a 
              href="/sign-in" 
              className="bg-luvora text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-luvora mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your business data...</p>
        </div>
      </div>
    );
  }

  return (
    <BusinessContext.Provider value={{
      state,
      addInventoryItem,
      updateInventoryItem,
      addSale,
      updatePaymentStatus,
      deleteTransaction,
      getInventoryItem,
      userId,
      deleteInventoryItem,
      refetchAllData,
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

const calculateBusinessStats = (inventory: InventoryItem[], sales: Sale[], transactions: Transaction[]): BusinessStats => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalInvestment = transactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSales = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);

  const stockValue = inventory.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  const stockQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });

  const monthlySales = monthlyTransactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlySalesData = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });

  const monthlyProfit = monthlySalesData.reduce((sum, sale) => sum + sale.profit, 0);

  const lowStockItems = inventory.filter(item => item.quantity <= 5).length;

  const pendingPayments = sales.filter(sale => sale.paymentStatus === 'pending').length;
  const totalPendingAmount = sales
    .filter(sale => sale.paymentStatus === 'pending')
    .reduce((sum, sale) => sum + (sale.salePrice * sale.quantity), 0);

  return {
    totalInvestment,
    totalSales,
    totalProfit,
    stockValue,
    stockQuantity,
    monthlySales,
    monthlyProfit,
    lowStockItems,
    pendingPayments,
    totalPendingAmount,
  };
};

const calculatePendingPayments = (sales: Sale[]): PendingPayment[] => {
  return sales
    .filter(sale => sale.paymentStatus === 'pending')
    .map(sale => ({
      id: sale.id,
      saleId: sale.id,
      itemName: sale.itemName,
      customerName: sale.customerName || 'Unknown',
      quantity: sale.quantity,
      totalAmount: sale.salePrice * sale.quantity,
      saleDate: sale.date,
      daysPending: calculateDaysPending(sale.date),
      userId: sale.userId,
    }))
    .sort((a, b) => b.daysPending - a.daysPending);
};

const calculatePaymentSummary = (sales: Sale[]): PaymentSummary => {
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.salePrice * sale.quantity), 0);
  const pendingDues = sales
    .filter(sale => sale.paymentStatus === 'pending')
    .reduce((sum, sale) => sum + (sale.salePrice * sale.quantity), 0);
  const collectedCash = totalRevenue - pendingDues;
  const totalSales = sales.length;
  const pendingSales = sales.filter(sale => sale.paymentStatus === 'pending').length;
  const paidVsPendingRatio = totalSales > 0 ? ((totalSales - pendingSales) / totalSales) * 100 : 0;

  return {
    totalRevenue,
    pendingDues,
    collectedCash,
    paidVsPendingRatio,
    totalSales,
    pendingSales,
  };
}; 