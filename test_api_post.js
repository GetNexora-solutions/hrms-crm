const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const http = require('http');

if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...vals] = line.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}

async function run() {
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

  // 3. Login as test admin user to get the JWT
  const userClient = createClient(url, anonKey);
  const { data: sessionData } = await userClient.auth.signInWithPassword({ email, password });
  const token = sessionData.session.access_token;
  const refreshToken = sessionData.session.refresh_token;

  // 4. Hit the local API Route
  const payload = JSON.stringify({
    title: 'Test Job via API',
    department: 'Engineering',
    positions: 1,
    status: 'Open'
  });

  const req = http.request('http://localhost:3000/api/recruitment/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `sb-${new URL(url).hostname.split('.')[0]}-auth-token=${encodeURIComponent(JSON.stringify([token, refreshToken]))}`
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', async () => {
      console.log('HTTP Status:', res.statusCode);
      console.log('HTTP Response Body:', body);

      // Clean up
      await adminClient.from('job_postings').delete().eq('posted_by', emp.id);
      await adminClient.from('employees').delete().eq('user_id', uid);
      await adminClient.auth.admin.deleteUser(uid);
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e);
  });

  req.write(payload);
  req.end();
}

run();
