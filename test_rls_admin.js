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

async function testAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const adminClient = createClient(url, serviceKey);

  // 1. Create a test user
  const email = `testadmin_${Date.now()}@nexorasolutions.com`;
  const password = 'Password123!';
  
  const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authErr) {
    console.error("Failed to create auth user:", authErr);
    return;
  }

  const uid = authUser.user.id;

  // 2. Insert into employees
  const { data: emp, error: empErr } = await adminClient.from('employees').insert({
    user_id: uid,
    role: 'admin',
    full_name: 'Test Admin',
    email: email,
    emp_id: `TA${Date.now()}`
  }).select().single();

  if (empErr) {
    console.error("Failed to insert employee:", empErr);
    return;
  }

  // 3. Login as test user
  const userClient = createClient(url, anonKey);
  const { data: sessionData, error: loginErr } = await userClient.auth.signInWithPassword({
    email,
    password
  });

  if (loginErr) {
    console.error("Failed to login:", loginErr);
    return;
  }

  console.log("1. auth.uid():", sessionData.user.id);
  console.log("2. Employee row matching auth.uid():", emp);

  // 4. Test employees query as logged-in user
  const { data: employeesList, error: queryErr } = await userClient
    .from('employees')
    .select('id, full_name, employee_id')
    .order('full_name');

  console.log("5. Is employees query returning zero rows?", employeesList?.length === 0);
  console.log("6. Exact result of employees query used by Dropdown:", employeesList || queryErr);

  // 5. Test is_admin() via rpc
  const { data: rpcData, error: rpcErr } = await userClient.rpc('is_admin');
  console.log("3. Does public.is_admin() return TRUE for this exact user via RPC?", rpcData, rpcErr);

  // Clean up
  await adminClient.from('employees').delete().eq('user_id', uid);
  await adminClient.auth.admin.deleteUser(uid);
}

testAdmin();
