import { createClient } from './supabase'
import type { Categoria, Produto } from '@/types'

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (error) {
    console.error('Erro ao buscar categorias:', error.message)
    return []
  }

  return data ?? []
}

export async function getProdutos(): Promise<Produto[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (error) {
    console.error('Erro ao buscar produtos:', error.message)
    return []
  }

  return data ?? []
}

export async function getProdutosByCategoria(slug: string): Promise<Produto[]> {
  const supabase = createClient()

  // Primeiro obtém a categoria pelo slug
  const { data: categoria, error: categoriaError } = await supabase
    .from('categorias')
    .select('id')
    .eq('slug', slug)
    .single()

  if (categoriaError || !categoria) {
    console.error('Erro ao buscar categoria por slug:', categoriaError?.message)
    return []
  }

  // Depois busca os produtos dessa categoria
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('categoria_id', categoria.id)
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (error) {
    console.error('Erro ao buscar produtos por categoria:', error.message)
    return []
  }

  return data ?? []
}

export async function getCategoriaBySlug(slug: string): Promise<Categoria | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Erro ao buscar categoria por slug:', error.message)
    return null
  }

  return data
}
