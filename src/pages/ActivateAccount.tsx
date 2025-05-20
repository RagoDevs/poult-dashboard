import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isActivated, setIsActivated] = useState(false);
  const [error, setError] = useState('');
  const { activateAccount, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const performActivation = async () => {
      if (!token) {
        setError('No activation token provided');
        return;
      }

      const success = await activateAccount(token);
      if (success) {
        setIsActivated(true);
      } else {
        setError('Failed to activate account. The token may be invalid or expired.');
      }
    };

    performActivation();
  }, [token, activateAccount])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Account Activation</CardTitle>
          <CardDescription>
            {loading && "Verifying your account..."}
            {isActivated && "Your account has been activated successfully"}
            {error && "Failed to activate your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          {loading && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          {isActivated && (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
          {error && (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {loading ? (
            <p className="text-sm text-muted-foreground">Please wait while we verify your account...</p>
          ) : isActivated ? (
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          ) : (
            <div className="flex flex-col space-y-3 w-full items-center">
              <p className="text-sm text-muted-foreground text-center">
                {error || 'The activation link is invalid or has expired.'}
              </p>
              <Button asChild variant="outline">
                <Link to="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
