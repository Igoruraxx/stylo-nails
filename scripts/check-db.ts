import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://blwzprxihmienukhsapw.supabase.co'
const anonKey = 'sb_publishable_Md8oCk2-vqoTLqFTKmfxHA_pJ1eQhvA'

const supabase = createClient(supabaseUrl, anonKey)

async function init() {
  // Try to execute SQL via REST API
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, name TEXT)`
  })
  console.log('exec_sql:', { data, error })

  // Check if we can at least query
  const { data: d2, error: e2 } = await supabase.from('categorias').select('*').limit(1)
  console.log('categorias query:', { data: d2, error: e2 })
}

init().catch(console.error)
