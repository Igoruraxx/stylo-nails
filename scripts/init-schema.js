const { createClient } = require('@supabase/supabase-js');
const key = 'eyJhbG...fjU8';
const supabase = createClient('https://blwzprxihmienukhsapw.supabase.co', key, { auth: { persistSession: false } });

async function init() {
  // Create tables via the raw SQL approach
  // We'll use the /rest/v1/ endpoint to create a function that runs SQL
  // or use rpc if available
  
  // First, enable pg_graphql via service_role
  console.log('Checking connection...');
  
  // Try creating the categorias table by using the REST API directly
  // The service_role key can create tables via SQL
  
  // Actually, let's use a different approach - use postgREST with service_role
  // to create the schema via the management functions
  
  console.log('Creating schema...');
  
  // Check if categorias exists
  const { data: catCheck, error: catErr } = await supabase.from('categorias').select('id').limit(1);
  if (catErr && catErr.code === 'PGRST205') {
    console.log('Table does not exist yet - attempting to create...');
    // We'll need raw SQL access. Let's try via pg client
    console.log('Need direct DB access to create tables');
    console.log('Cat error:', catErr.message);
  } else if (!catErr) {
    console.log('Table categorias already exists!');
    const { count } = await supabase.from('categorias').select('*', { count: 'exact', head: true });
    console.log('Categories count:', count);
  }
}

init().catch(e => console.log('Error:', e.message));
