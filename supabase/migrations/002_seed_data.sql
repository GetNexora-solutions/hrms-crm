-- Insert default company
INSERT INTO companies (name, email, website)
VALUES ('ABC Company Pvt. Ltd.', 'hr@abccompany.com', 'https://abccompany.com');

-- Get the company ID for subsequent inserts
DO $$
DECLARE
  v_company_id uuid;
BEGIN
  SELECT id INTO v_company_id FROM companies LIMIT 1;

  -- Insert default leave types
  INSERT INTO leave_types (company_id, name, annual_quota, carry_forward) VALUES
  (v_company_id, 'Casual Leave', 12, false),
  (v_company_id, 'Sick Leave', 12, true),
  (v_company_id, 'Earned Leave', 15, true),
  (v_company_id, 'Maternity Leave', 180, false),
  (v_company_id, 'Paternity Leave', 15, false);

  -- Insert default shifts
  INSERT INTO shifts (company_id, shift_name, start_time, end_time, break_minutes) VALUES
  (v_company_id, 'General Shift', '09:00:00', '18:00:00', 60),
  (v_company_id, 'Morning Shift', '06:00:00', '15:00:00', 60),
  (v_company_id, 'Night Shift', '22:00:00', '07:00:00', 60);
  
END $$;
