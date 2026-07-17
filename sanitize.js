const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('job_postings').update({ status: 'Open' }).eq('status', 'open').select();
  console.log('Sanitization Result:', data?.length, 'rows updated.');
  console.log('Error:', error);
}
run();
