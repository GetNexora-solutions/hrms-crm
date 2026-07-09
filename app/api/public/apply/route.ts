import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { jobId, name, email, phone, resume_url } = await req.json();

    if (!jobId || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createClient();

    // Insert Candidate
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        job_id: jobId,
        name: name,
        email: email,
        phone: phone,
        resume_url: resume_url || null,
        current_stage: 'Applied',
        source: 'Website',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Insert Timeline Event
    try {
       await supabase.from('candidate_timeline').insert({
         candidate_id: data.id,
         stage: 'Applied',
         action: 'Candidate Applied via Public Portal',
         notes: 'Application submitted successfully.'
       });
    } catch (e) {
       console.error("Timeline error on public apply", e);
    }

    return NextResponse.json({ success: true, candidateId: data.id });
  } catch (error: unknown) {
    console.error("Public apply error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to submit application" }, { status: 500 });
  }
}
