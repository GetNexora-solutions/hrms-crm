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

  return (
    <>
      <div className="flex gap-2 mt-4 md:mt-0">
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white" 
          onClick={() => setOfferOpen(true)}
        >
          Generate Offer
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
