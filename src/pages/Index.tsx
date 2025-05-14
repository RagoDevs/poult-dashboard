
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Apple, Pill, Wrench, Construction } from "lucide-react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";

export type ExpenseCategory = 'food' | 'medicine' | 'tools' | 'fence' | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    setExpenses([...expenses, newExpense]);
    setShowExpenseForm(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Chicken Farm Expense Tracker</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <ExpenseSummary expenses={expenses} />
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowExpenseForm(true)}>
            <Plus className="mr-2" />
            Add Expense
          </Button>
        </div>

        {showExpenseForm ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
              <CardDescription>Enter the details of your new expense</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm onSubmit={addExpense} onCancel={() => setShowExpenseForm(false)} />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>View and filter your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
