const { exec } = require('child_process');
const http = require('http');

const server = exec('npm run dev');
let serverOutput = '';

server.stdout.on('data', (data) => {
  serverOutput += data.toString();
  if (data.toString().includes('Ready in') || data.toString().includes('started server on')) {
    setTimeout(runCurl, 3000);
  }
});

server.stderr.on('data', (data) => {
  serverOutput += data.toString();
});

function runCurl() {
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
      'Content-Length': payload.length
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
        process.exit(0);
      }, 1000);
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
    process.exit(1);
  });

  req.write(payload);
  req.end();
}

// Timeout failsafe
setTimeout(() => {
  console.log('Test timed out');
  console.log('--- SERVER LOGS ---');
  console.log(serverOutput);
  process.exit(1);
}, 20000);
