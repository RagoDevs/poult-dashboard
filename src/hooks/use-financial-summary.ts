import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/utils/config';

interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  total_profit: number;
}

export function useFinancialSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const API_BASE_URL = API_URL;
  
  const fetchFinancialSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    if (!user?.token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/financial-summary`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch financial summary: ${response.status}`);
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_BASE_URL]);

  // We're not automatically fetching on mount anymore to prevent duplicate calls
  // The parent component will call fetchFinancialSummary when needed
  
  return { 
    summary, 
    loading,
    error,
    fetchFinancialSummary
  };
}
