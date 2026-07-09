import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCurrentEmployee, hasPermission } from '@/lib/rbac'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const currentEmployee = await getCurrentEmployee()

    if (!currentEmployee) {
      return NextResponse.json({ success: false, error: 'Unauthorized or invalid employee' }, { status: 401 })
    }

    if (!hasPermission(currentEmployee.role, ['super_admin', 'hr', 'md', 'admin'])) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions to update employees' }, { status: 403 })
    }

    const { employee } = await req.json()
    const supabase = createClient()

    // 1. Verify target employee belongs to the same company
    const { data: targetEmployee, error: targetError } = await supabase
      .from('employees')
      .select('company_id')
      .eq('id', params.id)
      .single()
      
    if (targetError || !targetEmployee) {
        return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }
    
    if (targetEmployee.company_id !== currentEmployee.company_id) {
        return NextResponse.json({ success: false, error: 'Unauthorized to edit this employee' }, { status: 403 })
    }

    // 2. Validate and extract strictly allowed fields
    const parsedSalary = parseFloat(employee.salary)
    
    if (Number.isNaN(parsedSalary)) {
      return NextResponse.json({ success: false, error: 'Invalid salary.' }, { status: 400 })
    }

    const updateData = {
      full_name: employee.full_name,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      role: employee.role,
      salary: parsedSalary,
      bank_name: employee.bank_name,
      bank_account: employee.bank_account,
      bank_ifsc: employee.bank_ifsc,
      updated_at: new Date().toISOString(),
    }

    // 3. Update Employee Record
    const { data: empData, error: empError } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (empError) {
      return NextResponse.json({ success: false, error: empError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      employee: empData
    })

  } catch (error: unknown) {
    console.error('Update Employee Error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
