const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: 'getnexora.solutions@gmail.com'
  });
  if (error) {
    console.error('Error generating link:', error);
  } else {
    console.log('MAGIC_LINK:', data.properties.action_link);
  }
}
run();
