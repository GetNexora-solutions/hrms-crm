import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { EmployeeIdConfig, resolvePatternPrefixes, generateEmployeeId } from '@/lib/services/employee-id'
import { getNextEmployeeSerial } from '@/lib/services/employee-serial'

// Temporary config for Phase B
const TEMP_ID_CONFIG: EmployeeIdConfig = {
  pattern: 'EMP{SERIAL}',
  serialLength: 4,
  startingNumber: 1,
  resetPolicy: 'never'
}

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: currentEmployee, error: verifyError } = await supabase
      .from('employees')
      .select('role, company_id')
      .eq('user_id', user.id)
      .single()

    if (verifyError || !currentEmployee) {
      return NextResponse.json({ success: false, error: 'Failed to verify authorization' }, { status: 403 })
    }

    if (currentEmployee.role !== 'super_admin' && currentEmployee.role !== 'hr') {
      return NextResponse.json({ success: false, error: 'Insufficient permissions to create employees' }, { status: 403 })
    }

    const { employee } = await req.json()
    const supabaseAdmin = createAdminClient()

    // 1. Generate Employee ID
    const joiningDate = employee.date_of_joining ? new Date(employee.date_of_joining) : new Date()
    const variables = {
      YYYY: joiningDate.getFullYear().toString(),
      YY: joiningDate.getFullYear().toString().slice(-2),
      MM: (joiningDate.getMonth() + 1).toString().padStart(2, '0'),
      DD: joiningDate.getDate().toString().padStart(2, '0'),
      DEPT: employee.department ? employee.department.substring(0, 3).toUpperCase() : 'GEN'
    }

    const resolvedPattern = resolvePatternPrefixes(TEMP_ID_CONFIG, variables)
    const parts = resolvedPattern.split('{SERIAL}')
    const prefixPart = parts[0]
    const suffixPart = parts[1] || ''

    const nextSerial = await getNextEmployeeSerial(supabaseAdmin, TEMP_ID_CONFIG, {
      companyId: currentEmployee.company_id,
      joiningDate,
      prefixPart,
      suffixPart
    })

    const newEmpId = generateEmployeeId(resolvedPattern, nextSerial, TEMP_ID_CONFIG.serialLength)

    // Generate random temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: employee.email,
      password: tempPassword,
      email_confirm: true
    })

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // 3. Create Employee Record
    const { data: empData, error: empError } = await supabaseAdmin.from('employees').insert({
      id: userId,
      user_id: userId,
      company_id: currentEmployee.company_id,
      emp_id: newEmpId,
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

    // 4. (Mock) Send Welcome Email & WhatsApp
    const mockEmailStatus = `Sent to ${employee.email}`
    const mockWhatsAppStatus = `Sent to ${employee.phone}`

    return NextResponse.json({ 
      success: true, 
      employee: empData,
      tempPassword,
      email: mockEmailStatus,
      whatsapp: mockWhatsAppStatus
    })

  } catch (error: unknown) {
    console.error('Onboarding Error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
