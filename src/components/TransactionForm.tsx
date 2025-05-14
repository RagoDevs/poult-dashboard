
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExpenseCategory, TransactionType } from "@/pages/Index";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionFormProps {
  onSubmit: (transaction: {
    type: TransactionType;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
    quantity?: number;
    chickenType?: 'hen' | 'cock' | 'baby';
  }) => void;
  onCancel: () => void;
  type: TransactionType;
}

export function TransactionForm({ onSubmit, onCancel, type }: TransactionFormProps) {
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [chickenType, setChickenType] = useState<'hen' | 'cock' | 'baby' | undefined>(undefined);
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      category,
      amount: parseFloat(amount),
      date,
      description,
      quantity: quantity ? parseInt(quantity) : undefined,
      chickenType: category === 'chicken' ? chickenType : undefined,
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
              <option value="chicken">Chicken Sales</option>
            ) : (
              <>
                <option value="food">Food</option>
                <option value="medicine">Medicine</option>
                <option value="tools">Tools</option>
                <option value="fence">Fence</option>
                <option value="chicken">Chicken Purchase</option>
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

        {category === 'chicken' && (
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of Chickens</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        )}
      </div>
      
      {category === 'chicken' && (
        <div className="space-y-2">
          <Label htmlFor="chickenType">Chicken Type</Label>
          <Select value={chickenType} onValueChange={(value: 'hen' | 'cock' | 'baby') => setChickenType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select chicken type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hen">Hen (Mother)</SelectItem>
              <SelectItem value="cock">Cock (Father)</SelectItem>
              <SelectItem value="baby">Children</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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
        <Button type="submit" className="w-full sm:w-auto">Save {isIncome ? 'Income' : 'Expense'}</Button>
      </div>
    </form>
  );
}
