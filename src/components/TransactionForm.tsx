
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
    chickenType?: 'hen' | 'cock' | 'chicks';
    bulkQuantities?: {
      hen: number;
      cock: number;
      chicks: number;
    };
  }) => void;
  onCancel: () => void;
  type: TransactionType;
}

export function TransactionForm({ onSubmit, onCancel, type }: TransactionFormProps) {
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  // For single chicken type transactions
  const [quantity, setQuantity] = useState('');
  const [chickenType, setChickenType] = useState<'hen' | 'cock' | 'chicks' | undefined>(undefined);
  
  // For bulk chicken transactions
  const [bulkMode, setBulkMode] = useState(false);
  const [henQuantity, setHenQuantity] = useState('');
  const [cockQuantity, setCockQuantity] = useState('');
  const [chicksQuantity, setChicksQuantity] = useState('');
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate description for expenses
    if (type === 'expense' && !description.trim()) {
      alert('Description is required for expenses.');
      return;
    }
    
    // For income, always set category to 'chicken' for chicken sales
    const finalCategory = isIncome ? 'chicken' : category;
    
    // Handle bulk mode submission
    if (finalCategory === 'chicken' && bulkMode) {
      const henCount = parseInt(henQuantity) || 0;
      const cockCount = parseInt(cockQuantity) || 0;
      const chicksCount = parseInt(chicksQuantity) || 0;
      
      // Validate that at least one type has a quantity
      if (henCount + cockCount + chicksCount === 0) {
        alert('Please enter at least one chicken quantity for bulk transactions');
        return;
      }
      
      // Create a bulk description if none provided
      let finalDescription = description;
      if (!finalDescription) {
        finalDescription = `Bulk ${type === 'expense' ? 'purchase' : 'sale'}: `;
        if (henCount > 0) finalDescription += `${henCount} hens `;
        if (cockCount > 0) finalDescription += `${cockCount} cocks `;
        if (chicksCount > 0) finalDescription += `${chicksCount} chicks`;
        finalDescription = finalDescription.trim();
      }
      
      // Submit the transaction with bulk data
      onSubmit({
        type,
        category: finalCategory,
        amount: parseFloat(amount),
        date,
        description: finalDescription,
        bulkQuantities: {
          hen: henCount,
          cock: cockCount,
          chicks: chicksCount
        }
      });
      return;
    }
    
    // Handle single chicken type transactions
    if (finalCategory === 'chicken' && (!chickenType || !quantity)) {
      alert('Please select a chicken type and enter quantity for chicken transactions');
      return;
    }
    
    onSubmit({
      type,
      category: finalCategory,
      amount: parseFloat(amount),
      date,
      description,
      quantity: finalCategory === 'chicken' ? parseInt(quantity) : undefined,
      chickenType: finalCategory === 'chicken' ? chickenType : undefined,
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
                <option value="chicken">Chicken Purchase</option>
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

        {(category === 'chicken' || isIncome) && !bulkMode && (
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of Chickens</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        )}
      </div>
      
      {(category === 'chicken' || isIncome) && (
        <div className="space-y-4">
          {/* Bulk mode toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="bulkMode"
              checked={bulkMode}
              onChange={() => setBulkMode(!bulkMode)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="bulkMode">Bulk {type === 'expense' ? 'Purchase' : 'Sale'}</Label>
          </div>
          
          {bulkMode ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Enter quantities for each type:</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Hen quantity */}
                <div className="space-y-2">
                  <Label htmlFor="henQuantity">Hens</Label>
                  <Input
                    id="henQuantity"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="1"
                    value={henQuantity}
                    onChange={(e) => setHenQuantity(e.target.value)}
                  />
                </div>
                
                {/* Cock quantity */}
                <div className="space-y-2">
                  <Label htmlFor="cockQuantity">Cocks</Label>
                  <Input
                    id="cockQuantity"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="1"
                    value={cockQuantity}
                    onChange={(e) => setCockQuantity(e.target.value)}
                  />
                </div>
                
                {/* Chicks quantity */}
                <div className="space-y-2">
                  <Label htmlFor="chicksQuantity">Chicks</Label>
                  <Input
                    id="chicksQuantity"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="1"
                    value={chicksQuantity}
                    onChange={(e) => setChicksQuantity(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="chickenType">Chicken Type</Label>
                <Select value={chickenType} onValueChange={(value: 'hen' | 'cock' | 'chicks') => setChickenType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chicken type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hen">Hen</SelectItem>
                    <SelectItem value="cock">Cock</SelectItem>
                    <SelectItem value="chicks">Chicks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
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
