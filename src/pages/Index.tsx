
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
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const isMobile = useIsMobile();

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions([...transactions, newTransaction]);
    setShowTransactionForm(false);
  };

  const expenses = transactions.filter(transaction => transaction.type === 'expense');
  const income = transactions.filter(transaction => transaction.type === 'income');

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-4 sm:py-8 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-gray-800">Chicken Farm Financial Tracker</h1>
        
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4 mb-8">
          <TransactionSummary transactions={transactions} />
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
