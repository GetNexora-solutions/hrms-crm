const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const jobPayload = {
    company_id: '031406ca-bc5b-4cb9-9b99-8f23b0037ea9',
    title: 'Test Empty String UUID',
    department: 'Engineering',
    reporting_manager_id: '',
    status: 'Open'
  };
  
  const { data, error } = await supabase.from('job_postings').insert(jobPayload).select();
  console.log('Error:', error);
}
run();
