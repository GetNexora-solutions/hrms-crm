import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { JobDialog } from '@/components/recruitment/JobDialog'
import { JobApprovalActions } from '@/components/recruitment/JobApprovalActions'

import { getCurrentEmployee, hasPermission, ROLES } from '@/lib/rbac'

export default async function JobsPage() {
  const supabase = createClient()
  const employee = await getCurrentEmployee()
  const canCreateJob = employee ? hasPermission(employee.role, [ROLES.SUPER_ADMIN, ROLES.HR, ROLES.MD, ROLES.ADMIN, ROLES.RECRUITER, ROLES.MANAGER]) : false

  const { data: jobs } = await supabase.from('job_postings').select('*').order('created_at', { ascending: false })
  const { data: employees } = await supabase.from('employees').select('id, full_name, emp_id').order('full_name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Job Postings</h1>
          <p className="text-slate-400">Manage recruitment job listings.</p>
        </div>
        {canCreateJob && <JobDialog employees={employees || []} />}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Active Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Title</TableHead>
                <TableHead className="text-slate-400">Department</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Approval</TableHead>
                <TableHead className="text-slate-400 text-right">Filled</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs?.map((job) => (
                <TableRow key={job.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-white">{job.title}</TableCell>
                  <TableCell className="text-slate-300">{job.department || '-'}</TableCell>
                  <TableCell className="text-slate-300">{job.employment_type || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={job.status === 'Open' ? 'text-green-400 border-green-400' : 'text-slate-400 border-slate-400'}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      job.approval_status === 'Approved' ? 'text-green-400 border-green-400' : 
                      job.approval_status === 'Rejected' ? 'text-red-400 border-red-400' : 
                      'text-yellow-400 border-yellow-400'
                    }>
                      {job.approval_status || 'Approved'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-300">{job.filled_positions} / {job.vacancies || 0}</TableCell>
                  <TableCell className="text-right">
                    <JobApprovalActions job={job} employees={employees || []} userRole={employee?.role} employeeId={employee?.id} />
                  </TableCell>
                </TableRow>
              ))}
              {(!jobs || jobs.length === 0) && (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={5} className="h-32 text-center">
                    <EmptyState />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
