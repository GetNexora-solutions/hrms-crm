"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LeaveActions({ leaveId }: { leaveId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleAction = async (action: 'approve' | 'reject', reason?: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejection_reason: reason })
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message || `Leave ${action}d successfully.`)
        if (action === 'reject') {
          setRejectOpen(false)
          setRejectionReason('')
        }
        router.refresh()
      } else {
        toast.error(data.error || `Failed to ${action} leave.`)
      }
    } catch {
      toast.error(`An error occurred while trying to ${action} leave.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAction('approve')}
          disabled={loading}
          className="border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-400"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
          Approve
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setRejectOpen(true)}
          disabled={loading}
          className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
          Reject
        </Button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={(open) => {
        setRejectOpen(open)
        if (!open) setRejectionReason('')
      }}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription className="text-slate-400">
              Please provide a reason for rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Reason (Optional)</Label>
              <Input 
                className="bg-slate-800 border-slate-700" 
                placeholder="Brief reason for rejection..." 
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => {
              setRejectOpen(false)
              setRejectionReason('')
            }} className="hover:bg-slate-800 hover:text-white" disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleAction('reject', rejectionReason)} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
