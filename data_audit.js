const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const report = {};
  
  // 1. job_postings.status count
  const { data: statusData, error: statusErr } = await supabase.from('job_postings').select('status');
  if (statusData) {
    const counts = {};
    for (const row of statusData) {
      counts[row.status] = (counts[row.status] || 0) + 1;
    }
    report.job_postings_status = counts;
  } else {
    report.job_postings_status = statusErr;
  }
  
  // 2. Candidates NULL checks
  const { count: nullNameCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).is('name', null);
  const { count: nullEmailCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).is('email', null);
  const { count: nullPhoneCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).is('phone', null);
  report.candidates_nulls = {
    name: nullNameCount || 0,
    email: nullEmailCount || 0,
    phone: nullPhoneCount || 0
  };
  
  // 3. Duplicate job_code / candidate_id
  // Since columns don't exist, we will just note it, but let's try querying just in case they were added partially
  const { error: jcErr } = await supabase.from('job_postings').select('job_code').limit(1);
  const { error: cidErr } = await supabase.from('candidates').select('candidate_id').limit(1);
  report.duplicate_checks = {
    job_code: jcErr ? jcErr.code : 'exists',
    candidate_id: cidErr ? cidErr.code : 'exists'
  };
  
  // 5. Row counts
  const { count: jpCount } = await supabase.from('job_postings').select('*', { count: 'exact', head: true });
  const { count: candCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true });
  const { count: intCount, error: intErr } = await supabase.from('interviews').select('*', { count: 'exact', head: true });
  
  report.row_counts = {
    job_postings: jpCount || 0,
    candidates: candCount || 0,
    interviews: intErr ? intErr.code : (intCount || 0)
  };
  
  console.log(JSON.stringify(report, null, 2));
}
run();
