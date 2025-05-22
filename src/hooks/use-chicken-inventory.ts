import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type ChickenType = 'hen' | 'cock' | 'chicks';

interface ChickenData {
  id: string;
  type: ChickenType;
  quantity: number;
  updated_at: string;
}

export interface ChickenCounts {
  hen: number;
  cock: number;
  chicks: number;
}

export interface ChickenHistoryEntry {
  id: string;
  chicken_type: ChickenType;
  quantity_change: number;
  reason: string;
  created_at: string;
}

export function useChickenInventory() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ChickenCounts>({ hen: 0, cock: 0, chicks: 0 });
  const [history, setHistory] = useState<ChickenHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
  const API_BASE_URL = 'http://localhost:5055/v1';
  
  const fetchChickenInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    if (!user?.token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/chickens`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chicken inventory: ${response.status}`);
      }
      
      const data: ChickenData[] = await response.json();
      const newCounts: ChickenCounts = { hen: 0, cock: 0, chicks: 0 };
      
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.type === 'hen' || item.type === 'cock' || item.type === 'chicks') {
            newCounts[item.type] = typeof item.quantity === 'number' ? item.quantity : 0;
          }
        });
      }
      
      setCounts({...newCounts});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_BASE_URL]); // End of fetchChickenInventory

  const updateChickenInventory = useCallback(async (type: ChickenType, newQuantity: number, reason: string = 'other') => {
    setLoading(true);
    setError(null);
    
    if (!user?.token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/chickens`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chicken inventory: ${response.status}`);
      }
      
      const data: ChickenData[] = await response.json();
      const chickenToUpdate = data.find(chicken => chicken.type === type);
      
      if (!chickenToUpdate) {
        throw new Error(`Chicken type ${type} not found`);
      }
      
      // Calculate the change (difference between new and current quantity)
      const currentQuantity = chickenToUpdate.quantity;
      const quantityChange = newQuantity - currentQuantity;
      
      // Only send the update if there's an actual change
      if (quantityChange !== 0) {
        const updateResponse = await fetch(`${API_BASE_URL}/auth/chickens/${chickenToUpdate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ quantity: quantityChange, reason })
        });
        
        if (!updateResponse.ok) {
          throw new Error(`Failed to update chicken inventory: ${updateResponse.status}`);
        }
      }
      
      // Update local state with the new quantity
      setCounts(prev => ({ ...prev, [type]: newQuantity }));
      
      // Refetch the inventory to ensure consistency
      await fetchChickenInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_BASE_URL]); // End of updateChickenInventory

  const fetchChickenHistory = useCallback(async (type?: ChickenType, reason?: string) => {
    setHistoryLoading(true);
    setHistoryError(null);
    
    if (!user?.token) {
      setHistoryError('Authentication required');
      setHistoryLoading(false);
      return;
    }
    
    try {
      // Build the URL with optional query parameters
      let url = `${API_BASE_URL}/auth/chicken-history`;
      const params = new URLSearchParams();
      
      if (type) {
        params.append('type', type);
      }
      
      if (reason) {
        params.append('reason', reason);
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chicken history: ${response.status}`);
      }
      
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.token, API_BASE_URL]);

  useEffect(() => {
    if (user?.token) {
      fetchChickenInventory();
    }
  }, [user?.token, fetchChickenInventory]);
  
  return { 
    counts, 
    history,
    loading, 
    historyLoading,
    error, 
    historyError,
    fetchChickenInventory, 
    fetchChickenHistory,
    updateChickenInventory 
  };
}
