"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export function LeaveRequestDialog({ employeeId, leaveTypes }: { employeeId: string, leaveTypes: any[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    leave_type_id: "",
    from_date: "",
    to_date: "",
    reason: ""
  })

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const d1 = new Date(start)
    const d2 = new Date(end)
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const days = calculateDays(formData.from_date, formData.to_date)
    if (days <= 0) {
      toast.error("Invalid dates selected")
      setLoading(false)
      return
    }

    const { error } = await supabase.from('leave_requests').insert({
      employee_id: employeeId,
      leave_type_id: formData.leave_type_id,
      from_date: formData.from_date,
      to_date: formData.to_date,
      days,
      reason: formData.reason,
      status: 'pending'
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Leave request submitted successfully")
      setOpen(false)
      setFormData({ leave_type_id: "", from_date: "", to_date: "", reason: "" })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Apply Leave</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription className="text-slate-400">
              Submit a new leave request. It will be sent to HR for approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select 
                required 
                onValueChange={(val) => setFormData({...formData, leave_type_id: val})}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                  {leaveTypes.map((lt) => (
                    <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input 
                  type="date" 
                  required
                  className="bg-slate-800 border-slate-700" 
                  value={formData.from_date}
                  onChange={(e) => setFormData({...formData, from_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input 
                  type="date" 
                  required
                  className="bg-slate-800 border-slate-700" 
                  value={formData.to_date}
                  onChange={(e) => setFormData({...formData, to_date: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input 
                className="bg-slate-800 border-slate-700" 
                placeholder="Brief reason for leave..." 
                required
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-slate-800 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
