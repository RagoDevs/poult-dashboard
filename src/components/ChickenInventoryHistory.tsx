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

  const [searchTerm, setSearchTerm] = useState('');
  
  // Load history from localStorage
  const inventoryHistory: InventoryHistoryEntry[] = JSON.parse(
    localStorage.getItem('chickenInventoryHistory') || '[]'
  );
  
  // Sort history by date (newest first)
  const sortedHistory = [...inventoryHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Apply filters
  const filteredHistory = sortedHistory.filter(entry => {
    // Filter by type
    if (filter.type !== 'all' && entry.type !== filter.type) return false;
    
    // Filter by reason
    if (filter.reason !== 'all' && entry.reason !== filter.reason) return false;
    
    // Filter by search term (in notes)
    if (searchTerm && !entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });
  
  // Helper function to get color class based on reason
  const getReasonColorClass = (reason: InventoryChangeReason): string => {
    switch (reason) {
      case 'purchase': return 'text-blue-600';
      case 'sale': return 'text-purple-600';
      case 'birth': return 'text-green-600';
      case 'death': return 'text-red-600';
      case 'gift': return 'text-green-400';
      case 'other': return 'text-gray-600';
      default: return '';
    }
  };
  
  // Helper function to get color class based on chicken type
  const getTypeColorClass = (type: 'hen' | 'cock' | 'chicks'): string => {
    switch (type) {
      case 'hen': return 'text-amber-700';
      case 'cock': return 'text-red-700';
      case 'chicks': return 'text-purple-700';
      default: return '';
    }
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Inventory History</CardTitle>
        <CardDescription>Track all changes to your chicken inventory</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="space-y-2 flex-1">
            <Label htmlFor="type-filter">Filter by Type</Label>
            <Select
              value={filter.type}
              onValueChange={(value: 'all' | 'hen' | 'cock' | 'chicks') => 
                setFilter({...filter, type: value})
              }
            >
              <SelectTrigger id="type-filter">
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
          
          <div className="space-y-2 flex-1">
            <Label htmlFor="reason-filter">Filter by Reason</Label>
            <Select
              value={filter.reason}
              onValueChange={(value: 'all' | InventoryChangeReason) => 
                setFilter({...filter, reason: value})
              }
            >
              <SelectTrigger id="reason-filter">
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
          
          <div className="space-y-2 flex-1">
            <Label htmlFor="search-notes">Search Notes</Label>
            <Input
              id="search-notes"
              placeholder="Search in notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* History Table */}
        {filteredHistory.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {format(new Date(entry.date), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className={getTypeColorClass(entry.type)}>
                      {formatChickenType(entry.type)}
                    </TableCell>
                    <TableCell>
                      <span className={entry.change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {entry.change > 0 ? '+' : ''}{entry.change}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">
                        ({entry.previousValue} → {entry.newValue})
                      </span>
                    </TableCell>
                    <TableCell className={getReasonColorClass(entry.reason)}>
                      {entry.reason.charAt(0).toUpperCase() + entry.reason.slice(1)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No history records found{searchTerm || filter.type !== 'all' || filter.reason !== 'all' ? ' matching your filters' : ''}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
