import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, Calendar as CalendarIcon, FileText } from 'lucide-react'

export default async function RecruitmentDashboardPage() {
  const supabase = createClient()

  // KPIs
  const { count: totalCandidates } = await supabase.from('candidates').select('*', { count: 'exact', head: true })
  const { count: activeJobs } = await supabase.from('job_postings').select('*', { count: 'exact', head: true }).eq('status', 'Open')
  const { count: upcomingInterviews } = await supabase.from('interviews').select('*', { count: 'exact', head: true }).eq('status', 'Scheduled')
  
  // Recent Candidates
  const { data: recentCandidates } = await supabase.from('candidates').select('id, name, current_stage, created_at').order('created_at', { ascending: false }).limit(5)
  
  // Upcoming Interviews List
  const { data: nextInterviews } = await supabase.from('interviews')
    .select('id, date, time, round, candidates(name), job_postings(title)')
    .eq('status', 'Scheduled')
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(5)

  // Stages Breakdown (Rough approximation using client-side aggregation or just recent ones, 
  // actually better to just fetch all and aggregate if small, or use a view. Let's just fetch counts for key stages)
  const { count: screeningCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('current_stage', 'Screening')
  const { count: interviewCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).ilike('current_stage', '%Interview%')
  const { count: offerCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).ilike('current_stage', '%Offer%')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Recruitment Dashboard</h1>
        <p className="text-slate-400">Overview of your hiring pipeline and activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Candidates</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalCandidates || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeJobs || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Interviews</CardTitle>
            <CalendarIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{upcomingInterviews || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Screening</CardTitle>
            <FileText className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{screeningCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Interviewing</CardTitle>
            <CalendarIcon className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{interviewCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Offers</CardTitle>
            <FileText className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{offerCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCandidates?.map(candidate => (
                <div key={candidate.id} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-white">{candidate.name}</p>
                    <p className="text-xs text-slate-400">{new Date(candidate.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm text-slate-300 bg-slate-800 px-2 py-1 rounded">{candidate.current_stage}</span>
                </div>
              ))}
              {(!recentCandidates || recentCandidates.length === 0) && (
                <p className="text-slate-400 text-sm">No recent candidates.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Next Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextInterviews?.map(interview => (
                <div key={interview.id} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-white">{(interview.candidates as unknown as Record<string, unknown>)?.name as string}</p>
                    <p className="text-xs text-slate-400">{(interview.job_postings as unknown as Record<string, unknown>)?.title as string} - {interview.round}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{interview.date}</p>
                    <p className="text-xs text-slate-400">{interview.time}</p>
                  </div>
                </div>
              ))}
              {(!nextInterviews || nextInterviews.length === 0) && (
                <p className="text-slate-400 text-sm">No upcoming interviews.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
