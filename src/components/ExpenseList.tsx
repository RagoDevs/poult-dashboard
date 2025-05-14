
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Expense, ExpenseCategory } from "@/pages/Index";
import { Apple, Pill, Wrench, Construction, Package } from "lucide-react";

interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  const [filter, setFilter] = useState('');
  
  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'food':
        return <Apple className="text-green-500" />;
      case 'medicine':
        return <Pill className="text-blue-500" />;
      case 'tools':
        return <Wrench className="text-orange-500" />;
      case 'fence':
        return <Construction className="text-brown-500" />;
      default:
        return <Package className="text-gray-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(filter.toLowerCase()) || 
    expense.category.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter expenses..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />
      
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {expenses.length === 0 
            ? "No expenses recorded yet. Add your first expense!" 
            : "No expenses match your filter criteria."}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="flex items-center gap-2">
                  {getCategoryIcon(expense.category)}
                  <span className="capitalize">{expense.category}</span>
                </TableCell>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
