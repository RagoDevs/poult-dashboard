import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionSummary } from "@/components/TransactionSummary";
import { ChickenInventory } from "@/components/ChickenInventory";
import { ChickenInventoryHistory } from "@/components/ChickenInventoryHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from '@/components/ui/use-toast';
import { useChickenInventory, ChickenType as HookChickenType } from '@/hooks/use-chicken-inventory';
import { useChickenHistory } from '@/hooks/use-chicken-history';

export type ExpenseCategory = 'food' | 'medicine' | 'tools' | 'chicken' | 'salary' | 'other';
export type TransactionType = 'expense' | 'income';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  quantity?: number;
  chickenType?: 'hen' | 'cock' | 'chicks';
}

// Type for inventory history entry
type InventoryChangeReason = 'purchase' | 'sale' | 'birth' | 'death' | 'gift' | 'other';
type InventoryHistoryEntry = {
  date: string;
  type: 'hen' | 'cock' | 'chicks';
  previousValue: number;
  newValue: number;
  change: number;
  reason: InventoryChangeReason;
  notes: string;
};

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const [activeInventoryTab, setActiveInventoryTab] = useState<'current' | 'history'>('current');
  const isMobile = useIsMobile();
  
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  // Use the chicken inventory hook for current chickens tab
  const {
    counts: hookChickenCounts,
    loading: hookInventoryLoading,
    error: hookInventoryError,
    fetchChickenInventory: hookFetchChickenInventory,
    updateChickenInventory: hookUpdateChickenInventory
  } = useChickenInventory();

  // Use the dedicated chicken history hook for history tab
  const {
    history: hookChickenHistory,
    loading: hookHistoryLoading,
    error: hookHistoryError,
    fetchChickenHistory: hookFetchChickenHistory
  } = useChickenHistory();


  // Track the currently selected category filter for API requests
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Use a ref to track the last request to prevent duplicate calls
  const lastRequestRef = React.useRef<string | null>(null);

  const loadTransactionsFromServer = useCallback(async (category?: string, tabType?: 'expenses' | 'income') => {
    if (!user || !user.token) {
      setTransactions([]); // Clear transactions if no user/token
      return;
    }
    
    // Use the provided category or the current categoryFilter state
    const currentCategory = category || categoryFilter;
    // Use the provided tab type or the current activeTab state
    const currentTabType = tabType || activeTab;
    
    // Create a request key to track this specific request
    const requestKey = `${currentTabType}:${currentCategory}`;
    
    // Skip if this is a duplicate request (same category + type)
    if (requestKey === lastRequestRef.current) {
      return;
    }
    
    // Update the last request ref
    lastRequestRef.current = requestKey;
    
    try {
      // Determine which endpoint to call based on the active tab
      const baseUrl = currentTabType === 'expenses' 
        ? 'http://localhost:5055/v1/auth/transactions/type/expense'
        : 'http://localhost:5055/v1/auth/transactions/type/income';
      
      // Add category filter if not 'all'
      let url = baseUrl;
      if (currentCategory !== 'all') {
        url = `${baseUrl}?category_name=${currentCategory}`;
      }

      const headers = {
        'Authorization': `Bearer ${user.token}`,
      };

      const response = await fetch(url, { headers });

      const processApiResponse = (responseData: any): Transaction[] => {
        let transactionsArray: any[] = [];
        if (Array.isArray(responseData?.transactions)) {
          transactionsArray = responseData.transactions;
        } else if (Array.isArray(responseData)) {
          transactionsArray = responseData;
        }

        return transactionsArray.map((tx: any) => ({
          id: tx.id,
          type: tx.type as TransactionType,
          category: tx.category_name as ExpenseCategory,
          amount: tx.amount,
          date: tx.date.split('T')[0],
          description: tx.description,
          quantity: tx.quantity, // Will be undefined if not present
          chickenType: tx.chickenType, // Will be undefined if not present
        }));
      };

      let fetchedTransactions: Transaction[] = [];
      if (response.ok) {
        const data = await response.json();
        fetchedTransactions = processApiResponse(data);
      } else {
        const errorData = await response.json().catch(() => ({ 
          message: `Failed to fetch ${currentTabType} and could not parse error response` 
        }));
        console.error(`Error fetching ${currentTabType}:`, response.status, errorData);
        toast({
          title: `Error Fetching ${currentTabType === 'expenses' ? 'Expenses' : 'Income'}`,
          description: errorData.message || `Server responded with status: ${response.status}`,
          variant: 'destructive',
        });
      }
      
      // Update only the transactions for the current tab type
      setTransactions(prevTransactions => {
        // Keep transactions of the other type
        const otherTypeTransactions = prevTransactions.filter(t => 
          t.type !== (currentTabType === 'expenses' ? 'expense' : 'income')
        );
        
        // Combine with newly fetched transactions
        return [...otherTypeTransactions, ...fetchedTransactions];
      });

    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      toast({
        title: 'Error Loading Transactions',
        description: error.message || 'An unexpected error occurred while trying to load data.',
        variant: 'destructive',
      });
    }
  }, [user, toast, setTransactions, categoryFilter, activeTab]);

  // Only load transactions when component mounts or when dependencies change
  useEffect(() => {
    if (!user || !user.token) return;
    
    // The reference check in loadTransactionsFromServer will prevent duplicate requests
    loadTransactionsFromServer(categoryFilter, activeTab);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, activeTab, user]);

  // Removed duplicate useEffect that was causing multiple fetches when switching to the history tab

  const addTransaction = async (transaction: Omit<Transaction, 'id'> & { bulkQuantities?: { hen: number; cock: number; chicks: number } }) => {
    
    if (!user || !user.token) {
      toast({ 
        title: 'Authentication Error', 
        description: 'You must be logged in to add transactions', 
        variant: 'destructive' 
      });
      return;
    }
    
    // Define the base transaction interface for API payload
    interface ApiTransactionBase {
      type: TransactionType;
      category: ExpenseCategory;
      amount: number;
      date: string;
      description: string;
      chickenType?: 'hen' | 'cock' | 'chicks';
      quantity?: number;
      bulkQuantities?: {
        hen: number;
        cock: number;
        chicks: number;
      };
    }
    
    // Prepare transaction data for API - ensure only serializable data is included
    const apiTransaction: ApiTransactionBase = {
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: `${transaction.date}T00:00:00Z`, // Append time for Go backend
      description: transaction.description
    };
    
    // Add chicken-specific fields if applicable
    if (transaction.category === 'chicken') {
      if (transaction.bulkQuantities) {
        apiTransaction.bulkQuantities = {
          hen: transaction.bulkQuantities.hen || 0,
          cock: transaction.bulkQuantities.cock || 0,
          chicks: transaction.bulkQuantities.chicks || 0
        };
      } else if (transaction.chickenType && transaction.quantity) {
        apiTransaction.chickenType = transaction.chickenType;
        apiTransaction.quantity = transaction.quantity;
      }
    }
    
    console.log('Sending transaction to API:', apiTransaction);
    
    try {
      // Send transaction to API
      const response = await fetch('http://localhost:5055/v1/auth/transactions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(apiTransaction)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add transaction');
      }
      // Backend returns OK with nil body, so we don't parse JSON for success.
      // Generate ID client-side.
      const newTransaction = {
        ...transaction,
        id: crypto.randomUUID(),
      };
      
      // Since the backend already handles chicken inventory updates when posting transactions,
      // we only need to fetch the updated data once after the transaction is complete
      if (transaction.category === 'chicken') {
        // Fetch the updated chicken inventory data
        await hookFetchChickenInventory();
        
        // Only fetch history if we're on the history tab
        if (activeInventoryTab === 'history') {
          await hookFetchChickenHistory();
        }
      }

      // Refetch all transactions (the function will check if we're already loading)
      loadTransactionsFromServer();
      setShowTransactionForm(false);
      toast({ title: 'Success', description: 'Transaction added successfully and list updated.' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add transaction', 
        variant: 'destructive' 
      });
      console.error('Error adding transaction:', error);
    }
  };

  const expenses = transactions.filter(transaction => transaction.type === 'expense');
  const income = transactions.filter(transaction => transaction.type === 'income');
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div></div> {/* Empty div for flex alignment */}
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <span className="transform -scale-x-100 inline-block mr-2">🐔</span>
            Kuku Farm
          </h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* Financial Summary Cards */}
        <section className="mb-10">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <TransactionSummary transactions={transactions} />
          </div>
        </section>
        
        {/* Inventory Section */}
        <section className="mb-10">
          <div className="flex flex-col">
            <div className="flex justify-center mb-4 md:mb-5">
              <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
                <Button 
                  variant={activeInventoryTab === 'current' ? 'default' : 'ghost'} 
                  onClick={() => setActiveInventoryTab('current')}
                  size="sm"
                  className="rounded-md text-sm"
                >
                  Current Chickens
                </Button>
                <Button 
                  variant={activeInventoryTab === 'history' ? 'default' : 'ghost'} 
                  onClick={() => setActiveInventoryTab('history')}
                  size="sm"
                  className="rounded-md text-sm"
                >
                  Chicken History
                </Button>
              </div>
            </div>
            
            {/* Inventory Content */}
            <div className="rounded-xl overflow-hidden">
              {activeInventoryTab === 'current' ? (
                <ChickenInventory 
                  counts={hookChickenCounts}
                  isLoading={hookInventoryLoading}
                  error={hookInventoryError}
                  updateChickenInventory={hookUpdateChickenInventory} // Pass down the function
                  fetchChickenInventory={hookFetchChickenInventory}   // Pass down the function
                />
              ) : (
                <ChickenInventoryHistory history={hookChickenHistory} isLoading={hookHistoryLoading} error={hookHistoryError} />
              )}
            </div>
          </div>
        </section>

        {/* Transactions Section */}
        <section>
          <div className="flex flex-col">
            <div className="flex flex-col items-center mb-6 gap-4">
              <div className="flex justify-center gap-4 w-full">
                <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
                  <Button 
                    variant={activeTab === 'expenses' ? 'default' : 'ghost'} 
                    onClick={() => {
                      // Reset the category filter when switching tabs
                      setCategoryFilter('all');
                      // Update the active tab
                      setActiveTab('expenses');
                    }}
                    size="sm"
                    className="rounded-md text-sm"
                  >
                    Expenses
                  </Button>
                  <Button 
                    variant={activeTab === 'income' ? 'default' : 'ghost'} 
                    onClick={() => {
                      // Reset the category filter when switching tabs
                      setCategoryFilter('all');
                      // Update the active tab
                      setActiveTab('income');
                    }}
                    size="sm"
                    className="rounded-md text-sm"
                  >
                    Income
                  </Button>
                </div>
                <Button 
                  onClick={() => setShowTransactionForm(true)} 
                  className="border-gray-200 bg-white shadow-sm hover:bg-gray-50"
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4 text-gray-600" />
                  Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
                </Button>
              </div>
            </div>
            
            {/* Transaction Form */}
            {showTransactionForm && (
              <Card className="mb-8 border border-gray-200 shadow-sm">
                <CardHeader className="pb-3 bg-gray-50">
                  <CardTitle className="text-lg">Add New {activeTab === 'expenses' ? 'Expense' : 'Income'}</CardTitle>
                  <CardDescription>
                    Enter the details of your new {activeTab === 'expenses' ? 'expense' : 'income'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <TransactionForm 
                    onSubmit={addTransaction} 
                    onCancel={() => setShowTransactionForm(false)} 
                    type={activeTab === 'expenses' ? 'expense' : 'income'}
                  />
                </CardContent>
              </Card>
            )}

            {/* Transaction List */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3 bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-lg">{activeTab === 'expenses' ? 'Recent Expenses' : 'Recent Income'}</CardTitle>
                <CardDescription>View and filter your {activeTab === 'expenses' ? 'expenses' : 'income'}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <TransactionList 
                    transactions={activeTab === 'expenses' ? expenses : income} 
                    type={activeTab}
                    key={activeTab} /* Add key to force re-render and reset internal state when tab changes */
                    onCategoryChange={(category) => {
                      // Update the category filter state
                      setCategoryFilter(category);
                      // The loadTransactionsFromServer function will check if we're already loading
                      loadTransactionsFromServer(category, activeTab);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-10 py-6 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Kuku Farm. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
