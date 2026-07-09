"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CandidateDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [duplicates, setDuplicates] = useState<{ id: string, name: string, email: string, current_stage: string }[]>([])
  const [checkingDupes, setCheckingDupes] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkDupes = async () => {
      if (!email && !phone) {
        setDuplicates([]);
        return;
      }
      setCheckingDupes(true);
      try {
        const res = await fetch('/api/recruitment/candidates/duplicate-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, phone })
        });
        const data = await res.json();
        if (data.isDuplicate) {
          setDuplicates(data.duplicates);
        } else {
          setDuplicates([]);
        }
      } catch (err) {
        console.error("Duplicate check failed", err);
      } finally {
        setCheckingDupes(false);
      }
    };

    const timer = setTimeout(checkDupes, 500);
    return () => clearTimeout(timer);
  }, [email, phone]);

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
      setEmail('')
      setPhone('')
      setDuplicates([])
      router.refresh()
    } catch (err: unknown) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) {
        setEmail('')
        setPhone('')
        setDuplicates([])
      }
    }}>
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
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="bg-slate-800 border-slate-700" 
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
              <Input 
                id="phone" 
                name="phone" 
                required 
                className="bg-slate-800 border-slate-700" 
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
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

          {duplicates.length > 0 && (
            <Alert variant="destructive" className="bg-red-950 border-red-900 text-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Possible Duplicate Found</AlertTitle>
              <AlertDescription>
                {duplicates.length} candidate(s) exist with similar contact info.
                <ul className="mt-2 list-disc list-inside text-xs">
                  {duplicates.map(d => (
                    <li key={d.id}>{d.name} ({d.email}) - {d.current_stage}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || checkingDupes} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Adding...' : 'Add Candidate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
