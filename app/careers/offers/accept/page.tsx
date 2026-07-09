import { tokenService } from "@/lib/services/token";
import { OfferResponseClient } from "./OfferResponseClient";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OfferAcceptancePage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Invalid Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">No security token was provided. This link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const decoded = tokenService.verifyOfferToken(token);

  if (!decoded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Link Expired or Invalid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">This offer link is either invalid, expired, or has already been used.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Double check if already accepted
  const supabase = createAdminClient();
  const { data: timeline } = await supabase
    .from('candidate_timeline')
    .select('action')
    .eq('candidate_id', decoded.candidateId)
    .in('action', ['Offer Accepted', 'Offer Rejected']);

  if (timeline && timeline.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-center">
          <CardHeader>
            <CardTitle className="text-indigo-400">Offer Already Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">Your response to this offer has already been recorded.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: candidate } = await supabase
    .from('candidates')
    .select('full_name, job_postings(title)')
    .eq('id', decoded.candidateId)
    .single();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <Card className="max-w-xl w-full bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">Offer of Employment</CardTitle>
          <p className="text-slate-400 mt-2">Nexora Solutions</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-lg text-slate-200 space-y-3">
            <p><strong>Candidate:</strong> {candidate?.full_name}</p>
            <p><strong>Position:</strong> {((candidate?.job_postings as unknown) as { title: string })?.title}</p>
            <p><strong>Annual CTC:</strong> ₹ {decoded.ctc?.toLocaleString()}</p>
            <p><strong>Date of Joining:</strong> {decoded.doj}</p>
          </div>
          
          <div className="text-sm text-slate-400 text-center">
            By accepting this offer, you agree to the terms outlined in the official Offer Letter document that was attached to your email.
          </div>

          <OfferResponseClient token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
