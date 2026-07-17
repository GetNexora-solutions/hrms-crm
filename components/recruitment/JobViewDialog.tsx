"use client"
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-react'

export function JobViewDialog({ job, employees, children }: { job: Record<string, unknown> & { title?: string; department?: string; status?: string; approval_status?: string; positions?: number; employment_type?: string; min_experience?: string; max_experience?: string; min_salary?: string; max_salary?: string; salary_type?: string; reporting_manager_id?: string; recruiter_id?: string; required_skills?: string; description?: string; created_at?: string; updated_at?: string }, employees: Array<{ id: string; full_name: string; emp_id: string; [key: string]: unknown }>, children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  const getEmpName = (id: string | undefined) => {
    return employees.find(e => e.id === id)?.full_name || 'Unassigned'
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline" className="h-8 border-slate-700 hover:bg-slate-800">
            <Eye className="w-4 h-4 mr-1" /> View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start pr-6">
            <div>
              <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
              <div className="text-sm text-slate-400 mt-1">{job.department || 'No Department'}</div>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline" className={job.status === 'Open' ? 'text-green-400 border-green-400' : 'text-slate-400 border-slate-400'}>
                {job.status}
              </Badge>
              <Badge variant="outline" className={job.approval_status === 'Approved' ? 'text-green-400 border-green-400' : 'text-yellow-400 border-yellow-400'}>
                {job.approval_status}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400 block mb-1">Positions</span>
              <span className="font-medium">{job.positions || 1}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Employment Type</span>
              <span className="font-medium">{job.employment_type || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Experience</span>
              <span className="font-medium">{job.min_experience || '0'} - {job.max_experience || '0'} Years</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Salary</span>
              <span className="font-medium">{job.min_salary || '0'} - {job.max_salary || '0'} ({job.salary_type || 'Monthly'})</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Hiring Manager</span>
              <span className="font-medium">{getEmpName(job.reporting_manager_id)}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Recruiter</span>
              <span className="font-medium">{getEmpName(job.recruiter_id)}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-sm block mb-1">Skills Required</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {job.required_skills ? job.required_skills.split(',').map((s: string, i: number) => (
                <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">{s.trim()}</Badge>
              )) : '-'}
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-sm block mb-1">Description</span>
            <div className="bg-slate-800/50 rounded-md p-4 text-sm whitespace-pre-wrap border border-slate-800">
              {job.description || 'No description provided.'}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div>Created Date: {formatDate(job.created_at)}</div>
            <div>Last Updated: {formatDate(job.updated_at)}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
