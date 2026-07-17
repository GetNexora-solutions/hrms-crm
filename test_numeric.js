const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const jobPayload = {
    company_id: '031406ca-bc5b-4cb9-9b99-8f23b0037ea9',
    posted_by: 'f077b7fe-00c4-4745-a268-7fcca566fc61',
    title: 'Test Numeric Job',
    department: 'Engineering',
    min_experience: ''
  };

  const { data, error } = await supabase.from('job_postings').insert(jobPayload).select();
  
  if (error) {
    console.log('--- ERROR ---');
    console.log('error.code:', error.code);
    console.log('error.message:', error.message);
  } else {
    console.log('--- SUCCESS ---');
  }
}
run();
