import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Check, X, Plus, Minus, RefreshCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChickenInventory, ChickenType, ChickenCounts } from "@/hooks/use-chicken-inventory";

type InventoryChangeReason = 'birth' | 'death' | 'gift' | 'other';

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
  onInventoryChange?: (newCounts: {
    hen: number;
    cock: number;
    chicks: number;
  }) => void;
}

export function ChickenInventory({ onInventoryChange }: ChickenInventoryProps = {}) {
  const { counts: apiCounts, loading, error, fetchChickenInventory, updateChickenInventory } = useChickenInventory();
  const [editDialog, setEditDialog] = useState({
    isOpen: false,
    type: '' as ChickenType,
    currentValue: 0,
    newValue: 0,
    reason: '' as InventoryChangeReason
  });
  
  const totalCount = apiCounts?.hen + apiCounts?.cock + apiCounts?.chicks || 0;
  
  const handleInventoryChange = async (type: ChickenType, newValue: number, reason: InventoryChangeReason = 'other') => {
    // Always update via API first
    await updateChickenInventory(type, newValue, reason);
    
    // Then notify parent component if callback is provided
    if (onInventoryChange) {
      onInventoryChange({...apiCounts, [type]: newValue});
    }
  };

  const openEditDialog = (type: ChickenType) => {
    setEditDialog({
      isOpen: true,
      type,
      currentValue: apiCounts?.[type] || 0,
      newValue: apiCounts?.[type] || 0,
      reason: '' as InventoryChangeReason
    });
  };
  
  const closeEditDialog = () => {
    setEditDialog({...editDialog, isOpen: false});
  };
  
  const handleValueChange = (value: string) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    setEditDialog({...editDialog, newValue});
  };
  
  const applyValueChange = async () => {
    if (!editDialog.reason) return;
    
    const { type, currentValue, newValue, reason } = editDialog;
    
    if (newValue === currentValue) {
      closeEditDialog();
      return;
    }
    const historyEntry: InventoryHistoryEntry = {
      date: new Date().toISOString(),
      type,
      previousValue: currentValue,
      newValue,
      change: newValue - currentValue,
      reason,
      notes: ''
    };
    
    try {
      await handleInventoryChange(type, newValue, reason);
    } catch (error) {
      console.error('Failed to update chicken inventory:', error);
    }
    closeEditDialog();
  };

  return (
    <>
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update {editDialog.type.charAt(0).toUpperCase() + editDialog.type.slice(1)} Count</DialogTitle>
            <DialogDescription>Change the number of {editDialog.type} in your inventory.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-value" className="text-right">Current</Label>
              <Input id="current-value" value={editDialog.currentValue} className="col-span-3" disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-value" className="text-right">New Value</Label>
              <div className="flex items-center col-span-3">
                <Button type="button" variant="outline" size="icon" onClick={() => handleValueChange(Math.max(0, editDialog.newValue - 1).toString())}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input id="new-value" type="number" value={editDialog.newValue} onChange={(e) => handleValueChange(e.target.value)} className="text-center" min="0" />
                <Button type="button" variant="outline" size="icon" onClick={() => handleValueChange((editDialog.newValue + 1).toString())}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="change-reason">Reason for Change</Label>
              <Select value={editDialog.reason} onValueChange={(value) => setEditDialog({...editDialog, reason: value as InventoryChangeReason})}>
                <SelectTrigger id="change-reason"><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="birth">Birth</SelectItem>
                  <SelectItem value="death">Death</SelectItem>
                  <SelectItem value="gift">Gift</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={closeEditDialog}><X className="mr-2 h-4 w-4" />Cancel</Button>
            <Button onClick={applyValueChange} disabled={!editDialog.reason || editDialog.currentValue === editDialog.newValue}><Check className="mr-2 h-4 w-4" />Save Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="w-full overflow-hidden border border-gray-100 shadow-sm">
        <CardContent className="p-4">
          <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500">Total Chickens</div>
            <div className="text-xl font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">{totalCount}</div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            {error && <div className="text-red-500 text-sm">Error loading chicken inventory: {error}</div>}
            <Button variant="outline" size="sm" onClick={() => fetchChickenInventory()} disabled={loading} className="ml-auto text-gray-700">
              <RefreshCcw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: 'hen', label: 'Hens', count: apiCounts?.hen },
              { type: 'cock', label: 'Cocks', count: apiCounts?.cock },
              { type: 'chicks', label: 'Chicks', count: apiCounts?.chicks }
            ].map((item) => (
              <div key={item.type} className="border border-gray-200 rounded-lg bg-white overflow-hidden hover:shadow-sm transition-shadow">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-medium text-gray-900">{item.label}</h3>
                    <div className="text-3xl font-bold text-gray-900 ml-2">{loading ? '...' : item.count}</div>
                  </div>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="w-full border-gray-200 hover:bg-gray-50 text-gray-700 text-xs py-1" onClick={() => openEditDialog(item.type as ChickenType)} disabled={loading}>
                      <Edit className="h-3 w-3 mr-1" /> Update Count
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
