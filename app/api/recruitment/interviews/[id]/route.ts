import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { RecruitmentService } from '@/lib/services/recruitment'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const service = new RecruitmentService(supabase)
    const interview = await service.getInterviewById(params.id)
    return NextResponse.json(interview)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const service = new RecruitmentService(supabase)
    const body = await request.json()
    const interview = await service.updateInterview(params.id, body)
    return NextResponse.json(interview)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const service = new RecruitmentService(supabase)
    const interview = await service.cancelInterview(params.id)
    return NextResponse.json(interview)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
