import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';

type InventoryChangeReason = 'purchase' | 'sale' | 'birth' | 'death' | 'gift' | 'other';

type InventoryHistoryEntry = {
  date: string;
  type: 'hen' | 'cock' | 'chicks';
  previousValue: number;
  newValue: number;
  change: number;
  reason: InventoryChangeReason;
  notes: string;
};

export function ChickenInventoryHistory() {
  const [filter, setFilter] = useState<{
    type: 'all' | 'hen' | 'cock' | 'chicks';
    reason: 'all' | InventoryChangeReason;
  }>({ type: 'all', reason: 'all' });

  // Load history from localStorage
  const inventoryHistory: InventoryHistoryEntry[] = JSON.parse(
    localStorage.getItem('chickenInventoryHistory') || '[]'
  );
  
  // Filter history based on selected filters
  const sortedHistory = [...inventoryHistory].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  const filteredHistory = sortedHistory.filter(entry => {
    if (filter.type !== 'all' && entry.type !== filter.type) return false;
    if (filter.reason !== 'all' && entry.reason !== filter.reason) return false;
    return true;
  });
  
  // Helper function to get badge class for displaying reason
  const getReasonBadgeClass = (reason: InventoryChangeReason): string => {
    return 'bg-gray-100 text-gray-700 py-1 px-2 rounded text-xs font-medium';
  };
  
  // Helper function to get subtle indicator for chicken type
  const getTypeIndicatorClass = (): string => {
    return 'font-medium text-gray-700';
  };
  
  // Helper function to format chicken type for display
  const formatChickenType = (type: 'hen' | 'cock' | 'chicks'): string => {
    switch (type) {
      case 'hen': return 'Hen';
      case 'cock': return 'Cock';
      case 'chicks': return 'Chicks';
      default: return type;
    }
  };

  return (
    <Card className="w-full overflow-hidden border border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50 border-b border-gray-200 pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">Inventory History</CardTitle>
        <CardDescription>Track all changes to your chicken inventory</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="space-y-2">
            <Label htmlFor="type-filter" className="text-sm font-medium text-gray-700">Filter by Type</Label>
            <Select
              value={filter.type}
              onValueChange={(value: 'all' | 'hen' | 'cock' | 'chicks') => 
                setFilter({...filter, type: value})
              }
            >
              <SelectTrigger id="type-filter" className="border-gray-200 bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hen">Hens</SelectItem>
                <SelectItem value="cock">Cocks</SelectItem>
                <SelectItem value="chicks">Chicks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason-filter" className="text-sm font-medium text-gray-700">Filter by Reason</Label>
            <Select
              value={filter.reason}
              onValueChange={(value: 'all' | InventoryChangeReason) => 
                setFilter({...filter, reason: value})
              }
            >
              <SelectTrigger id="reason-filter" className="border-gray-200 bg-white">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="birth">Birth</SelectItem>
                <SelectItem value="death">Death</SelectItem>
                <SelectItem value="gift">Gift</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* History Table */}
        {filteredHistory.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="whitespace-nowrap font-medium text-gray-700">Date</TableHead>
                  <TableHead className="whitespace-nowrap font-medium text-gray-700">Type</TableHead>
                  <TableHead className="whitespace-nowrap font-medium text-gray-700">Change</TableHead>
                  <TableHead className="whitespace-nowrap font-medium text-gray-700">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((entry, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 border-t border-gray-100">
                    <TableCell className="font-medium text-gray-700">
                      {format(new Date(entry.date), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className={getTypeIndicatorClass()}>
                      {formatChickenType(entry.type)}
                    </TableCell>
                    <TableCell>
                      <span className={entry.change > 0 ? 'text-gray-900 font-medium' : 'text-gray-900 font-medium'}>
                        {entry.change > 0 ? '+' : ''}{entry.change}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">
                        ({entry.previousValue} → {entry.newValue})
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getReasonBadgeClass(entry.reason)}>
                        {entry.reason.charAt(0).toUpperCase() + entry.reason.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-2">
              No history records found{filter.type !== 'all' || filter.reason !== 'all' ? ' matching your filters' : ''}.
            </p>
            {(filter.type !== 'all' || filter.reason !== 'all') && (
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
