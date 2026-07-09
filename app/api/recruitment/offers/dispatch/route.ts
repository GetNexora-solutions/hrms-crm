import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emailService } from "@/lib/services/email";
import { pdfService } from "@/lib/services/pdf";
import { tokenService } from "@/lib/services/token";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { candidateId, ctc, designation, doj } = body;

    if (!candidateId || !ctc || !designation || !doj) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch Candidate and Job details
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*, job_postings(*)')
      .eq('id', candidateId)
      .single();

    if (candidateError || !candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    // 2. Generate HTML Offer Letter Template
    const offerHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; color: #333;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #0f172a; margin: 0;">Nexora Solutions</h1>
            <p style="color: #64748b; margin: 0;">Enterprise HRMS & CRM</p>
          </div>
          
          <p>Date: ${new Date().toLocaleDateString()}</p>
          <p>Dear <strong>${candidate.full_name}</strong>,</p>
          
          <p>We are thrilled to offer you the position of <strong>${designation}</strong> at Nexora Solutions.</p>
          
          <p><strong>Offer Details:</strong></p>
          <ul>
            <li><strong>Designation:</strong> ${designation}</li>
            <li><strong>Department:</strong> ${candidate.job_postings.department || 'General'}</li>
            <li><strong>Annual CTC:</strong> ${Number(ctc).toLocaleString()}</li>
            <li><strong>Date of Joining:</strong> ${new Date(doj).toLocaleDateString()}</li>
          </ul>
          
          <p>This offer is valid for 7 days from the date of issuance. Please review the attached detailed compensation structure and terms of employment.</p>
          
          <p>We look forward to welcoming you to the team!</p>
          
          <div style="margin-top: 60px;">
            <p>Sincerely,</p>
            <p><strong>Human Resources Team</strong><br>Nexora Solutions</p>
          </div>
        </body>
      </html>
    `;

    // 3. Generate PDF
    const pdfBuffer = await pdfService.generatePdfFromHtml(offerHtml);

    // 4. Generate Secure Token
    const token = tokenService.generateOfferToken(candidateId, candidate.job_id, ctc, doj);
    
    // Construct acceptance link (Requires frontend route /careers/offers/accept)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const acceptLink = `${appUrl}/careers/offers/accept?token=${token}`;

    // 5. Dispatch Email
    await emailService.sendEmail({
      to: candidate.email,
      subject: `Offer Letter from Nexora Solutions - ${designation}`,
      html: `
        <p>Dear ${candidate.full_name},</p>
        <p>Congratulations! We are pleased to offer you the position of <strong>${designation}</strong>.</p>
        <p>Please find your official offer letter attached.</p>
        <p>To accept or reject this offer, please click the secure link below. This link is valid for 7 days and can only be used once.</p>
        <div style="margin: 30px 0;">
          <a href="${acceptLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Review and Respond to Offer</a>
        </div>
        <p>Best regards,<br>Nexora HR Team</p>
      `,
      attachments: [
        {
          filename: `Offer_Letter_${candidate.full_name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    // 6. Update Timeline
    await supabase.from('candidate_timeline').insert({
      candidate_id: candidateId,
      stage: 'Offer Released',
      action: 'Offer Letter Emailed',
      notes: `Sent offer for ${designation} at CTC ${ctc}. Token generated.`,
      performed_by: user.id
    });

    // 7. Update Candidate Stage
    await supabase
      .from('candidates')
      .update({ 
        current_stage: 'Offer Released',
        expected_ctc: ctc, // Alternatively recommended_ctc if schema allowed
        expected_joining_date: doj,
        offer_valid_till: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', candidateId);

    return NextResponse.json({ success: true, message: "Offer dispatched successfully" });

  } catch (error) {
    console.error("Offer dispatch error:", error);
    return NextResponse.json({ error: "Failed to dispatch offer" }, { status: 500 });
  }
}
