import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { employee } = await req.json()
    const supabaseAdmin = createAdminClient()

    // Generate random temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: employee.email,
      password: tempPassword,
      email_confirm: true
    })

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // 2. Create Employee Record
    const { data: empData, error: empError } = await supabaseAdmin.from('employees').insert({
      id: userId,
      user_id: userId,
      company_id: employee.company_id,
      emp_id: employee.emp_id,
      full_name: employee.full_name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      role: employee.role,
      bank_name: employee.bank_name,
      bank_account: employee.bank_account,
      bank_ifsc: employee.bank_ifsc,
      salary: parseFloat(employee.salary),
      status: 'active'
    }).select().single()

    if (empError) {
      // Rollback auth user
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ success: false, error: empError.message }, { status: 400 })
    }

    // 3. (Mock) Send Welcome Email & WhatsApp
    // In production, integrate Resend and Twilio here.
    const mockEmailStatus = `Sent to ${employee.email}`
    const mockWhatsAppStatus = `Sent to ${employee.phone}`

    return NextResponse.json({ 
      success: true, 
      employee: empData,
      email: mockEmailStatus,
      whatsapp: mockWhatsAppStatus
    })

  } catch (error: unknown) {
    console.error('Onboarding Error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
