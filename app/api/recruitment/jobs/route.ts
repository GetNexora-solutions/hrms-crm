import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RecruitmentService } from '@/lib/services/recruitment'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    
    const filters = {
      status: searchParams.get('status'),
      department: searchParams.get('department'),
      location_type: searchParams.get('location_type'),
      employment_type: searchParams.get('employment_type'),
      recruiter_id: searchParams.get('recruiter_id'),
    }

    const service = new RecruitmentService(supabase)
    const jobs = await service.getJobs(filters)

    return NextResponse.json(jobs)
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
    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const job = await service.createJob(body)
    return NextResponse.json(job, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
