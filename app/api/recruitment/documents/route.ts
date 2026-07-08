import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RecruitmentService } from '@/lib/services/recruitment'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const service = new RecruitmentService(supabase)
    const body = await request.json()

    if (!body.candidate_id || !body.category || !body.document_type || !body.file_name || !body.storage_path || !body.file_url) {
      return NextResponse.json({ error: 'Missing required document metadata fields' }, { status: 400 })
    }

    const document = await service.createDocument(body)
    return NextResponse.json(document, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
