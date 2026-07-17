const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: empData } = await supabase.from('employees').select('id, company_id').limit(1);
  const currentEmployee = empData[0];

  const body = {
    title: 'Test Job 2',
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

  const parseNumber = (val) => val && !isNaN(Number(val)) ? Number(val) : null;
  const parseArray = (val) => typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : (Array.isArray(val) ? val : null);

  const jobPayload = {
    company_id: currentEmployee.company_id,
    posted_by: currentEmployee.id,
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
    approval_status: body.approval_status || 'Pending',
  };

  const { data, error } = await supabase.from('job_postings').insert(jobPayload).select();
  
  if (error) {
    console.log('--- ERROR ---');
    console.log('error.code:', error.code);
    console.log('error.message:', error.message);
    console.log('error.details:', error.details);
    console.log('error.hint:', error.hint);
  } else {
    console.log('--- SUCCESS ---');
  }
}
run();
