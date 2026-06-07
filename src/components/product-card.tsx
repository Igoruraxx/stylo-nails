'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import type { Produto } from '@/types'

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const categoryGradients: Record<number, string> = {
  1: 'from-pink-500 to-purple-600',
  2: 'from-cyan-500 to-blue-600',
  3: 'from-violet-500 to-purple-800',
  4: 'from-teal-400 to-emerald-600',
  5: 'from-rose-400 to-orange-500',
  6: 'from-fuchsia-500 to-pink-600',
  7: 'from-sky-400 to-indigo-600',
  8: 'from-amber-500 to-red-600',
  9: 'from-green-400 to-teal-600',
  10: 'from-rose-500 to-pink-700',
}

function getGradient(categoriaId: number): string {
  return categoryGradients[categoriaId] ?? 'from-[#C9A96E] to-[#B8860B]'
}

interface ProductCardProps {
  produto: Produto
}

export default function ProductCard({ produto }: ProductCardProps) {
  const { adicionar } = useCart()
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const temFoto = !!produto.imagem_url && !imgError

  const precoAtual =
    produto.promocao && produto.preco_promocional
      ? produto.preco_promocional
      : produto.preco

  const handleAdd = useCallback(() => {
    adicionar(produto)
    setAdded(true)
    const t = setTimeout(() => setAdded(false), 1200)
    return () => clearTimeout(t)
  }, [adicionar, produto])

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#2E2820]/60 backdrop-blur-lg transition-all duration-300 hover:scale-[1.03] hover:border-[#C9A96E]/30 hover:shadow-xl hover:shadow-[#C9A96E]/10">
      <div className={`relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br ${getGradient(produto.categoria_id)}`}>
        {temFoto && (
          <img
            ref={imgRef}
            src={produto.imagem_url!}
            alt={produto.nome}
            className="absolute inset-0 z-10 h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}

        <div className="shimmer pointer-events-none absolute inset-0 z-0" />

        {produto.promocao && (
          <span className="absolute left-3 top-3 z-20 animate-pulse rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            🔥 OFERTA
          </span>
        )}

        {!temFoto && (
          <span className="relative z-[1] select-none text-5xl opacity-30">💅</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="truncate font-serif text-lg font-semibold leading-tight text-[#F8F1E9]">
          {produto.nome}
        </h3>

        {produto.descricao && (
          <p className="line-clamp-2 text-sm leading-relaxed text-white/50">
            {produto.descricao}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2">
          <span className="gold-gradient-text text-xl font-bold tracking-tight">
            {formatPrice(precoAtual)}
          </span>
          {produto.promocao && produto.preco_promocional != null && (
            <span className="text-sm text-white/40 line-through">
              {formatPrice(produto.preco)}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] ${
            added
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-[#C9A96E] text-[#1A1612] hover:bg-[#DAA520] hover:shadow-lg hover:shadow-[#C9A96E]/20'
          }`}
        >
          {added ? (
            <>✓ Adicionado</>
          ) : (
            <><Plus size={18} aria-hidden="true" /> Adicionar</>
          )}
        </button>
      </div>
    </div>
  )
}
