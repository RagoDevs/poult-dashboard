
import { useState } from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Transaction, TransactionType } from "@/pages/Index";
import { Apple, Pill, Wrench, Construction, Package, DollarSign, Bird, Baby } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TransactionListProps {
  transactions: Transaction[];
  type: 'expenses' | 'income';
  onCategoryChange?: (category: string) => void;
}

export function TransactionList({ transactions, type, onCategoryChange }: TransactionListProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const isMobile = useIsMobile();
  
  // Handle category change and notify parent component
  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const formatCategoryName = (category: string): string => {
    if (!category) return '';
    return category
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const getCategoryIcon = (category: string, type: TransactionType, chickenType?: string) => {
    // Use monochromatic icons (gray-600 for better visibility)
    if (category === 'chicken') {
      if (chickenType === 'hen' || chickenType === 'cock' || chickenType === 'baby') {
        return <Bird className="text-gray-600" />;
      }
      return <Package className="text-gray-600" />;
    }
    
    if (type === 'income') {
      return <DollarSign className="text-gray-600" />;
    }
    
    switch (category) {
      case 'food':
        return <Apple className="text-gray-600" />;
      case 'medicine':
        return <Pill className="text-gray-600" />;
      case 'tools':
        return <Wrench className="text-gray-600" />;
      case 'fence':
        return <Construction className="text-gray-600" />;
      default:
        return <Package className="text-gray-600" />;
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

  const getChickenTypeDisplay = (chickenType?: string) => {
    if (!chickenType) return '';
    switch (chickenType) {
      case 'hen': return ' (Hen)';
      case 'cock': return ' (Cock)';
      case 'baby': return ' (Children)';
      default: return '';
    }
  };

  // Get unique categories from transactions
  const categories = ['all', ...new Set(transactions.map(t => t.category))];
  
  const filteredTransactions = categoryFilter === 'all' 
    ? transactions 
    : transactions.filter(transaction => transaction.category === categoryFilter);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" onValueChange={handleCategoryChange} className="w-full">
        <TabsList className="w-full flex overflow-x-auto bg-gray-50 p-1 border border-gray-100 rounded-md">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className="flex-1 text-xs sm:text-sm py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              {formatCategoryName(category)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-2">
            {transactions.length === 0 
              ? `No ${type} recorded yet` 
              : `No ${type} in the '${categoryFilter}' category`}
          </p>
          <p className="text-sm text-gray-400">
            {transactions.length === 0 
              ? `Add your first ${type === 'expenses' ? 'expense' : 'income'}!` 
              : `Try selecting a different category`}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="whitespace-nowrap font-medium text-gray-700">Category</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-gray-700">Date</TableHead>
                <TableHead className="whitespace-nowrap font-medium text-gray-700">Description</TableHead>
                {type === 'income' && <TableHead className="whitespace-nowrap font-medium text-gray-700">Quantity</TableHead>}
                <TableHead className="text-right whitespace-nowrap font-medium text-gray-700">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow 
                  key={transaction.id} 
                  className="hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <TableCell className="flex items-center gap-2 whitespace-nowrap py-3">
                    <div className="flex items-center justify-center bg-gray-100 rounded p-1.5 w-8 h-8">
                      {getCategoryIcon(transaction.category, transaction.type, transaction.chickenType)}
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCategoryName(transaction.category)}
                    </span>
                    {transaction.chickenType && (
                      <span className="text-xs text-gray-500 font-normal">
                        {getChickenTypeDisplay(transaction.chickenType)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-gray-600">{formatDate(transaction.date)}</TableCell>
                  <TableCell className="max-w-[150px] sm:max-w-[250px] truncate text-gray-600">
                    {transaction.description || '—'}
                  </TableCell>
                  {type === 'income' && (
                    <TableCell className="whitespace-nowrap text-gray-600">
                      {transaction.quantity ? transaction.quantity : '—'}
                    </TableCell>
                  )}
                  <TableCell className="text-right whitespace-nowrap font-medium text-gray-900">{formatCurrency(transaction.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
