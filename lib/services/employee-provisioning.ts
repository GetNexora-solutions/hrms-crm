import { SupabaseClient } from '@supabase/supabase-js';
import { emailService } from './email';

export interface IEmployeeIdGenerator {
  generate(companyId?: string): Promise<string>;
}

export class DefaultEmployeeIdGenerator implements IEmployeeIdGenerator {
  constructor(private supabaseAdmin: SupabaseClient) {}

  async generate(companyId?: string): Promise<string> {
    const query = this.supabaseAdmin
      .from('employees')
      .select('emp_id')
      .order('emp_id', { ascending: false })
      .limit(1);
    
    if (companyId) {
      query.eq('company_id', companyId);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0 || !data[0].emp_id) {
      return 'EMP001';
    }

    const lastId = data[0].emp_id;
    const match = lastId.match(/EMP(\d+)/);
    if (match && match[1]) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `EMP${nextNum.toString().padStart(3, '0')}`;
    }

    return `EMP${Date.now().toString().slice(-4)}`;
  }
}

export class EmployeeProvisioningService {
  constructor(
    private supabaseAdmin: SupabaseClient,
    private idGenerator: IEmployeeIdGenerator
  ) {}

  /**
   * Converts a candidate to an employee.
   * Uses Admin Client to bypass RLS and create Auth user.
   */
  async convertCandidateToEmployee(candidateId: string, performedBy: string): Promise<{ employeeId: string }> {
    // 1. Fetch Candidate details
    const { data: candidate, error: candidateError } = await this.supabaseAdmin
      .from('candidates')
      .select('*, job_postings(*)')
      .eq('id', candidateId)
      .single();

    if (candidateError || !candidate) {
      throw new Error(`Candidate not found: ${candidateError?.message || ''}`);
    }

    if (candidate.current_stage !== 'Offer Accepted') {
      throw new Error(`Candidate must be in 'Offer Accepted' stage. Current stage: ${candidate.current_stage}`);
    }

    if (candidate.converted_employee_id) {
      throw new Error('Candidate has already been converted to an employee.');
    }

    const email = candidate.email;
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;

    // 2. Create Supabase Auth User
    const { data: authUser, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: candidate.full_name,
      }
    });

    if (authError) {
      throw new Error(`Failed to create Auth User: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error('Auth user creation returned empty.');
    }

    try {
      // 3. Generate Employee ID
      const empId = await this.idGenerator.generate(candidate.job_postings?.company_id);

      // 4. Create Employee Record
      const { data: employee, error: employeeError } = await this.supabaseAdmin
        .from('employees')
        .insert({
          company_id: candidate.job_postings?.company_id || null,
          user_id: authUser.user.id,
          emp_id: empId,
          full_name: candidate.full_name,
          email: email,
          phone: candidate.phone,
          designation: ((candidate.job_postings as unknown) as { title?: string })?.title || 'Employee',
          department: ((candidate.job_postings as unknown) as { department?: string })?.department || 'General',
          salary: candidate.expected_ctc || 0,
          date_of_joining: candidate.expected_joining_date || new Date().toISOString().split('T')[0],
          is_temp_password: true,
          status: 'active',
          role: 'employee',
        })
        .select()
        .single();

      if (employeeError || !employee) {
        throw new Error(`Failed to insert employee record: ${employeeError?.message}`);
      }

      // 5. Update Candidate Record
      await this.supabaseAdmin
        .from('candidates')
        .update({
          current_stage: 'Converted',
          converted_employee_id: employee.id,
        })
        .eq('id', candidateId);

      // 6. Add Timeline Event
      await this.supabaseAdmin
        .from('candidate_timeline')
        .insert({
          candidate_id: candidateId,
          stage: 'Converted',
          action: 'Candidate Converted to Employee',
          notes: `Provisioned as ${empId} with temporary credentials.`,
          performed_by: performedBy,
        });

      // 7. Send Welcome Email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await emailService.sendEmail({
        to: email,
        subject: `Welcome to Nexora Solutions! Your Account Details`,
        html: `
          <p>Dear ${candidate.full_name},</p>
          <p>Welcome to Nexora Solutions! Your employee account has been successfully provisioned.</p>
          <p><strong>Employee ID:</strong> ${empId}</p>
          <p>You can now log in to the HRMS portal using the following temporary credentials:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${tempPassword}</p>
          <p>Please log in and change your password immediately.</p>
          <p><a href="${appUrl}/login">Login to Portal</a></p>
          <br/>
          <p>Best regards,<br>Nexora HR Team</p>
        `
      });

      return { employeeId: employee.id };
    } catch (error) {
      // Rollback Auth User if employee record fails (compensating action)
      await this.supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }
  }
}
