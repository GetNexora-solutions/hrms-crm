"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Edit, Send, Trash2, X, Archive, Loader2 } from "lucide-react";
import { JobDialog } from "@/components/recruitment/JobDialog";
import { JobViewDialog } from "@/components/recruitment/JobViewDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface JobActionsProps {
  job: Record<string, unknown> & { id?: string; status?: string; approval_status?: string; reporting_manager_id?: string };
  employees: Array<{ id: string; full_name: string; emp_id: string; [key: string]: unknown }>;
  userRole?: string;
  employeeId?: string;
}

type ConfirmActionState = {
  isOpen: boolean;
  action: string | null;
  title: string;
  description: string;
  confirmText: string;
  variant: "destructive" | "default";
};

export function JobApprovalActions({ job, employees, userRole, employeeId }: JobActionsProps) {
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmActionState>({
    isOpen: false,
    action: null,
    title: "",
    description: "",
    confirmText: "",
    variant: "default"
  });
  const router = useRouter();

  // Roles permitted to perform major edits/approvals
  const isHRAdminOrMD = ["super_admin", "admin", "hr", "md"].includes(userRole || "");
  const isHiringManager = job.reporting_manager_id === employeeId;
  const isRecruiter = userRole === "recruiter";
  
  const canEdit = isHRAdminOrMD || isHiringManager || isRecruiter;
  const canApprove = isHRAdminOrMD || (isHiringManager && userRole === "manager");

  const requestConfirm = (action: string) => {
    switch (action) {
      case 'Publish':
        setConfirmState({
          isOpen: true,
          action,
          title: "Publish Job Requisition",
          description: "This will publish the job for approval. Are you sure you want to proceed?",
          confirmText: "Publish",
          variant: "default"
        });
        break;
      case 'Delete':
        setConfirmState({
          isOpen: true,
          action,
          title: "Delete Job Requisition",
          description: "This action cannot be undone. This will permanently delete the draft.",
          confirmText: "Delete",
          variant: "destructive"
        });
        break;
      case 'Reject':
        setConfirmState({
          isOpen: true,
          action,
          title: "Reject Job Requisition",
          description: "This will reject the job posting. It will not be opened.",
          confirmText: "Reject",
          variant: "destructive"
        });
        break;
      case 'Close':
        setConfirmState({
          isOpen: true,
          action,
          title: "Close Job",
          description: "This will mark the job as closed. No further applications can be accepted.",
          confirmText: "Close Job",
          variant: "destructive"
        });
        break;
      case 'Archive':
        setConfirmState({
          isOpen: true,
          action,
          title: "Archive Job",
          description: "This will cancel and archive the job posting. Are you sure?",
          confirmText: "Archive",
          variant: "destructive"
        });
        break;
    }
  };

  const handleAction = async (action: string) => {
    setLoading(true);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
    try {
      if (action === 'Approve' || action === 'Reject') {
        const res = await fetch(`/api/recruitment/jobs/${job.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to ${action.toLowerCase()} job`);
        toast.success(data.message);
      } else if (action === 'Publish') {
        const payload = { status: 'Open', approval_status: 'Pending' };
        const res = await fetch(`/api/recruitment/jobs/${job.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to publish job');
        toast.success('Job published for approval');
      } else if (action === 'Close') {
        const payload = { status: 'Closed' };
        const res = await fetch(`/api/recruitment/jobs/${job.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to close job');
        toast.success('Job closed');
      } else if (action === 'Archive') {
        const payload = { status: 'Cancelled' };
        const res = await fetch(`/api/recruitment/jobs/${job.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to archive job');
        toast.success('Job archived');
      } else if (action === 'Delete') {
        const res = await fetch(`/api/recruitment/jobs/${job.id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete job');
        toast.success('Job deleted');
      }
      
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const status = job.status as string;
  const approvalStatus = job.approval_status as string;

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {status === 'Draft' && canEdit && (
          <>
            <JobDialog job={job} employees={employees}>
              <Button size="sm" variant="outline" className="h-8 border-slate-700 hover:bg-slate-800" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Edit className="w-4 h-4 mr-1" />} Edit
              </Button>
            </JobDialog>
            <Button size="sm" variant="outline" className="h-8 border-blue-600 text-blue-500 hover:bg-blue-950" onClick={() => requestConfirm('Publish')} disabled={loading}>
              <Send className="w-4 h-4 mr-1" /> Publish
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-red-600 text-red-500 hover:bg-red-950" onClick={() => requestConfirm('Delete')} disabled={loading}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}

        {status === 'Open' && approvalStatus === 'Pending' && canApprove && (
          <>
            <Button size="sm" variant="outline" className="h-8 border-green-600 text-green-500 hover:bg-green-950" onClick={() => handleAction('Approve')} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />} Approve
            </Button>
            <Button size="sm" variant="outline" className="h-8 border-red-600 text-red-500 hover:bg-red-950" onClick={() => requestConfirm('Reject')} disabled={loading}>
              <XCircle className="w-4 h-4 mr-1" /> Reject
            </Button>
          </>
        )}

        {status === 'Open' && approvalStatus === 'Approved' && (
          <>
            {canEdit && (
              <JobDialog job={job} employees={employees}>
                <Button size="sm" variant="outline" className="h-8 border-slate-700 hover:bg-slate-800" disabled={loading}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              </JobDialog>
            )}
            {canEdit && (
              <Button size="sm" variant="outline" className="h-8 border-yellow-600 text-yellow-500 hover:bg-yellow-950" onClick={() => requestConfirm('Close')} disabled={loading}>
                <X className="w-4 h-4 mr-1" /> Close
              </Button>
            )}
            {canEdit && (
              <Button size="sm" variant="outline" className="h-8 border-slate-600 text-slate-400 hover:bg-slate-800" onClick={() => requestConfirm('Archive')} disabled={loading}>
                <Archive className="w-4 h-4 mr-1" /> Archive
              </Button>
            )}
          </>
        )}
        
        {/* We always allow viewing the job if they can see it in the list */}
        <JobViewDialog job={job} employees={employees} />
      </div>

      <Dialog open={confirmState.isOpen} onOpenChange={(open) => setConfirmState(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>{confirmState.title}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {confirmState.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" onClick={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button 
              className={confirmState.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} 
              onClick={() => confirmState.action && handleAction(confirmState.action)}
            >
              {confirmState.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
