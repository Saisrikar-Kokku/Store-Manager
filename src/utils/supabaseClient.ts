import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key exists:', !!supabaseAnonKey);
    
    // Test if client is properly initialized
    if (!supabase) {
      console.error('Supabase client is null or undefined');
      return { success: false, error: 'Supabase client not initialized' };
    }
    
    // Simple ping test
    const { data, error } = await supabase
      .from('inventory')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, error };
    }
    
    console.log('Supabase connection test successful');
    return { success: true, data };
  } catch (err) {
    console.error('Supabase connection test error:', err);
    return { success: false, error: err };
  }
};

// Simple ping test
export const pingSupabase = async () => {
  try {
    console.log('Pinging Supabase...');
    const { data, error } = await supabase.rpc('version');
    console.log('Ping result:', { data, error });
    return { success: !error, error };
  } catch (err) {
    console.error('Ping failed:', err);
    return { success: false, error: err };
  }
};

// Test RLS policy access with user ID
export const testRLSAccess = async (userId: string) => {
  try {
    console.log('Testing RLS access for user:', userId);
    
    // Test sales table access
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('id, payment_status')
      .eq('user_id', userId)
      .limit(1);
      
    console.log('Sales RLS test:', { salesData, salesError });
    
    // Test inventory table access
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('id, name')
      .eq('user_id', userId)
      .limit(1);
      
    console.log('Inventory RLS test:', { inventoryData, inventoryError });
    
    return {
      success: !salesError && !inventoryError,
      sales: { data: salesData, error: salesError },
      inventory: { data: inventoryData, error: inventoryError }
    };
  } catch (err) {
    console.error('RLS test failed:', err);
    return { success: false, error: err };
  }
};

// Function to check if RLS policies are blocking access
export const diagnoseRLSIssue = async (userId: string) => {
  try {
    console.log('Diagnosing RLS issue for user:', userId);
    
    // Test without user_id filter first
    const { data: allSales, error: allSalesError } = await supabase
      .from('sales')
      .select('id, user_id, payment_status')
      .limit(5);
      
    console.log('All sales test (no filter):', { allSales, allSalesError });
    
    // Test with user_id filter
    const { data: userSales, error: userSalesError } = await supabase
      .from('sales')
      .select('id, user_id, payment_status')
      .eq('user_id', userId)
      .limit(5);
      
    console.log('User sales test (with filter):', { userSales, userSalesError });
    
    // Test direct update attempt
    if (userSales && userSales.length > 0) {
      const testSaleId = userSales[0].id;
      const { data: updateTest, error: updateError } = await supabase
        .from('sales')
        .update({ payment_status: 'pending' }) // Reset to original state
        .eq('id', testSaleId)
        .eq('user_id', userId)
        .select();
        
      console.log('Update test:', { updateTest, updateError });
    }
    
    return {
      allSalesAccess: !allSalesError,
      userSalesAccess: !userSalesError,
      hasUserSales: userSales && userSales.length > 0,
      allSalesError,
      userSalesError
    };
  } catch (err) {
    console.error('RLS diagnosis failed:', err);
    return { error: err };
  }
}; 