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

async function testJobInsert() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const adminClient = createClient(url, serviceKey);

  // 1. Create a test admin user
  const email = `testadmin_${Date.now()}@nexorasolutions.com`;
  const password = 'Password123!';
  
  const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  const uid = authUser.user.id;

  // 2. Insert into employees
  const { data: emp } = await adminClient.from('employees').insert({
    user_id: uid,
    role: 'admin',
    full_name: 'Test Admin',
    email: email,
    emp_id: `TA${Date.now()}`
  }).select().single();

  // 3. Login as test admin user
  const userClient = createClient(url, anonKey);
  await userClient.auth.signInWithPassword({ email, password });

  // 4. Test job insert
  const payload = {
    title: 'Test Job Insert',
    department: 'Engineering',
    company_id: emp.company_id || null, // Might be null
    posted_by: emp.id,
    status: 'Draft',
    approval_status: 'Pending'
  };

  const { data: job, error: jobErr } = await userClient
    .from('job_postings')
    .insert(payload)
    .select()
    .single();

  console.log("Job Insert Result:", job || jobErr);

  // Clean up
  if (job) await adminClient.from('job_postings').delete().eq('id', job.id);
  await adminClient.from('employees').delete().eq('user_id', uid);
  await adminClient.auth.admin.deleteUser(uid);
}

testJobInsert();
