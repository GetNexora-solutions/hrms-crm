const http = require('http');

async function run() {
  const payload = {
    title: 'Smoke Test Job',
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
  
  // Try to insert EXACTLY what the API inserts
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const currentEmployee = { company_id: '031406ca-bc5b-4cb9-9b99-8f23b0037ea9', id: 'f077b7fe-00c4-4745-a268-7fcca566fc61' };

  const jobPayload = {
    company_id: currentEmployee.company_id,
    posted_by: currentEmployee.id,
    title: payload.title,
    department: payload.department,
    positions: parseNumber(payload.positions) || 1,
    status: payload.status || 'Open',
    description: payload.description,
    employment_type: payload.employment_type || null,
    hiring_priority: payload.hiring_priority || null,
    location_type: payload.location_type || null,
    hiring_type: payload.hiring_type || null,
    office_location: payload.office_location || null,
    reporting_manager_id: payload.reporting_manager_id || null,
    min_experience: parseNumber(payload.min_experience),
    max_experience: parseNumber(payload.max_experience),
    min_salary: parseNumber(payload.min_salary),
    max_salary: parseNumber(payload.max_salary),
    required_skills: parseArray(payload.required_skills),
    education_required: payload.education_required || null,
    joining_date: payload.joining_date || null,
    closing_date: payload.closing_date || null,
    approval_status: payload.approval_status || 'Pending',
  };

  const { error } = await supabase.from('job_postings').insert(jobPayload).select();
  if (error) {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error details:', error.details);
    console.log('Error hint:', error.hint);
  } else {
    console.log('Insert succeeded via service role!');
  }
}
run();
