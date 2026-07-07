import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/rbac'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'
import { GeneratePayrollButton } from './GeneratePayrollButton'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default async function PayrollPage() {
  const employee = await getCurrentEmployee()
  const supabase = createClient()

  if (!employee) return null

  // Fetch Payroll Data
  let query = supabase.from('payroll').select('*, employees(full_name, emp_id)').order('month', { ascending: false })
  
  if (employee.role === 'employee') {
    query = query.eq('employee_id', employee.id)
  }

  const { data: payrollRecords, error: payrollError } = await query

  if (payrollError) {
    return (
      <ErrorState message={payrollError.message} />
    )
  }

  const canGenerate = ['super_admin', 'hr', 'finance', 'admin'].includes(employee.role)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Payroll</h1>
          <p className="text-slate-400">Manage salary processing and payslips.</p>
        </div>
        {canGenerate && <GeneratePayrollButton />}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Payslips & Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Month</TableHead>
                {canGenerate && <TableHead className="text-slate-400">Employee</TableHead>}
                <TableHead className="text-slate-400">Gross</TableHead>
                <TableHead className="text-slate-400">Net Pay</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRecords?.map((record) => (
                <TableRow key={record.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-300">{record.month}</TableCell>
                  {canGenerate && (
                    <TableCell className="text-slate-300">
                      {record.employees?.full_name} ({record.employees?.emp_id})
                    </TableCell>
                  )}
                  <TableCell className="text-slate-300">₹{record.gross_salary}</TableCell>
                  <TableCell className="text-slate-300 font-bold">₹{record.net_salary}</TableCell>
                  <TableCell>
                    <StatusBadge status={record.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20" asChild>
                      <a href={`/api/payslip/${record.id}`} download>
                        <FileDown className="mr-2 h-4 w-4" /> Download PDF
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!payrollRecords || payrollRecords.length === 0) && (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={canGenerate ? 6 : 5} className="h-32 text-center">
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
