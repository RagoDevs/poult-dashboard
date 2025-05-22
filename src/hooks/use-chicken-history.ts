import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChickenType, ChickenHistoryEntry } from './use-chicken-inventory';

export function useChickenHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ChickenHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_BASE_URL = 'http://localhost:5055/v1';
  
  const fetchChickenHistory = useCallback(async (type?: ChickenType, reason?: string) => {
    setLoading(true);
    setError(null);
    
    if (!user?.token) {
      setError('Authentication required');
      setLoading(false);
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
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_BASE_URL]);

  useEffect(() => {
    if (user?.token) {
      fetchChickenHistory();
    }
  }, [user?.token, fetchChickenHistory]);
  
  return { 
    history,
    loading,
    error,
    fetchChickenHistory
  };
}
