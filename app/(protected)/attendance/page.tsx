import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/rbac'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AttendanceClient } from './AttendanceClient'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function AttendancePage() {
  const employee = await getCurrentEmployee()
  const supabase = createClient()

  if (!employee) return null

  const today = new Date().toISOString().split('T')[0]

  // Get today's attendance for the user
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('date', today)
    .single()

  // Get recent attendance history
  const { data: history } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employee.id)
    .order('date', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Attendance</h1>
        <p className="text-slate-400">Mark your daily attendance and view history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Daily Check-in</CardTitle>
            <CardDescription className="text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceClient 
              employeeId={employee.id} 
              initialData={todayAttendance} 
            />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Check In</TableHead>
                <TableHead className="text-slate-400">Check Out</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history?.map((record) => (
                <TableRow key={record.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-slate-300">{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-slate-300">
                    {record.check_in ? new Date(record.check_in).toLocaleTimeString() : '--'}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {record.check_out ? new Date(record.check_out).toLocaleTimeString() : '--'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={record.status === 'present' ? 'default' : 'secondary'}
                      className={record.status === 'present' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-800 text-slate-300'}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
