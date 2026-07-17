-- Migration: Phase D1 Recruitment Schema
-- Description: Configurable masters, rich document tracking, timelines, extensible profiles

-- 1. Helper Triggers (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Create Master Tables
CREATE TABLE IF NOT EXISTS public.recruitment_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    allow_candidate_move BOOLEAN DEFAULT true,
    allow_rejection BOOLEAN DEFAULT true,
    allow_hold BOOLEAN DEFAULT true,
    allow_offer BOOLEAN DEFAULT false,
    allow_employee_conversion BOOLEAN DEFAULT false,
    is_system_stage BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, code)
);
DROP TRIGGER IF EXISTS update_recruitment_stages_updated_at ON public.recruitment_stages;
CREATE TRIGGER update_recruitment_stages_updated_at BEFORE UPDATE ON public.recruitment_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    code TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, code)
);
DROP TRIGGER IF EXISTS update_document_types_updated_at ON public.document_types;
CREATE TRIGGER update_document_types_updated_at BEFORE UPDATE ON public.document_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.interview_modes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, name)
);
DROP TRIGGER IF EXISTS update_interview_modes_updated_at ON public.interview_modes;
CREATE TRIGGER update_interview_modes_updated_at BEFORE UPDATE ON public.interview_modes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Modify Existing Tables

-- job_postings
ALTER TABLE public.job_postings
ADD COLUMN IF NOT EXISTS public_link_token UUID UNIQUE DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS link_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_link_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_applications INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS application_form_schema JSONB,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- candidates
ALTER TABLE public.candidates
ADD COLUMN IF NOT EXISTS pipeline_stage_id UUID REFERENCES public.recruitment_stages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS applied_form_schema JSONB,
ADD COLUMN IF NOT EXISTS custom_fields JSONB,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- interviews
ALTER TABLE public.interviews
ADD COLUMN IF NOT EXISTS round_number INTEGER,
ADD COLUMN IF NOT EXISTS mode_id UUID REFERENCES public.interview_modes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 4. Create / Alter Operational Tables

CREATE TABLE IF NOT EXISTS public.candidate_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    notes TEXT,
    metadata JSONB,
    related_table TEXT,
    related_record_id UUID,
    performed_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    is_system_generated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.candidate_timeline
ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'Log',
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS related_table TEXT,
ADD COLUMN IF NOT EXISTS related_record_id UUID,
ADD COLUMN IF NOT EXISTS is_system_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DROP TRIGGER IF EXISTS update_candidate_timeline_updated_at ON public.candidate_timeline;
CREATE TRIGGER update_candidate_timeline_updated_at BEFORE UPDATE ON public.candidate_timeline FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE IF NOT EXISTS public.candidate_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
    original_file_name TEXT,
    stored_file_name TEXT,
    mime_type TEXT,
    file_size BIGINT,
    storage_provider TEXT DEFAULT 'supabase',
    storage_path TEXT,
    bucket_name TEXT DEFAULT 'recruitment-documents',
    version INTEGER DEFAULT 1,
    checksum TEXT,
    uploaded_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.candidate_documents
ADD COLUMN IF NOT EXISTS document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS original_file_name TEXT,
ADD COLUMN IF NOT EXISTS stored_file_name TEXT,
ADD COLUMN IF NOT EXISTS storage_provider TEXT DEFAULT 'supabase',
ADD COLUMN IF NOT EXISTS bucket_name TEXT DEFAULT 'recruitment-documents',
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS checksum TEXT,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DROP TRIGGER IF EXISTS update_candidate_documents_updated_at ON public.candidate_documents;
CREATE TRIGGER update_candidate_documents_updated_at BEFORE UPDATE ON public.candidate_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE IF NOT EXISTS public.job_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
    original_file_name TEXT NOT NULL,
    stored_file_name TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    storage_provider TEXT DEFAULT 'supabase',
    storage_path TEXT NOT NULL,
    bucket_name TEXT DEFAULT 'recruitment-documents',
    version INTEGER DEFAULT 1,
    checksum TEXT,
    uploaded_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS update_job_attachments_updated_at ON public.job_attachments;
CREATE TRIGGER update_job_attachments_updated_at BEFORE UPDATE ON public.job_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TABLE IF NOT EXISTS public.interview_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
    interviewer_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    scorecard JSONB,
    notes TEXT,
    recommendation TEXT,
    attachments TEXT[],
    created_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS update_interview_feedback_updated_at ON public.interview_feedback;
CREATE TRIGGER update_interview_feedback_updated_at BEFORE UPDATE ON public.interview_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 5. Storage Bucket Configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recruitment-documents', 'recruitment-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_recruitment_stages_company ON public.recruitment_stages(company_id);
CREATE INDEX IF NOT EXISTS idx_document_types_company ON public.document_types(company_id);
CREATE INDEX IF NOT EXISTS idx_interview_modes_company ON public.interview_modes(company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_pipeline_stage ON public.candidates(pipeline_stage_id);
CREATE INDEX IF NOT EXISTS idx_candidate_timeline_candidate ON public.candidate_timeline(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_docs_candidate ON public.candidate_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_attachments_job ON public.job_attachments(job_id);
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview ON public.interview_feedback(interview_id);

-- 7. RLS Policies
ALTER TABLE public.recruitment_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;

-- Helper policies for Master Tables
DROP POLICY IF EXISTS "Employees can view company recruitment_stages" ON public.recruitment_stages;
CREATE POLICY "Employees can view company recruitment_stages" ON public.recruitment_stages FOR SELECT USING (company_id = public.get_employee_company_id());
DROP POLICY IF EXISTS "Admins can manage company recruitment_stages" ON public.recruitment_stages;
CREATE POLICY "Admins can manage company recruitment_stages" ON public.recruitment_stages FOR ALL USING (company_id = public.get_employee_company_id() AND public.has_role(ARRAY['admin', 'super_admin', 'hr']));

DROP POLICY IF EXISTS "Employees can view company document_types" ON public.document_types;
CREATE POLICY "Employees can view company document_types" ON public.document_types FOR SELECT USING (company_id = public.get_employee_company_id());
DROP POLICY IF EXISTS "Admins can manage company document_types" ON public.document_types;
CREATE POLICY "Admins can manage company document_types" ON public.document_types FOR ALL USING (company_id = public.get_employee_company_id() AND public.has_role(ARRAY['admin', 'super_admin', 'hr']));

DROP POLICY IF EXISTS "Employees can view company interview_modes" ON public.interview_modes;
CREATE POLICY "Employees can view company interview_modes" ON public.interview_modes FOR SELECT USING (company_id = public.get_employee_company_id());
DROP POLICY IF EXISTS "Admins can manage company interview_modes" ON public.interview_modes;
CREATE POLICY "Admins can manage company interview_modes" ON public.interview_modes FOR ALL USING (company_id = public.get_employee_company_id() AND public.has_role(ARRAY['admin', 'super_admin', 'hr']));

-- candidate_timeline RLS
DROP POLICY IF EXISTS "Employees can view candidate_timeline for company" ON public.candidate_timeline;
CREATE POLICY "Employees can view candidate_timeline for company" ON public.candidate_timeline FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.candidates
        WHERE candidates.id = candidate_timeline.candidate_id
        AND EXISTS (SELECT 1 FROM public.job_postings WHERE job_postings.id = candidates.job_id AND job_postings.company_id = public.get_employee_company_id())
    )
);
DROP POLICY IF EXISTS "Employees can insert candidate_timeline for company" ON public.candidate_timeline;
CREATE POLICY "Employees can insert candidate_timeline for company" ON public.candidate_timeline FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.candidates
        WHERE candidates.id = candidate_timeline.candidate_id
        AND EXISTS (SELECT 1 FROM public.job_postings WHERE job_postings.id = candidates.job_id AND job_postings.company_id = public.get_employee_company_id())
    )
);

-- job_attachments RLS
DROP POLICY IF EXISTS "Employees can view company job_attachments" ON public.job_attachments;
CREATE POLICY "Employees can view company job_attachments" ON public.job_attachments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.job_postings
        WHERE job_postings.id = job_attachments.job_id
        AND job_postings.company_id = public.get_employee_company_id()
    )
);
DROP POLICY IF EXISTS "HR can manage company job_attachments" ON public.job_attachments;
CREATE POLICY "HR can manage company job_attachments" ON public.job_attachments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.job_postings
        WHERE job_postings.id = job_attachments.job_id
        AND job_postings.company_id = public.get_employee_company_id()
    )
    AND public.has_role(ARRAY['admin', 'super_admin', 'hr', 'recruiter'])
);

-- interview_feedback RLS
DROP POLICY IF EXISTS "Interviewers and HR can view interview_feedback" ON public.interview_feedback;
CREATE POLICY "Interviewers and HR can view interview_feedback" ON public.interview_feedback FOR SELECT USING (
    interviewer_id = auth.uid() OR public.has_role(ARRAY['admin', 'super_admin', 'hr', 'recruiter'])
);
DROP POLICY IF EXISTS "Interviewers can insert interview_feedback" ON public.interview_feedback;
CREATE POLICY "Interviewers can insert interview_feedback" ON public.interview_feedback FOR INSERT WITH CHECK (
    interviewer_id = auth.uid()
);

-- 8. Storage bucket policies (Scoped by company)
-- Clean old policies if any
DROP POLICY IF EXISTS "Employees can upload recruitment documents" ON storage.objects;
DROP POLICY IF EXISTS "Employees can read recruitment documents" ON storage.objects;

-- Company ID is expected to be the first segment of the storage path. (e.g., 'company-uuid/candidates/candidate-uuid/resume.pdf')
DROP POLICY IF EXISTS "Employees can read recruitment documents in their company" ON storage.objects;
CREATE POLICY "Employees can read recruitment documents in their company" ON storage.objects FOR SELECT TO authenticated USING (
    bucket_id = 'recruitment-documents' AND 
    (storage.foldername(name))[1] = public.get_employee_company_id()::text
);

DROP POLICY IF EXISTS "Employees can insert recruitment documents in their company" ON storage.objects;
CREATE POLICY "Employees can insert recruitment documents in their company" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'recruitment-documents' AND 
    (storage.foldername(name))[1] = public.get_employee_company_id()::text
);

DROP POLICY IF EXISTS "Employees can update recruitment documents in their company" ON storage.objects;
CREATE POLICY "Employees can update recruitment documents in their company" ON storage.objects FOR UPDATE TO authenticated USING (
    bucket_id = 'recruitment-documents' AND 
    (storage.foldername(name))[1] = public.get_employee_company_id()::text
);

DROP POLICY IF EXISTS "Employees can delete recruitment documents in their company" ON storage.objects;
CREATE POLICY "Employees can delete recruitment documents in their company" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'recruitment-documents' AND 
    (storage.foldername(name))[1] = public.get_employee_company_id()::text
);

-- Anonymous Public Apply Portal uploads
-- Path must start with 'public_apply/token/' to restrict arbitrary drops
DROP POLICY IF EXISTS "Anonymous can insert documents to public_apply folder" ON storage.objects;
CREATE POLICY "Anonymous can insert documents to public_apply folder" ON storage.objects FOR INSERT TO anon WITH CHECK (
    bucket_id = 'recruitment-documents' AND 
    (storage.foldername(name))[1] = 'public_apply'
);


-- candidate_documents RLS
DROP POLICY IF EXISTS "Employees can view candidate_documents for company" ON public.candidate_documents;
CREATE POLICY "Employees can view candidate_documents for company" ON public.candidate_documents FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.candidates
        WHERE candidates.id = candidate_documents.candidate_id
        AND EXISTS (SELECT 1 FROM public.job_postings WHERE job_postings.id = candidates.job_id AND job_postings.company_id = public.get_employee_company_id())
    )
);
DROP POLICY IF EXISTS "Employees can manage candidate_documents for company" ON public.candidate_documents;
CREATE POLICY "Employees can manage candidate_documents for company" ON public.candidate_documents FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.candidates
        WHERE candidates.id = candidate_documents.candidate_id
        AND EXISTS (SELECT 1 FROM public.job_postings WHERE job_postings.id = candidates.job_id AND job_postings.company_id = public.get_employee_company_id())
    )
);
