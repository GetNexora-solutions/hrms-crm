import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RecruitmentService } from '@/lib/services/recruitment'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const service = new RecruitmentService(supabase)
    const job = await service.getJobById(params.id)
    return NextResponse.json(job)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const service = new RecruitmentService(supabase)
    const body = await request.json()
    const job = await service.updateJob(params.id, body)
    return NextResponse.json(job)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const service = new RecruitmentService(supabase)
    const job = await service.deleteJob(params.id)
    return NextResponse.json(job)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
