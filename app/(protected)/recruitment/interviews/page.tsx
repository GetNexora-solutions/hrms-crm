import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { InterviewDialog } from '@/components/recruitment/InterviewDialog'

export default async function InterviewsPage() {
  const supabase = createClient()
  const { data: interviews } = await supabase.from('interviews').select('*, candidates(name), job_postings(title), employees!interviewer_id(full_name)').order('date', { ascending: false })
  const { data: candidates } = await supabase.from('candidates').select('id, name')
  const { data: jobs } = await supabase.from('job_postings').select('id, title').eq('status', 'Open')
  const { data: employees } = await supabase.from('employees').select('id, full_name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Interviews</h1>
          <p className="text-slate-400">Manage recruitment interview schedules.</p>
        </div>
        <InterviewDialog 
          candidates={(candidates as unknown as unknown as Record<string, unknown>[]) || []} 
          jobs={(jobs as unknown as unknown as Record<string, unknown>[]) || []} 
          employees={(employees as unknown as unknown as Record<string, unknown>[]) || []} 
        />
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Scheduled Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Date & Time</TableHead>
                <TableHead className="text-slate-400">Candidate</TableHead>
                <TableHead className="text-slate-400">Job</TableHead>
                <TableHead className="text-slate-400">Round</TableHead>
                <TableHead className="text-slate-400">Interviewer</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews?.map((interview) => (
                <TableRow key={interview.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-white">{interview.date} at {interview.time}</TableCell>
                  <TableCell className="text-slate-300">{(interview.candidates as unknown as Record<string, unknown>)?.name as string}</TableCell>
                  <TableCell className="text-slate-300">{(interview.job_postings as unknown as Record<string, unknown>)?.title as string}</TableCell>
                  <TableCell className="text-slate-300">{interview.round} ({interview.mode})</TableCell>
                  <TableCell className="text-slate-300">{(interview.employees as unknown as Record<string, unknown>)?.full_name as string}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      {interview.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!interviews || interviews.length === 0) && (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="h-32 text-center">
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
