import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/header'
import StoreLayout from '@/components/store-layout'
import ProductCard from '@/components/product-card'
import type { Categoria, Produto } from '@/types'

const SUPABASE_URL = 'https://blwzprxihmienukhsapw.supabase.co'
const ANON_KEY = 'sb_publishable_Md8oCk2-vqoTLqFTKmfxHA_pJ1eQhvA'

interface Props {
  params: Promise<{ slug: string }>
}

async function fetchFrom<T>(table: string, query: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  return res.json()
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params

  const categorias = await fetchFrom<Categoria[]>('categorias', 'select=*&ativo=eq.true&order=ordem')
  const catList = await fetchFrom<Categoria[]>('categorias', `select=*&slug=eq.${slug}&ativo=eq.true`)

  const categoria = catList[0]
  if (!categoria) notFound()

  const produtos = await fetchFrom<Produto[]>('produtos', `select=*&categoria_id=eq.${categoria.id}&ativo=eq.true&order=ordem`)

  return (
    <>
      <Header />
      <StoreLayout categorias={categorias}>
        <div className="px-4 py-8 sm:px-6 lg:px-10">
          <nav className="mb-6 text-sm text-white/50" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-[#C9A96E]">Home</Link>
            <span className="mx-2">&gt;</span>
            <span className="text-white/80">{categoria.nome}</span>
          </nav>

          {categoria.descricao && (
            <p className="mb-6 max-w-2xl text-white/60">{categoria.descricao}</p>
          )}

          <h1 className="mb-8 font-serif text-3xl font-bold text-[#C9A96E] sm:text-4xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {categoria.nome}
          </h1>

          {produtos.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {produtos.map((produto: Produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-white/50">Nenhum produto encontrado nesta categoria.</p>
          )}
        </div>
      </StoreLayout>
    </>
  )
}
