import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id?: string;
  name?: string;
  email: string;
  token?: string;
  expiry?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (password: string, token: string) => Promise<boolean>;
  resendActivationToken: (email: string) => Promise<boolean>;
  activateAccount: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check for stored auth on mount and validate token expiration
  useEffect(() => {
    const storedUser = localStorage.getItem('kuku_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Check if token has expired
        if (parsedUser.expiry && parsedUser.expiry * 1000 < Date.now()) {
          // Token has expired, log user out
          console.log('Token expired, logging out');
          localStorage.removeItem('kuku_user');
          setUser(null);
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('kuku_user');
      }
    }
    setLoading(false);
  }, []);
  
  // Periodically check token expiration
  useEffect(() => {
    if (!user || !user.expiry) return;
    
    const checkTokenExpiration = () => {
      if (user.expiry && user.expiry * 1000 < Date.now()) {
        // Token has expired, log user out
        toast({ 
          title: 'Session expired', 
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive'
        });
        logout();
      }
    };
    
    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    
    // Initial check
    checkTokenExpiration();
    
    return () => clearInterval(interval);
  }, [user]);

  const handleApiError = (error: any): string => {
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    return error.message || 'An error occurred';
  };

  const API_BASE_URL = 'http://localhost:5055/v1';

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      const userData = {
        email,
        name: data.name,
        token: data.token,
        expiry: data.expiry
      };
      
      setUser(userData);
      localStorage.setItem('kuku_user', JSON.stringify(userData));
      toast({ title: 'Success', description: 'Logged in successfully' });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: handleApiError(error), variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }
      
      toast({ 
        title: 'Success', 
        description: 'Account created successfully. Please check your email to activate your account.' 
      });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: handleApiError(error), variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kuku_user');
    navigate('/login');
    toast({ title: 'Logged out', description: 'You have been logged out successfully' });
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tokens/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to request password reset');
      }
      
      toast({ 
        title: 'Success', 
        description: 'Password reset instructions have been sent to your email.' 
      });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: handleApiError(error), variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (password: string, token: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/password/reset`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, token })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
      
      toast({ title: 'Success', description: 'Password has been reset successfully. Please log in.' });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: handleApiError(error), variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendActivationToken = async (email: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tokens/resend/activation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resend activation token');
      }
      
      toast({ 
        title: 'Success', 
        description: 'Activation link has been sent to your email.' 
      });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: handleApiError(error), variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = async (token: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/activate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to activate account');
      }
      
      toast({ title: 'Success', description: 'Your account has been activated successfully. Please log in.' });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: handleApiError(error), variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
    resendActivationToken,
    activateAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
