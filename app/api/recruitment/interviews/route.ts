import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RecruitmentService } from '@/lib/services/recruitment'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const filters = {
      candidate_id: searchParams.get('candidate_id'),
      interviewer_id: searchParams.get('interviewer_id'),
      status: searchParams.get('status'),
    }

    const service = new RecruitmentService(supabase)
    const interviews = await service.getInterviews(filters)

    return NextResponse.json(interviews)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const service = new RecruitmentService(supabase)
    const body = await request.json()

    if (!body.candidate_id || !body.job_id || !body.round || !body.mode || !body.interviewer_id || !body.date || !body.time) {
      return NextResponse.json({ error: 'Missing required interview fields' }, { status: 400 })
    }

    const interview = await service.createInterview(body)
    return NextResponse.json(interview, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
