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

    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const parseNumber = (val: unknown) => val && !isNaN(Number(val)) ? Number(val) : null;
    const parseArray = (val: unknown) => typeof val === 'string' ? val.split(',').map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(val) ? val : null);
    const parseUUID = (val: unknown) => (typeof val === 'string' && val.trim() !== '') ? val.trim() : null;

    const jobPayload: Record<string, unknown> = {
      company_id: currentEmployee.company_id,
      posted_by: currentEmployee.id,
      title: body.title,
      department: body.department,
      positions: parseNumber(body.positions) || 1,
      status: body.status || 'Open',
      description: body.description,
      employment_type: body.employment_type || null,
      hiring_priority: body.hiring_priority || null,
      location_type: body.location_type || null,
      hiring_type: body.hiring_type || null,
      office_location: body.office_location || null,
      reporting_manager_id: parseUUID(body.reporting_manager_id),
      recruiter_id: parseUUID(body.recruiter_id),
      hiring_manager: parseUUID(body.hiring_manager),
      min_experience: parseNumber(body.min_experience),
      max_experience: parseNumber(body.max_experience),
      min_salary: parseNumber(body.min_salary),
      max_salary: parseNumber(body.max_salary),
      required_skills: parseArray(body.required_skills),
      education_required: body.education_required || null,
      joining_date: body.joining_date || null,
      closing_date: body.closing_date || null,
      approval_status: body.approval_status || 'Pending',
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
