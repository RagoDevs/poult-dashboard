import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Check, X, Plus, Minus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Define reason types for inventory changes
type InventoryChangeReason = 'purchase' | 'sale' | 'birth' | 'death' | 'gift' | 'other';
type ChickenType = 'hen' | 'cock' | 'chicks';

type InventoryHistoryEntry = {
  date: string;
  type: ChickenType;
  previousValue: number;
  newValue: number;
  change: number;
  reason: InventoryChangeReason;
  notes: string;
};

interface ChickenInventoryProps {
  externalCounts?: {
    hen: number;
    cock: number;
    chicks: number;
  };
  onInventoryChange?: (newCounts: {
    hen: number;
    cock: number;
    chicks: number;
  }) => void;
}

export function ChickenInventory({ externalCounts, onInventoryChange }: ChickenInventoryProps = {}) {
  // State for edit dialog
  const [editDialog, setEditDialog] = useState({
    isOpen: false,
    type: '' as ChickenType,
    currentValue: 0,
    newValue: 0,
    reason: '' as InventoryChangeReason,
    notes: ''
  });
  
  // State for counts - use external counts if provided, otherwise use localStorage
  const [counts, setCountsInternal] = useState(() => {
    // If external counts are provided, use them
    if (externalCounts) {
      return externalCounts;
    }
    
    // Otherwise, load from localStorage
    const savedCounts = localStorage.getItem('chickenCounts');
    return savedCounts ? JSON.parse(savedCounts) : {
      hen: 0,
      cock: 0,
      chicks: 0
    };
  });
  
  // Update local state when external counts change
  useEffect(() => {
    if (externalCounts) {
      setCountsInternal(externalCounts);
    }
  }, [externalCounts]);
  
  // Wrapper for setCounts that also calls the onInventoryChange callback
  const setCounts = (newCounts: typeof counts) => {
    setCountsInternal(newCounts);
    
    // If onInventoryChange callback is provided, call it
    if (onInventoryChange) {
      onInventoryChange(newCounts);
    }
  };

  // Initialize inventory history
  const [inventoryHistory, setInventoryHistory] = useState(() => {
    const savedHistory = localStorage.getItem('chickenInventoryHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Calculate total count
  const totalCount = counts.hen + counts.cock + counts.chicks;
  
  // Function to open edit dialog
  const openEditDialog = (type: ChickenType) => {
    setEditDialog({
      isOpen: true,
      type,
      currentValue: counts[type],
      newValue: counts[type],
      reason: '' as InventoryChangeReason,
      notes: ''
    });
  };
  
  // Function to close edit dialog
  const closeEditDialog = () => {
    setEditDialog({
      ...editDialog,
      isOpen: false
    });
  };
  
  // Function to handle value change in the dialog
  const handleValueChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    const newValue = Math.max(0, numValue); // Prevent negative counts
    
    setEditDialog({
      ...editDialog,
      newValue
    });
  };
  
  // Function to apply confirmed value change
  const applyValueChange = () => {
    if (!editDialog.reason) return;
    
    const { type, currentValue, newValue, reason, notes } = editDialog;
    
    // Only proceed if there's an actual change
    if (newValue === currentValue) {
      closeEditDialog();
      return;
    }
    
    // Create a history entry
    const historyEntry: InventoryHistoryEntry = {
      date: new Date().toISOString(),
      type,
      previousValue: currentValue,
      newValue: Math.max(0, newValue),
      change: Math.max(0, newValue) - currentValue,
      reason,
      notes
    };
    
    // Update inventory history
    const updatedHistory = [...inventoryHistory, historyEntry];
    setInventoryHistory(updatedHistory);
    localStorage.setItem('chickenInventoryHistory', JSON.stringify(updatedHistory));
    
    // Update counts
    const newCounts = {
      ...counts,
      [type]: Math.max(0, newValue) // Prevent negative counts
    };
    
    setCounts(newCounts);
    localStorage.setItem('chickenCounts', JSON.stringify(newCounts));
    
    // Close the dialog
    closeEditDialog();
  };

  return (
    <>
      {/* Edit Dialog with Reason Selection */}
      <Dialog open={editDialog.isOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Update {editDialog.type ? editDialog.type.charAt(0).toUpperCase() + editDialog.type.slice(1) : ''} Count
            </DialogTitle>
            <DialogDescription>
              Enter the new count and provide a reason for the change.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-count">New Count</Label>
              <div className="flex items-center space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleValueChange((editDialog.newValue - 1).toString())}
                  disabled={editDialog.newValue <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="new-count"
                  type="number"
                  value={editDialog.newValue}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="text-center"
                  min="0"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleValueChange((editDialog.newValue + 1).toString())}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {editDialog.currentValue !== editDialog.newValue && (
                <p className="text-sm text-gray-500">
                  {editDialog.newValue > editDialog.currentValue ? 'Increase' : 'Decrease'} by: {Math.abs(editDialog.newValue - editDialog.currentValue)}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="change-reason">Reason for change</Label>
              <Select 
                value={editDialog.reason} 
                onValueChange={(value: InventoryChangeReason) => 
                  setEditDialog({...editDialog, reason: value})
                }
              >
                <SelectTrigger id="change-reason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="birth">Birth</SelectItem>
                  <SelectItem value="death">Death</SelectItem>
                  <SelectItem value="gift">Gift</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="change-notes">Notes (optional)</Label>
              <Input
                id="change-notes"
                value={editDialog.notes}
                onChange={(e) => setEditDialog({...editDialog, notes: e.target.value})}
                placeholder="Additional details about this change"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={closeEditDialog}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={applyValueChange}
              disabled={!editDialog.reason || editDialog.currentValue === editDialog.newValue}
            >
              <Check className="mr-2 h-4 w-4" />
              Save Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="w-full overflow-hidden border-0 shadow">
        <CardHeader className="bg-white pt-8 pb-4 px-8">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">Chicken Inventory</CardTitle>
              <CardDescription className="text-gray-500 mt-1">Track and manage your chicken population</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <div className="flex justify-center mb-8">
            <div className="flex items-center px-6 py-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Inventory</span>
                <span className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card Generator Function */}
            {[
              { type: 'hen', label: 'Hens', count: counts.hen },
              { type: 'cock', label: 'Cocks', count: counts.cock },
              { type: 'chicks', label: 'Chicks', count: counts.chicks }
            ].map((item, index) => (
              <div 
                key={item.type}
                className={cn(
                  "relative overflow-hidden rounded-2xl transition-all duration-300",
                  "hover:translate-y-[-4px] hover:shadow-xl",
                  "bg-white backdrop-blur-sm",
                  "border border-gray-200",
                  "flex flex-col"
                )}
                style={{
                  boxShadow: "rgba(17, 17, 26, 0.05) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px"
                }}
              >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full bg-gray-500 transform translate-x-10 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 opacity-5 rounded-full bg-gray-500 transform -translate-x-8 translate-y-8"></div>
                
                {/* Content area */}
                <div className="p-6 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 mb-6">
                    <div className="text-5xl font-bold text-gray-900">{item.count}</div>
                    <div className="mt-1 text-sm text-gray-500">{item.count === 1 ? 'bird' : 'birds'}</div>
                  </div>
                </div>
                
                {/* Button area with subtle separation */}
                <div className="px-6 pb-6">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all duration-200" 
                    onClick={() => openEditDialog(item.type as ChickenType)}
                  >
                    <Edit className="h-4 w-4 mr-2 text-gray-500" /> Update Count
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
