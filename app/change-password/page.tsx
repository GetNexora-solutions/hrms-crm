"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error("You must be logged in to access this page")
        router.push('/login')
      } else {
        setIsInitializing(false)
      }
    }
    checkSession()
  }, [router, supabase.auth])

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/[0-9]/.test(password)) return "Password must contain at least one number"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character"
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    const validationError = validatePassword(newPassword)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setLoading(true)
    
    try {
      // 1. Update password in Supabase Auth
      const { error: authError, data: authData } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (authError) {
        console.error("Auth update error:", authError)
        toast.error("Failed to update password securely. Please try again.")
        setLoading(false)
        return
      }

      // 2. Update is_temp_password flag in employees table
      const { error: empError } = await supabase
        .from('employees')
        .update({ is_temp_password: false })
        .eq('user_id', authData.user.id)

      if (empError) {
        console.error("Employee update error:", empError)
        toast.error("Failed to finalize account setup. Please contact support.")
        setLoading(false)
        return
      }

      toast.success("Password changed successfully!")
      router.push('/dashboard')
      
    } catch (error: unknown) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="rounded-full bg-blue-500/10 p-4">
            <Lock className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Secure Your Account</h1>
          <p className="text-sm text-slate-400">Please change your temporary password to continue</p>
        </div>

        <Card className="border-slate-800 bg-slate-900 shadow-xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-white">New Password</CardTitle>
              <CardDescription className="text-slate-400">
                Choose a strong password you haven&apos;t used before.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
