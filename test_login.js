const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'm.scott@nexorasolutions.com',
    password: 'password'
  });
  console.log('Login error:', error);
  if (data.session) {
    const res = await fetch('http://localhost:3000/api/recruitment/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'sb-access-token=' + data.session.access_token + '; sb-refresh-token=' + data.session.refresh_token
      },
      body: JSON.stringify({
        title: 'Test Job',
        department: 'Engineering',
        employment_type: 'Full-time',
        hiring_priority: 'Medium',
        location_type: 'Remote',
        hiring_type: 'New',
        status: 'Open'
      })
    });
    console.log('API Status:', res.status);
    console.log('API Body:', await res.text());
  }
}
test();
