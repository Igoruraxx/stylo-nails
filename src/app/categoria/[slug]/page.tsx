'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import ProductCard from '@/components/product-card'
import type { Categoria, Produto } from '@/types'

export default function CategoriaPage() {
  const params = useParams()
  const slug = params.slug as string

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const API = 'https://blwzprxihmienukhsapw.supabase.co/rest/v1'
        const HEADERS = {
          apikey: 'sb_publishable_Md8oCk2-vqoTLqFTKmfxHA_pJ1eQhvA',
          Authorization: 'Bearer sb_publishable_Md8oCk2-vqoTLqFTKmfxHA_pJ1eQhvA',
        }

        const [catRes, catsRes] = await Promise.all([
          fetch(`${API}/categorias?select=*&slug=eq.${slug}&ativo=eq.true`, { headers: HEADERS }),
          fetch(`${API}/categorias?select=*&ativo=eq.true&order=ordem`, { headers: HEADERS }),
        ])

        const catData: Categoria[] = await catRes.json()
        const catsData: Categoria[] = await catsRes.json()

        if (!catData.length) {
          setNotFound(true)
          setLoading(false)
          return
        }

        setCategoria(catData[0])
        setCategorias(catsData)

        const prodRes = await fetch(
          `${API}/produtos?select=*&categoria_id=eq.${catData[0].id}&ativo=eq.true&order=ordem`,
          { headers: HEADERS }
        )
        const prodData: Produto[] = await prodRes.json()
        setProdutos(prodData)
      } catch (e) {
        console.error('Erro ao carregar:', e)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <>
        <Header logoUrl="/logo-gold.png" />
        <div className="flex h-screen items-center justify-center">
          <div className="animate-pulse text-[#C9A96E]">Carregando...</div>
        </div>
      </>
    )
  }

  if (notFound || !categoria) {
    return (
      <>
        <Header categorias={categorias} logoUrl="/logo-gold.png" />
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <span className="text-6xl">💅</span>
          <h1 className="font-serif text-2xl text-[#C9A96E]">Página não encontrada</h1>
          <Link href="/" className="text-white/60 hover:text-[#C9A96E] transition-colors">
            Voltar ao início
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header categorias={categorias} logoUrl="/logo-gold.png" />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-white/50" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-[#C9A96E]">Home</Link>
          <span className="mx-2 text-white/30">/</span>
          <span className="text-[#C9A96E]">{categoria.nome}</span>
        </nav>

        {/* Header da categoria */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#C9A96E] sm:text-4xl">
            {categoria.nome}
          </h1>
          {categoria.descricao && (
            <p className="mt-2 max-w-2xl text-white/60">{categoria.descricao}</p>
          )}
        </div>

        {/* Grid de produtos */}
        {produtos.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {produtos.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <span className="text-4xl opacity-30">📦</span>
            <p className="mt-4 text-white/50">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </main>
    </>
  )
}
