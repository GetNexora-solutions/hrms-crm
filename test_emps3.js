const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('employees').select('id, user_id, company_id, role, email').ilike('email', '%m.scott%');
  console.log(data);
}
run();
