import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('job_postings')
      .select('id, title, department, employment_type, location, location_type, description, requirements')
      .eq('status', 'Open')
      .eq('approval_status', 'Approved') // Ensure it is approved
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, jobs: data });
  } catch (error: unknown) {
    console.error("Fetch public jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
