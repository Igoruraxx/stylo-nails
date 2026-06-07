'use client'

import { useState, useEffect, useMemo } from 'react'
import { Toaster, toast } from 'sonner'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import ProductCard from '@/components/product-card'
import type { Categoria, Produto } from '@/types'
import { getCategorias, getProdutos import { CategoriaIconView } from '@/components/categoria-icon'
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
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      <div className="flex min-h-screen flex-col bg-[#1A1612] text-[#F8F1E9]">
        <Header onToggleSidebar={() => {}} />
        <div className="flex flex-1 items-center justify-center pt-14 lg:pt-16">
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
      <div className="flex min-h-screen flex-col bg-[#1A1612] text-[#F8F1E9]">
        <Header onToggleSidebar={() => {}} />
        <div className="flex flex-1 items-center justify-center pt-14 lg:pt-16">
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
      <div className="flex min-h-screen flex-col bg-[#1A1612] text-[#F8F1E9]">
        <Header onToggleSidebar={() => {}} />
        <div className="flex flex-1 items-center justify-center pt-14 lg:pt-16">
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
    <div className="flex min-h-screen flex-col bg-[#1A1612] text-[#F8F1E9]">
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

      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {/* Scrim do sidebar mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar como drawer no mobile */}
      <aside
        className={`fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-72 overflow-y-auto transition-transform duration-300 lg:static lg:top-auto lg:z-auto lg:block lg:h-auto lg:w-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          categorias={categorias}
          categoriaAtiva={categoriaAtiva}
        />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 pt-14 lg:pt-16">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <Sidebar
            categorias={categorias}
            categoriaAtiva={categoriaAtiva}
          />
        </aside>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {/* Hero */}
          <section className="animate-fade-in relative mb-10 overflow-hidden rounded-2xl border border-[#C9A96E]/15 bg-gradient-to-br from-[#2E2820] via-[#3A3228] to-[#2E2820] p-6 sm:p-10 lg:p-12">
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
            <div className="absolute -bottom-8 -right-8 select-none text-[100px] opacity-[0.06] sm:text-[120px]">
              💅
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

          {/* Categorias */}
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

      {/* Bottom spacer para nav no mobile */}
      <div className="h-16 lg:hidden" />
    </div>
  )
}
