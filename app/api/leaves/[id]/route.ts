import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Get current user's employee record to verify role
    const { data: currentEmployee, error: verifyError } = await supabase
      .from('employees')
      .select('id, role, company_id')
      .eq('user_id', user.id)
      .single()

    if (verifyError || !currentEmployee) {
      return NextResponse.json({ success: false, error: 'Failed to verify authorization' }, { status: 403 })
    }

    // Must be an admin role to approve/reject
    const adminRoles = ['super_admin', 'hr', 'md', 'admin']
    if (!adminRoles.includes(currentEmployee.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    // 2. Validate payload
    const body = await req.json()
    const { action, rejection_reason } = body

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    // 3. Fetch existing leave request to verify it's pending and belongs to same company
    const { data: leaveRequest, error: leaveError } = await supabase
      .from('leave_requests')
      .select('*, employees!inner(company_id)')
      .eq('id', params.id)
      .single()

    if (leaveError || !leaveRequest) {
      return NextResponse.json({ success: false, error: 'Leave request not found' }, { status: 404 })
    }

    // Company boundary check
    if ((leaveRequest.employees as { company_id: string }).company_id !== currentEmployee.company_id) {
      return NextResponse.json({ success: false, error: 'Leave request not found in your company' }, { status: 404 })
    }

    // Self-approval check
    if (leaveRequest.employee_id === currentEmployee.id) {
      return NextResponse.json({ success: false, error: 'Cannot approve or reject your own leave request' }, { status: 403 })
    }

    // Ensure it's still pending and not already approved/rejected
    if (leaveRequest.status !== 'pending' || leaveRequest.approved_by !== null || leaveRequest.approved_at !== null) {
      return NextResponse.json({ success: false, error: 'Leave request has already been processed' }, { status: 400 })
    }

    // 4. Update the database
    const updateData: Record<string, string | null> = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: currentEmployee.id,
      approved_at: new Date().toISOString()
    }

    if (action === 'reject' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    const { data: updatedRows, error: updateError } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', params.id)
      .eq('status', 'pending') // Double check condition for concurrency safety
      .select('id')

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Leave request has already been processed by another reviewer' }, { status: 409 })
    }

    return NextResponse.json({ success: true, message: `Leave request ${action}d successfully.` })

  } catch (error: unknown) {
    console.error('Leave Review Error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
