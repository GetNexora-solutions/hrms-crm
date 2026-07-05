import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { employeeId, selfieBase64, lat, lng, type } = await req.json()
    const supabase = createClient()

    const today = new Date().toISOString().split('T')[0]

    if (type === 'check_in') {
      let selfie_url = null
      
      // Upload selfie if provided
      if (selfieBase64) {
        const buffer = Buffer.from(selfieBase64, 'base64')
        const filePath = `${employeeId}/${today}.jpg`
        const { data, error } = await supabase.storage
          .from('selfies')
          .upload(filePath, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          })
          
        if (!error && data) {
          selfie_url = data.path
        }
      }

      const { data, error } = await supabase.from('attendance').upsert({
        employee_id: employeeId,
        date: today,
        check_in: new Date().toISOString(),
        check_in_lat: lat,
        check_in_lng: lng,
        selfie_url,
        status: 'present'
      }, { onConflict: 'employee_id, date' }).select().single()

      if (error) throw error
      return NextResponse.json({ success: true, data })
    } 
    
    if (type === 'check_out') {
      // For checkout, we update the existing record
      const { data, error } = await supabase.from('attendance')
        .update({
          check_out: new Date().toISOString(),
          check_out_lat: lat,
          check_out_lng: lng,
        })
        .eq('employee_id', employeeId)
        .eq('date', today)
        .select().single()

      if (error) throw error
      
      // Calculate working hours
      if (data && data.check_in && data.check_out) {
        const diffMs = new Date(data.check_out).getTime() - new Date(data.check_in).getTime()
        const diffHrs = diffMs / (1000 * 60 * 60)
        
        await supabase.from('attendance').update({
          working_hours: diffHrs
        }).eq('id', data.id)
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ success: false, error: 'Invalid action type' }, { status: 400 })
  } catch (error: any) {
    console.error('Checkin Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
