-- Categorias
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

-- Produtos
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

-- Pedidos
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

-- Admin user
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Public read produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Public insert pedidos" ON pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own pedidos" ON pedidos FOR SELECT USING (true);
