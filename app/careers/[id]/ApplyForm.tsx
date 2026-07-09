"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

export function ApplyForm({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      jobId,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      resume_url: formData.get("resume_url") || ""
    };

    try {
      const res = await fetch('/api/public/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to submit application");
      
      setSuccess(true);
      toast.success("Application submitted successfully!");
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Application Received!</h3>
        <p className="text-slate-400">Thank you for applying. Our recruiting team will review your application and get back to you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
        <Input id="name" name="name" required className="bg-slate-800 border-slate-700 text-white" placeholder="John Doe" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input id="email" name="email" type="email" required className="bg-slate-800 border-slate-700 text-white" placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
          <Input id="phone" name="phone" required className="bg-slate-800 border-slate-700 text-white" placeholder="+1 (555) 000-0000" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume_url">Resume / Portfolio URL (Optional)</Label>
        <Input id="resume_url" name="resume_url" type="url" className="bg-slate-800 border-slate-700 text-white" placeholder="https://linkedin.com/in/johndoe" />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6">
        {loading ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
