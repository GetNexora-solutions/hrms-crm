import Link from 'next/link'
import { ReactNode } from 'react'
import { Briefcase, Users, Calendar } from 'lucide-react'

export default function RecruitmentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 border-b border-slate-800 pb-4">
        <Link href="/recruitment" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium">
          <Briefcase className="h-4 w-4" /> Dashboard
        </Link>
        <Link href="/recruitment/jobs" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium">
          <Briefcase className="h-4 w-4" /> Jobs
        </Link>
        <Link href="/recruitment/candidates" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium">
          <Users className="h-4 w-4" /> Candidates
        </Link>
        <Link href="/recruitment/interviews" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium">
          <Calendar className="h-4 w-4" /> Interviews
        </Link>
      </div>
      {children}
    </div>
  )
}
