
import { useState } from 'react';
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
  
  // Load chicken counts from localStorage
  const { logout } = useAuth();
  
  const [chickenCounts, setChickenCounts] = useState(() => {
    const savedCounts = localStorage.getItem('chickenCounts');
    return savedCounts ? JSON.parse(savedCounts) : {
      hen: 0,
      cock: 0,
      chicks: 0
    };
  });

  // Function to update chicken inventory
  const updateChickenInventory = (
    chickenType: 'hen' | 'cock' | 'chicks', 
    quantity: number, 
    isIncrease: boolean,
    reason: InventoryChangeReason,
    description: string
  ) => {
    // Get current counts
    const currentCount = chickenCounts[chickenType];
    
    // Calculate new count (increase or decrease)
    const newCount = isIncrease ? currentCount + quantity : Math.max(0, currentCount - quantity);
    
    // Create history entry
    const historyEntry: InventoryHistoryEntry = {
      date: new Date().toISOString(),
      type: chickenType,
      previousValue: currentCount,
      newValue: newCount,
      change: isIncrease ? quantity : -quantity,
      reason,
      notes: description
    };
    
    // Update inventory history in localStorage
    const savedHistory = localStorage.getItem('chickenInventoryHistory');
    const inventoryHistory = savedHistory ? JSON.parse(savedHistory) : [];
    const updatedHistory = [...inventoryHistory, historyEntry];
    localStorage.setItem('chickenInventoryHistory', JSON.stringify(updatedHistory));
    
    // Update counts
    const newCounts = {
      ...chickenCounts,
      [chickenType]: newCount
    };
    
    setChickenCounts(newCounts);
    localStorage.setItem('chickenCounts', JSON.stringify(newCounts));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'> & { bulkQuantities?: { hen: number; cock: number; chicks: number } }) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    
    // Handle bulk chicken transactions
    if (transaction.category === 'chicken' && transaction.bulkQuantities) {
      const { hen: henCount, cock: cockCount, chicks: chicksCount } = transaction.bulkQuantities;
      const isIncrease = transaction.type === 'expense'; // Expense = buying chickens (increase)
      const reason = transaction.type === 'expense' ? 'purchase' : 'sale';
      
      // Update inventory for each chicken type with quantity > 0
      if (henCount > 0) {
        updateChickenInventory('hen', henCount, isIncrease, reason, transaction.description);
      }
      
      if (cockCount > 0) {
        updateChickenInventory('cock', cockCount, isIncrease, reason, transaction.description);
      }
      
      if (chicksCount > 0) {
        updateChickenInventory('chicks', chicksCount, isIncrease, reason, transaction.description);
      }
    }
    // Handle single chicken type transactions
    else if (transaction.category === 'chicken' && transaction.chickenType && transaction.quantity) {
      const isIncrease = transaction.type === 'expense'; // Expense = buying chickens (increase)
      const reason = transaction.type === 'expense' ? 'purchase' : 'sale';
      
      updateChickenInventory(
        transaction.chickenType,
        transaction.quantity,
        isIncrease,
        reason,
        transaction.description
      );
    }
    
    setTransactions([...transactions, newTransaction]);
    setShowTransactionForm(false);
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
                  onInventoryChange={(newCounts) => {
                    setChickenCounts(newCounts);
                    localStorage.setItem('chickenCounts', JSON.stringify(newCounts));
                  }}
                />
              ) : (
                <ChickenInventoryHistory />
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
                    onClick={() => setActiveTab('expenses')}
                    size="sm"
                    className="rounded-md text-sm"
                  >
                    Expenses
                  </Button>
                  <Button 
                    variant={activeTab === 'income' ? 'default' : 'ghost'} 
                    onClick={() => setActiveTab('income')}
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
                  <TransactionList transactions={activeTab === 'expenses' ? expenses : income} type={activeTab} />
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
