require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkPolicies() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = createClient(url, serviceKey);

  // We need to query pg_policies. We can do this by using postgres directly if we have connection string.
  // We can't query pg_policies via postgREST unless exposed.
  // Instead, let's query the table as anon to see what fails.
  const { data, error } = await adminClient.rpc('get_policies_for_table', { table_name: 'job_postings' });
  console.log("Policies via RPC (if exists):", data, error);
}
checkPolicies();
