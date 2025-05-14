
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExpenseCategory } from "@/pages/Index";

interface ExpenseFormProps {
  onSubmit: (expense: {
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
  }) => void;
  onCancel: () => void;
}

export function ExpenseForm({ onSubmit, onCancel }: ExpenseFormProps) {
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category,
      amount: parseFloat(amount),
      date,
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="food">Food</option>
            <option value="medicine">Medicine</option>
            <option value="tools">Tools</option>
            <option value="fence">Fence</option>
            <option value="other">Other</option>
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

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter expense details"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Expense</Button>
      </div>
    </form>
  );
}
