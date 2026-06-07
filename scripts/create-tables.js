const { Pool } = require('pg');

// Password with @ encoded as %40
const encodedPassword = '92752703Cl%40';
const connStr = `postgresql://postgres:${encodedPassword}@db.blwzprxihmienukhsapw.supabase.co:5432/postgres`;

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  query_timeout: 30000
});

const sql = `
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  imagem_url TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  promocao BOOLEAN DEFAULT false,
  preco_promocional DECIMAL(10,2),
  imagem_url TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  cliente_nome VARCHAR(200) NOT NULL,
  cliente_whatsapp VARCHAR(20) NOT NULL,
  itens JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(50) NOT NULL,
  observacao TEXT,
  status VARCHAR(20) DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categorias" ON categorias;
CREATE POLICY "Public read categorias" ON categorias FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read produtos" ON produtos;
CREATE POLICY "Public read produtos" ON produtos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert pedidos" ON pedidos;
CREATE POLICY "Public insert pedidos" ON pedidos FOR INSERT WITH CHECK (true);
`;

const seedSql = `
INSERT INTO categorias (nome, slug, descricao, ordem) VALUES
  ('Esmaltes', 'esmaltes', 'Esmaltes de alta qualidade com cores intensas', 1),
  ('Unhas Postiças', 'unhas-positicas', 'Unhas postiças estilosas para todas as ocasiões', 2),
  ('Acessórios', 'acessorios', 'Acessórios para cuidados e decoração', 3),
  ('Cuidados', 'cuidados', 'Produtos para fortalecer e hidratar as unhas', 4)
ON CONFLICT (slug) DO NOTHING;
`;

async function main() {
  console.log('Connecting...');
  const client = await pool.connect();
  try {
    console.log('Connected! Creating schema...');
    await client.query(sql);
    console.log('Schema created!');
    await client.query(seedSql);
    console.log('Seed data inserted!');
    const { rows } = await client.query('SELECT id, nome, slug FROM categorias');
    console.log('Categories:', JSON.stringify(rows));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
