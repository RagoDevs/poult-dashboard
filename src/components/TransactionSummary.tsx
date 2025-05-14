
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Pill, Wrench, Construction, Package, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { Transaction } from "@/pages/Index";

interface TransactionSummaryProps {
  transactions: Transaction[];
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
          {profit >= 0 ? 
            <ArrowUp className="h-4 w-4 text-green-500" /> : 
            <ArrowDown className="h-4 w-4 text-red-500" />
          }
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(profit)}
          </div>
          <p className="text-xs text-muted-foreground">Income minus expenses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <DollarSign className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground">
            All sales and income
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <Package className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            All expenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Chicken Count</CardTitle>
          <Package className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{chickensPurchased - chickensSold}</div>
          <p className="text-xs text-muted-foreground">
            {chickensPurchased} purchased, {chickensSold} sold
          </p>
        </CardContent>
      </Card>
    </>
  );
}
