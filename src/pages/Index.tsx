
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
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Chicken Farm Financial Tracker</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <TransactionSummary transactions={transactions} />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button 
              variant={activeTab === 'expenses' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('expenses')}
            >
              Expenses
            </Button>
            <Button 
              variant={activeTab === 'income' ? 'default' : 'outline'} 
              onClick={() => setActiveTab('income')}
            >
              Income/Sales
            </Button>
          </div>
          <Button onClick={() => setShowTransactionForm(true)}>
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
          <CardContent>
            <TransactionList transactions={activeTab === 'expenses' ? expenses : income} type={activeTab} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
