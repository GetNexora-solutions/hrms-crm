import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RecruitmentService } from "@/lib/services/recruitment";
import { getCurrentEmployee } from '@/lib/rbac'

export async function POST(req: NextRequest) {
  try {
    const currentEmployee = await getCurrentEmployee()

    // Authenticated active employees only for internal duplicate checking
    if (!currentEmployee) {
      return NextResponse.json({ error: "Unauthorized or invalid employee" }, { status: 401 });
    }
    const supabase = createClient();

    const { email, phone } = await req.json();

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    const recruitmentService = new RecruitmentService(supabase);
    const duplicates = await recruitmentService.checkDuplicate(email, phone);

    return NextResponse.json({ isDuplicate: duplicates.length > 0, duplicates });
  } catch (error: unknown) {
    console.error("Duplicate check error:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to check duplicates" }, { status: 500 });
  }
}
