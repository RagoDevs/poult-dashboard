import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitted(true)
      toast({
        title: 'Success',
        description: 'If an account exists with this email, you will receive a reset link.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            {!submitted
              ? "Enter your email and we'll send you a link to reset your password"
              : "Check your email for a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!submitted ? (
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                We've sent an email to <strong>{email}</strong> with a link to reset your password.
                Please check your inbox and spam folder.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSubmitted(false)}
              >
                Try another email
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-center w-full">
            <Link to="/login" className="inline-flex items-center text-primary hover:underline">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
