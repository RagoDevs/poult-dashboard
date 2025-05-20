import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ActivateAccount() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [activationState, setActivationState] = useState<'loading' | 'success' | 'error'>('loading')
  const { toast } = useToast()

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setActivationState('error')
        return
      }

      try {
        // Mock API call - replace with actual verification API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Simulate successful verification (in a real app, this would check the token validity)
        const isValidToken = token.length > 10
        
        if (isValidToken) {
          setActivationState('success')
          toast({
            title: 'Success',
            description: 'Your account has been activated successfully!',
          })
        } else {
          setActivationState('error')
          toast({
            title: 'Error',
            description: 'Invalid or expired activation token',
            variant: 'destructive',
          })
        }
      } catch (error) {
        setActivationState('error')
        toast({
          title: 'Error',
          description: 'Failed to activate your account. Please try again.',
          variant: 'destructive',
        })
      }
    }

    verifyToken()
  }, [token, toast])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Account Activation</CardTitle>
          <CardDescription>
            {activationState === 'loading' && "Verifying your account..."}
            {activationState === 'success' && "Your account has been activated successfully"}
            {activationState === 'error' && "Failed to activate your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          {activationState === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          {activationState === 'success' && (
            <CheckCircle className="h-16 w-16 text-green-500" />
          )}
          {activationState === 'error' && (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {activationState === 'loading' ? (
            <p className="text-sm text-muted-foreground">Please wait while we verify your account...</p>
          ) : activationState === 'success' ? (
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          ) : (
            <div className="flex flex-col space-y-3 w-full items-center">
              <p className="text-sm text-muted-foreground text-center">
                The activation link is invalid or has expired.
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
