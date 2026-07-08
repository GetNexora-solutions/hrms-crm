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

export function DocumentDialog({ candidateId }: { candidateId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await fetch('/api/recruitment/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId,
          category: formData.get('category'),
          document_type: formData.get('document_type'),
          file_name: formData.get('file_name'),
          storage_path: '/placeholder/path', // D1.6 specifies metadata only
          file_url: 'https://placeholder.url', // D1.6 specifies metadata only
          verification_status: 'Pending'
        })
      })

      if (!res.ok) throw new Error('Failed to upload document')
      
      toast.success('Document uploaded successfully')
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
        <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" /> Add Document
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Document Metadata</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue="Identity">
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Identity">Identity</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Employment">Employment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document_type">Document Type <span className="text-red-500">*</span></Label>
            <Input id="document_type" name="document_type" required className="bg-slate-800 border-slate-700" placeholder="e.g. Passport, Offer Letter" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_name">File Name <span className="text-red-500">*</span></Label>
            <Input id="file_name" name="file_name" required className="bg-slate-800 border-slate-700" placeholder="e.g. passport.pdf" />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Adding...' : 'Add Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
