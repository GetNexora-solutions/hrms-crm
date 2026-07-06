"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Ban, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeactivateButtonProps {
  employeeId: string
  employeeName: string
  iconOnly?: boolean
}

export function DeactivateButton({ employeeId, employeeName, iconOnly = false }: DeactivateButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDeactivate = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/employees/${employeeId}/deactivate`, {
        method: 'PATCH',
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success(data.message || 'Employee deactivated successfully.')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to deactivate employee.')
      }
    } catch {
      toast.error('An error occurred while trying to deactivate the employee.')
    } finally {
      setLoading(false)
    }
  }

  const trigger = iconOnly ? (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => setOpen(true)}
      className="text-slate-400 hover:text-red-500 hover:bg-red-500/10"
      title="Deactivate"
    >
      <Ban className="h-4 w-4" />
    </Button>
  ) : (
    <Button 
      variant="destructive" 
      onClick={() => setOpen(true)}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      <Ban className="mr-2 h-4 w-4" />
      Deactivate
    </Button>
  )

  return (
    <>
      {trigger}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle>Deactivate Employee</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to deactivate {employeeName}? They will immediately lose access to the system. Their records will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-slate-800 hover:text-white" disabled={loading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeactivate} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
