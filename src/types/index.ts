export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  quantity: number;
  vendor: string;
  dateAdded: string;
  notes?: string;
  userId?: string;
  photo_url?: string;
}

export interface Sale {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  salePrice: number;
  costPrice: number;
  profit: number;
  date: string;
  customerName?: string;
  notes?: string;
  createdAt: Date;
  paymentStatus: 'pending' | 'paid';
  paymentDate?: string;
  userId?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'investment' | 'sale';
  category: string;
  date: string;
  notes?: string;
  createdAt: Date;
  itemId?: string;
  quantity?: number;
  profit?: number;
  userId?: string;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface Budget {
  category: string;
  amount: number;
  spent: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  createdAt: Date;
  type: 'sales' | 'profit' | 'inventory';
}

export interface BusinessStats {
  totalInvestment: number;
  totalSales: number;
  totalProfit: number;
  stockValue: number;
  stockQuantity: number;
  monthlySales: number;
  monthlyProfit: number;
  lowStockItems: number;
  pendingPayments: number;
  totalPendingAmount: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ProfitLossData {
  date: string;
  sales: number;
  profit: number;
  investment: number;
}

export interface CategoryPerformance {
  category: string;
  totalSales: number;
  totalProfit: number;
  itemsSold: number;
  color: string;
}

export interface PendingPayment {
  id: string;
  saleId: string;
  itemName: string;
  customerName: string;
  quantity: number;
  totalAmount: number;
  saleDate: string;
  daysPending: number;
  userId?: string;
}

export interface PaymentSummary {
  totalRevenue: number;
  pendingDues: number;
  collectedCash: number;
  paidVsPendingRatio: number;
  totalSales: number;
  pendingSales: number;
} 