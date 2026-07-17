const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Sending NOTIFY pgrst, reload schema...');
  // Since we can't run raw SQL easily via JS REST client unless we have an RPC, 
  // Let's just try to call an RPC or just let it fail if it doesn't work.
  const { error } = await supabase.rpc('execute_sql', { sql: " });
  console.log('RPC error:', error);
}
run();
