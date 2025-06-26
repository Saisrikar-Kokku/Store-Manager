'use client';

import React, { createContext, useContext } from 'react';
import { Transaction, BusinessStats, InventoryItem, Sale, PendingPayment, PaymentSummary } from '../types';
import { calculateDaysPending } from '../utils/formatCurrency';
// import { useUser } from '@clerk/nextjs';
import { supabase } from '../utils/supabaseClient';
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
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const { user, isLoaded } = useUser();
  const user = { id: 'local-dev-user' };
  const isLoaded = true;
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
    if (!isLoaded || !userId) return;
    const fetchData = async () => {
      setIsReady(false);
      // Fetch inventory
      const { data: inventory } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId);
      // Fix costPrice and quantity types
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
      setIsReady(true);
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
    if (!userId) return;
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
    const { error } = await supabase
      .from('inventory')
      .insert([payload])
      .select();
    if (error) {
      console.error('Error adding inventory:', error);
      return;
    }
    await refetchAllData();
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
    // 1. Find the inventory item
    const inventoryItem = state.inventory.find(item => item.id === saleData.itemId);
    if (!inventoryItem) {
      // TODO: Show error to user: Item not found
      console.error('Sale failed: Inventory item not found');
      toast.error('Sale failed: Inventory item not found');
      return;
    }
    // 2. Validate input
    if (saleData.quantity <= 0 || saleData.salePrice < 0 || saleData.costPrice < 0) {
      // TODO: Show error to user: Invalid input values
      console.error('Sale failed: Invalid input values');
      toast.error('Sale failed: Invalid input values');
      return;
    }
    // 3. Prevent overselling
    if (saleData.quantity > inventoryItem.quantity) {
      // TODO: Show error to user: Not enough stock
      console.error('Sale failed: Not enough stock');
      toast.error('Sale failed: Not enough stock');
      return;
    }
    // TODO: Show loading state in UI
    const {
      itemId, itemName, category, quantity, salePrice, costPrice, profit, date,
      customerName, notes, paymentStatus, paymentDate
    } = saleData;
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
    if (error) {
      // TODO: Show error to user: Could not add sale
      console.error('Error adding sale:', error);
      toast.error('Could not add sale. Please try again.');
      return;
    } else {
      toast.success('Sale recorded successfully.');
    }
    if (data) {
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
      const { error: invError } = await supabase
        .from('inventory')
        .update({ quantity: newQuantity })
        .eq('id', soldItemId)
        .eq('user_id', userId);
      if (invError) {
        // TODO: Show error to user: Could not update inventory
        console.error('Error updating inventory quantity:', invError);
        toast.error('Could not update inventory after sale.');
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
      // TODO: Show success message in UI
    }
    // TODO: Hide loading state in UI
  };

  const updatePaymentStatus = async (saleId: string, status: 'paid' | 'pending') => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('sales')
      .update({ payment_status: status, payment_date: status === 'paid' ? new Date().toISOString().split('T')[0] : null })
      .eq('id', saleId)
      .eq('user_id', userId)
      .select();
    if (error) {
      console.error('Error updating payment status:', error);
    }
    if (!error && data) {
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
    }
    // Optionally, you can also call await refetchAllData(); if you want to always sync with DB
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

  if (!isLoaded || !userId || !isReady) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading your business data...</div>;
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