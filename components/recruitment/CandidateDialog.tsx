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

export function CandidateDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          current_stage: 'Applied',
          source: formData.get('source')
        })
      })

      if (!res.ok) throw new Error('Failed to create candidate')
      
      toast.success('Candidate created successfully')
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
          <Plus className="mr-2 h-4 w-4" /> Add Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Candidate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input id="name" name="name" required className="bg-slate-800 border-slate-700" placeholder="e.g. John Doe" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input id="email" name="email" type="email" required className="bg-slate-800 border-slate-700" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
              <Input id="phone" name="phone" required className="bg-slate-800 border-slate-700" placeholder="+1234567890" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select name="source" defaultValue="Website">
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Naukri">Naukri</SelectItem>
                <SelectItem value="Indeed">Indeed</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Campus">Campus</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Adding...' : 'Add Candidate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
