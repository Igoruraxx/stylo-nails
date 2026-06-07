const { createClient } = require('@supabase/supabase-js');
const key = 'eyJhbG...fjU8';
const supabase = createClient('https://blwzprxihmienukhsapw.supabase.co', key, { auth: { persistSession: false } });

const produtos = [
  { categoria_id: 1, nome: 'Esmalte Azul Safira', descricao: 'Azul profundo com brilho metálico', preco: 14.90, promocao: true, preco_promocional: 11.90, destaque: true, ordem: 3 },
  { categoria_id: 1, nome: 'Esmalte Rosa Pink', descricao: 'Rosa vibrante e marcante', preco: 12.90, promocao: false, destaque: true, ordem: 4 },
  { categoria_id: 1, nome: 'Esmalte Glitter Diamante', descricao: 'Glitter prateado que ilumina', preco: 16.90, promocao: false, destaque: false, ordem: 5 },
  { categoria_id: 2, nome: 'Unhas Postiças Curtas', descricao: 'Kit 24 unhas postiças redondas', preco: 24.90, promocao: true, preco_promocional: 19.90, destaque: true, ordem: 2 },
  { categoria_id: 2, nome: 'Unhas Postiças Decoradas', descricao: '24 unhas com desenhos florais', preco: 34.90, promocao: false, destaque: true, ordem: 3 },
  { categoria_id: 3, nome: 'Alicate de Cutículas', descricao: 'Alicate profissional inox', preco: 15.90, promocao: false, destaque: false, ordem: 2 },
  { categoria_id: 3, nome: 'Kit Pincéis para Nail Art', descricao: 'Kit 3 pincéis profissionais', preco: 22.90, promocao: false, destaque: true, ordem: 3 },
  { categoria_id: 4, nome: 'Base Fortalecedora', descricao: 'Base com cálcio e queratina', preco: 11.90, promocao: false, destaque: false, ordem: 2 },
  { categoria_id: 4, nome: 'Creme Hidratante para Mãos', descricao: 'Hidratação intensiva com ureia', preco: 18.90, promocao: true, preco_promocional: 14.90, destaque: true, ordem: 3 },
];

async function main() {
  for (const p of produtos) {
    const { error } = await supabase.from('produtos').insert(p);
    if (error) console.log(`Error inserting ${p.nome}:`, error.message);
    else console.log(`✓ ${p.nome}`);
  }
  
  const { data, error } = await supabase.from('produtos').select('id, nome, preco');
  if (error) console.log('Query error:', error.message);
  else console.log('Total produtos:', data.length);
}

main().catch(e => console.log('Fatal:', e.message));
