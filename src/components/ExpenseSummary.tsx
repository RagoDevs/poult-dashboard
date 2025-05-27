
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Apple, Pill, Wrench, Construction, Package } from "lucide-react";
import { Expense } from "@/pages/Index";
import { formatCurrency } from "@/utils/format";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const calculateCategoryTotal = (category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  // Use centralized formatting utility
  const formatAmountAsCurrency = (amount: number) => {
    return formatCurrency(amount);
  };

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const foodTotal = calculateCategoryTotal('food');
  const medicineTotal = calculateCategoryTotal('medicine');
  const toolsTotal = calculateCategoryTotal('tools');
  const otherTotal = calculateCategoryTotal('other');

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <Package className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmountAsCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">All time expenses</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Food</CardTitle>
          <Apple className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmountAsCurrency(foodTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {((foodTotal / totalExpenses) * 100 || 0).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Medicine</CardTitle>
          <Pill className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmountAsCurrency(medicineTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {((medicineTotal / totalExpenses) * 100 || 0).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Equipment</CardTitle>
          <Wrench className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatAmountAsCurrency(toolsTotal + otherTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {(((toolsTotal + otherTotal) / totalExpenses) * 100 || 0).toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>
    </>
  );
}
