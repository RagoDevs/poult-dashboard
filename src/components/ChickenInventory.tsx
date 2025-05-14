import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bird, Baby, Plus, Minus, Save, ShoppingCart, DollarSign } from "lucide-react";

export function ChickenInventory() {
  // Initialize counts from localStorage or default to 0
  const [counts, setCounts] = useState(() => {
    const savedCounts = localStorage.getItem('chickenCounts');
    return savedCounts ? JSON.parse(savedCounts) : {
      hen: 0,
      cock: 0,
      baby: 0
    };
  });

  // Save counts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chickenCounts', JSON.stringify(counts));
  }, [counts]);

  // Calculate total count
  const totalCount = counts.hen + counts.cock + counts.baby;

  // Functions to update counts
  const increment = (type: 'hen' | 'cock' | 'baby') => {
    setCounts(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const decrement = (type: 'hen' | 'cock' | 'baby') => {
    if (counts[type] > 0) {
      setCounts(prev => ({
        ...prev,
        [type]: Math.max(0, prev[type] - 1) // Prevent negative counts
      }));
    }
  };

  const handleInputChange = (type: 'hen' | 'cock' | 'baby', value: string) => {
    const numValue = parseInt(value) || 0;
    setCounts(prev => ({
      ...prev,
      [type]: Math.max(0, numValue) // Prevent negative counts
    }));
  };

  return (
    <Card className="col-span-2 md:col-span-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg sm:text-xl">Chicken Inventory</CardTitle>
        <CardDescription>Manually track your chicken counts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Chicken Count Card */}
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg font-bold text-blue-600">Chicken Count</span>
            </div>
            <div className="text-3xl font-bold mb-2">{totalCount}</div>
            <div className="flex flex-col items-center text-sm text-gray-600 space-y-1">
              <div className="text-center mt-2">
                <span>Total chickens in your farm</span>
              </div>
            </div>
          </div>
          
          {/* Hens */}
          <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
            <Bird className="h-8 w-8 text-amber-500 mb-2" />
            <span className="text-sm font-medium mb-2">Hens</span>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => decrement('hen')}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input 
                type="number" 
                value={counts.hen} 
                onChange={(e) => handleInputChange('hen', e.target.value)}
                className="w-16 text-center"
                min="0"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => increment('hen')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Cocks */}
          <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
            <Bird className="h-8 w-8 text-red-500 mb-2" />
            <span className="text-sm font-medium mb-2">Cocks</span>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => decrement('cock')}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input 
                type="number" 
                value={counts.cock} 
                onChange={(e) => handleInputChange('cock', e.target.value)}
                className="w-16 text-center"
                min="0"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => increment('cock')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Children */}
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
            <Baby className="h-8 w-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium mb-2">Children</span>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => decrement('baby')}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input 
                type="number" 
                value={counts.baby} 
                onChange={(e) => handleInputChange('baby', e.target.value)}
                className="w-16 text-center"
                min="0"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => increment('baby')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
