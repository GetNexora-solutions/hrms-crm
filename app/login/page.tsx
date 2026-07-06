"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Checking if employee exists and status
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('is_temp_password, status')
      .eq('user_id', data.user.id)
      .single()

    if (empError) {
      toast.error("Employee profile not found")
      setLoading(false)
      return
    }

    if (employee?.status === 'inactive') {
      await supabase.auth.signOut()
      toast.error("Your account has been deactivated. Please contact HR.")
      setLoading(false)
      return
    }

    if (employee?.is_temp_password) {
      router.push('/change-password')
    } else {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100 shadow-xl">
        <CardHeader className="space-y-1 items-center pb-6">
          <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">ABC HRMS</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email / Login ID</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m.scott@abccompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-slate-500">
          © {new Date().getFullYear()} ABC Company Pvt. Ltd.
        </CardFooter>
      </Card>
    </div>
  )
}
