import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Transaction } from "@/pages/Index";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";

interface TransactionSummaryProps {
  transactions: Transaction[];
  summary: {
    total_income: number;
    total_expenses: number;
    total_profit: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export function TransactionSummary({ transactions, summary, loading, error }: TransactionSummaryProps) {
  const isMobile = useIsMobile();

  // Use centralized formatting utility
  const formatCurrencyWithMobile = (amount: number) => {
    return formatCurrency(amount, isMobile);
  };

  // We're no longer tracking chicken quantities as they were removed from the Transaction interface

  // Calculate financial values

  // Instead of rendering a fragment with multiple cards, we need to render a single div
  // This ensures the parent grid layout properly handles all three cards
  return [
    <Card key="profit" className="border border-gray-200 shadow-sm hover:shadow bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <CardTitle className="text-sm font-medium text-gray-700">Total Profit</CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          {!loading && summary && summary.total_profit >= 0 ? 
            <ArrowUp className="h-4 w-4 text-gray-600" /> : 
            <ArrowDown className="h-4 w-4 text-gray-600" />
          }
        </div>
      </CardHeader>
      <CardContent className="pt-1 px-5 pb-5">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : error ? (
          <div className="text-sm text-red-500">Error loading data</div>
        ) : summary ? (
          <div className="text-2xl font-bold text-gray-900">{formatCurrencyWithMobile(summary.total_profit)}</div>
        ) : (
          <div className="text-sm text-gray-500">No data available</div>
        )}
        <p className="text-xs text-gray-500 mt-1">Income minus expenses</p>
      </CardContent>
    </Card>,

    <Card key="income" className="border border-gray-200 shadow-sm hover:shadow bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <CardTitle className="text-sm font-medium text-gray-700">Total Income</CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-gray-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-1 px-5 pb-5">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : error ? (
          <div className="text-sm text-red-500">Error loading data</div>
        ) : summary ? (
          <div className="text-2xl font-bold text-gray-900">{formatCurrencyWithMobile(summary.total_income)}</div>
        ) : (
          <div className="text-sm text-gray-500">No data available</div>
        )}
        <p className="text-xs text-gray-500 mt-1">All sales and income</p>
      </CardContent>
    </Card>,

    <Card key="expenses" className="border border-gray-200 shadow-sm hover:shadow bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-5">
        <CardTitle className="text-sm font-medium text-gray-700">Total Expenses</CardTitle>
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="h-4 w-4 text-gray-600" />
        </div>
      </CardHeader>
      <CardContent className="pt-1 px-5 pb-5">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : error ? (
          <div className="text-sm text-red-500">Error loading data</div>
        ) : summary ? (
          <div className="text-2xl font-bold text-gray-900">{formatCurrencyWithMobile(summary.total_expenses)}</div>
        ) : (
          <div className="text-sm text-gray-500">No data available</div>
        )}
        <p className="text-xs text-gray-500 mt-1">All expenses</p>
      </CardContent>
    </Card>
  ];
}
