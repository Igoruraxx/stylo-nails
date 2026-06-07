'use client'

import { useState, useEffect, useMemo } from 'react'
import { Toaster, toast } from 'sonner'
import Header from '@/components/header'
import ProductCard from '@/components/product-card'
import { useCart } from '@/lib/cart-context'
import type { Categoria, Produto } from '@/types'
import { getCategorias, getProdutos } from '@/lib/queries'

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
        if (!cancelled) setError('Não foi possível carregar os dados.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [])

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
    toast.success(`${produto.nome} adicionado`, {
      description: `${formatPrice(preco)} — 1 un.`,
      duration: 3000,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1612] text-[#F8F1E9]">
        <Header logoUrl="/logo-gold.png" />
        <div className="flex items-center justify-center pt-32">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#C9A96E] border-t-transparent" />
            <p className="text-[#E8D5B0]/70">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1612] text-[#F8F1E9]">
        <Header categorias={categorias} logoUrl="/logo-gold.png" />
        <div className="flex items-center justify-center pt-32">
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

  const hasData = categorias.length > 0 || produtos.length > 0

  if (!hasData) {
    return (
      <div className="min-h-screen bg-[#1A1612] text-[#F8F1E9]">
        <Header categorias={categorias} logoUrl="/logo-gold.png" />
        <div className="flex items-center justify-center pt-32">
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

  return (
    <div className="min-h-screen bg-[#1A1612] text-[#F8F1E9]">
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

      <Header categorias={categorias} logoUrl="/logo-gold.png" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero com vídeo de fundo */}
        <section className="animate-fade-in relative mb-10 overflow-hidden rounded-2xl border border-[#C9A96E]/15 p-6 sm:p-10 lg:p-12 min-h-[320px] sm:min-h-[400px] flex items-center">
          {/* Vídeo de fundo */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            poster="/logo-gold.png"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>

          {/* Overlay escuro */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1612]/85 via-[#1A1612]/70 to-[#1A1612]/85" />

          {/* Conteúdo */}
          <div className="relative z-10 max-w-xl">
            <h2 className="mb-3 font-serif text-2xl font-bold text-[#C9A96E] sm:text-3xl lg:text-4xl">
              Beleza que começa nas pontas dos dedos 💅
            </h2>
            <p className="mb-6 text-base text-[#E8D5B0]/80 sm:text-lg">
              Produtos premium para unhas impecáveis. Explore nossa linha
              exclusiva.
            </p>
            <a
              href="#destaques"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 hover:shadow-lg hover:shadow-[#C9A96E]/20 active:scale-[0.98]"
            >
              Ver Destaques
            </a>
          </div>
        </section>

        {/* Destaques */}
        {destaques.length > 0 && (
          <section id="destaques" className="mb-12">
            <h2 className="gold-gradient-text mb-5 font-serif text-xl font-semibold sm:text-2xl">
              ✨ Produtos em Destaque
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {destaques.map((produto) => (
                <div key={produto.id} onClick={() => handleAddWithToast(produto)}>
                  <ProductCard produto={produto} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categorias com seus produtos */}
        {categorias
          .filter((cat) => cat.ativo && produtosPorCategoria.has(cat.id))
          .map((categoria) => {
            const prods = produtosPorCategoria.get(categoria.id)!
            return (
              <section key={categoria.id} className="mb-12">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="font-serif text-lg font-semibold text-[#C9A96E] sm:text-xl">
                    {categoria.nome}
                  </h2>
                  {categoria.descricao && (
                    <span className="hidden text-sm text-[#E8D5B0]/50 sm:block">
                      {categoria.descricao}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  )
}
