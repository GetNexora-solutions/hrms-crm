import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmployee, hasPermission } from '@/lib/rbac'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentEmployee = await getCurrentEmployee()

    if (!currentEmployee) {
      return NextResponse.json({ error: 'Unauthorized or invalid employee' }, { status: 401 })
    }

    if (!hasPermission(currentEmployee.role, ['super_admin', 'hr', 'md', 'admin', 'manager'])) {
      return NextResponse.json({ error: 'Insufficient permissions to approve jobs' }, { status: 403 })
    }

    const { action } = await req.json(); // "Approve" or "Reject"
    const jobId = params.id;

    if (!jobId || !action) {
      return NextResponse.json({ error: "Job ID and action are required" }, { status: 400 });
    }

    const status = action === 'Approve' ? 'Open' : 'Draft';
    const supabase = createClient();

    const { data, error } = await supabase
      .from('job_postings')
      .update({
        status: status,
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, job: data, message: `Job successfully ${action.toLowerCase()}d` });
  } catch (error: unknown) {
    console.error("Job approval error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to approve job" }, { status: 500 });
  }
}
