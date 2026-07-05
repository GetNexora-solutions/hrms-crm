-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. COMPANIES (SaaS multi-tenant ready)
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  address text,
  gst_number text,
  pan_number text,
  phone text,
  email text,
  website text,
  created_at timestamptz default now()
);

-- 3. EMPLOYEES
create table employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  user_id uuid references auth.users(id),
  emp_id text unique not null, -- e.g. EMP001
  full_name text not null,
  email text unique not null,
  phone text,
  designation text,
  department text,
  role text default 'employee', -- super_admin/hr/md/admin/manager/finance/employee/recruiter
  date_of_joining date,
  date_of_birth date,
  gender text,
  blood_group text,
  city text,
  address text,
  emergency_contact text,
  emergency_phone text,
  salary numeric default 0,
  bank_name text,
  bank_account text,
  bank_ifsc text,
  pan_number text,
  aadhar_number text,
  status text default 'active', -- active/inactive/resigned
  avatar_url text,
  is_temp_password boolean default true,
  password_changed_at timestamptz,
  last_login_at timestamptz,
  welcome_sent_at timestamptz,
  welcome_whatsapp_status text default 'pending',
  welcome_email_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. PASSWORD RESET LOGS
create table password_reset_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  reset_by uuid references employees(id), -- null if self-reset
  reset_type text, -- 'self_change' / 'admin_reset' / 'first_login'
  old_is_temp boolean,
  new_is_temp boolean,
  whatsapp_sent boolean default false,
  email_sent boolean default false,
  created_at timestamptz default now()
);

-- 5. ATTENDANCE
create table attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  date date not null,
  check_in timestamptz,
  check_out timestamptz,
  check_in_lat numeric,
  check_in_lng numeric,
  check_out_lat numeric,
  check_out_lng numeric,
  selfie_url text,
  status text default 'present', -- present/absent/half_day/late/on_leave
  working_hours numeric,
  notes text,
  is_manual boolean default false,
  approved_by uuid references employees(id),
  created_at timestamptz default now(),
  unique(employee_id, date)
);

-- 6. LEAVE TYPES
create table leave_types (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  name text not null, -- Casual/Sick/Earned/Maternity/Paternity
  annual_quota integer default 12,
  carry_forward boolean default false,
  created_at timestamptz default now()
);

-- 7. LEAVE REQUESTS
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  leave_type_id uuid references leave_types(id),
  from_date date not null,
  to_date date not null,
  days integer not null,
  reason text,
  status text default 'pending', -- pending/approved/rejected
  approved_by uuid references employees(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now()
);

-- 8. PAYROLL
create table payroll (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  month text not null, -- e.g. "2025-06"
  basic_salary numeric,
  hra numeric,
  da numeric,
  travel_allowance numeric,
  other_allowance numeric,
  gross_salary numeric,
  pf_deduction numeric,
  esi_deduction numeric,
  professional_tax numeric,
  tds_deduction numeric,
  advance_deduction numeric,
  total_deductions numeric,
  net_salary numeric,
  working_days integer,
  present_days integer,
  paid_leaves integer,
  status text default 'draft', -- draft/processed/paid
  payment_date date,
  payment_mode text,
  created_at timestamptz default now(),
  unique(employee_id, month)
);

-- 9. DOCUMENTS
create table documents (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  document_type text not null, -- aadhar/pan/offer_letter/contract/certificate
  document_name text not null,
  file_url text not null,
  drive_file_id text, -- Google Drive file ID
  uploaded_by uuid references employees(id),
  is_verified boolean default false,
  verified_by uuid references employees(id),
  created_at timestamptz default now()
);

-- 10. RECRUITMENT
create table job_postings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  title text not null,
  department text,
  description text,
  requirements text,
  positions integer default 1,
  status text default 'open', -- open/closed/on_hold
  posted_by uuid references employees(id),
  created_at timestamptz default now()
);

create table candidates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references job_postings(id),
  name text not null,
  email text,
  phone text,
  resume_url text,
  stage text default 'applied', -- applied/screening/interview/offer/hired/rejected
  notes text,
  created_at timestamptz default now()
);

-- 11. ASSETS
create table assets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  asset_name text not null,
  asset_type text, -- laptop/mobile/sim/vehicle/accessory
  serial_number text,
  assigned_to uuid references employees(id),
  assigned_date date,
  returned_date date,
  status text default 'available', -- available/assigned/maintenance/retired
  created_at timestamptz default now()
);

-- 12. EXPENSES
create table expenses (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  category text, -- travel/food/accommodation/office/other
  amount numeric not null,
  description text,
  receipt_url text,
  status text default 'pending', -- pending/approved/rejected/reimbursed
  approved_by uuid references employees(id),
  expense_date date,
  created_at timestamptz default now()
);

-- 13. CRM LEADS
create table crm_leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  name text not null,
  email text,
  phone text,
  company_name text,
  source text, -- website/referral/cold_call/social
  status text default 'new', -- new/contacted/qualified/proposal/negotiation/won/lost
  assigned_to uuid references employees(id),
  expected_value numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table crm_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references crm_leads(id),
  activity_type text, -- call/email/meeting/whatsapp/note
  description text,
  done_by uuid references employees(id),
  scheduled_at timestamptz,
  done_at timestamptz,
  created_at timestamptz default now()
);

-- 14. PROJECTS
create table projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  name text not null,
  description text,
  status text default 'active', -- active/completed/on_hold/cancelled
  start_date date,
  end_date date,
  manager_id uuid references employees(id),
  budget numeric,
  created_at timestamptz default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  title text not null,
  description text,
  assigned_to uuid references employees(id),
  priority text default 'medium', -- low/medium/high/urgent
  status text default 'todo', -- todo/in_progress/review/done
  due_date date,
  created_at timestamptz default now()
);

-- 15. SHIFTS
create table shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  shift_name text not null,
  start_time time not null,
  end_time time not null,
  break_minutes integer default 60,
  is_night_shift boolean default false,
  created_at timestamptz default now()
);

-- 16. AI CHAT LOGS
create table ai_chat_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  role text, -- user/assistant
  message text,
  context text, -- which module/page
  created_at timestamptz default now()
);

-- 17. NOTIFICATIONS
create table notifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  title text not null,
  message text,
  type text, -- leave/attendance/payroll/task/system
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 18. AUDIT LOGS
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  action text not null, -- created/updated/deleted/viewed
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  created_at timestamptz default now()
);
