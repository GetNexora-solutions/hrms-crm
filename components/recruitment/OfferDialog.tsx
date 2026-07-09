"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
}

export function OfferDialog({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  jobTitle,
  onSuccess
}: OfferDialogProps) {
  const [ctc, setCtc] = useState("");
  const [designation, setDesignation] = useState(jobTitle);
  const [doj, setDoj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctc || !designation || !doj) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recruitment/offers/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId,
          ctc: Number(ctc),
          designation,
          doj
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch offer");
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Offer for {candidateName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="designation" className="text-slate-300">Designation</Label>
            <Input 
              id="designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ctc" className="text-slate-300">Annual CTC (₹)</Label>
            <Input 
              id="ctc"
              type="number"
              min="0"
              value={ctc}
              onChange={(e) => setCtc(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="doj" className="text-slate-300">Date of Joining</Label>
            <Input 
              id="doj"
              type="date"
              value={doj}
              onChange={(e) => setDoj(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate & Send Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
