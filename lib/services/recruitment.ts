import { SupabaseClient } from '@supabase/supabase-js'

export class RecruitmentService {
  constructor(private supabase: SupabaseClient) {}

  // --------------------------------------------------------
  // TIMELINE EVENTS
  // --------------------------------------------------------
  async insertTimelineEvent(
    candidateId: string,
    stage: string,
    action: string,
    notes?: string
  ) {
    const { data: userData } = await this.supabase.auth.getUser()
    let performedBy = null
    if (userData?.user) {
      const { data: empData } = await this.supabase
        .from('employees')
        .select('id')
        .eq('user_id', userData.user.id)
        .single()
      if (empData) {
        performedBy = empData.id
      }
    }

    return this.supabase.from('candidate_timeline').insert({
      candidate_id: candidateId,
      stage,
      action,
      notes,
      performed_by: performedBy,
      created_by: performedBy,
    })
  }

  // --------------------------------------------------------
  // JOB POSTINGS
  // --------------------------------------------------------
  async getJobs(filters: Record<string, unknown> = {}) {
    let query = this.supabase.from('job_postings').select('*')

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.department) query = query.eq('department', filters.department)
    if (filters.location_type) query = query.eq('location_type', filters.location_type)
    if (filters.employment_type) query = query.eq('employment_type', filters.employment_type)
    if (filters.recruiter_id) query = query.eq('recruiter_id', filters.recruiter_id)

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async getJobById(id: string) {
    const { data, error } = await this.supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async createJob(payload: Record<string, unknown>) {
    const { data, error } = await this.supabase
      .from('job_postings')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async updateJob(id: string, payload: Record<string, unknown>) {
    const { data, error } = await this.supabase
      .from('job_postings')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async deleteJob(id: string) {
    // Soft delete via status
    return this.updateJob(id, { status: 'Cancelled' })
  }

  // --------------------------------------------------------
  // CANDIDATES
  // --------------------------------------------------------
  async getCandidates(filters: Record<string, unknown> = {}) {
    let query = this.supabase.from('candidates').select('*')

    if (filters.current_stage) query = query.eq('current_stage', filters.current_stage)
    if (filters.recruiter_id) query = query.eq('recruiter_id', filters.recruiter_id)
    if (filters.job_id) query = query.eq('job_id', filters.job_id)

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async getCandidateById(id: string) {
    const { data, error } = await this.supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  // --------------------------------------------------------
  // DUPLICATE DETECTION
  // --------------------------------------------------------
  async checkDuplicate(email: string, phone: string): Promise<Record<string, unknown>[]> {
    if (!email && !phone) return []

    let query = this.supabase
      .from('candidates')
      .select('id, name, email, phone, current_stage, created_at')

    if (email && phone) {
      query = query.or(`email.ilike.%${email}%,phone.ilike.%${phone}%`)
    } else if (email) {
      query = query.ilike('email', `%${email}%`)
    } else if (phone) {
      query = query.ilike('phone', `%${phone}%`)
    }

    const { data, error } = await query.limit(5)
    
    if (error) {
      console.error("Error checking for duplicate candidates:", error)
      throw error
    }

    return data || []
  }

  async createCandidate(payload: Record<string, unknown>) {
    const { data, error } = await this.supabase
      .from('candidates')
      .insert(payload)
      .select()
      .single()
    
    if (error) throw error
    
    // Timeline
    try {
      await this.insertTimelineEvent(
        data.id, 
        data.current_stage || 'Applied', 
        'Candidate Created', 
        'Candidate added to system.'
      )
    } catch (err) {
      console.error("Timeline insert failed", err)
    }

    
    return data
  }

  async updateCandidate(id: string, payload: Record<string, unknown>) {
    // Get existing to check if stage changed
    const existing = await this.getCandidateById(id)
    
    const { data, error } = await this.supabase
      .from('candidates')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    
    if (existing.current_stage !== data.current_stage) {
       try {
         await this.insertTimelineEvent(
           data.id,
           data.current_stage,
           'Stage Updated',
           `Moved from ${existing.current_stage} to ${data.current_stage}`
         )
       } catch (err) {
         console.error("Timeline insert failed", err)
       }
    } else {
       try {
         await this.insertTimelineEvent(
           data.id,
           data.current_stage,
           'Profile Updated',
           'Candidate profile details updated.'
         )
       } catch (err) {
         console.error("Timeline insert failed", err)
       }
    }

    return data
  }

  async deleteCandidate(id: string) {
    // Soft delete via current_stage = Rejected
    return this.updateCandidate(id, { current_stage: 'Rejected' })
  }

  // --------------------------------------------------------
  // INTERVIEWS
  // --------------------------------------------------------
  async getInterviews(filters: Record<string, unknown> = {}) {
    let query = this.supabase.from('interviews').select('*, candidates(name, current_stage), job_postings(title)')

    if (filters.candidate_id) query = query.eq('candidate_id', filters.candidate_id)
    if (filters.interviewer_id) query = query.eq('interviewer_id', filters.interviewer_id)
    if (filters.status) query = query.eq('status', filters.status)

    query = query.order('date', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async getInterviewById(id: string) {
    const { data, error } = await this.supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async createInterview(payload: Record<string, unknown>) {
    const { data, error } = await this.supabase
      .from('interviews')
      .insert(payload)
      .select()
      .single()
    
    if (error) throw error
    
    try {
      await this.insertTimelineEvent(
        data.candidate_id, 
        'Interview Scheduled', 
        'Interview Created', 
        `Scheduled for ${data.date} via ${data.mode}`
      )
    } catch (err) {
      console.error("Timeline insert failed", err)
    }
    
    return data
  }

  async updateInterview(id: string, payload: Record<string, unknown>) {
    const { data, error } = await this.supabase
      .from('interviews')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    
    try {
      await this.insertTimelineEvent(
        data.candidate_id, 
        'Interview Updated', 
        `Interview Status: ${data.status}`, 
        `Interview details updated. Result: ${data.result || 'Pending'}`
      )
    } catch (err) {
      console.error("Timeline insert failed", err)
    }
    
    return data
  }

  async cancelInterview(id: string) {
    return this.updateInterview(id, { status: 'Cancelled' })
  }

  // --------------------------------------------------------
  // DOCUMENTS
  // --------------------------------------------------------
  async createDocument(payload: Record<string, unknown>) {
    const { data, error } = await this.supabase
      .from('candidate_documents')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    
    try {
      await this.insertTimelineEvent(
        data.candidate_id,
        'Document Uploaded',
        'Document Added',
        `${data.document_type} uploaded.`
      )
    } catch (err) {
      console.error("Timeline insert failed", err)
    }
    
    return data
  }
  async getCandidateTimeline(candidateId: string) {
    const { data, error } = await this.supabase
      .from('candidate_timeline')
      .select('*, performed_by_employee:employees!candidate_timeline_performed_by_fkey(full_name)')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  async getCandidateDocuments(candidateId: string) {
    const { data, error } = await this.supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
}
