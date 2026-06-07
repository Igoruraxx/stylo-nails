'use client'

import { useState, useEffect, useMemo } from 'react'
import { Toaster, toast } from 'sonner'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import CartPanel from '@/components/cart-panel'
import ProductCard from '@/components/product-card'
import type { Categoria, Produto } from '@/types'
import { getCategorias, getProdutos } from '@/lib/queries'

/* ──────────────────────────────────────────
   Utilitário de preço para o toast
   ────────────────────────────────────────── */
function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)

  /* ── Fetch real data from Supabase on mount ── */
  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          getCategorias(),
          getProdutos(),
        ])
        if (!cancelled) {
          setCategorias(cats)
          setProdutos(prods)
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        if (!cancelled) {
          setError('Não foi possível carregar os dados.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [])

  /* Filtra destaques + produtos por categoria */
  const destaques = useMemo(
    () => produtos.filter((p) => p.ativo && p.destaque),
    [produtos],
  )

  const produtosPorCategoria = useMemo(() => {
    const map = new Map<number, Produto[]>()
    for (const p of produtos) {
      if (!p.ativo) continue
      const arr = map.get(p.categoria_id) ?? []
      arr.push(p)
      map.set(p.categoria_id, arr)
    }
    return map
  }, [produtos])

  const handleAddWithToast = (produto: Produto) => {
    const preco =
      produto.promocao && produto.preco_promocional
        ? produto.preco_promocional
        : produto.preco
    toast.success(`${produto.nome} adicionado ao carrinho`, {
      description: `${formatPrice(preco)} — 1 un.`,
      duration: 3000,
    })
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#1A1612] text-[#F8F1E9]">
        <Header />
        <div className="flex flex-1 items-center justify-center pt-16">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#C9A96E] border-t-transparent" />
            <p className="text-[#E8D5B0]/70">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#1A1612] text-[#F8F1E9]">
        <Header />
        <div className="flex flex-1 items-center justify-center pt-16">
          <div className="max-w-md text-center">
            <p className="mb-4 text-4xl">😕</p>
            <p className="mb-2 text-lg text-[#E8D5B0]">{error}</p>
            <p className="text-sm text-[#E8D5B0]/50">
              Tente recarregar a página ou volte mais tarde.
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Empty state (dados carregaram mas não há nada) ── */
  const hasCategorias = categorias.length > 0
  const hasProdutos = produtos.length > 0

  if (!hasCategorias && !hasProdutos) {
    return (
      <div className="flex min-h-screen flex-col bg-[#1A1612] text-[#F8F1E9]">
        <Header />
        <div className="flex flex-1 items-center justify-center pt-16">
          <div className="max-w-md text-center">
            <p className="mb-4 text-4xl">🛍️</p>
            <p className="mb-2 text-lg text-[#E8D5B0]">
              Nenhum produto disponível no momento.
            </p>
            <p className="text-sm text-[#E8D5B0]/50">
              Volte em breve para conferir nossas novidades.
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ── Main layout with real data ── */
  return (
    <div className="flex min-h-screen flex-col bg-[#1A1612] text-[#F8F1E9]">
      {/* Toaster global */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#2E2820',
            color: '#F8F1E9',
            border: '1px solid rgba(201, 169, 110, 0.25)',
          },
        }}
      />

      {/* Header fixo no topo */}
      <Header />

      {/* Layout principal: Sidebar | Conteúdo | CartPanel */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar (esquerda) — fixa em desktop */}
        <aside className="hidden lg:block">
          <Sidebar
            categorias={categorias}
            categoriaAtiva={categoriaAtiva}
          />
        </aside>

        {/* Conteúdo central (scrollável) */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-10">
          {/* ── Banner / Hero ── */}
          <section className="relative mb-12 overflow-hidden rounded-2xl border border-[#C9A96E]/15 bg-gradient-to-br from-[#2E2820] via-[#3A3228] to-[#2E2820] p-8 sm:p-12">
            <div className="relative z-10 max-w-xl">
              <h2 className="mb-3 font-serif text-3xl font-bold text-[#C9A96E] sm:text-4xl">
                Beleza que começa nas pontas dos dedos 💅
              </h2>
              <p className="mb-6 text-lg text-[#E8D5B0]/80">
                Produtos premium para unhas impecáveis. Explore nossa linha
                exclusiva de esmaltes, alongamentos e cuidados.
              </p>
              <a
                href="#destaques"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Ver Destaques
              </a>
            </div>
            {/* Decoração sutil */}
            <div className="absolute -bottom-8 -right-8 text-[120px] opacity-[0.06] select-none">
              💅
            </div>
          </section>

          {/* ── Produtos em Destaque ── */}
          {destaques.length > 0 && (
            <section id="destaques" className="mb-14">
              <h2 className="mb-6 font-serif text-2xl font-semibold text-[#C9A96E]">
                ✨ Produtos em Destaque
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {destaques.map((produto) => (
                  <div key={produto.id} onClick={() => handleAddWithToast(produto)}>
                    <ProductCard produto={produto} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Categorias como seções ── */}
          {categorias
            .filter((cat) => cat.ativo && produtosPorCategoria.has(cat.id))
            .map((categoria) => {
              const prods = produtosPorCategoria.get(categoria.id)!
              return (
                <section key={categoria.id} className="mb-14">
                  <div className="mb-2 flex items-baseline justify-between">
                    <h2 className="font-serif text-xl font-semibold text-[#C9A96E]">
                      {categoria.nome}
                    </h2>
                    {categoria.descricao && (
                      <span className="hidden text-sm text-[#E8D5B0]/50 sm:block">
                        {categoria.descricao}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {prods.map((produto) => (
                      <div key={produto.id} onClick={() => handleAddWithToast(produto)}>
                        <ProductCard produto={produto} />
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
        </main>

        {/* CartPanel (direita) — fixo */}
        <aside className="hidden xl:block">
          <CartPanel />
        </aside>
      </div>
    </div>
  )
}
