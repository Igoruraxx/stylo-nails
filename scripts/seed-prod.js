const { Pool } = require('pg');

const password = process.env.DB_PASSWORD || process.env.PGPASSWORD;
if (!password) {
  console.error('Set DB_PASSWORD environment variable');
  process.exit(1);
}

const pool = new Pool({
  connectionString: `postgresql://postgres:${password}@db.blwzprxihmienukhsapw.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

const sql = `
INSERT INTO produtos (categoria_id, nome, descricao, preco, promocao, preco_promocional, destaque, ordem)
VALUES
(1, 'Esmalte Azul Safira', 'Azul profundo com brilho metálico', 14.90, true, 11.90, true, 3),
(1, 'Esmalte Rosa Pink', 'Rosa vibrante e marcante', 12.90, false, NULL, true, 4),
(1, 'Esmalte Glitter Diamante', 'Glitter prateado que ilumina', 16.90, false, NULL, false, 5),
(2, 'Unhas Postiças Curtas', 'Kit 24 unhas postiças redondas', 24.90, true, 19.90, true, 2),
(2, 'Unhas Postiças Decoradas', '24 unhas com desenhos florais', 34.90, false, NULL, true, 3),
(3, 'Alicate de Cutículas', 'Alicate profissional inox', 15.90, false, NULL, false, 2),
(3, 'Kit Pincéis para Nail Art', 'Kit 3 pincéis profissionais', 22.90, false, NULL, true, 3),
(4, 'Base Fortalecedora', 'Base com cálcio e queratina', 11.90, false, NULL, false, 2),
(4, 'Creme Hidratante para Mãos', 'Hidratação intensiva com ureia', 18.90, true, 14.90, true, 3)
ON CONFLICT DO NOTHING;
`;

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected!');
    const r = await client.query(sql);
    console.log('Inserted:', r.rowCount, 'rows');
    const { rows } = await client.query('SELECT COUNT(*) as c FROM produtos');
    console.log('Total produtos:', rows[0].c);
  } catch(e) { console.error('Error:', e.message); }
  finally { client.release(); await pool.end(); }
}
main();
