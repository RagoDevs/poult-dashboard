import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, ArrowUp, ArrowDown } from "lucide-react";
import { Transaction } from "@/pages/Index";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TransactionSummaryProps {
  transactions: Transaction[];
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const isMobile = useIsMobile();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: isMobile ? 'compact' : 'standard',
    }).format(amount);
  };

  const totalExpenses = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);
  
  const totalIncome = transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);
  
  const profit = totalIncome - totalExpenses;
  const chickensPurchased = transactions
    .filter(transaction => transaction.type === 'expense' && transaction.category === 'chicken')
    .reduce((total, transaction) => total + (transaction.quantity || 0), 0);
  
  const chickensSold = transactions
    .filter(transaction => transaction.type === 'income' && transaction.category === 'chicken')
    .reduce((total, transaction) => total + (transaction.quantity || 0), 0);

  // Calculate financial values

  // Instead of rendering a fragment with multiple cards, we need to render a single div
  // This ensures the parent grid layout properly handles all three cards
  return [
    <Card key="profit" className="border hover:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
        <div>
          {profit >= 0 ? 
            <ArrowUp className="h-4 w-4 text-gray-500" /> : 
            <ArrowDown className="h-4 w-4 text-gray-500" />
          }
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-2xl font-bold">{formatCurrency(profit)}</div>
        <p className="text-xs text-gray-500 mt-1">Income minus expenses</p>
      </CardContent>
    </Card>,

    <Card key="income" className="border hover:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
        <div>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
        <p className="text-xs text-gray-500 mt-1">All sales and income</p>
      </CardContent>
    </Card>,

    <Card key="expenses" className="border hover:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
        <div>
          <Package className="h-4 w-4 text-gray-500" />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
        <p className="text-xs text-gray-500 mt-1">All expenses</p>
      </CardContent>
    </Card>
  ];
}
