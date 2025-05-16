
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Apple, Pill, Wrench, Construction } from "lucide-react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionSummary } from "@/components/TransactionSummary";
import { ChickenInventory } from "@/components/ChickenInventory";
import { ChickenInventoryHistory } from "@/components/ChickenInventoryHistory";
import { useIsMobile } from "@/hooks/use-mobile";

export type ExpenseCategory = 'food' | 'medicine' | 'tools' | 'fence' | 'chicken' | 'other';
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800">Chicken Farm Financial Tracker</h1>
        
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 mb-8">
          <TransactionSummary transactions={transactions} />
        </div>
        
        <div className="mb-8">
          {/* Inventory Tab Navigation */}
          <div className="flex justify-start mb-4">
            <div className="flex space-x-2">
              <Button 
                variant={activeInventoryTab === 'current' ? 'default' : 'outline'} 
                onClick={() => setActiveInventoryTab('current')}
                className="flex-1 sm:flex-initial"
              >
                Current Inventory
              </Button>
              <Button 
                variant={activeInventoryTab === 'history' ? 'default' : 'outline'} 
                onClick={() => setActiveInventoryTab('history')}
                className="flex-1 sm:flex-initial"
              >
                Inventory History
              </Button>
            </div>
          </div>
          
          {/* Show either current inventory or history based on active tab */}
          {activeInventoryTab === 'current' ? (
            <ChickenInventory 
              externalCounts={chickenCounts}
              onInventoryChange={(newCounts) => {
                setChickenCounts(newCounts);
                localStorage.setItem('chickenCounts', JSON.stringify(newCounts));
              }}
            />
          ) : (
            <ChickenInventoryHistory />
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button 
              variant={activeTab === 'expenses' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('expenses')}
              className="flex-1 sm:flex-initial"
            >
              Expenses
            </Button>
            <Button 
              variant={activeTab === 'income' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('income')}
              className="flex-1 sm:flex-initial"
            >
              Income/Sales
            </Button>
          </div>
          <Button onClick={() => setShowTransactionForm(true)} className="w-full sm:w-auto">
            <Plus className="mr-2" />
            Add {activeTab === 'expenses' ? 'Expense' : 'Income'}
          </Button>
        </div>

        {showTransactionForm ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New {activeTab === 'expenses' ? 'Expense' : 'Income'}</CardTitle>
              <CardDescription>
                Enter the details of your new {activeTab === 'expenses' ? 'expense' : 'income'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm 
                onSubmit={addTransaction} 
                onCancel={() => setShowTransactionForm(false)} 
                type={activeTab === 'expenses' ? 'expense' : 'income'}
              />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{activeTab === 'expenses' ? 'Recent Expenses' : 'Recent Income'}</CardTitle>
            <CardDescription>View and filter your {activeTab === 'expenses' ? 'expenses' : 'income'}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <TransactionList transactions={activeTab === 'expenses' ? expenses : income} type={activeTab} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
