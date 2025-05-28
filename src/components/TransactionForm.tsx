import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExpenseCategory, TransactionType } from "@/pages/Index";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionFormProps {
  onSubmit: (transaction: {
    id?: string;
    type: TransactionType;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
    quantity?: number;
  }) => void;
  onCancel: () => void;
  type: TransactionType;
  transaction?: {
    id: string;
    type: TransactionType;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
  };
  isEditing?: boolean;
}

export function TransactionForm({ onSubmit, onCancel, type, transaction, isEditing = false }: TransactionFormProps) {
  const [category, setCategory] = useState<ExpenseCategory>(transaction?.category || 'food');
  const [amount, setAmount] = useState(transaction ? transaction.amount.toString() : '');
  const [date, setDate] = useState(transaction ? transaction.date : new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(transaction ? transaction.description : '');
  const isMobile = useIsMobile();

  // Reset category when transaction type changes, but only if not editing
  useEffect(() => {
    // Only reset category if not in editing mode
    if (!isEditing) {
      // Set appropriate default category based on transaction type
      if (type === 'income') {
        setCategory('chicken_sale');
      } else {
        setCategory('food');
      }
    }
  }, [type, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate description for both expenses and income
    if (!description.trim()) {
      alert(`Description is required for ${type === 'expense' ? 'expenses' : 'income'}.`);
      return;
    }
    
    // For expenses, if chicken is selected, use 'chicken_purchase'
    // For income, use the selected category (chicken_sale or egg_sale)
    let finalCategory = category;
    if (isIncome) {
      // Keep the selected income category (chicken_sale or egg_sale)
      finalCategory = category;
    } else if (category === 'chicken') {
      finalCategory = 'chicken_purchase';
    }
    
    onSubmit({
      id: transaction?.id,
      type,
      category: finalCategory,
      amount: parseFloat(amount),
      date,
      description
      // Removed quantity field as requested
    });
  };

  const isIncome = type === 'income';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {isIncome ? (
              <>
                <option value="chicken_sale">Chicken Sales</option>
                <option value="egg_sale">Egg Sales</option>
              </>
            ) : (
              <>
                <option value="food">Food</option>
                <option value="medicine">Medicine</option>
                <option value="tools">Tools</option>
                <option value="chicken_purchase">Chicken Purchase</option>
                <option value="salary">Salary</option>
                <option value="other">Other</option>
              </>
            )}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Removed Number of Chickens field as requested */}
      </div>
      
      {/* Quantity field is already shown in the grid above for chicken category or income */}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder={`Enter ${type} details`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        <Button variant="outline" type="button" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">{isEditing ? 'Update' : 'Save'} {isIncome ? 'Income' : 'Expense'}</Button>
      </div>
    </form>
  );
}
