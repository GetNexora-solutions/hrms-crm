import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit } from 'lucide-react'
import Link from 'next/link'

export default async function EmployeesPage() {
  const supabase = createClient()
  
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading employees: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Employees</h1>
          <p className="text-slate-400">Manage your company&apos;s workforce.</p>
        </div>
        <Link href="/employees/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </Link>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">EMP ID</TableHead>
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Department</TableHead>
                <TableHead className="text-slate-400">Designation</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees?.map((emp) => (
                <TableRow key={emp.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-300">{emp.emp_id}</TableCell>
                  <TableCell className="text-white">{emp.full_name}</TableCell>
                  <TableCell className="text-slate-300">{emp.department}</TableCell>
                  <TableCell className="text-slate-300">{emp.designation}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      {emp.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={emp.status === 'active' ? 'default' : 'secondary'}
                      className={emp.status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20' : 'bg-slate-800 text-slate-300'}
                    >
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/employees/${emp.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {employees?.length === 0 && (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="text-center text-slate-400 h-24">
                    No employees found.
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
