import { getCurrentEmployee } from '@/lib/rbac'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User, Mail, Briefcase, Building2, BadgeCheck, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function ProfilePage() {
  const employeeData = await getCurrentEmployee()
  const supabase = createClient()

  if (!employeeData) return null

  // Fetch full employee details including company name
  const { data: employee } = await supabase
    .from('employees')
    .select('*, companies(name)')
    .eq('id', employeeData.id)
    .single()

  if (!employee) return null

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="text-slate-400">View your personal and professional details.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
              <User className="h-10 w-10 text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                {employee.full_name}
                <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {employee.role}
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400 mt-1 flex items-center gap-1">
                <Hash className="h-4 w-4" /> {employee.emp_id}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </p>
              <p className="text-slate-200 font-medium">{employee.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Department
              </p>
              <p className="text-slate-200 font-medium">{employee.department || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <BadgeCheck className="h-4 w-4" /> Designation
              </p>
              <p className="text-slate-200 font-medium">{employee.designation || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Company
              </p>
              <p className="text-slate-200 font-medium">{employee.companies?.name || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
