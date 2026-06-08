'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

interface CartPanelProps {
  onClose?: () => void
}

export default function CartPanel({ onClose }: CartPanelProps) {
  const { itens, total, totalItens, remover, atualizarQtd, limpar } = useCart()
  const [removendo, setRemovendo] = useState<number | null>(null)
  const [badgeAnim, setBadgeAnim] = useState(false)
  const prevCount = useRef(totalItens)
  const itemsRef = useRef<HTMLDivElement>(null)

  // Animar badge quando o total de itens muda
  if (totalItens !== prevCount.current && prevCount.current > 0) {
    setBadgeAnim(true)
    setTimeout(() => setBadgeAnim(false), 400)
  }
  prevCount.current = totalItens

  const getPreco = (item: (typeof itens)[number]) => {
    const p = item.produto
    return p.promocao && p.preco_promocional ? p.preco_promocional : p.preco
  }

  const handleRemover = useCallback((id: number) => {
    setRemovendo(id)
    setTimeout(() => {
      remover(id)
      setRemovendo(null)
    }, 250)
  }, [remover])

  const handleQtd = useCallback((id: number, qtd: number) => {
    if (qtd < 1) return
    atualizarQtd(id, qtd)
  }, [atualizarQtd])

  return (
    <>
      {/* ═══ Header ═══ */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#C9A96E]/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag size={18} className="text-[#C9A96E]" />
            {totalItens > 0 && (
              <span
                className={`absolute -right-2 -top-2 flex min-w-[18px] items-center justify-center rounded-full bg-[#C9A96E] px-1 text-[10px] font-bold text-[#1A1612] leading-none h-[18px] ${
                  badgeAnim ? 'animate-badge-bounce' : ''
                }`}
              >
                {totalItens > 99 ? '99+' : totalItens}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#F8F1E9]">
              Carrinho
            </h2>
            <p className="text-[10px] tracking-wide text-[#E8D5B0]/40 uppercase">
              {totalItens === 0 ? 'Vazio' : `${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#E8D5B0]/60 transition-all hover:bg-white/10 hover:text-[#C9A96E] active:scale-90"
          aria-label="Fechar carrinho"
        >
          <X size={16} />
        </button>
      </div>

      {/* ═══ Lista de Itens (scrollável) ═══ */}
      <div ref={itemsRef} className="cart-scroll flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-1">
        {itens.length === 0 ? (
          /* ── Empty State Premium ── */
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="animate-empty-float mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A96E]/20 to-[#B8860B]/10">
              <ShoppingBag size={40} className="text-[#C9A96E]/60" />
            </div>
            <h3 className="mb-2 font-serif text-xl font-semibold text-[#E8D5B0]">
              Carrinho vazio
            </h3>
            <p className="mb-8 max-w-[200px] text-sm leading-relaxed text-[#E8D5B0]/40">
              Adicione produtos do catálogo para começar
            </p>
            <button
              onClick={onClose}
              className="rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-[#B8860B]/20 transition-all hover:brightness-110 active:scale-[0.97]"
            >
              Ver Catálogo
            </button>
          </div>
        ) : (
          itens.map((item, idx) => {
            const preco = getPreco(item)
            const isPromocao = item.produto.promocao && item.produto.preco_promocional
            const isRemoving = removendo === item.produto.id

            return (
              <div
                key={item.produto.id}
                className={`${isRemoving ? 'cart-item-exit' : 'cart-item-enter'}`}
                style={{ animationDelay: isRemoving ? '0ms' : `${idx * 40}ms` }}
              >
                <div className="group relative flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all hover:border-[#C9A96E]/20 hover:bg-white/[0.06]">
                  {/* Imagem do produto */}
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#1A1612]">
                    {item.produto.imagem_url ? (
                      <Image
                        src={item.produto.imagem_url}
                        alt={item.produto.nome}
                        fill
                        sizes="56px"
                        className="object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl opacity-30">
                        💅
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#F8F1E9]">
                      {item.produto.nome}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-[#C9A96E]">
                      {isPromocao && (
                        <span className="mr-1.5 text-[10px] text-[#E8D5B0]/30 line-through">
                          {formatPrice(item.produto.preco)}
                        </span>
                      )}
                      {formatPrice(preco)}
                    </p>
                  </div>

                  {/* Quantidade +/‑ */}
                  <div className="flex shrink-0 items-center gap-0 rounded-lg border border-white/5 bg-white/[0.03] p-0.5">
                    <button
                      onClick={() => handleQtd(item.produto.id, item.quantidade - 1)}
                      disabled={item.quantidade <= 1}
                      className="qty-btn flex h-7 w-7 items-center justify-center rounded-md text-[#E8D5B0]/50 transition-all hover:bg-[#C9A96E]/15 hover:text-[#C9A96E] disabled:opacity-20 disabled:cursor-not-allowed"
                      aria-label="Diminuir"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="flex w-7 items-center justify-center text-center text-sm font-medium tabular-nums text-[#F8F1E9]">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => handleQtd(item.produto.id, item.quantidade + 1)}
                      className="qty-btn flex h-7 w-7 items-center justify-center rounded-md text-[#E8D5B0]/50 transition-all hover:bg-[#C9A96E]/15 hover:text-[#C9A96E]"
                      aria-label="Aumentar"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Preço total do item */}
                  <span className="hidden w-16 text-right text-xs font-medium tabular-nums text-[#E8D5B0]/70 sm:block">
                    {formatPrice(preco * item.quantidade)}
                  </span>

                  {/* Remover */}
                  <button
                    onClick={() => handleRemover(item.produto.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#E8D5B0]/20 transition-all hover:bg-red-500/15 hover:text-red-400 active:scale-90"
                    aria-label="Remover"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ═══ Footer (Total + Checkout) ═══ */}
      {itens.length > 0 && (
        <div className="shrink-0 border-t border-[#C9A96E]/10 bg-gradient-to-t from-[#1A1612] via-[#1A1612] to-transparent px-6 pt-4 pb-6">
          {/* Cupom / Frete (placeholder premium) */}
          <div className="mb-4 flex items-center justify-between rounded-lg border border-dashed border-[#C9A96E]/10 px-4 py-2.5">
            <span className="text-xs text-[#E8D5B0]/30">Frete</span>
            <span className="text-xs text-[#E8D5B0]/40">Consulte o valor do frete para seu endereço</span>
          </div>

          {/* Total */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-medium text-[#E8D5B0]/70">Total</span>
            <div className="text-right">
              <span className="animate-gold-shimmer text-2xl font-bold tracking-tight">
                {formatPrice(total)}
              </span>
              <p className="text-[10px] text-[#E8D5B0]/30">
                Em até 3x sem juros
              </p>
            </div>
          </div>

          {/* Checkout */}
          <Link
            href="/checkout"
            onClick={onClose}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#B8860B] via-[#DAA520] to-[#B8860B] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#B8860B]/30 transition-all hover:brightness-110 hover:shadow-[#B8860B]/50 active:scale-[0.98]"
          >
            <span className="relative z-10">Finalizar Pedido</span>
            <span className="relative z-10 text-lg">→</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>

          {/* Limpar */}
          <button
            onClick={limpar}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-[#E8D5B0]/40 transition-all hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400 active:scale-[0.98]"
          >
            <Trash2 size={12} />
            Limpar Carrinho
          </button>
        </div>
      )}
    </>
  )
}
