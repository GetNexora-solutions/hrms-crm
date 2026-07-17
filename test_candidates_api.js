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
    role: 'super_admin',
    full_name: 'Test Admin',
    email: email,
    emp_id: `TA${Date.now()}`
  }).select().single();

  // 3. Login as test admin user to get the JWT
  const userClient = createClient(url, anonKey);
  const { data: sessionData } = await userClient.auth.signInWithPassword({ email, password });
  
  const projectId = new URL(url).hostname.split('.')[0];
  const sessionStr = JSON.stringify(sessionData.session);
  const encodedSession = encodeURIComponent(sessionStr);
  
  let cookies = [];
  const chunkSize = 3000;
  for (let i = 0; i < Math.ceil(encodedSession.length / chunkSize); i++) {
    cookies.push(`sb-${projectId}-auth-token.${i}=${encodedSession.slice(i * chunkSize, (i + 1) * chunkSize)}`);
  }
  
  // 4. Hit the local API Route
  const payload = JSON.stringify({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1234567890'
  });

  const req = http.request('http://localhost:3000/api/recruitment/candidates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies.join('; ')
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', async () => {
      console.log('HTTP Status:', res.statusCode);
      try {
        console.log('HTTP Response Body:', JSON.stringify(JSON.parse(body), null, 2));
      } catch (e) {
        console.log('HTTP Response Body:', body);
      }

      // Clean up
      await adminClient.from('candidates').delete().eq('email', 'jane.doe@example.com');
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
