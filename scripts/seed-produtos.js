const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:***@db.blwzprxihmienukhsapw.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});
async function main() {
  const client = await pool.connect();
  try {
    // Insert more products
    await client.query(`
      INSERT INTO produtos (categoria_id, nome, descricao, preco, promocao, preco_promocional, destaque, ordem)
      SELECT id, 'Esmalte Azul Safira', 'Azul profundo com brilho metálico', 14.90, true, 11.90, true, 3 FROM categorias WHERE slug = 'esmaltes'
      UNION ALL SELECT id, 'Esmalte Rosa Pink', 'Rosa vibrante e marcante', 12.90, false, NULL, true, 4 FROM categorias WHERE slug = 'esmaltes'
      UNION ALL SELECT id, 'Esmalte Glitter Diamante', 'Glitter prateado que ilumina', 16.90, false, NULL, false, 5 FROM categorias WHERE slug = 'esmaltes'
      UNION ALL SELECT id, 'Unhas Postiças Curtas', 'Kit 24 unhas postiças redondas', 24.90, true, 19.90, true, 2 FROM categorias WHERE slug = 'unhas-positicas'
      UNION ALL SELECT id, 'Unhas Postiças Decoradas', '24 unhas com desenhos florais', 34.90, false, NULL, true, 3 FROM categorias WHERE slug = 'unhas-positicas'
      UNION ALL SELECT id, 'Alicate de Cutículas', 'Alicate profissional inox', 15.90, false, NULL, false, 2 FROM categorias WHERE slug = 'acessorios'
      UNION ALL SELECT id, 'Kit Pincéis para Nail Art', 'Kit 3 pincéis profissionais', 22.90, false, NULL, true, 3 FROM categorias WHERE slug = 'acessorios'
      UNION ALL SELECT id, 'Base Fortalecedora', 'Base com cálcio e queratina', 11.90, false, NULL, false, 2 FROM categorias WHERE slug = 'cuidados'
      UNION ALL SELECT id, 'Creme Hidratante para Mãos', 'Hidratação intensiva com ureia', 18.90, true, 14.90, true, 3 FROM categorias WHERE slug = 'cuidados'
    `);
    console.log('Products seeded!');
    const { rows } = await client.query('SELECT id, nome, preco FROM produtos ORDER BY id');
    console.log(JSON.stringify(rows, null, 2));
  } catch(e) { console.error('Error:', e.message); }
  finally { client.release(); await pool.end(); }
}
main();
