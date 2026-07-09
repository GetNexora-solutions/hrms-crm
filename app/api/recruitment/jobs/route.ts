import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RecruitmentService } from '@/lib/services/recruitment'
import { getCurrentEmployee, hasPermission } from '@/lib/rbac'

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
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentEmployee = await getCurrentEmployee()
    
    if (!currentEmployee) {
      return NextResponse.json({ error: 'Unauthorized or invalid employee' }, { status: 401 })
    }

    if (!hasPermission(currentEmployee.role, ['super_admin', 'hr', 'md', 'admin', 'recruiter', 'manager'])) {
      return NextResponse.json({ error: 'Insufficient permissions to create jobs' }, { status: 403 })
    }

    const body = await request.json()
    console.log("Job Creation API - Received Payload:", body)

    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // Sanitize payload to match the database schema (001_initial_schema.sql)
    const jobPayload: Record<string, unknown> = {
      title: body.title,
      department: body.department,
      status: body.status || 'open',
      posted_by: currentEmployee.id
    }

    try {
      const supabase = createClient()
      const service = new RecruitmentService(supabase)
      const job = await service.createJob(jobPayload)
      
      console.log("Job Creation API - Success:", job.id)
      return NextResponse.json(job, { status: 201 })
    } catch (dbError: unknown) {
      console.error("Supabase Insert Error:", dbError)
      throw dbError
    }

  } catch (error: unknown) {
    console.error("Job Creation API - General Error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
