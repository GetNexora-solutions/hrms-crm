import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RecruitmentService } from '@/lib/services/recruitment'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const filters = {
      current_stage: searchParams.get('current_stage'),
      recruiter_id: searchParams.get('recruiter_id'),
      job_id: searchParams.get('job_id'),
      search: searchParams.get('search'),
    }

    const service = new RecruitmentService(supabase)
    const candidates = await service.getCandidates(filters)

    return NextResponse.json(candidates)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const service = new RecruitmentService(supabase)
    const body = await request.json()

    // Required fields validation
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: 'name, email, and phone are required' }, { status: 400 })
    }

    const candidate = await service.createCandidate(body)
    return NextResponse.json(candidate, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
