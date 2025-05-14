
import { useState } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Transaction, TransactionType } from "@/pages/Index";
import { Apple, Pill, Wrench, Construction, Package, DollarSign } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  type: 'expenses' | 'income';
}

export function TransactionList({ transactions, type }: TransactionListProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const getCategoryIcon = (category: string, type: TransactionType) => {
    if (type === 'income') {
      return <DollarSign className="text-green-500" />;
    }
    
    switch (category) {
      case 'food':
        return <Apple className="text-green-500" />;
      case 'medicine':
        return <Pill className="text-blue-500" />;
      case 'tools':
        return <Wrench className="text-orange-500" />;
      case 'fence':
        return <Construction className="text-brown-500" />;
      case 'chicken':
        return <Package className="text-purple-500" />;
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

  // Get unique categories from transactions
  const categories = ['all', ...new Set(transactions.map(t => t.category))];
  
  const filteredTransactions = categoryFilter === 'all' 
    ? transactions 
    : transactions.filter(transaction => transaction.category === categoryFilter);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" onValueChange={setCategoryFilter}>
        <TabsList className="w-full flex overflow-x-auto">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className="capitalize flex-1"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {transactions.length === 0 
            ? `No ${type} recorded yet. Add your first ${type === 'expenses' ? 'expense' : 'income'}!` 
            : `No ${type} in the '${categoryFilter}' category.`}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              {type === 'income' && <TableHead>Quantity</TableHead>}
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="flex items-center gap-2">
                  {getCategoryIcon(transaction.category, transaction.type)}
                  <span className="capitalize">{transaction.category}</span>
                </TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                {type === 'income' && (
                  <TableCell>{transaction.quantity ?? '-'}</TableCell>
                )}
                <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
