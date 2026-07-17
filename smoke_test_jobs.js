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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(url, serviceKey);

async function makeRequest(method, path, payload, cookies) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies.join('; ')
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
}

async function run() {
  console.log("Starting smoke tests...");

  // 1. Create a test admin user
  const email = `smoke_${Date.now()}@test.com`;
  const password = 'Password123!';
  
  const { data: authUser } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  const uid = authUser.user.id;

  const { data: emp } = await adminClient.from('employees').insert({
    user_id: uid,
    role: 'super_admin',
    full_name: 'Smoke Tester',
    email: email,
    emp_id: `SMK${Date.now()}`
  }).select().single();

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
  
  console.log("1. Add Job (Draft)");
  const draftRes = await makeRequest('POST', '/api/recruitment/jobs', {
    title: 'Smoke Test Job',
    status: 'Draft',
    approval_status: 'Pending'
  }, cookies);
  console.log("Draft Create Status:", draftRes.status);
  const jobId = draftRes.body.id;
  if (!jobId) throw new Error("Job not created");

  console.log("2. Edit Draft Job");
  const editRes = await makeRequest('PUT', `/api/recruitment/jobs/${jobId}`, {
    title: 'Smoke Test Job - Edited',
    department: 'Engineering'
  }, cookies);
  console.log("Edit Status:", editRes.status);

  console.log("3. Publish Draft Job");
  const pubRes = await makeRequest('PUT', `/api/recruitment/jobs/${jobId}`, {
    status: 'Open',
    approval_status: 'Pending'
  }, cookies);
  console.log("Publish Status:", pubRes.status);

  console.log("4. Approve Job");
  const approveRes = await makeRequest('POST', `/api/recruitment/jobs/${jobId}/approve`, {
    action: 'Approve'
  }, cookies);
  console.log("Approve Status:", approveRes.status);

  console.log("5. Close Job");
  const closeRes = await makeRequest('PUT', `/api/recruitment/jobs/${jobId}`, {
    status: 'Closed'
  }, cookies);
  console.log("Close Status:", closeRes.status);

  console.log("6. Archive Job");
  const archiveRes = await makeRequest('PUT', `/api/recruitment/jobs/${jobId}`, {
    status: 'Cancelled'
  }, cookies);
  console.log("Archive Status:", archiveRes.status);

  console.log("Cleaning up...");
  await adminClient.from('job_postings').delete().eq('id', jobId);
  await adminClient.from('employees').delete().eq('id', emp.id);
  await adminClient.auth.admin.deleteUser(uid);
  console.log("Done.");
}

run().catch(console.error);
