const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: employee } = await supabase.from('employees').select('id, user_id, company_id, role').eq('email', 'm.scott@nexorasolutions.com').single();
  console.log('Employee:', employee);
  
  if (employee && employee.user_id) {
    const jwt = require('jsonwebtoken');
    const secret = process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';
    const token = jwt.sign({
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      sub: employee.user_id,
      email: 'm.scott@nexorasolutions.com',
      role: 'authenticated'
    }, secret);
    
    console.log('JWT Generated');
    
    const parseNumber = (val) => val && !isNaN(Number(val)) ? Number(val) : null;
    const parseArray = (val) => typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : (Array.isArray(val) ? val : null);
    
    const body = {
      title: 'JWT Test Job',
      department: 'Engineering',
      reporting_manager_id: '',
      positions: 1,
      employment_type: 'Full-time',
      office_location: '',
      location_type: 'Remote',
      description: '',
      required_skills: '',
      preferred_skills: '',
      min_experience: '',
      max_experience: '',
      education_required: '',
      joining_date: '',
      hiring_priority: 'Medium',
      hiring_type: 'New',
      salary_type: 'Monthly',
      min_salary: '',
      max_salary: '',
      salary_negotiable: false,
      closing_date: '',
      status: 'Open',
      approval_status: 'Pending'
    };

    const jobPayload = {
      company_id: employee.company_id,
      posted_by: employee.id,
      title: body.title,
      department: body.department,
      positions: parseNumber(body.positions) || 1,
      status: body.status || 'Open',
      description: body.description,
      employment_type: body.employment_type || null,
      hiring_priority: body.hiring_priority || null,
      location_type: body.location_type || null,
      hiring_type: body.hiring_type || null,
      office_location: body.office_location || null,
      reporting_manager_id: body.reporting_manager_id || null,
      min_experience: parseNumber(body.min_experience),
      max_experience: parseNumber(body.max_experience),
      min_salary: parseNumber(body.min_salary),
      max_salary: parseNumber(body.max_salary),
      required_skills: parseArray(body.required_skills),
      education_required: body.education_required || null,
      joining_date: body.joining_date || null,
      closing_date: body.closing_date || null,
      approval_status: body.approval_status || 'Pending'
    };
    
    const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data, error } = await userClient.from('job_postings').insert(jobPayload).select();
    if (error) {
        console.log('--- ERROR ---');
        console.log(JSON.stringify(error, null, 2));
    } else {
        console.log('--- SUCCESS ---');
    }
  }
}
run();
