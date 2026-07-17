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
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    console.error("Missing credentials");
    return;
  }

  // Client 1: As logged-in user
  const userClient = createClient(url, anonKey);
  const { data: authData, error: authErr } = await userClient.auth.signInWithPassword({
    email: 'm.scott@nexorasolutions.com',
    password: 'password123'
  });

  if (authErr) {
    console.error("Login failed:", authErr.message);
    return;
  }

  const uid = authData.user.id;
  console.log("1. auth.uid():", uid);

  // Client 2: Service Role
  const adminClient = createClient(url, serviceKey);

  // Get employee row
  const { data: emp, error: empErr } = await adminClient
    .from('employees')
    .select('id, user_id, role, company_id, full_name')
    .eq('user_id', uid)
    .single();

  console.log("2. Employee row matching auth.uid():", emp || empErr);

  // Check what is_admin logic says
  if (emp) {
    const isAdmin = ['admin', 'super_admin'].includes(emp.role);
    console.log(`3. Logic for is_admin() (role in 'admin', 'super_admin'): ${isAdmin}`);
  }

  // Execute exact employees query as logged-in user
  const { data: employeesList, error: queryErr } = await userClient
    .from('employees')
    .select('id, full_name, employee_id')
    .order('full_name');

  console.log("6. Exact result of employees query used by Dropdown:", employeesList || queryErr);
}

investigate();
