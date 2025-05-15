import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bird, Save, X, AlertCircle, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ChickenInventory() {
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: '' as 'hen' | 'cock' | 'chicks',
    currentValue: 0,
    newValue: 0
  });
  
  // State for unsaved changes
  const [unsavedCounts, setUnsavedCounts] = useState({
    hen: 0,
    cock: 0,
    chicks: 0
  });
  
  // Initialize counts from localStorage or default to 0
  const [counts, setCounts] = useState(() => {
    const savedCounts = localStorage.getItem('chickenCounts');
    const initialCounts = savedCounts ? JSON.parse(savedCounts) : {
      hen: 0,
      cock: 0,
      chicks: 0
    };
    setUnsavedCounts(initialCounts);
    return initialCounts;
  });

  // Calculate total count
  const totalCount = counts.hen + counts.cock + counts.chicks;
  const unsavedTotalCount = unsavedCounts.hen + unsavedCounts.cock + unsavedCounts.chicks;
  
  // Function to open confirmation dialog for value changes
  const openConfirmDialog = (type: 'hen' | 'cock' | 'chicks', newValue: number) => {
    if (newValue === unsavedCounts[type]) return; // No change, no need for confirmation
    
    setConfirmDialog({
      isOpen: true,
      type,
      currentValue: unsavedCounts[type],
      newValue: newValue
    });
  };
  
  // Function to close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      ...confirmDialog,
      isOpen: false
    });
  };
  
  // Function to apply confirmed value change
  const applyValueChange = (type: 'hen' | 'cock' | 'chicks', newValue: number) => {
    if (!editMode) return;
    
    setUnsavedCounts(prev => ({
      ...prev,
      [type]: Math.max(0, newValue) // Prevent negative counts
    }));
  };

  const handleInputChange = (type: 'hen' | 'cock' | 'chicks', value: string) => {
    if (!editMode) return;
    
    const numValue = parseInt(value) || 0;
    const newValue = Math.max(0, numValue); // Prevent negative counts
    
    // Apply all changes directly without confirmation
    applyValueChange(type, newValue);
  };
  
  // Function to save changes
  const saveChanges = () => {
    setCounts(unsavedCounts);
    localStorage.setItem('chickenCounts', JSON.stringify(unsavedCounts));
    setEditMode(false);
  };
  
  // Function to cancel changes
  const cancelChanges = () => {
    setUnsavedCounts(counts);
    setEditMode(false);
  };

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={closeConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirm Change
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to change the number of {confirmDialog.type}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Current value: {confirmDialog.currentValue}</p>
              <p className="text-sm text-gray-500">New value: {confirmDialog.newValue}</p>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={closeConfirmDialog}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={() => {
                applyValueChange(confirmDialog.type, confirmDialog.newValue);
                closeConfirmDialog();
              }}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="col-span-2 md:col-span-4 shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-2 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg sm:text-xl">Chicken Inventory</CardTitle>
              <CardDescription>Manually track your chicken counts</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-mode" className="text-sm font-medium">
                Edit Mode
              </Label>
              <Switch 
                id="edit-mode" 
                checked={editMode} 
                onCheckedChange={setEditMode} 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Chicken Count Card */}
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-lg font-bold text-blue-600">Chicken Count</span>
              </div>
              <div className="text-3xl font-bold mb-2 text-blue-600">{editMode ? unsavedTotalCount : totalCount}</div>
              <div className="flex flex-col items-center text-sm text-gray-600 space-y-1">
                <div className="text-center mt-2">
                  <span>Total chickens in your farm</span>
                </div>
                {editMode && totalCount !== unsavedTotalCount && (
                  <div className="text-xs text-amber-600 font-medium mt-1">
                    Unsaved changes
                  </div>
                )}
              </div>
            </div>
            
            {/* Hens */}
            <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
              <div className="bg-amber-100 p-2 rounded-full mb-2">
                <Bird className="h-8 w-8 text-amber-500" />
              </div>
              <span className="text-base font-medium mb-2 text-amber-700">Hens</span>
              <div className="flex flex-col items-center gap-2 mb-2">
                <Label htmlFor="hen-count" className="text-xs text-amber-700">Enter count:</Label>
                <Input 
                  id="hen-count"
                  type="number" 
                  value={editMode ? unsavedCounts.hen : counts.hen} 
                  onChange={(e) => handleInputChange('hen', e.target.value)}
                  className="w-24 text-center font-bold text-amber-700 border-amber-200 focus-visible:ring-amber-300"
                  min="0"
                  disabled={!editMode}
                />
              </div>
              {editMode && counts.hen !== unsavedCounts.hen && (
                <div className="text-xs text-amber-600 font-medium">
                  {counts.hen > unsavedCounts.hen ? 'Decreased' : 'Increased'} by {Math.abs(counts.hen - unsavedCounts.hen)}
                </div>
              )}
            </div>
            
            {/* Cocks */}
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
              <div className="bg-red-100 p-2 rounded-full mb-2">
                <Bird className="h-8 w-8 text-red-500" />
              </div>
              <span className="text-base font-medium mb-2 text-red-700">Cocks</span>
              <div className="flex flex-col items-center gap-2 mb-2">
                <Label htmlFor="cock-count" className="text-xs text-red-700">Enter count:</Label>
                <Input 
                  id="cock-count"
                  type="number" 
                  value={editMode ? unsavedCounts.cock : counts.cock} 
                  onChange={(e) => handleInputChange('cock', e.target.value)}
                  className="w-24 text-center font-bold text-red-700 border-red-200 focus-visible:ring-red-300"
                  min="0"
                  disabled={!editMode}
                />
              </div>
              {editMode && counts.cock !== unsavedCounts.cock && (
                <div className="text-xs text-red-600 font-medium">
                  {counts.cock > unsavedCounts.cock ? 'Decreased' : 'Increased'} by {Math.abs(counts.cock - unsavedCounts.cock)}
                </div>
              )}
            </div>
            
            {/* Chicks */}
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg shadow-sm hover:shadow transition-shadow duration-200">
              <div className="bg-purple-100 p-2 rounded-full mb-2">
                <Bird className="h-8 w-8 text-purple-500" />
              </div>
              <span className="text-base font-medium mb-2 text-purple-700">Chicks</span>
              <div className="flex flex-col items-center gap-2 mb-2">
                <Label htmlFor="chicks-count" className="text-xs text-purple-700">Enter count:</Label>
                <Input 
                  id="chicks-count"
                  type="number" 
                  value={editMode ? unsavedCounts.chicks : counts.chicks} 
                  onChange={(e) => handleInputChange('chicks', e.target.value)}
                  className="w-24 text-center font-bold text-purple-700 border-purple-200 focus-visible:ring-purple-300"
                  min="0"
                  disabled={!editMode}
                />
              </div>
              {editMode && counts.chicks !== unsavedCounts.chicks && (
                <div className="text-xs text-purple-600 font-medium">
                  {counts.chicks > unsavedCounts.chicks ? 'Decreased' : 'Increased'} by {Math.abs(counts.chicks - unsavedCounts.chicks)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        {editMode && (
          <CardFooter className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={cancelChanges}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={saveChanges}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
