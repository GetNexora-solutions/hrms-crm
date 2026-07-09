"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OfferDialog } from "@/components/recruitment/OfferDialog";

interface CandidateActionsProps {
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
}

export function CandidateActions({ candidateId, candidateName, jobId, jobTitle }: CandidateActionsProps) {
  const [offerOpen, setOfferOpen] = useState(false);

  const [converting, setConverting] = useState(false);

  const handleConvert = async () => {
    if (!confirm("Are you sure you want to convert this candidate into an employee? This will provision an employee account and send a welcome email.")) return;
    setConverting(true);
    try {
      const res = await fetch(`/api/recruitment/candidates/${candidateId}/convert`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to convert candidate");
      alert("Candidate successfully converted! Employee ID: " + data.employeeId);
      window.location.reload();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2 mt-4 md:mt-0">
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white" 
          onClick={() => setOfferOpen(true)}
        >
          Generate Offer
        </Button>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white" 
          onClick={handleConvert}
          disabled={converting}
        >
          {converting ? "Converting..." : "Convert to Employee"}
        </Button>
      </div>

      <OfferDialog 
        open={offerOpen} 
        onOpenChange={setOfferOpen}
        candidateId={candidateId}
        candidateName={candidateName}
        jobId={jobId}
        jobTitle={jobTitle}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
