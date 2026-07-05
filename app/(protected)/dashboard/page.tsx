import { getCurrentEmployee } from '@/lib/rbac'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, Clock, Calendar, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
  const employee = await getCurrentEmployee()
  const supabase = createClient()
  
  if (!employee) return null
  
  const today = new Date().toISOString().split('T')[0]

  // Employee specific stats
  const { data: myAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('date', today)
    .single()

  const { count: pendingLeaves } = await supabase
    .from('leave_requests')
    .select('*', { count: 'exact', head: true })
    .eq('employee_id', employee.id)
    .eq('status', 'pending')

  // Admin / HR stats
  let totalEmployees = 0
  let presentToday = 0
  let allPendingLeaves = 0
  
  if (['super_admin', 'hr', 'md', 'admin'].includes(employee.role)) {
    const { count: eCount } = await supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'active')
    totalEmployees = eCount || 0
    
    const { count: pCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'present')
    presentToday = pCount || 0
    
    const { count: lCount } = await supabase.from('leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    allPendingLeaves = lCount || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-slate-400">Overview of your HRMS platform.</p>
      </div>

      {['super_admin', 'hr', 'md', 'admin'].includes(employee.role) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalEmployees}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{presentToday}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{allPendingLeaves}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Absent Today</CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalEmployees - presentToday}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">My Status</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Today's Attendance</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">
                {myAttendance ? (
                  <span className="text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Checked In at {new Date(myAttendance.check_in).toLocaleTimeString()}
                  </span>
                ) : (
                  <span className="text-slate-400">Not Checked In</span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">My Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{pendingLeaves || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  )
}
