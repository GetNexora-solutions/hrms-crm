import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Briefcase, Mail, Phone, Building, Hash, Calendar, DollarSign, Landmark } from 'lucide-react'
import Link from 'next/link'

export default async function EmployeeProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  // 2. Get current user's employee record (to check role and company_id)
  const { data: currentEmployee } = await supabase
    .from('employees')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single()

  if (!currentEmployee) return notFound()

  // 3. Get target employee record
  const { data: targetEmployee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !targetEmployee) return notFound()

  // 4. Company boundary check
  if (targetEmployee.company_id !== currentEmployee.company_id) {
    return notFound()
  }

  // 5. Field level authorization check
  const isSuperAdmin = currentEmployee.role === 'super_admin'
  const isHR = currentEmployee.role === 'hr'
  const isSelf = targetEmployee.user_id === user.id

  const canViewFinancials = isSuperAdmin || isHR || isSelf

  // Date formatting
  const joinDate = new Date(targetEmployee.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <Button variant="outline" size="icon" className="bg-slate-900 border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{targetEmployee.full_name}</h1>
              <p className="text-slate-400 flex items-center gap-2 mt-1">
                <Hash className="h-4 w-4" /> {targetEmployee.emp_id}
              </p>
            </div>
            {canViewFinancials && (
              <Link href={`/employees/${targetEmployee.id}/edit`}>
                <Button variant="outline" className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white">
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Personal Info */}
        <div className="space-y-6 md:col-span-1">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Email Address</p>
                  <p className="text-white break-all">{targetEmployee.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Phone Number</p>
                  <p className="text-white">{targetEmployee.phone || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                  <p className="text-sm font-medium text-slate-400 mb-2">Status</p>
                  <Badge 
                    variant={targetEmployee.status === 'active' ? 'default' : 'secondary'}
                    className={targetEmployee.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-800 text-slate-300'}
                  >
                    {targetEmployee.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-2">System Role</p>
                  <Badge variant="outline" className="text-blue-400 border-blue-400 capitalize">
                    {targetEmployee.role.replace('_', ' ')}
                  </Badge>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Employment & Financial Info */}
        <div className="space-y-6 md:col-span-2">
          
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Employment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-400">Designation</p>
                    <p className="text-white">{targetEmployee.designation || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-400">Department</p>
                    <p className="text-white">{targetEmployee.department || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-400">Join Date</p>
                    <p className="text-white">{joinDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {canViewFinancials && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Financial Information</CardTitle>
                <CardDescription className="text-slate-400">Salary and banking details.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-400">Annual Salary</p>
                      <p className="text-white font-medium">
                        {targetEmployee.salary ? `$${targetEmployee.salary.toLocaleString()}` : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Landmark className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-400">Bank Name</p>
                      <p className="text-white">{targetEmployee.bank_name || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-400">Account Number</p>
                      <p className="text-white font-mono">{targetEmployee.bank_account || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-slate-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-400">IFSC / Routing</p>
                      <p className="text-white font-mono">{targetEmployee.bank_ifsc || 'Not specified'}</p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
