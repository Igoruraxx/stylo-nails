const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

(async () => {
  // Try creating/executing a SQL function via the REST API
  // First, let's try using the pg_execute function if it exists
  const { data: funcs, error: funcErr } = await supabase.rpc('pg_execute', {
    query: 'ALTER TABLE produtos ADD COLUMN IF NOT EXISTS total_vendas INTEGER DEFAULT 0'
  });
  
  if (funcErr) {
    console.log('pg_execute not available:', funcErr.message);
    
    // Try direct postgREST with service role - we can use the /rest/v1/ endpoint
    // with a special header to execute raw SQL
    console.log('Trying via fetch...');
    
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: 'ALTER TABLE produtos ADD COLUMN IF NOT EXISTS total_vendas INTEGER DEFAULT 0'
      })
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text.substring(0, 300));
  } else {
    console.log('✅ Column added via pg_execute!');
  }
  
  // If we get here, verify the column
  const { data: check } = await supabase.from('produtos').select('id, total_vendas').limit(3);
  if (check && 'total_vendas' in check[0]) {
    console.log('✅ total_vendas exists!');
    
    // Seed data
    await supabase.rpc('pg_execute', {
      query: 'UPDATE produtos SET total_vendas = floor(random() * 50 + 1)::int'
    });
    
    const { data: top } = await supabase.from('produtos')
      .select('id, nome, total_vendas')
      .order('total_vendas', { ascending: false })
      .limit(5);
    console.log('🏆 Top 5:', top);
  }
  
})().catch(e => console.error('Fatal:', e.message));
