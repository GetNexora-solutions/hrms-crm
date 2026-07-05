import { askHRAgent } from '@/lib/gemini'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json()
    const supabase = createClient()
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Employee Data
    const { data: employee } = await supabase
      .from('employees')
      .select('id, role')
      .eq('user_id', user.id)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Pass data into Gemini
    const reply = await askHRAgent(message, context)

    // Log the chat (Async)
    supabase.from('ai_chat_logs').insert([
      { employee_id: employee.id, role: 'user', message: message, context: context.module },
      { employee_id: employee.id, role: 'assistant', message: reply, context: context.module }
    ]).then()

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error('AI Agent Error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
