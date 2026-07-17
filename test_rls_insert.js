const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'm.scott@nexorasolutions.com',
    password: 'password'
  });
  
  if (authErr) {
    console.log('Login failed:', authErr);
    return;
  }

  const { data: empData } = await supabase.from('employees').select('id, company_id').eq('id', authData.user.id).single();
  const currentEmployee = empData;

  const jobPayload = {
    company_id: currentEmployee.company_id,
    posted_by: currentEmployee.id,
    title: 'Test RLS Job',
    department: 'Engineering',
    positions: 1,
    status: 'Open',
    description: '',
    employment_type: 'Full-time',
    hiring_priority: 'Medium',
    location_type: 'Remote',
    hiring_type: 'New',
    office_location: null,
    reporting_manager_id: null,
    min_experience: null,
    max_experience: null,
    min_salary: null,
    max_salary: null,
    required_skills: [],
    education_required: null,
    joining_date: null,
    closing_date: null,
    approval_status: 'Pending',
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
