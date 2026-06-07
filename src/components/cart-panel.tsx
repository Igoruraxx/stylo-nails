'use client'

import Link from 'next/link'
import { X, Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

/* ──────────────────────────────────────────
   Formatação monetária BRL
   ────────────────────────────────────────── */
function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/* ──────────────────────────────────────────
   Props
   ────────────────────────────────────────── */
interface CartPanelProps {
  /** Callback ao fechar */
  onClose?: () => void
}

/* ══════════════════════════════════════════
   CART PANEL — Content only (wrapped by CartModal)
   ══════════════════════════════════════════ */
export default function CartPanel({ onClose }: CartPanelProps) {
  const { itens, total, totalItens, remover, atualizarQtd, limpar } = useCart()

  const getPreco = (item: (typeof itens)[number]) => {
    const p = item.produto
    return p.promocao && p.preco_promocional ? p.preco_promocional : p.preco
  }

  return (
    <>
      {/* ── Cabeçalho ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#1A1612]/10 px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Carrinho
          {totalItens > 0 && (
            <span className="ml-1 text-sm font-normal opacity-60">
              ({totalItens})
            </span>
          )}
        </h2>

        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1612]/5 text-[#1A1612]/50 transition hover:bg-[#1A1612]/15 hover:text-[#1A1612]"
          aria-label="Fechar carrinho"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Lista de itens (scrollável) ── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {itens.length === 0 ? (
          <p className="mt-16 text-center text-sm opacity-50">
            Seu carrinho está vazio
          </p>
        ) : (
          <div className="space-y-3">
            {itens.map((item) => {
              const preco = getPreco(item)
              const isPromocao =
                item.produto.promocao && item.produto.preco_promocional

              return (
                <div
                  key={item.produto.id}
                  className="flex items-center gap-3 rounded-lg border border-[#1A1612]/8 bg-white/60 p-3"
                >
                  {/* ── Foto / Emoji ── */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#1A1612]/5 text-2xl">
                    💅
                  </div>

                  {/* ── Nome + Preço ── */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.produto.nome}
                    </p>
                    <p className="text-xs font-semibold text-[#B8860B]">
                      {isPromocao && (
                        <span className="mr-1 text-[10px] text-[#1A1612]/40 line-through">
                          {formatPrice(item.produto.preco)}
                        </span>
                      )}
                      {formatPrice(preco)}
                    </p>
                  </div>

                  {/* ── Qty +/- ── */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        atualizarQtd(item.produto.id, item.quantidade - 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#1A1612]/10 transition hover:bg-[#1A1612]/20"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() =>
                        atualizarQtd(item.produto.id, item.quantidade + 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#1A1612]/10 transition hover:bg-[#1A1612]/20"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* ── Remover × ── */}
                  <button
                    onClick={() => remover(item.produto.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-base text-[#1A1612]/40 transition hover:bg-red-100 hover:text-red-600"
                    aria-label="Remover item"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Footer (total + ações) ── */}
      {itens.length > 0 && (
        <div className="shrink-0 border-t border-[#1A1612]/10 px-6 py-5">
          <div className="space-y-3">
            {/* Total com gradiente gold */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1A1612]/70">
                Total
              </span>
              <span className="gold-gradient-text text-xl font-bold drop-shadow-sm">
                {formatPrice(total)}
              </span>
            </div>

            {/* Finalizar Pedido → /checkout */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#B8860B]/30 transition-all hover:brightness-110 hover:shadow-[#B8860B]/50 active:scale-[0.98]"
            >
              Finalizar Pedido
            </Link>

            {/* Limpar Carrinho */}
            <button
              onClick={limpar}
              className="flex w-full items-center justify-center rounded-lg border border-[#1A1612]/15 bg-white/50 px-4 py-2.5 text-xs font-medium text-[#1A1612]/60 transition hover:bg-red-50 hover:text-red-600"
            >
              Limpar Carrinho
            </button>
          </div>
        </div>
      )}
    </>
  )
}
