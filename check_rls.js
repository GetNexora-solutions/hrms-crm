const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...vals] = line.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'job_postings' });
  if (error) {
    // try direct query
    const { data: res, error: e2 } = await supabase.from('pg_policies').select('*').eq('tablename', 'job_postings');
    console.log(res, e2);
  } else {
    console.log(data);
  }
}
check();
