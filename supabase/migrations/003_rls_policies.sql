-- ENABLE RLS ON ALL TABLES
alter table companies enable row level security;
alter table employees enable row level security;
alter table password_reset_logs enable row level security;
alter table attendance enable row level security;
alter table leave_types enable row level security;
alter table leave_requests enable row level security;
alter table payroll enable row level security;
alter table documents enable row level security;
alter table job_postings enable row level security;
alter table candidates enable row level security;
alter table assets enable row level security;
alter table expenses enable row level security;
alter table crm_leads enable row level security;
alter table crm_activities enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;
alter table shifts enable row level security;
alter table ai_chat_logs enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- ROLE CHECKS FUNCTIONS
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from employees 
    where user_id = auth.uid() 
    and role in ('super_admin', 'hr', 'md', 'admin')
  );
end;
$$ language plpgsql security definer;

-- RLS POLICIES FOR EMPLOYEES TABLE
-- Admins can view and manage all employees
create policy "admin_all_employees" on employees
  for all using (public.is_admin());

-- Employees can view their own profile
create policy "employees_view_own" on employees
  for select using (user_id = auth.uid());

-- Employees can update their own profile (limited fields - handled in app logic, but RLS allows update)
create policy "employees_update_own" on employees
  for update using (user_id = auth.uid());

-- RLS POLICIES FOR ATTENDANCE
-- Employees can view their own attendance
create policy "employees_view_own_attendance" on attendance
  for select using (employee_id = (select id from employees where user_id = auth.uid()));

-- Employees can insert their own attendance
create policy "employees_insert_own_attendance" on attendance
  for insert with check (employee_id = (select id from employees where user_id = auth.uid()));

-- Admins can view and manage all attendance
create policy "admin_all_attendance" on attendance
  for all using (public.is_admin());

-- RLS POLICIES FOR LEAVE REQUESTS
-- Employees can view their own leaves
create policy "employees_view_own_leaves" on leave_requests
  for select using (employee_id = (select id from employees where user_id = auth.uid()));

-- Employees can insert their own leave requests
create policy "employees_insert_own_leaves" on leave_requests
  for insert with check (employee_id = (select id from employees where user_id = auth.uid()));

-- Admins can view and manage all leave requests
create policy "admin_all_leaves" on leave_requests
  for all using (public.is_admin());

-- RLS POLICIES FOR LEAVE TYPES
-- Everyone can view leave types
create policy "all_view_leave_types" on leave_types
  for select using (true);

-- Only admins can manage leave types
create policy "admin_manage_leave_types" on leave_types
  for all using (public.is_admin());

-- RLS POLICIES FOR PAYROLL
-- Employees can view their own payroll
create policy "employees_view_own_payroll" on payroll
  for select using (employee_id = (select id from employees where user_id = auth.uid()));

-- Admins/Finance can manage all payroll
create policy "finance_manage_payroll" on payroll
  for all using (
    exists (select 1 from employees where user_id = auth.uid() and role in ('super_admin', 'hr', 'md', 'finance'))
  );

-- RLS POLICIES FOR DOCUMENTS
-- Employees can view their own documents
create policy "employees_view_own_documents" on documents
  for select using (employee_id = (select id from employees where user_id = auth.uid()));

-- Employees can upload their own documents
create policy "employees_insert_own_documents" on documents
  for insert with check (employee_id = (select id from employees where user_id = auth.uid()));

-- Admins can view and manage all documents
create policy "admin_manage_documents" on documents
  for all using (public.is_admin());

-- RLS POLICIES FOR NOTIFICATIONS
-- Employees can view their own notifications
create policy "employees_view_own_notifications" on notifications
  for select using (employee_id = (select id from employees where user_id = auth.uid()));

-- Employees can update their own notifications (e.g. mark as read)
create policy "employees_update_own_notifications" on notifications
  for update using (employee_id = (select id from employees where user_id = auth.uid()));

-- RLS POLICIES FOR AI CHAT LOGS
-- Employees can view and create their own chat logs
create policy "employees_own_chat_logs" on ai_chat_logs
  for all using (employee_id = (select id from employees where user_id = auth.uid()));
