const { exec } = require('child_process');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');

async function getJwtToken() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: employee } = await supabase.from('employees').select('*').eq('email', 'sharmag212003@gmail.com').single();
  const jwt = require('jsonwebtoken');
  return jwt.sign({
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    sub: employee.user_id,
    email: 'sharmag212003@gmail.com',
    role: 'authenticated'
  }, process.env.SUPABASE_JWT_SECRET);
}

async function run() {
  const token = await getJwtToken();
  const server = exec('npm run dev');
  let serverOutput = '';

  server.stdout.on('data', (data) => {
    serverOutput += data.toString();
    if (data.toString().includes('Ready in') || data.toString().includes('started server on')) {
      setTimeout(() => runCurl(token, serverOutput, server), 3000);
    }
  });

  server.stderr.on('data', (data) => {
    serverOutput += data.toString();
  });
}

function runCurl(token, serverOutput, server) {
  const payload = JSON.stringify({
    title: 'Smoke Test Job',
    department: 'Engineering',
    reporting_manager_id: '',
    positions: 1,
    employment_type: 'Full-time',
    office_location: '',
    location_type: 'Remote',
    description: '',
    required_skills: '',
    preferred_skills: '',
    min_experience: '',
    max_experience: '',
    education_required: '',
    joining_date: '',
    hiring_priority: 'Medium',
    hiring_type: 'New',
    salary_type: 'Monthly',
    min_salary: '',
    max_salary: '',
    salary_negotiable: false,
    closing_date: '',
    status: 'Open',
    approval_status: 'Pending'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/recruitment/jobs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      'Cookie': \sb-xvhvkiejuknfzbmnozls-auth-token=\\
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('--- API RESPONSE ---');
      console.log('HTTP Status:', res.statusCode);
      console.log('Response Body:', data);
      
      setTimeout(() => {
        console.log('--- SERVER LOGS ---');
        console.log(serverOutput);
        server.kill();
        process.exit(0);
      }, 1000);
    });
  });

  req.write(payload);
  req.end();
}

run();
