import React, { useState, useEffect, useCallback, useRef } from 'react';
import { buildApiUrl } from '@/utils/config';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, LogOut } from "lucide-react";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionSummary } from "@/components/TransactionSummary";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFinancialSummary } from "@/hooks/use-financial-summary";
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ExpenseCategory = 'food' | 'medicine' | 'tools' | 'chicken' | 'chicken_purchase' | 'chicken_sale' | 'egg_sale' | 'salary' | 'other';
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
}




const Index = () => {
  const { summary, loading: summaryLoading, error: summaryError, fetchFinancialSummary } = useFinancialSummary();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [totalSum, setTotalSum] = useState<number>(0);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const { user, logout, fetchUserProfile } = useAuth();
  const { toast } = useToast();
  



  // Track the currently selected category filter for API requests
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Use a ref to track the last request to prevent duplicate calls
  const lastRequestRef = React.useRef<string | null>(null);

  const loadTransactionsFromServer = useCallback(async (category?: string, tabType?: 'expenses' | 'income', forceRefresh: boolean = false) => {
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
    
    // Skip if this is a duplicate request (same category + type) and not forced refresh
    if (requestKey === lastRequestRef.current && !forceRefresh) {
      return;
    }
    
    // Update the last request ref
    lastRequestRef.current = requestKey;
    
    try {
      // Determine which endpoint to call based on the active tab
      const baseUrl = currentTabType === 'expenses' 
        ? buildApiUrl('auth/transactions/type/expense')
        : buildApiUrl('auth/transactions/type/income');
      
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
          description: tx.description
        }));
      };

      let fetchedTransactions: Transaction[] = [];
      let currentTotalSum = 0;
      if (response.ok) {
        const data = await response.json();
        fetchedTransactions = processApiResponse(data);
        // Store the total_sum from the API response
        if (data.total_sum !== undefined) {
          currentTotalSum = data.total_sum;
          setTotalSum(data.total_sum);
        }
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

  // Fetch transactions and financial summary when component mounts or user changes
  useEffect(() => {
    if (user && user.token) {
      loadTransactionsFromServer();
      fetchFinancialSummary(); // Now we need to call this explicitly since it's no longer automatic in the hook
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user to prevent circular dependencies
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'expenses' | 'income');
    // Reset category filter when changing tabs
    setCategoryFilter('all');
    // Close transaction form if open and reset editing state
    if (showTransactionForm || editingTransaction) {
      setShowTransactionForm(false);
      setEditingTransaction(null);
    }
    // Load transactions for the new tab
    loadTransactionsFromServer('all', value as 'expenses' | 'income');
  };

  // Check if profile was updated and fetch the latest user data
  useEffect(() => {
    const profileUpdated = sessionStorage.getItem('profile_updated');
    if (profileUpdated === 'true' && user?.token) {
      // Clear the flag first to prevent repeated fetches
      sessionStorage.removeItem('profile_updated');
      // Fetch the latest user profile data
      fetchUserProfile();
    }
  }, [fetchUserProfile, user?.token]);

  // Removed duplicate useEffect that was causing multiple fetches when switching to the history tab

  const addTransaction = async (transaction: Omit<Transaction, 'id'> & { id?: string }) => {
    // If transaction has an ID, we're updating an existing transaction
    const isEditing = !!transaction.id;
    
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
    }
    
    const apiTransaction: ApiTransactionBase = {
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: `${transaction.date}T00:00:00Z`, 
      description: transaction.description
    };
    
    try {
      // Determine if we're creating or updating a transaction
      const url = isEditing 
        ? buildApiUrl(`auth/transactions/${transaction.id}`)
        : buildApiUrl('auth/transactions');
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
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
      
      const newTransaction = {
        ...transaction,
        id: crypto.randomUUID(),
      };
      
      // Force refresh transactions after adding/updating
      loadTransactionsFromServer(categoryFilter, activeTab, true);
      fetchFinancialSummary(); // Refresh the financial summary
      setShowTransactionForm(false);
      setEditingTransaction(null); // Clear editing state
      toast({ 
        title: 'Success', 
        description: `Transaction ${isEditing ? 'updated' : 'added'} successfully and list updated.` 
      });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add transaction', 
        variant: 'destructive' 
      });
      console.error('Error adding transaction:', error);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (transaction: Transaction) => {
    if (!user || !user.token) {
      toast({ 
        title: 'Authentication Error', 
        description: 'You must be logged in to delete transactions', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`auth/transactions/${transaction.id}`), {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete transaction');
      }

      // Force refresh transactions after deleting
      loadTransactionsFromServer(categoryFilter, activeTab, true);
      fetchFinancialSummary(); // Refresh the financial summary
      toast({ title: 'Success', description: 'Transaction deleted successfully.' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete transaction', 
        variant: 'destructive' 
      });
      console.error('Error deleting transaction:', error);
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const expenses = transactions.filter(transaction => transaction.type === 'expense');
  const income = transactions.filter(transaction => transaction.type === 'income');
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-5 border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <img src="/chicken.png" alt="Kuku Farm Logo" className="h-8 w-8 mr-3" />
            Kuku Farm
          </h1>
          
          <div className="flex items-center">
            {/* User Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0 border-gray-300">
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center justify-center h-full w-full bg-gray-300 text-gray-700 rounded-full">
                    <span className="text-sm font-medium">{user?.name ? `${user.name.split(' ')[0][0]}${user.name.split(' ')[1]?.[0] || ''}` : 'LA'}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-sm font-bold">My Account</p>
                  <p className="text-sm">{user?.name || 'Lugano Abel'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'lugano.ngulwa@gmail.com'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 sm:py-10 px-4 sm:px-6 relative flex-grow">
        {/* Financial Summary */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
            <div className="hidden sm:block">
              <Button 
                onClick={() => setShowTransactionForm(true)} 
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm transition-colors"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
              </Button>
            </div>
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <TransactionSummary 
  transactions={transactions}
  summary={summary}
  loading={summaryLoading}
  error={summaryError}
/>
          </div>
        </section>
        
        <section>
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg shadow-sm">
                  <Button 
                    variant={activeTab === 'expenses' ? 'default' : 'ghost'} 
                    onClick={() => handleTabChange('expenses')}
                    size="sm"
                    className="rounded-md font-medium"
                  >
                    Expenses
                  </Button>
                  <Button 
                    variant={activeTab === 'income' ? 'default' : 'ghost'} 
                    onClick={() => handleTabChange('income')}
                    size="sm"
                    className="rounded-md font-medium"
                  >
                    Income
                  </Button>
                </div>
              </div>
            </div>

            {showTransactionForm && (
              <Card className="mb-8 border border-gray-200 shadow-md bg-white rounded-xl overflow-hidden">
                <CardHeader className="pb-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Add New {activeTab === 'expenses' ? 'Expense' : 'Income'}</CardTitle>
                      <CardDescription className="mt-1">
                        Enter the details of your new {activeTab === 'expenses' ? 'expense' : 'income'}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowTransactionForm(false)}
                      className="rounded-full h-8 w-8 p-0"
                    >
                      <span className="sr-only">Close</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 px-6">
                  <TransactionForm 
                    onSubmit={addTransaction} 
                    onCancel={() => {
                      setShowTransactionForm(false);
                      setEditingTransaction(null);
                    }} 
                    type={activeTab === 'expenses' ? 'expense' : 'income'}
                    transaction={editingTransaction || undefined}
                    isEditing={!!editingTransaction}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="border border-gray-200 shadow-md bg-white rounded-xl overflow-hidden">
              <CardHeader className="pb-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{activeTab === 'expenses' ? 'Recent Expenses' : 'Recent Income'}</CardTitle>
                    <CardDescription className="mt-1">
                      View and filter your {activeTab === 'expenses' ? 'expenses' : 'income'}
                    </CardDescription>
                  </div>
                  <div className="sm:hidden">
                    <Button 
                      onClick={() => setShowTransactionForm(true)} 
                      className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm transition-colors"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  {/* TransactionList component */}
                  <TransactionList 
                    transactions={activeTab === 'expenses' ? expenses : income} 
                    type={activeTab}
                    key={activeTab} 
                    onCategoryChange={(category) => {
                      setCategoryFilter(category);
                      loadTransactionsFromServer(category, activeTab);
                    }}
                    onEdit={handleEditTransaction}
                    onDelete={deleteTransaction}
                    totalSum={totalSum}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 sm:hidden z-20">
        <Button
          onClick={() => setShowTransactionForm(true)}
          className="h-14 w-14 rounded-full bg-gray-900 hover:bg-gray-800 shadow-lg flex items-center justify-center"
          size="lg"
        >
          <Plus className="h-6 w-6 text-white" />
          <span className="sr-only">Add Transaction</span>
        </Button>
      </div>

      <footer className="mt-auto py-8 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center mb-4">
              <img src="/chicken.png" alt="Kuku Farm Logo" className="h-6 w-6 mr-2" />
              <span className="font-semibold text-gray-900">Kuku Farm</span>
            </div>
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Kuku Farm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
