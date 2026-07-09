"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

interface JobApprovalActionsProps {
  jobId: string;
  currentStatus: string;
}

export function JobApprovalActions({ jobId, currentStatus }: JobApprovalActionsProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (currentStatus !== 'Pending Approval') {
    return null; // Only show for pending jobs
  }

  const handleAction = async (action: 'Approve' | 'Reject') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recruitment/jobs/${jobId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action.toLowerCase()} job`);
      toast.success(data.message);
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 border-green-600 text-green-500 hover:bg-green-950"
        onClick={() => handleAction('Approve')}
        disabled={loading}
      >
        <CheckCircle className="w-4 h-4 mr-1" /> Approve
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 border-red-600 text-red-500 hover:bg-red-950"
        onClick={() => handleAction('Reject')}
        disabled={loading}
      >
        <XCircle className="w-4 h-4 mr-1" /> Reject
      </Button>
    </div>
  );
}
