import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { employeeProvisioningService } from "@/lib/services/employee-provisioning-instance";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidateId = params.id;
    if (!candidateId) {
      return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });
    }

    const { employeeId } = await employeeProvisioningService.convertCandidateToEmployee(candidateId, user.id);

    return NextResponse.json({ success: true, employeeId, message: "Candidate converted successfully" });
  } catch (error: unknown) {
    console.error("Employee conversion error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to convert candidate" }, { status: 500 });
  }
}
