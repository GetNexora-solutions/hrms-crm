import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/rbac'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LeaveRequestDialog } from './LeaveRequestDialog'

export default async function LeavesPage() {
  const employee = await getCurrentEmployee()
  const supabase = createClient()

  if (!employee) return null

  // Fetch Leave Types
  const { data: leaveTypes } = await supabase.from('leave_types').select('*')

  // Fetch User's Leave Requests
  const { data: myLeaves } = await supabase
    .from('leave_requests')
    .select(`*, leave_types(name)`)
    .eq('employee_id', employee.id)
    .order('created_at', { ascending: false })

  // If Admin/Manager, fetch pending leaves of others
  let pendingApprovals: any[] = []
  if (['super_admin', 'hr', 'md', 'admin', 'manager'].includes(employee.role)) {
    const { data: pending } = await supabase
      .from('leave_requests')
      .select(`*, employees(full_name, emp_id), leave_types(name)`)
      .eq('status', 'pending')
      .neq('employee_id', employee.id)
      .order('created_at', { ascending: false })
    pendingApprovals = pending || []
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Leave Management</h1>
          <p className="text-slate-400">Apply for leaves and view your leave history.</p>
        </div>
        <LeaveRequestDialog employeeId={employee.id} leaveTypes={leaveTypes || []} />
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Leave Type</TableHead>
                <TableHead className="text-slate-400">From</TableHead>
                <TableHead className="text-slate-400">To</TableHead>
                <TableHead className="text-slate-400">Days</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLeaves?.map((leave) => (
                <TableRow key={leave.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-300">{leave.leave_types?.name}</TableCell>
                  <TableCell className="text-slate-300">{new Date(leave.from_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-slate-300">{new Date(leave.to_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-slate-300">{leave.days}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        leave.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        leave.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }
                    >
                      {leave.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!myLeaves || myLeaves.length === 0) && (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={5} className="text-center text-slate-400 h-24">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pendingApprovals.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-400">Employee</TableHead>
                  <TableHead className="text-slate-400">Leave Type</TableHead>
                  <TableHead className="text-slate-400">Dates</TableHead>
                  <TableHead className="text-slate-400">Days</TableHead>
                  <TableHead className="text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((leave) => (
                  <TableRow key={leave.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium text-slate-300">
                      {leave.employees?.full_name} <br/>
                      <span className="text-xs text-slate-500">{leave.employees?.emp_id}</span>
                    </TableCell>
                    <TableCell className="text-slate-300">{leave.leave_types?.name}</TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-300">{leave.days}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-800">Pending Review</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
