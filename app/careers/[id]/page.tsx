import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { MapPin, Briefcase, Building, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ApplyForm } from './ApplyForm'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: job, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !job || job.status !== 'Open' || job.approval_status !== 'Approved') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center pt-10 pb-20">
      <div className="w-full max-w-4xl px-6">
        <Link href="/careers" className="inline-flex items-center text-slate-400 hover:text-blue-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Careers
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{job.title}</h1>
          <div className="flex flex-wrap gap-3 mb-8">
            <Badge variant="secondary" className="bg-slate-800 text-slate-300 py-1.5 px-3">
              <Building className="w-4 h-4 mr-2" /> {job.department || 'General'}
            </Badge>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300 py-1.5 px-3">
              <Briefcase className="w-4 h-4 mr-2" /> {job.employment_type || 'Full-time'}
            </Badge>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300 py-1.5 px-3">
              <MapPin className="w-4 h-4 mr-2" /> {job.location_type || 'On-site'}
            </Badge>
          </div>

          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-2">About the Role</h3>
            <p className="text-slate-300 whitespace-pre-wrap mb-8">{job.description}</p>

            <h3 className="text-xl font-semibold mb-2">Requirements</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{job.requirements}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8" id="apply">
          <h2 className="text-2xl font-bold text-white mb-6">Apply for this Position</h2>
          <ApplyForm jobId={job.id} />
        </div>
      </div>
    </div>
  )
}
