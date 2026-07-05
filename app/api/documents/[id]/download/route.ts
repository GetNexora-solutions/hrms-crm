import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch doc info
    const { data: document } = await supabase
      .from('documents')
      .select('*, employees(user_id)')
      .eq('id', params.id)
      .single()

    if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Check permissions
    const { data: currentUser } = await supabase.from('employees').select('role, id').eq('user_id', user.id).single()
    const isAdmin = ['super_admin', 'hr', 'md', 'admin'].includes(currentUser?.role || '')
    
    if (!isAdmin && document.employee_id !== currentUser?.id) {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
