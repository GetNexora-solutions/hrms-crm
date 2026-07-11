"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, ChevronRight, ChevronLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

type EmployeeOption = { id: string, full_name: string, emp_id: string };
export function JobDialog({ employees = [] }: { employees?: EmployeeOption[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()
  
  // Basic Form State to simulate auto-save
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    reporting_manager_id: '',
    positions: 1,
    employment_type: 'Full-time',
    office_location: '',
    location_type: 'Remote',
    description: '',
    required_skills: '',
    preferred_skills: '',
    min_experience: '',
    max_experience: '',
    education_required: '',
    joining_date: '',
    hiring_priority: 'Medium',
    hiring_type: 'New',
    salary_type: 'Monthly',
    min_salary: '',
    max_salary: '',
    salary_negotiable: false,
    closing_date: '',
    status: 'Open',
    approval_status: 'Pending'
  })

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 4) {
      setStep(step + 1)
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/recruitment/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create job')
      }
      
      toast.success('Job Requisition created successfully')
      setOpen(false)
      setStep(1)
      router.refresh()
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!formData.title) {
      toast.error('Job Title is required to save a draft')
      return
    }
    setLoading(true)
    try {
      const draftData = { ...formData, status: 'Draft' }
      const res = await fetch('/api/recruitment/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save draft')
      }
      
      toast.success('Draft saved successfully')
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="text-xl font-bold">Create Job Requisition</DialogTitle>
          <div className="flex space-x-2 text-sm text-slate-400 font-medium">
            <span className={step >= 1 ? 'text-blue-500' : ''}>1. Basic</span> &gt;
            <span className={step >= 2 ? 'text-blue-500' : ''}>2. Details</span> &gt;
            <span className={step >= 3 ? 'text-blue-500' : ''}>3. Hiring</span> &gt;
            <span className={step >= 4 ? 'text-blue-500' : ''}>4. Finish</span>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                <Input id="title" value={formData.title} onChange={e => handleChange('title', e.target.value)} required className="bg-slate-800 border-slate-700" placeholder="e.g. Senior Frontend Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={formData.department} onChange={e => handleChange('department', e.target.value)} className="bg-slate-800 border-slate-700" placeholder="e.g. Engineering" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment_type">Employment Type</Label>
                  <Select value={formData.employment_type} onValueChange={v => handleChange('employment_type', v)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_type">Location Type</Label>
                  <Select value={formData.location_type} onValueChange={v => handleChange('location_type', v)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="Onsite">Onsite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office_location">Office Location</Label>
                  <Input id="office_location" value={formData.office_location} onChange={e => handleChange('office_location', e.target.value)} className="bg-slate-800 border-slate-700" placeholder="e.g. New York, NY" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="positions">Number of Openings</Label>
                  <Input id="positions" type="number" min="1" value={formData.positions} onChange={e => handleChange('positions', parseInt(e.target.value))} className="bg-slate-800 border-slate-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporting_manager_id">Hiring Manager</Label>
                  <Select value={formData.reporting_manager_id} onValueChange={v => handleChange('reporting_manager_id', v)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.emp_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <Label htmlFor="description">Job Description / Responsibilities</Label>
                <textarea 
                  id="description" 
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  className="w-full min-h-[120px] rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" 
                  placeholder="Enter detailed job description..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="required_skills">Required Skills (Comma separated)</Label>
                <Input id="required_skills" value={formData.required_skills} onChange={e => handleChange('required_skills', e.target.value)} className="bg-slate-800 border-slate-700" placeholder="e.g. React, Node.js, TypeScript" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_skills">Preferred Skills</Label>
                <Input id="preferred_skills" value={formData.preferred_skills} onChange={e => handleChange('preferred_skills', e.target.value)} className="bg-slate-800 border-slate-700" placeholder="e.g. GraphQL, Docker" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Experience (Years)</Label>
                  <div className="flex items-center space-x-2">
                    <Input type="number" placeholder="Min" value={formData.min_experience} onChange={e => handleChange('min_experience', e.target.value)} className="bg-slate-800 border-slate-700" />
                    <span className="text-slate-400">-</span>
                    <Input type="number" placeholder="Max" value={formData.max_experience} onChange={e => handleChange('max_experience', e.target.value)} className="bg-slate-800 border-slate-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education_required">Education Qualification</Label>
                  <Input id="education_required" value={formData.education_required} onChange={e => handleChange('education_required', e.target.value)} className="bg-slate-800 border-slate-700" placeholder="e.g. Bachelor's in CS" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="joining_date">Desired Joining Date</Label>
                  <Input type="date" id="joining_date" value={formData.joining_date} onChange={e => handleChange('joining_date', e.target.value)} className="bg-slate-800 border-slate-700 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hiring_priority">Hiring Priority</Label>
                  <Select value={formData.hiring_priority} onValueChange={v => handleChange('hiring_priority', v)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hiring_type">Hiring Type</Label>
                  <Select value={formData.hiring_type} onValueChange={v => handleChange('hiring_type', v)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Replacement">Replacement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_type">Salary Type</Label>
                  <Select value={formData.salary_type} onValueChange={v => handleChange('salary_type', v)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <div className="flex items-center space-x-2">
                  <Input type="number" placeholder="Min Salary" value={formData.min_salary} onChange={e => handleChange('min_salary', e.target.value)} className="bg-slate-800 border-slate-700" />
                  <span className="text-slate-400">-</span>
                  <Input type="number" placeholder="Max Salary" value={formData.max_salary} onChange={e => handleChange('max_salary', e.target.value)} className="bg-slate-800 border-slate-700" />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="salary_negotiable"
                  checked={formData.salary_negotiable}
                  onChange={e => handleChange('salary_negotiable', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900"
                />
                <Label htmlFor="salary_negotiable">Salary is negotiable</Label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closing_date">Application Deadline</Label>
                  <Input type="date" id="closing_date" value={formData.closing_date} onChange={e => handleChange('closing_date', e.target.value)} className="bg-slate-800 border-slate-700 [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Job Status</Label>
                  <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval_status">Approval Status</Label>
                <Select value={formData.approval_status} onValueChange={v => handleChange('approval_status', v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Approval Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label>Attachments</Label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 bg-slate-800/50 opacity-50 cursor-not-allowed">
                  <p className="text-sm">Document upload will be available in Phase D1.1</p>
                  <Button type="button" variant="outline" className="mt-4 bg-slate-800 border-slate-700" disabled>Browse Files</Button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
            <Button type="button" variant="ghost" onClick={handleSaveDraft} className="text-slate-400 hover:text-white" disabled={loading}>
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            
            <div className="flex space-x-2">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="border-slate-700 bg-slate-800 hover:bg-slate-700" disabled={loading}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              )}
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                {step < 4 ? (
                  <>Next <ChevronRight className="ml-2 h-4 w-4" /></>
                ) : (
                  loading ? 'Saving...' : 'Complete'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
