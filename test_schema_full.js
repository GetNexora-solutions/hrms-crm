const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: 'select column_name, is_nullable from information_schema.columns where table_name = \'job_postings\';' });
  if(error) {
     const { data: d2, error: e2 } = await supabase.from('job_postings').select('*').limit(1);
     console.log('Row:', d2[0]);
  } else {
     console.log(data);
  }
}
test();
