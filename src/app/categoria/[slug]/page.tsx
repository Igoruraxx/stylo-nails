import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/header'
import StoreLayout from '@/components/store-layout'
import ProductCard from '@/components/product-card'
import type { Categoria, Produto } from '@/types'

/* ──────────────────────────────────────────
   Mock-data (estático) até Supabase ficar pronto
   ────────────────────────────────────────── */

const mockCategorias: Categoria[] = [
  { id: 1, nome: 'Unhas em Gel',        slug: 'unhas-em-gel',        descricao: 'Alongamento e blindagem em gel',    imagem_url: null, ordem: 1, ativo: true },
  { id: 2, nome: 'Esmaltação',          slug: 'esmaltacao',          descricao: 'Esmaltação tradicional e em gel',   imagem_url: null, ordem: 2, ativo: true },
  { id: 3, nome: 'Decoração',           slug: 'decoracao',           descricao: 'Adesivos, francesinha e nail art',  imagem_url: null, ordem: 3, ativo: true },
  { id: 4, nome: 'Alongamento Acrílico',slug: 'alongamento-acrilico',descricao: 'Unhas de acrílico',                  imagem_url: null, ordem: 4, ativo: true },
  { id: 5, nome: 'Fibra de Vidro',      slug: 'fibra-de-vidro',      descricao: 'Alongamento com fibra de vidro',    imagem_url: null, ordem: 5, ativo: true },
  { id: 6, nome: 'Manicure',            slug: 'manicure',            descricao: 'Corte e lixa',                      imagem_url: null, ordem: 6, ativo: true },
  { id: 7, nome: 'Pedicure',            slug: 'pedicure',            descricao: 'Cuidados para os pés',              imagem_url: null, ordem: 7, ativo: true },
  { id: 8, nome: 'Tratamentos',         slug: 'tratamentos',         descricao: 'Hidratação e fortalecedores',       imagem_url: null, ordem: 8, ativo: true },
]

const mockProdutos: Produto[] = [
  { id: 1,  categoria_id: 1, nome: 'Gel Builder',           descricao: 'Base fortalecedora em gel para unhas naturais.',       preco: 89.90, promocao: true,  preco_promocional: 69.90, imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 2,  categoria_id: 1, nome: 'Tips em Gel',           descricao: 'Alongamento com tips e gel UV.',                        preco: 129.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 2,  ativo: true, destaque: true },
  { id: 3,  categoria_id: 2, nome: 'Esmalte em Gel',        descricao: 'Esmaltação em gel com cabine UV (duração 15+ dias).',   preco: 59.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 4,  categoria_id: 2, nome: 'Esmalte Tradicional',   descricao: 'Esmaltação tradicional com secagem natural.',            preco: 35.00, promocao: true,  preco_promocional: 25.00, imagem_url: null, ordem: 2,  ativo: true, destaque: false },
  { id: 5,  categoria_id: 3, nome: 'Francesinha Premium',   descricao: 'Francesinha clássica ou colorida feita à mão.',         preco: 45.00, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 6,  categoria_id: 3, nome: 'Kit Adesivos 3D',       descricao: 'Pacote com 20 adesivos metálicos e florais.',            preco: 29.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 2,  ativo: true, destaque: false },
  { id: 7,  categoria_id: 4, nome: 'Alongamento Acrílico',  descricao: 'Moldagem em acrílico para unhas longas e resistentes.',  preco: 149.90, promocao: true,  preco_promocional: 119.90, imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 8,  categoria_id: 5, nome: 'Fibra de Vidro',        descricao: 'Alongamento natural com fibra de vidro.',               preco: 169.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: false },
  { id: 9,  categoria_id: 6, nome: 'Manicure Completa',     descricao: 'Corte, lixa, cutículas e hidratação.',                   preco: 45.00, promocao: true,  preco_promocional: 35.00, imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 10, categoria_id: 6, nome: 'Corte e Lixa',          descricao: 'Apenas corte e formatação das unhas.',                    preco: 25.00, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 2,  ativo: true, destaque: false },
  { id: 11, categoria_id: 7, nome: 'Pedicure Completo',     descricao: 'Pés: corte, cutículas, hidratação e esmaltação.',         preco: 55.00, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 12, categoria_id: 8, nome: 'Hidratação Intensiva',  descricao: 'Hidratação com óleos e cremes fortalecedores.',          preco: 39.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: false },
]

/* ──────────────────────────────────────────
   Props — params é Promise no Next.js 16
   ────────────────────────────────────────── */

interface CategoriaPageProps {
  params: Promise<{ slug: string }>
}

/* ──────────────────────────────────────────
   Server Component
   ────────────────────────────────────────── */

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { slug } = await params

  const categoria = mockCategorias.find(
    (cat) => cat.slug === slug && cat.ativo,
  )

  if (!categoria) {
    notFound()
  }

  const produtos = mockProdutos.filter(
    (prod) => prod.categoria_id === categoria.id && prod.ativo,
  )

  return (
    <>
      <Header />

      <StoreLayout categorias={mockCategorias}>
        <div className="px-4 py-8 sm:px-6 lg:px-10">
          {/* ── Breadcrumb ── */}
          <nav
            className="mb-6 text-sm text-white/50"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="transition-colors hover:text-[#C9A96E]"
            >
              Home
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-white/80">{categoria.nome}</span>
          </nav>

          {/* ── Título da Categoria (Cormorant Garamond) ── */}
          <h1
            className="mb-8 font-serif text-3xl font-bold text-[#C9A96E] sm:text-4xl"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {categoria.nome}
          </h1>

          {/* ── Grid Responsivo de ProductCards ── */}
          {produtos.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {produtos.map((produto) => (
                <ProductCard key={produto.id} produto={produto} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-white/50">
              Nenhum produto encontrado nesta categoria.
            </p>
          )}
        </div>
      </StoreLayout>
    </>
  )
}
