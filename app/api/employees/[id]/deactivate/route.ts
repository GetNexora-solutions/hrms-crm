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

    // Must be an admin role to deactivate
    const adminRoles = ['super_admin', 'hr', 'md', 'admin']
    if (!adminRoles.includes(currentEmployee.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    // 2. Fetch target employee
    const { data: targetEmployee, error: targetError } = await supabase
      .from('employees')
      .select('id, role, company_id, status')
      .eq('id', params.id)
      .single()

    if (targetError || !targetEmployee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    // 3. Security Checks
    // Company boundary
    if (targetEmployee.company_id !== currentEmployee.company_id) {
      return NextResponse.json({ success: false, error: 'Employee not found in your company' }, { status: 404 })
    }

    // Self-deactivation
    if (targetEmployee.id === currentEmployee.id) {
      return NextResponse.json({ success: false, error: 'You cannot deactivate your own account' }, { status: 403 })
    }

    // Super admin deactivation
    if (targetEmployee.role === 'super_admin') {
      return NextResponse.json({ success: false, error: 'Super Admin accounts cannot be deactivated' }, { status: 403 })
    }

    // Already inactive
    if (targetEmployee.status === 'inactive') {
      return NextResponse.json({ success: false, error: 'Employee is already deactivated' }, { status: 400 })
    }

    // Last Active Administrator Protection
    if (['admin', 'hr', 'md'].includes(targetEmployee.role)) {
      const { count, error: countError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', currentEmployee.company_id)
        .eq('status', 'active')
        .in('role', ['admin', 'hr', 'md'])

      if (countError) {
        return NextResponse.json({ success: false, error: 'Failed to verify active administrators' }, { status: 500 })
      }

      if (count !== null && count <= 1) {
        return NextResponse.json({ success: false, error: 'Cannot deactivate the last active administrator for this company.' }, { status: 403 })
      }
    }

    // 4. Update the database
    const { data: updateData, error: updateError } = await supabase
      .from('employees')
      .update({ status: 'inactive' })
      .eq('id', params.id)
      .eq('status', 'active') // Concurrency check
      .select('id')

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    if (!updateData || updateData.length === 0) {
      return NextResponse.json({ success: false, error: 'Employee was already deactivated or modified by another request.' }, { status: 409 })
    }

    return NextResponse.json({ success: true, message: 'Employee deactivated successfully.' })

  } catch (error: unknown) {
    console.error('Deactivate Error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
