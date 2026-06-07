const { createClient } = require('@supabase/supabase-js');
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd3pwcnhpaG1pZW51a2hzYXB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc5NDE0NSwiZXhwIjoyMDk2MzcwMTQ1fQ.dCvISCul9pMSol58S90t8_0KD0__Si4L1fMxKYjfjU8';
console.log('Key length:', key.length);
const supabase = createClient('https://blwzprxihmienukhsapw.supabase.co', key, { auth: { persistSession: false } });
supabase.from('categorias').select('count', { count: 'exact', head: true }).then(r => console.log(JSON.stringify(r))).catch(e => console.log('Error:', e.message));
