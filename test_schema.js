const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('job_postings').select('employment_type').limit(1);
  console.log('Schema Check Error:', error ? error.message : 'None');
  console.log('Schema Check Code:', error ? error.code : 'None');
}
run();
