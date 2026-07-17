const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.from('job_postings').insert({
    title: 'Test Job',
    department: 'Engineering',
    status: 'Open'
  });
  console.log('Error:', error);
}
test();
