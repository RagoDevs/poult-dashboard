import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }
    
    if (!token) {
      toast({
        title: 'Error',
        description: 'Invalid reset token',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)

    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResetComplete(true)
      toast({
        title: 'Success',
        description: 'Your password has been reset successfully!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Invalid Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="text-sm text-center w-full">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Request a new password reset link
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {resetComplete ? 'Password Reset Complete' : 'Reset Your Password'}
          </CardTitle>
          <CardDescription>
            {resetComplete
              ? 'Your password has been reset successfully'
              : 'Create a new password for your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resetComplete ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting password...' : 'Reset password'}
              </Button>
            </form>
          ) : (
            <Button
              asChild
              className="w-full"
            >
              <Link to="/login">Go to login</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
