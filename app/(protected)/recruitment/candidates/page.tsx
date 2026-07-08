import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { CandidateDialog } from '@/components/recruitment/CandidateDialog'

export default async function CandidatesPage() {
  const supabase = createClient()
  const { data: candidates } = await supabase.from('candidates').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Candidates</h1>
          <p className="text-slate-400">Manage recruitment candidates pipeline.</p>
        </div>
        <CandidateDialog />
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">All Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-800/50">
                <TableHead className="text-slate-400">Name</TableHead>
                <TableHead className="text-slate-400">Email</TableHead>
                <TableHead className="text-slate-400">Phone</TableHead>
                <TableHead className="text-slate-400">Stage</TableHead>
                <TableHead className="text-slate-400">Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates?.map((candidate) => (
                <TableRow key={candidate.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-white">{candidate.name}</TableCell>
                  <TableCell className="text-slate-300">{candidate.email}</TableCell>
                  <TableCell className="text-slate-300">{candidate.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                      {candidate.current_stage || 'Applied'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">{candidate.source || '-'}</TableCell>
                </TableRow>
              ))}
              {(!candidates || candidates.length === 0) && (
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
