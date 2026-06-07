'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function CartPanel() {
  const { itens, total, totalItens, remover, atualizarQtd, limpar } = useCart()

  const getPreco = (item: (typeof itens)[number]) => {
    const p = item.produto
    return p.promocao && p.preco_promocional ? p.preco_promocional : p.preco
  }

  return (
    <aside className="fixed right-0 top-0 z-50 flex h-full w-96 flex-col bg-[#F8F1E9]/95 text-[#1A1612] shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A1612]/10 px-6 py-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Carrinho
          {totalItens > 0 && (
            <span className="ml-1 text-sm font-normal opacity-60">
              ({totalItens})
            </span>
          )}
        </h2>
      </div>

      {/* Scrollable items list */}
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
                  {/* Emoji como foto */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#1A1612]/5 text-2xl">
                    💅
                  </div>

                  {/* Nome + Preço */}
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

                  {/* Controles de quantidade */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        atualizarQtd(item.produto.id, item.quantidade - 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#1A1612]/10 text-sm transition hover:bg-[#1A1612]/20"
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() =>
                        atualizarQtd(item.produto.id, item.quantidade + 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded bg-[#1A1612]/10 text-sm transition hover:bg-[#1A1612]/20"
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>

                  {/* Botão remover */}
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

      {/* Footer — apenas quando há itens */}
      {itens.length > 0 && (
        <div className="border-t border-[#1A1612]/10 px-6 py-5">
          <div className="space-y-3">
            {/* Total com destaque gold */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1A1612]/70">
                Total
              </span>
              <span className="text-xl font-bold text-[#B8860B] drop-shadow-sm">
                {formatPrice(total)}
              </span>
            </div>

            {/* Finalizar Pedido → /checkout */}
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
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
    </aside>
  )
}
