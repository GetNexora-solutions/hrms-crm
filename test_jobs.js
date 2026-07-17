const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: employee, error: empErr } = await supabase.from('employees').select('id, company_id').eq('email', 'getnexora.solutions@gmail.com').single();
  if (empErr) return console.error('Employee Err:', empErr);

  console.log('Testing Draft Job...');
  const { data: draft, error: err1 } = await supabase.from('job_postings').insert({
    company_id: employee.company_id,
    title: 'Test Draft Job',
    department: 'Marketing',
    status: 'Draft',
    posted_by: employee.id,
    employment_type: 'Contract',
    hiring_priority: 'Low',
    location_type: 'Remote',
    hiring_type: 'New'
  }).select().single();
  console.log(err1 ? ('Failed: ' + JSON.stringify(err1)) : 'Success:', draft?.id);

  console.log('Testing Open Job...');
  const { data: open, error: err2 } = await supabase.from('job_postings').insert({
    company_id: employee.company_id,
    title: 'Test Open Job',
    department: 'Sales',
    status: 'Open',
    posted_by: employee.id,
    employment_type: 'Full-time',
    hiring_priority: 'Urgent',
    location_type: 'Onsite',
    hiring_type: 'Replacement'
  }).select().single();
  console.log(err2 ? ('Failed: ' + JSON.stringify(err2)) : 'Success:', open?.id);

  if(!err1 && !err2) {
     console.log('Verifying rows...');
     const { data: rows } = await supabase.from('job_postings').select('company_id, status, approval_status, title').in('id', [draft.id, open.id]);
     console.log(rows);
  }
}
run();
