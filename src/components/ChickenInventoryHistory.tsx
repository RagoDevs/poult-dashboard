import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { useChickenInventory, ChickenType, ChickenHistoryEntry } from "@/hooks/use-chicken-inventory";
import { RefreshCcw } from "lucide-react";

interface ChickenInventoryHistoryProps {
  history: ChickenHistoryEntry[];
  isLoading: boolean;
  error: string | null;
}

export function ChickenInventoryHistory({ history: propHistory, isLoading: propIsLoading, error: propError }: ChickenInventoryHistoryProps) {
  const {
    history: internalHookHistory,
    historyLoading: internalHookLoading,
    historyError: internalHookError,
    fetchChickenHistory
  } = useChickenInventory();
  
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
  
  // Determine which history to display: propHistory (initial/full) or localFilteredHistory (if filters applied)
  // For now, let's prioritize propHistory if available, otherwise localFilteredHistory if filters have been used.
  // A more robust solution might involve combining or always using one source.
  // Let's assume propHistory is the primary source and local filtering is client-side for now, or the hook's fetch is for specific filtered views.

  // If internalHookHistory has items (meaning a filter fetch was done by this component), use it.
  // Otherwise, use propHistory (passed from parent, representing initial full load or parent-driven updates).
  const activeHistorySource = internalHookHistory && internalHookHistory.length > 0 ? internalHookHistory : propHistory;

  // Sort history by date (newest first)
  const sortedHistory = [...(activeHistorySource || [])].sort((a, b) => {
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
            disabled={internalHookLoading} // Use internal hook's loading state for its own actions
            className="text-gray-700"
          >
            <RefreshCcw className={`h-4 w-4 mr-1 ${internalHookLoading ? 'animate-spin' : ''}`} />
            {internalHookLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
        
        {/* History Table */}
        {/* Display error from props (initial load) or internal hook error */}
        {(propError || internalHookError) && (
          <div className="text-center py-4 text-red-500">
            Error: {propError || internalHookError}
          </div>
        )}

        {/* Display loading from props (initial load) or internal hook loading */}
        {/* Show loading if propIsLoading (parent is loading) OR internalHookLoading (this component is loading via filter/refresh) */} 
        {/* AND there's no data yet to display and no errors. */}
        {(propIsLoading || internalHookLoading) && (!activeHistorySource || activeHistorySource.length === 0) && !(propError || internalHookError) && (
           <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-2">Loading chicken history...</p>
          </div>
        )}

        {/* Show table if NOT loading (neither parent nor internal) AND there is data AND no errors */}
        {!propIsLoading && !internalHookLoading && activeHistorySource && activeHistorySource.length > 0 && !(propError || internalHookError) ? (
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
          // This block is for when NOT loading (neither parent nor internal), no errors, AND activeHistorySource is empty or null
          !propIsLoading && !internalHookLoading && !(propError || internalHookError) && (!activeHistorySource || activeHistorySource.length === 0) && (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-500 mb-2">
                No history records found{filter.type !== 'all' || filter.reason !== 'all' ? ' for the current filters' : ''}.
              </p>
              {(filter.type !== 'all' || filter.reason !== 'all') && (
                <p className="text-sm text-gray-400">Try adjusting your filters or click Refresh.</p>
              )}
              {filter.type === 'all' && filter.reason === 'all' && (
                 <p className="text-sm text-gray-400">Click Refresh to try loading again.</p>
              )}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
