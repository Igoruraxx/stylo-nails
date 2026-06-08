'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Plus, Minus, X, ZoomIn, ShoppingBag } from 'lucide-react'
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
  const [imgFailed, setImgFailed] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [addCardOpen, setAddCardOpen] = useState(false)
  const [qtd, setQtd] = useState(1)

  const precoAtual =
    produto.promocao && produto.preco_promocional
      ? produto.preco_promocional
      : produto.preco

  const temFoto = !!produto.imagem_url && !imgFailed
  const foraEstoque = produto.estoque != null && produto.estoque <= 0

  const handleAddToCart = useCallback(() => {
    for (let i = 0; i < qtd; i++) {
      adicionar(produto)
    }
    setAddCardOpen(false)
    setQtd(1)
  }, [produto, qtd, adicionar])

  const openLightbox = useCallback(() => setLightboxOpen(true), [])
  const closeLightbox = useCallback(() => setLightboxOpen(false), [])
  const openAddCard = useCallback(() => setAddCardOpen(true), [])
  const closeAddCard = useCallback(() => {
    setAddCardOpen(false)
    setQtd(1)
  }, [])

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#2E2820]/60 backdrop-blur-lg h-full will-change-transform">
      {/* ── Imagem ─────────────────────────────────────────────── */}
      <div className="relative flex h-48 shrink-0 items-center justify-center overflow-hidden bg-[#2E2820]">
        {temFoto ? (
          <button
            type="button"
            onClick={openLightbox}
            className="relative h-full w-full cursor-pointer outline-none"
            aria-label="Ampliar imagem"
          >
            <Image
              src={produto.imagem_url!}
              alt={produto.nome}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-all duration-500 hover:scale-110 ${
                foraEstoque ? 'grayscale' : ''
              }`}
              onError={() => setImgFailed(true)}
              loading="lazy"
            />
            {/* Indicador de zoom */}
            <div className="pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white/70">
              <ZoomIn size={14} />
            </div>
          </button>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(produto.categoria_id)}`}>
            <div className="shimmer pointer-events-none absolute inset-0" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-3xl opacity-20">
              💅
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#2E2820] to-transparent" />

        {/* Badges */}
        {produto.estoque != null && produto.estoque <= 5 && produto.estoque > 0 && (
          <span className="absolute right-3 top-3 z-10 animate-pulse rounded-full bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg shadow-amber-500/30">
            ⚡ Últimas {produto.estoque}
          </span>
        )}
        {foraEstoque && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
            Esgotado
          </span>
        )}
        {produto.promocao && (
          <span className="absolute left-3 top-3 z-10 animate-pulse rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            🔥 OFERTA
          </span>
        )}

        {/* Overlay Indisponível */}
        {foraEstoque && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
            <span className="rounded-lg border border-white/10 bg-black/60 px-4 py-2 text-sm font-semibold text-white/70 backdrop-blur-sm">
              Indisponível
            </span>
          </div>
        )}
      </div>

      {/* ── Card body (somente visual — nada clicável exceto o botão) ── */}
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

        {/* Estoque */}
        <div className="flex items-center gap-1.5">
          {produto.estoque != null && produto.estoque > 5 ? (
            <span className="flex items-center gap-1 text-[10px] text-green-400/70">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              Em estoque
            </span>
          ) : produto.estoque != null && produto.estoque > 0 ? (
            <span className="flex items-center gap-1 text-[10px] text-amber-400/70">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Apenas {produto.estoque} und.
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-red-400/50">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              Indisponível
            </span>
          )}
        </div>

        {/* Botão Adicionar — abre o card de quantidade */}
        {!addCardOpen && (
          <button
            onClick={openAddCard}
            disabled={foraEstoque}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.04] active:scale-[0.95] ${
              foraEstoque
                ? 'bg-white/5 text-white/20 cursor-not-allowed hover:scale-100'
                : 'bg-[#C9A96E] text-[#1A1612] hover:bg-[#DAA520] hover:shadow-lg hover:shadow-[#C9A96E]/30'
            }`}
          >
            <Plus size={18} aria-hidden="true" />
            Adicionar
          </button>
        )}

        {/* ── Card de Adicionar ao Carrinho ── */}
        {addCardOpen && (
          <div className="animate-fade-in rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] p-3">
            {/* Info do produto */}
            <div className="mb-3 text-center">
              <p className="truncate text-sm font-semibold text-[#F8F1E9]">
                {produto.nome}
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#C9A96E]">
                {formatPrice(precoAtual)}
              </p>
            </div>

            {/* Seletor de quantidade */}
            <div className="mb-3 flex items-center justify-center gap-4">
              <button
                onClick={() => setQtd(q => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-90"
                aria-label="Diminuir quantidade"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-[2rem] text-center text-lg font-bold text-white">
                {qtd}
              </span>
              <button
                onClick={() => setQtd(q => Math.min(q + 1, 99))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-90"
                aria-label="Aumentar quantidade"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Confirmar */}
            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A96E] px-4 py-2.5 text-sm font-semibold text-[#1A1612] transition-all hover:bg-[#DAA520] active:scale-[0.97]"
            >
              <ShoppingBag size={16} />
              Adicionar — {formatPrice(precoAtual * qtd)}
            </button>

            {/* Cancelar */}
            <button
              onClick={closeAddCard}
              className="mt-2 w-full text-center text-xs text-white/40 transition-colors hover:text-white/60"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* ── Lightbox (imagem ampliada) ──────────────────────────── */}
      {lightboxOpen && temFoto && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            aria-label="Fechar imagem"
          >
            <X size={24} />
          </button>
          <img
            src={produto.imagem_url!}
            alt={produto.nome}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
