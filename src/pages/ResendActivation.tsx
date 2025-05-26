import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ResendActivation() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resendActivationToken, loading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await resendActivationToken(email);
    if (success) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Resend Activation Link</CardTitle>
          <CardDescription>
            {!isSubmitted 
              ? "Enter your email to receive a new activation link" 
              : "We've sent you a new activation link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Activation Link'}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center text-gray-600">
                We've sent a new activation link to <strong>{email}</strong>. 
                Please check your email and click on the link to activate your account.
              </p>
              <p className="text-sm text-gray-500 text-center">
                If you don't see the email in your inbox, please check your spam folder.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full space-y-2">
            <div>
              <Link to="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
            {!isSubmitted && (
              <div>
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
