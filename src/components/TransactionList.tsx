
import { useState } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Transaction, TransactionType } from "@/pages/Index";
import { Apple, Pill, Wrench, Construction, Package, DollarSign } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TransactionListProps {
  transactions: Transaction[];
  type: 'expenses' | 'income';
}

export function TransactionList({ transactions, type }: TransactionListProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const isMobile = useIsMobile();
  
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
      month: isMobile ? 'numeric' : 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: isMobile ? 'compact' : 'standard'
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
              className="capitalize flex-1 text-xs sm:text-sm"
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
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Description</TableHead>
                {type === 'income' && <TableHead className="whitespace-nowrap">Quantity</TableHead>}
                <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="flex items-center gap-2 whitespace-nowrap">
                    {getCategoryIcon(transaction.category, transaction.type)}
                    <span className="capitalize">{transaction.category}</span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(transaction.date)}</TableCell>
                  <TableCell className="max-w-[150px] sm:max-w-[250px] truncate">
                    {transaction.description}
                  </TableCell>
                  {type === 'income' && (
                    <TableCell className="whitespace-nowrap">{transaction.quantity ?? '-'}</TableCell>
                  )}
                  <TableCell className="text-right whitespace-nowrap">{formatCurrency(transaction.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
