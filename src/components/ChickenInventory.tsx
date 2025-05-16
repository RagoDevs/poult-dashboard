import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bird, Edit, Plus, Minus, Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Chicken Inventory</CardTitle>
              <CardDescription>Track your chicken population</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">Total Chickens: {totalCount}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hens */}
            <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
              <div className="bg-amber-100 p-2 rounded-full mb-2">
                <Bird className="h-8 w-8 text-amber-500" />
              </div>
              <span className="text-base font-medium mb-2 text-amber-700">Hens</span>
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className="text-2xl font-bold text-amber-700">{counts.hen}</div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="mt-2" 
                onClick={() => openEditDialog('hen')}
                title="Update hen count"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Cocks */}
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
              <div className="bg-red-100 p-2 rounded-full mb-2">
                <Bird className="h-8 w-8 text-red-500" />
              </div>
              <span className="text-base font-medium mb-2 text-red-700">Cocks</span>
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className="text-2xl font-bold text-red-700">{counts.cock}</div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="mt-2" 
                onClick={() => openEditDialog('cock')}
                title="Update cock count"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Chicks */}
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
              <div className="bg-purple-100 p-2 rounded-full mb-2">
                <Bird className="h-8 w-8 text-purple-500" />
              </div>
              <span className="text-base font-medium mb-2 text-purple-700">Chicks</span>
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className="text-2xl font-bold text-purple-700">{counts.chicks}</div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="mt-2" 
                onClick={() => openEditDialog('chicks')}
                title="Update chicks count"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
