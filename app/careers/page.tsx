import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Briefcase, Building } from 'lucide-react'

export default async function CareersPage() {
  const supabase = createClient()
  
  // Note: we can safely fetch directly here because it's a server component
  const { data: jobs } = await supabase
    .from('job_postings')
    .select('*')
    .eq('status', 'Open')
    .eq('approval_status', 'Approved')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center pt-20">
      <div className="w-full max-w-5xl px-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Join Our Team
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Discover opportunities to build the future of HR tech. Explore our open positions below and take the next step in your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {jobs?.length ? jobs.map(job => (
            <Link key={job.id} href={`/careers/${job.id}`}>
              <Card className="h-full bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors cursor-pointer group">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-blue-400 transition-colors">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-slate-400 mt-2">
                    <Building className="w-4 h-4" /> {job.department || 'General'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                      <Briefcase className="w-3 h-3 mr-1" /> {job.employment_type || 'Full-time'}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                      <MapPin className="w-3 h-3 mr-1" /> {job.location_type || 'On-site'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-3">
                    {job.description || "Join us to make an impact."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )) : (
            <div className="col-span-full text-center py-12 text-slate-400">
              No open positions at the moment. Please check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
