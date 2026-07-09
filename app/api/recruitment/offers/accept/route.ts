import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tokenService } from "@/lib/services/token";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, action } = body; // action is 'accept' or 'reject'

    if (!token || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Verify token
    const decoded = tokenService.verifyOfferToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const { candidateId } = decoded;

    // Use admin client because this is an unauthenticated public API call
    const supabaseAdmin = createAdminClient();

    // 1. Check if token was already used by inspecting timeline
    const { data: timelineEvents, error: timelineError } = await supabaseAdmin
      .from('candidate_timeline')
      .select('action')
      .eq('candidate_id', candidateId)
      .in('action', ['Offer Accepted', 'Offer Rejected']);

    if (timelineError) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (timelineEvents && timelineEvents.length > 0) {
      return NextResponse.json({ error: "This offer has already been responded to." }, { status: 403 });
    }

    // 2. Perform the action
    const newStage = action === 'accept' ? 'Offer Accepted' : 'Rejected';
    const timelineAction = action === 'accept' ? 'Offer Accepted' : 'Offer Rejected';
    const notes = action === 'accept' 
      ? 'Candidate electronically accepted the offer via secure token.' 
      : 'Candidate explicitly rejected the offer.';

    // Update candidate stage
    const { error: updateError } = await supabaseAdmin
      .from('candidates')
      .update({ current_stage: newStage })
      .eq('id', candidateId);

    if (updateError) {
      throw updateError;
    }

    // Insert timeline log (System action, performed_by = null)
    await supabaseAdmin.from('candidate_timeline').insert({
      candidate_id: candidateId,
      stage: newStage,
      action: timelineAction,
      notes: notes
    });

    return NextResponse.json({ success: true, message: `Offer successfully ${action}ed.` });
  } catch (error) {
    console.error("Offer acceptance error:", error);
    return NextResponse.json({ error: "Failed to process offer response" }, { status: 500 });
  }
}
