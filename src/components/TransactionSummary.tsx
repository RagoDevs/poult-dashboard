import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, ArrowUp, ArrowDown } from "lucide-react";
import { Transaction } from "@/pages/Index";
import { useIsMobile } from "@/hooks/use-mobile";

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

  return (
    <>
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <CardTitle className="text-sm sm:text-base font-medium">Total Profit</CardTitle>
          <div className="bg-gray-100 p-2 rounded-full">
            {profit >= 0 ? 
              <ArrowUp className="h-5 w-5 text-green-500" /> : 
              <ArrowDown className="h-5 w-5 text-red-500" />
            }
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className={`text-xl sm:text-3xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(profit)}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Income minus expenses</p>
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <CardTitle className="text-sm sm:text-base font-medium">Total Income</CardTitle>
          <div className="bg-green-50 p-2 rounded-full">
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-xl sm:text-3xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            All sales and income
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <CardTitle className="text-sm sm:text-base font-medium">Total Expenses</CardTitle>
          <div className="bg-red-50 p-2 rounded-full">
            <Package className="h-5 w-5 text-red-500" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-xl sm:text-3xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            All expenses
          </p>
        </CardContent>
      </Card>
    </>
  );
}
