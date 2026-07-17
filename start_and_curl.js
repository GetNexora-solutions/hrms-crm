const { spawn } = require('child_process');
const http = require('http');

const server = spawn('npm.cmd', ['run', 'dev'], { stdio: 'pipe' });
let serverOutput = '';

server.stdout.on('data', (data) => {
  serverOutput += data.toString();
  // Wait until server is ready
  if (data.toString().includes('Ready in')) {
    setTimeout(() => {
      runCurl();
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.log('STDERR:', data.toString());
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
      console.log('HTTP Status:', res.statusCode);
      console.log('Response Body:', data);
      
      setTimeout(() => {
        console.log('--- SERVER LOGS ---');
        console.log(serverOutput);
        
        // Restore rbac.ts
        require('child_process').execSync('powershell.exe -Command "Copy-Item -Path lib/rbac.ts.bak -Destination lib/rbac.ts -Force"');
        
        server.kill();
        process.exit(0);
      }, 2000);
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
    server.kill();
    process.exit(1);
  });

  req.write(payload);
  req.end();
}
