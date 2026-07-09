import { NextRequest, NextResponse } from "next/server";
import { employeeProvisioningService } from "@/lib/services/employee-provisioning-instance";
import { getCurrentEmployee, hasPermission } from '@/lib/rbac'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentEmployee = await getCurrentEmployee()

    if (!currentEmployee) {
      return NextResponse.json({ error: 'Unauthorized or invalid employee' }, { status: 401 })
    }

    if (!hasPermission(currentEmployee.role, ['super_admin', 'hr', 'md', 'admin', 'manager', 'recruiter'])) {
      return NextResponse.json({ error: 'Insufficient permissions to convert candidates' }, { status: 403 })
    }

    const candidateId = params.id;
    if (!candidateId) {
      return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });
    }

    const { employeeId } = await employeeProvisioningService.convertCandidateToEmployee(candidateId, currentEmployee.user_id);

    return NextResponse.json({ success: true, employeeId, message: "Candidate converted successfully" });
  } catch (error: unknown) {
    console.error("Employee conversion error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to convert candidate" }, { status: 500 });
  }
}
