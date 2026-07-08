import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecruitmentService } from '@/lib/services/recruitment'
import { EmptyState } from '@/components/shared/EmptyState'
import { format } from 'date-fns'
import { DocumentDialog } from '@/components/recruitment/DocumentDialog'

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const service = new RecruitmentService(supabase)
  
  const candidate = await service.getCandidateById(params.id)
  const timeline = await service.getCandidateTimeline(params.id)
  const interviews = await service.getInterviews({ candidate_id: params.id })
  const documents = await service.getCandidateDocuments(params.id)

  if (!candidate) return <EmptyState />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{candidate.name}</h1>
          <p className="text-slate-400">{candidate.email} | {candidate.phone}</p>
        </div>
        <Badge variant="outline" className="text-purple-400 border-purple-400 text-lg py-1 px-4">
          {candidate.current_stage || 'Applied'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="bg-slate-900 border-slate-800 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <div>
              <span className="block text-sm text-slate-500">Source</span>
              {candidate.source || '-'}
            </div>
            <div>
              <span className="block text-sm text-slate-500">Applied On</span>
              {format(new Date(candidate.created_at), 'PPP')}
            </div>
            {/* Extended Profile fields would go here */}
          </CardContent>
        </Card>

        {/* Timeline & Activity */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timeline && timeline.length > 0 ? (
                <div className="space-y-4">
                  {timeline.map((event: Record<string, unknown>) => (
                    <div key={event.id as string} className="flex gap-4 border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                      <div className="w-24 shrink-0 text-sm text-slate-500">
                        {format(new Date(event.created_at as string), 'MMM d, p')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{event.action as string}</p>
                        <p className="text-sm text-slate-400">{event.stage as string}</p>
                        {!!event.notes && <p className="text-sm text-slate-300 mt-1">{event.notes as string}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              {interviews && interviews.length > 0 ? (
                <div className="space-y-4">
                  {interviews.map((interview: Record<string, unknown>) => (
                    <div key={interview.id as string} className="flex justify-between items-center border border-slate-800 p-4 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{interview.round as string} - {interview.mode as string}</p>
                        <p className="text-sm text-slate-400">{interview.date as string} at {interview.time as string}</p>
                      </div>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {interview.status as string}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No interviews scheduled yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-white">Documents</CardTitle>
              <DocumentDialog candidateId={params.id} />
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc: Record<string, unknown>) => (
                    <div key={doc.id as string} className="flex justify-between items-center border border-slate-800 p-4 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{doc.document_type as string}</p>
                        <p className="text-sm text-slate-400">{doc.category as string}</p>
                      </div>
                      <Badge variant="outline" className="text-slate-400 border-slate-400">
                        {doc.verification_status as string}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No documents uploaded.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
