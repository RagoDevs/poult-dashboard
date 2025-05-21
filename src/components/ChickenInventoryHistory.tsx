import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { useChickenInventory, ChickenType, ChickenHistoryEntry } from "@/hooks/use-chicken-inventory";
import { RefreshCcw } from "lucide-react";

export function ChickenInventoryHistory() {
  const { history, historyLoading, historyError, fetchChickenHistory } = useChickenInventory();
  
  const [filter, setFilter] = useState<{
    type: 'all' | ChickenType;
    reason: 'all' | string;
  }>({ type: 'all', reason: 'all' });

  // Fetch history when component mounts or filter changes
  useEffect(() => {
    const fetchHistory = async () => {
      // Only pass type and reason to API if they're not 'all'
      const typeParam = filter.type !== 'all' ? filter.type : undefined;
      const reasonParam = filter.reason !== 'all' ? filter.reason : undefined;
      await fetchChickenHistory(typeParam, reasonParam);
    };
    
    fetchHistory();
    // Don't include fetchChickenHistory in dependencies to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.type, filter.reason]);
  
  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  // Helper function to get badge class for displaying reason
  const getReasonBadgeClass = (reason: string): string => {
    return 'bg-gray-100 text-gray-700 py-1 px-2 rounded text-xs font-medium';
  };
  
  // Helper function to get subtle indicator for chicken type
  const getTypeIndicatorClass = (): string => {
    return 'font-medium text-gray-700';
  };
  
  // Helper function to format chicken type for display
  const formatChickenType = (type: ChickenType): string => {
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
        <CardTitle className="text-xl font-bold text-gray-900">Chicken History</CardTitle>
        <CardDescription>Track all changes to your chicken flock</CardDescription>
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
              onValueChange={(value: 'all' | string) => 
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
        
        {/* Refresh Button */}
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchChickenHistory(filter.type !== 'all' ? filter.type as ChickenType : undefined, filter.reason !== 'all' ? filter.reason : undefined)} 
            disabled={historyLoading}
            className="text-gray-700"
          >
            <RefreshCcw className={`h-4 w-4 mr-1 ${historyLoading ? 'animate-spin' : ''}`} />
            {historyLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {/* History Table */}
        {sortedHistory.length > 0 ? (
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
                {sortedHistory.map((entry, index) => (
                  <TableRow key={entry.id || index} className="hover:bg-gray-50 border-t border-gray-100">
                    <TableCell className="font-medium text-gray-700">
                      {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className={getTypeIndicatorClass()}>
                      {formatChickenType(entry.chicken_type)}
                    </TableCell>
                    <TableCell>
                      <span className={entry.quantity_change > 0 ? 'text-gray-900 font-medium' : 'text-gray-900 font-medium'}>
                        {entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change}
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
            {historyLoading ? (
              <p className="text-gray-500 mb-2">Loading chicken history...</p>
            ) : historyError ? (
              <p className="text-red-500 mb-2">Error: {historyError}</p>
            ) : (
              <>
                <p className="text-gray-500 mb-2">
                  No history records found{filter.type !== 'all' || filter.reason !== 'all' ? ' matching your filters' : ''}.
                </p>
                {(filter.type !== 'all' || filter.reason !== 'all') && (
                  <p className="text-sm text-gray-400">Try adjusting your filters</p>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
