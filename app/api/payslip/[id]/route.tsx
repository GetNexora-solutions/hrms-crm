import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToStream } from '@react-pdf/renderer'
import { PayslipDocument } from '@/components/pdf/PayslipDocument'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch payroll record
    const { data: payroll } = await supabase
      .from('payroll')
      .select('*, employees(*, companies(*))')
      .eq('id', params.id)
      .single()

    if (!payroll) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Role check (must be admin/hr/finance OR the employee themselves)
    const { data: currentUser } = await supabase.from('employees').select('role, id').eq('user_id', user.id).single()
    
    if (
      !['super_admin', 'hr', 'finance', 'md', 'admin'].includes(currentUser?.role || '') &&
      currentUser?.id !== payroll.employee_id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const stream = await renderToStream(<PayslipDocument payroll={payroll} />)
    
    return new Response(stream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Payslip_${payroll.month}_${payroll.employees.emp_id}.pdf"`
      }
    })

  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
