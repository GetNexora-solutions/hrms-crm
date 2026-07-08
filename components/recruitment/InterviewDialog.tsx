"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function InterviewDialog({ candidates, jobs, employees }: { candidates: Record<string, unknown>[], jobs: Record<string, unknown>[], employees: Record<string, unknown>[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/recruitment/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: formData.get('candidate_id'),
          job_id: formData.get('job_id'),
          round: formData.get('round'),
          mode: formData.get('mode'),
          interviewer_id: formData.get('interviewer_id'),
          date: formData.get('date'),
          time: formData.get('time'),
          status: 'Scheduled'
        })
      })

      if (!res.ok) throw new Error('Failed to schedule interview')
      
      toast.success('Interview scheduled successfully')
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
          <Plus className="mr-2 h-4 w-4" /> Schedule Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="candidate_id">Candidate <span className="text-red-500">*</span></Label>
            <Select name="candidate_id" required>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Select candidate" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map(c => (
                  <SelectItem key={c.id as string} value={c.id as string}>{c.name as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_id">Job Posting <span className="text-red-500">*</span></Label>
            <Select name="job_id" required>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Select job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(j => (
                  <SelectItem key={j.id as string} value={j.id as string}>{j.title as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="round">Round</Label>
              <Select name="round" defaultValue="HR">
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Managerial">Managerial</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select name="mode" defaultValue="Online">
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Google Meet">Google Meet</SelectItem>
                  <SelectItem value="Zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewer_id">Interviewer <span className="text-red-500">*</span></Label>
            <Select name="interviewer_id" required>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Select interviewer" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => (
                  <SelectItem key={e.id as string} value={e.id as string}>{e.full_name as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
              <Input type="date" id="date" name="date" required className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time <span className="text-red-500">*</span></Label>
              <Input type="time" id="time" name="time" required className="bg-slate-800 border-slate-700" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
