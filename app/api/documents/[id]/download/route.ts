import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCurrentEmployee, hasPermission } from '@/lib/rbac'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const currentEmployee = await getCurrentEmployee()
    if (!currentEmployee) return NextResponse.json({ error: 'Unauthorized or invalid employee' }, { status: 401 })

    // Fetch doc info
    const { data: document } = await supabase
      .from('documents')
      .select('*, employees(user_id)')
      .eq('id', params.id)
      .single()

    if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Check permissions
    const isAdmin = hasPermission(currentEmployee.role, ['super_admin', 'hr', 'md', 'admin'])
    
    if (!isAdmin && document.employee_id !== currentEmployee.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_url, 60) // valid for 60s

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 })
    }

    return NextResponse.redirect(data.signedUrl)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
