export interface Categoria {
  id: number
  nome: string
  slug: string
  descricao: string | null
  imagem_url: string | null
  ordem: number
  ativo: boolean
}

export interface Produto {
  id: number
  categoria_id: number
  nome: string
  descricao: string | null
  preco: number
  promocao: boolean
  preco_promocional: number | null
  imagem_url: string | null
  ordem: number
  ativo: boolean
  destaque: boolean
  total_vendas?: number
}

export interface CartItem {
  produto: Produto
  quantidade: number
}

export interface Pedido {
  id: number
  cliente_nome: string
  cliente_whatsapp: string
  itens: CartItem[]
  total: number
  forma_pagamento: string
  observacao: string | null
  status: string
  created_at: string
}
