export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + 'Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(1) + 'L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    // Clothing Categories
    'Shirts': '#FF6B6B',
    'Pants': '#4ECDC4',
    'Dresses': '#45B7D1',
    'Jackets': '#96CEB4',
    'Shoes': '#FFEAA7',
    'Accessories': '#DDA0DD',
    'Jeans': '#98D8C8',
    'T-Shirts': '#F7DC6F',
    'Sweaters': '#52C41A',
    'Skirts': '#1890FF',
    'Suits': '#722ED1',
    'Activewear': '#FF9F43',
    'Formal Wear': '#6C5CE7',
    'Casual Wear': '#00B894',
    'Winter Wear': '#74B9FF',
    'Summer Wear': '#FDCB6E',
    'Other': '#8C8C8C',
  };
  
  return colors[category] || '#8C8C8C';
};

export const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    'Shirts': '👔',
    'Pants': '👖',
    'Dresses': '👗',
    'Jackets': '🧥',
    'Shoes': '👟',
    'Accessories': '👜',
    'Jeans': '👖',
    'T-Shirts': '👕',
    'Sweaters': '🧶',
    'Skirts': '👗',
    'Suits': '🤵',
    'Activewear': '🏃',
    'Formal Wear': '🎩',
    'Casual Wear': '😊',
    'Winter Wear': '❄️',
    'Summer Wear': '☀️',
    'Other': '📦',
  };
  
  return icons[category] || '📦';
};

export const calculateProfit = (salePrice: number, costPrice: number, quantity: number): number => {
  return (salePrice - costPrice) * quantity;
};

export const calculateProfitMargin = (salePrice: number, costPrice: number): number => {
  if (costPrice === 0) return 0;
  return ((salePrice - costPrice) / costPrice) * 100;
};

// New utility functions for payment tracking
export const calculateDaysPending = (saleDate: string): number => {
  const sale = new Date(saleDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - sale.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getPaymentStatusColor = (status: 'pending' | 'paid'): string => {
  return status === 'paid' ? 'text-green-600' : 'text-orange-600';
};

export const getPaymentStatusBgColor = (status: 'pending' | 'paid'): string => {
  return status === 'paid' ? 'bg-green-100' : 'bg-orange-100';
};

export const getPaymentStatusIcon = (status: 'pending' | 'paid'): string => {
  return status === 'paid' ? '✅' : '⏳';
}; 