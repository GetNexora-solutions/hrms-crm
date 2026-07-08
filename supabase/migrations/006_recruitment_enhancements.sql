-- 1. Helper function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Enhance job_postings table
DO $$ 
BEGIN 
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS job_code text unique;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS employment_type text CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship'));
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS job_category text;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS hiring_priority text CHECK (hiring_priority IN ('Low', 'Medium', 'High', 'Urgent'));
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS location_type text CHECK (location_type IN ('Remote', 'Hybrid', 'Onsite'));
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS office_location text;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS reporting_manager_id uuid references employees(id) ON DELETE SET NULL;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS recruiter_id uuid references employees(id) ON DELETE SET NULL;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS min_experience numeric;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS max_experience numeric;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS min_salary numeric;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS max_salary numeric;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS filled_positions integer default 0;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS required_skills text[];
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS required_languages text[];
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS education_required text;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS required_certifications text[];
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS shift text;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS working_days text;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS working_hours text;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS travel_required boolean default false;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS hiring_type text CHECK (hiring_type IN ('Replacement', 'New'));
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS reason_for_hiring text;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS opening_date date;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS closing_date date;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS joining_date date;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS approval_status text default 'Pending' CHECK (approval_status IN ('Pending', 'Approved', 'Rejected'));
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS published_date timestamptz;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS closed_date timestamptz;
    ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Enforce constraints on job_postings
ALTER TABLE job_postings DROP CONSTRAINT IF EXISTS job_postings_status_check;
ALTER TABLE job_postings ADD CONSTRAINT job_postings_status_check CHECK (status IN ('Draft', 'Open', 'On Hold', 'Closed', 'Cancelled'));

-- Create updated_at trigger for job_postings
DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Enhance candidates table
DO $$ 
BEGIN
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS candidate_id text unique;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS father_name text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS dob date;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('Male', 'Female', 'Other'));
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS marital_status text CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed'));
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS blood_group text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS nationality text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS alternate_phone text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_address text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS permanent_address text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_company text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_designation text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_ctc numeric;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS expected_ctc numeric;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS expected_in_hand_salary numeric;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS notice_period_days integer;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS availability text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_location text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS preferred_location text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS total_experience numeric;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS relevant_experience numeric;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS highest_qualification text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS college text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS university text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS passing_year text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skills text[];
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS certifications text[];
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS languages_known text[];
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS linkedin text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS github text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS portfolio text;
    
    -- AI Future Hooks
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_score numeric CHECK (resume_score >= 0 AND resume_score <= 100);
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_summary text;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_skill_match jsonb;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ai_recommended_salary numeric;
    
    -- Tracking & System
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS recruiter_id uuid references employees(id) ON DELETE SET NULL;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_stage text default 'Applied' CHECK (current_stage IN ('Applied', 'Resume Uploaded', 'Screening', 'Shortlisted', 'Interview Round 1', 'Interview Round 2', 'Interview Round 3', 'Offer Released', 'Offer Accepted', 'Documents Submitted', 'Background Verification', 'Joined', 'Converted', 'Rejected'));
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS expected_joining_date date;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS offer_valid_till date;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS source text CHECK (source IN ('LinkedIn', 'Naukri', 'Indeed', 'Referral', 'Website', 'Walk-in', 'Campus', 'Manual'));
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS tags text[];
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_starred boolean default false;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS watchlist boolean default false;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS duplicate_flags jsonb;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS follow_up_reminder timestamptz;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS hiring_cost numeric;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS converted_employee_id uuid references employees(id) ON DELETE SET NULL;
    ALTER TABLE candidates ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Enforce NOT NULL on candidates
ALTER TABLE candidates ALTER COLUMN name SET NOT NULL;
ALTER TABLE candidates ALTER COLUMN email SET NOT NULL;
ALTER TABLE candidates ALTER COLUMN phone SET NOT NULL;

-- Create updated_at trigger for candidates
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid not null references candidates(id) on delete cascade,
    job_id uuid not null references job_postings(id) on delete cascade,
    round text not null CHECK (round IN ('HR', 'Technical', 'Managerial', 'Director')),
    mode text not null CHECK (mode IN ('Online', 'Offline', 'Google Meet', 'Zoom')),
    interviewer_id uuid not null references employees(id) on delete restrict,
    department text,
    date date not null,
    time time not null,
    duration_minutes integer,
    meeting_link text,
    interview_location text,
    status text not null default 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')),
    attendance text CHECK (attendance IN ('Present', 'No Show')),
    result text CHECK (result IN ('Strong Hire', 'Hire', 'Hold', 'Reject', 'Reschedule')),
    rating numeric CHECK (rating >= 1 AND rating <= 5),
    communication_rating numeric CHECK (communication_rating >= 1 AND communication_rating <= 5),
    technical_rating numeric CHECK (technical_rating >= 1 AND technical_rating <= 5),
    behaviour_rating numeric CHECK (behaviour_rating >= 1 AND behaviour_rating <= 5),
    culture_fit_rating numeric CHECK (culture_fit_rating >= 1 AND culture_fit_rating <= 5),
    recommended_salary numeric,
    recommended_designation text,
    recommended_doj date,
    remarks text,
    attachments text[],
    created_by uuid references employees(id) on delete set null,
    updated_by uuid references employees(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Create candidate_timeline table
CREATE TABLE IF NOT EXISTS candidate_timeline (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid not null references candidates(id) on delete cascade,
    stage text not null,
    action text not null,
    notes text,
    performed_by uuid references employees(id) on delete set null,
    created_by uuid references employees(id) on delete set null,
    created_at timestamptz default now()
    -- Timeline is immutable append-only log; NO updated_at required.
);

-- 6. Create candidate_documents table
CREATE TABLE IF NOT EXISTS candidate_documents (
    id uuid primary key default gen_random_uuid(),
    candidate_id uuid not null references candidates(id) on delete cascade,
    category text not null CHECK (category IN ('Identity', 'Personal', 'Education', 'Employment', 'Other')),
    document_type text not null,
    file_name text not null,
    file_size integer,
    mime_type text,
    storage_path text not null,
    file_url text not null,
    verification_status text not null default 'Pending' CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
    verified_by uuid references employees(id) on delete set null,
    uploaded_by uuid references employees(id) on delete set null,
    uploaded_at timestamptz default now(),
    created_by uuid references employees(id) on delete set null,
    updated_by uuid references employees(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

DROP TRIGGER IF EXISTS update_candidate_documents_updated_at ON candidate_documents;
CREATE TRIGGER update_candidate_documents_updated_at BEFORE UPDATE ON candidate_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Prepare Storage Architecture (Comments only)
/*
   Supabase Storage Preparation (Architectural Plan only)
   -----------------------------------------------------
   Bucket Name: recruitment
   Access: Private Bucket
   Folder Hierarchy: {company_id}/candidates/{candidate_id}/{category}/{filename}
*/

-- 8. Performance & Duplicate Detection Indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_recruiter ON job_postings(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_manager ON job_postings(reporting_manager_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_phone ON candidates(phone);
CREATE INDEX IF NOT EXISTS idx_candidates_linkedin ON candidates(linkedin);
CREATE INDEX IF NOT EXISTS idx_candidates_cand_id ON candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(current_stage);
CREATE INDEX IF NOT EXISTS idx_candidates_recruiter ON candidates(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at);
CREATE INDEX IF NOT EXISTS idx_candidates_offer_valid ON candidates(offer_valid_till);
CREATE INDEX IF NOT EXISTS idx_candidates_doj ON candidates(expected_joining_date);

CREATE INDEX IF NOT EXISTS idx_interviews_interviewer ON interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(date);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at);

-- 9. Enterprise RLS Policies
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;

-- Interviews RLS
DROP POLICY IF EXISTS "HR and Recruiters can do all with interviews" ON interviews;
CREATE POLICY "HR and Recruiters can do all with interviews" ON interviews
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE employees.id = auth.uid() 
            AND employees.role IN ('super_admin', 'admin', 'hr', 'recruiter')
        )
    );

DROP POLICY IF EXISTS "Managers can view interviews for their department jobs" ON interviews;
CREATE POLICY "Managers can view interviews for their department jobs" ON interviews
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM job_postings
            JOIN employees ON employees.department = job_postings.department
            WHERE job_postings.id = interviews.job_id
            AND employees.id = auth.uid()
            AND employees.role = 'manager'
        )
    );

DROP POLICY IF EXISTS "Interviewers can view and update their assigned interviews" ON interviews;
CREATE POLICY "Interviewers can view and update their assigned interviews" ON interviews
    FOR ALL
    USING (interviewer_id = auth.uid())
    WITH CHECK (interviewer_id = auth.uid());

-- Timeline RLS (Strictly Immutable)
DROP POLICY IF EXISTS "Timeline is viewable by HR and Recruiters" ON candidate_timeline;
CREATE POLICY "Timeline is viewable by HR and Recruiters" ON candidate_timeline
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE employees.id = auth.uid() 
            AND employees.role IN ('super_admin', 'admin', 'hr', 'recruiter')
        )
    );

DROP POLICY IF EXISTS "Timeline is insertable by HR and Recruiters" ON candidate_timeline;
CREATE POLICY "Timeline is insertable by HR and Recruiters" ON candidate_timeline
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE employees.id = auth.uid() 
            AND employees.role IN ('super_admin', 'admin', 'hr', 'recruiter')
        )
    );

DROP POLICY IF EXISTS "Timeline is immutable (No Updates)" ON candidate_timeline;
CREATE POLICY "Timeline is immutable (No Updates)" ON candidate_timeline FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Timeline is immutable (No Deletes)" ON candidate_timeline;
CREATE POLICY "Timeline is immutable (No Deletes)" ON candidate_timeline FOR DELETE USING (false);

-- Documents RLS
DROP POLICY IF EXISTS "HR and Recruiters can do all with candidate_documents" ON candidate_documents;
CREATE POLICY "HR and Recruiters can do all with candidate_documents" ON candidate_documents
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM employees 
            WHERE employees.id = auth.uid() 
            AND employees.role IN ('super_admin', 'admin', 'hr', 'recruiter')
        )
    );

DROP POLICY IF EXISTS "Interviewers can select documents for assigned candidates" ON candidate_documents;
CREATE POLICY "Interviewers can select documents for assigned candidates" ON candidate_documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM interviews
            WHERE interviews.candidate_id = candidate_documents.candidate_id
            AND interviews.interviewer_id = auth.uid()
        )
    );
