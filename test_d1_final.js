const fs = require('fs');
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...vals] = line.split('=');
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
}
const { exec } = require('child_process');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

async function getJwtToken() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: employee } = await supabase.from('employees').select('*').eq('role', 'manager').limit(1).single();
  if (!employee) throw new Error("No manager employee found");
  return jwt.sign({
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    sub: employee.user_id,
    email: employee.email,
    role: 'authenticated'
  }, "super-secret-jwt-token-with-at-least-32-characters-long");
}

function makeRequest(method, path, token, payload = null) {
  return new Promise((resolve, reject) => {
    const cookieStr = token ? `sb-xvhvkiejuknfzbmnozls-auth-token=${encodeURIComponent(JSON.stringify(["access_token", token]))}` : '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Cookie'] = cookieStr;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request({ hostname: 'localhost', port: 3000, path, method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  let token;
  try {
    token = await getJwtToken();
    console.log("JWT acquired");
  } catch (e) {
    console.error("Failed to get JWT:", e);
    process.exit(1);
  }

  console.log("Starting Next.js server...");
  const server = exec('npm run dev');
  let serverReady = false;

  server.stdout.on('data', async (data) => {
    if (!serverReady && (data.includes('Ready in') || data.includes('started server on') || data.includes('compiled client and server'))) {
      serverReady = true;
      console.log("Server ready, running tests...");
      setTimeout(async () => {
        try {
          // 1. Create Job (Draft)
          const draftPayload = JSON.stringify({ title: 'Draft Job', department: 'HR', status: 'Draft', reporting_manager_id: '', positions: 2 });
          console.log("Testing Save Draft...");
          const res1 = await makeRequest('POST', '/api/recruitment/jobs', token, draftPayload);
          console.log("Draft Result:", res1.status);
          if (res1.status !== 201) throw new Error(`Draft failed: ${JSON.stringify(res1.data)}`);
          const jobId = res1.data.id;

          // 2. Edit Job
          const editPayload = JSON.stringify({ title: 'Edited Draft Job', status: 'Open', approval_status: 'Approved' });
          console.log("Testing Edit Job...");
          const res2 = await makeRequest('PUT', `/api/recruitment/jobs/${jobId}`, token, editPayload);
          console.log("Edit Result:", res2.status);
          if (res2.status !== 200) throw new Error(`Edit failed: ${JSON.stringify(res2.data)}`);

          // 3. Create Job (Open)
          const openPayload = JSON.stringify({ title: 'Open Job', department: 'Engineering', status: 'Open' });
          console.log("Testing Create Open Job...");
          const res3 = await makeRequest('POST', '/api/recruitment/jobs', token, openPayload);
          console.log("Open Result:", res3.status);
          if (res3.status !== 201) throw new Error(`Open create failed: ${JSON.stringify(res3.data)}`);

          // 4. Public Careers API
          console.log("Testing Public Careers API...");
          const res4 = await makeRequest('GET', '/api/public/jobs', null);
          console.log("Public API Result:", res4.status, "Count:", res4.data.length);
          if (res4.status !== 200) throw new Error(`Public API failed: ${JSON.stringify(res4.data)}`);

          console.log("ALL TESTS PASSED");
        } catch (e) {
          console.error("TEST FAILED:", e.message);
        } finally {
          server.kill();
          process.exit(0);
        }
      }, 3000);
    }
  });
}
runTests();
