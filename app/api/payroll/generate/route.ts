import { createClient } from '@/lib/supabase/server'
import { calculatePayroll } from '@/lib/payroll'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { month, workingDays } = await req.json() // e.g. "2025-06"
    const supabase = createClient()
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    // Role check (must be admin/hr/finance)
    const { data: admin } = await supabase.from('employees').select('role').eq('user_id', user.id).single()
    if (!['super_admin', 'hr', 'finance', 'md', 'admin'].includes(admin?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Fetch all active employees
    const { data: employees } = await supabase.from('employees').select('*').eq('status', 'active')
    
    if (!employees) return NextResponse.json({ error: 'No employees found' }, { status: 404 })

    const [yearStr, monthStr] = month.split('-')
    const startDate = new Date(Number(yearStr), Number(monthStr) - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(Number(yearStr), Number(monthStr), 0).toISOString().split('T')[0]

    // 2. Process each employee
    for (const emp of employees) {
      // Get attendance for the month
      const { data: attendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('employee_id', emp.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('status', 'present')
      
      const presentDays = attendance?.length || 0

      // Get approved paid leaves
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('days')
        .eq('employee_id', emp.id)
        .eq('status', 'approved')
        .gte('from_date', startDate)
        .lte('to_date', endDate)
      
      const paidLeaves = leaves?.reduce((acc, curr) => acc + curr.days, 0) || 0
      const totalPayableDays = presentDays + paidLeaves

      const calc = calculatePayroll(emp, totalPayableDays, workingDays)

      await supabase.from('payroll').upsert({
        employee_id: emp.id,
        month,
        basic_salary: calc.basic,
        hra: calc.hra,
        da: calc.da,
        travel_allowance: calc.ta,
        other_allowance: calc.other,
        gross_salary: calc.gross,
        pf_deduction: calc.pf,
        esi_deduction: calc.esi,
        professional_tax: calc.pt,
        tds_deduction: calc.tds,
        total_deductions: calc.totalDeductions,
        net_salary: calc.netSalary,
        working_days: workingDays,
        present_days: presentDays,
        paid_leaves: paidLeaves,
        status: 'draft'
      }, { onConflict: 'employee_id, month' })
    }

    return NextResponse.json({ success: true, processed: employees.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
