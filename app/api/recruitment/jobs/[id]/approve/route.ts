import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json(); // "Approve" or "Reject"
    const jobId = params.id;

    if (!jobId || !action) {
      return NextResponse.json({ error: "Job ID and action are required" }, { status: 400 });
    }

    const approvalStatus = action === 'Approve' ? 'Approved' : 'Rejected';
    const status = action === 'Approve' ? 'Open' : 'Draft';

    const { data, error } = await supabase
      .from('job_postings')
      .update({
        approval_status: approvalStatus,
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, job: data, message: `Job successfully ${approvalStatus.toLowerCase()}` });
  } catch (error: unknown) {
    console.error("Job approval error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to approve job" }, { status: 500 });
  }
}
