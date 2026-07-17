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

async function investigate() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing credentials");
    return;
  }

  // Client 2: Service Role
  const adminClient = createClient(url, serviceKey);

  // Get Admin employees
  const { data: emps, error: empErr } = await adminClient
    .from('employees')
    .select('id, user_id, role, company_id, full_name, email')
    .in('role', ['admin', 'super_admin'])
    .limit(10);

  console.log("Admin Employees in DB:", emps);
}

investigate();
