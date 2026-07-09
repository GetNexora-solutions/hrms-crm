-- 007_missing_rls_policies.sql
-- Fix for Systemic Authorization / RLS Issues
-- Adds missing FOR ALL USING and WITH CHECK policies for core tables

-- 1. Recruitment Tables
CREATE POLICY "admin_all_job_postings" ON job_postings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'recruiter', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'recruiter', 'manager')
    )
  );

CREATE POLICY "admin_all_candidates" ON candidates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'recruiter', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'recruiter', 'manager')
    )
  );

-- 2. Core Operations & Setup Tables
CREATE POLICY "admin_all_companies" ON companies
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_all_shifts" ON shifts
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. CRM & Projects
CREATE POLICY "admin_all_crm_leads" ON crm_leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'manager')
    )
  );

CREATE POLICY "admin_all_crm_activities" ON crm_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'manager')
    )
  );

CREATE POLICY "admin_all_projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'manager')
    )
  );

CREATE POLICY "admin_all_tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'manager', 'employee')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'manager', 'employee')
    )
  );

-- 4. Finance & Assets
CREATE POLICY "admin_all_assets" ON assets
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "finance_all_expenses" ON expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'finance')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'hr', 'md', 'admin', 'finance')
    )
  );
