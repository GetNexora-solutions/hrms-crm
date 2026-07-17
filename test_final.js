const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: employee } = await supabase.from('employees').select('id, company_id').eq('email', 'getnexora.solutions@gmail.com').single();

  const jobPayload = {
    title: 'Verification Job',
    department: 'Engineering',
    company_id: employee.company_id,
    posted_by: employee.id,
    status: 'Open'
  };

  console.log('Sending payload to DB:', jobPayload);

  const { data, error, status } = await supabase.from('job_postings').insert(jobPayload).select().single();
  
  if (error) {
     console.error('HTTP 500 equivalent DB Error:', error);
  } else {
     console.log('HTTP 201 Created successfully.');
     console.log('Inserted Record:', data);
  }
}
run();
