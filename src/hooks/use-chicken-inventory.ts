import { useState, useEffect } from 'react';
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

export function useChickenInventory() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<ChickenCounts>({ hen: 0, cock: 0, chicks: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const API_BASE_URL = 'http://localhost:5055/v1';
  
  const fetchChickenInventory = async () => {
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
  };
  
  const updateChickenInventory = async (type: ChickenType, newQuantity: number, reason: string = 'other') => {
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
      
      // No need to fetch again if we've already calculated the new state
      // await fetchChickenInventory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.token) {
      fetchChickenInventory();
    }
  }, [user]);
  
  return { counts, loading, error, fetchChickenInventory, updateChickenInventory };
}
