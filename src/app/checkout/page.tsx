'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast, Toaster } from 'sonner'
import { useCart } from '@/lib/cart-context'
import type { CartItem } from '@/types'

/* ──────────────────────────────────────────
   Utilitários
   ────────────────────────────────────────── */

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function getPreco(item: CartItem): number {
  const p = item.produto
  return p.promocao && p.preco_promocional ? p.preco_promocional : p.preco
}

function sanitizeWhatsApp(value: string): string {
  return value.replace(/\D/g, '')
}

function buildWhatsAppMessage(params: {
  nome: string
  whatsapp: string
  itens: CartItem[]
  total: number
  formaPagamento: string
  observacao: string
}): string {
  const { nome, whatsapp, itens, total, formaPagamento, observacao } = params

  const linhasItens = itens
    .map((item, i) => {
      const preco = getPreco(item)
      const subtotal = preco * item.quantidade
      return `${i + 1}. ${item.produto.nome} (${item.quantidade}x) — ${formatPrice(subtotal)}`
    })
    .join('\n')

  const mensagem = [
    '🛍️ *Novo Pedido — Stylo Nails*',
    '',
    `👤 *Cliente:* ${nome || '(não informado)'}`,
    `📱 *WhatsApp:* ${whatsapp || '(não informado)'}`,
    '',
    '📋 *Itens:*',
    linhasItens,
    '',
    `💵 *Total:* ${formatPrice(total)}`,
    `💳 *Forma de Pagamento:* ${formaPagamento}`,
    observacao.trim() ? `📝 *Observação:* ${observacao.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return encodeURIComponent(mensagem)
}

/* ──────────────────────────────────────────
   Tipos de pagamento
   ────────────────────────────────────────── */

type FormaPagamento = 'PIX' | 'Cartão' | 'Dinheiro'

const FORMAS_PAGAMENTO: FormaPagamento[] = ['PIX', 'Cartão', 'Dinheiro']

/* ──────────────────────────────────────────
   Componente principal
   ────────────────────────────────────────── */

export default function CheckoutPage() {
  const router = useRouter()
  const { itens, total, limpar } = useCart()

  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [observacao, setObservacao] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)

  /* ── Redireciona se carrinho vazio ── */
  useEffect(() => {
    // Aguarda o carrinho ser hidratado do localStorage
    if (typeof window !== 'undefined') {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (!carregando && itens.length === 0) {
      router.replace('/')
    }
  }, [carregando, itens.length, router])

  /* ── Se ainda está carregando ou carrinho vazio, mostra nada ── */
  if (carregando || itens.length === 0) {
    return null
  }

  /* ── Manipulador do formulário ── */
  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!formaPagamento) {
      toast.error('Selecione uma forma de pagamento')
      return
    }

    setEnviando(true)

    const whatsappLimpo = sanitizeWhatsApp(whatsapp)
    const mensagem = buildWhatsAppMessage({
      nome: nome.trim(),
      whatsapp: whatsappLimpo,
      itens,
      total,
      formaPagamento,
      observacao: observacao.trim(),
    })

    const link = `https://wa.me/55${whatsappLimpo}?text=${mensagem}`

    // Mostra toast de confirmação
    toast.success('Pedido gerado com sucesso!', {
      description: 'Você será redirecionado para o WhatsApp.',
      duration: 4000,
    })

    // Abre o WhatsApp em nova aba após breve delay para o toast aparecer
    setTimeout(() => {
      window.open(link, '_blank')
      limpar()
      setEnviando(false)
    }, 1500)
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

      {/* Header simplificado */}
      <header className="border-b border-[#C9A96E]/10 px-6 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl font-semibold tracking-wide text-[#C9A96E]"
          >
            Stylo Nails
          </Link>
          <Link
            href="/"
            className="text-sm text-[#E8D5B0]/60 transition hover:text-[#C9A96E]"
          >
            ← Voltar à loja
          </Link>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="mb-10 font-serif text-3xl font-bold text-[#C9A96E]">
          Finalizar Pedido
        </h1>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* ── Coluna da esquerda: Formulário ── */}
          <form
            onSubmit={handleSubmit}
            className="space-y-8 lg:col-span-3"
          >
            {/* Dados do cliente */}
            <section className="rounded-xl border border-[#C9A96E]/15 bg-[#2E2820]/60 p-6 backdrop-blur-sm">
              <h2 className="mb-6 font-serif text-lg font-semibold text-[#C9A96E]">
                Dados do Cliente
              </h2>

              <div className="space-y-5">
                {/* Nome */}
                <div>
                  <label
                    htmlFor="nome"
                    className="mb-1.5 block text-sm font-medium text-[#E8D5B0]/80"
                  >
                    Nome do Cliente
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-3 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none transition focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40"
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label
                    htmlFor="whatsapp"
                    className="mb-1.5 block text-sm font-medium text-[#E8D5B0]/80"
                  >
                    WhatsApp <span className="text-xs opacity-50">(apenas números)</span>
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    inputMode="numeric"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(sanitizeWhatsApp(e.target.value))}
                    placeholder="11999999999"
                    maxLength={11}
                    className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-3 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none transition focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40"
                    required
                  />
                </div>

                {/* Observação */}
                <div>
                  <label
                    htmlFor="observacao"
                    className="mb-1.5 block text-sm font-medium text-[#E8D5B0]/80"
                  >
                    Observação <span className="text-xs opacity-50">(opcional)</span>
                  </label>
                  <textarea
                    id="observacao"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Algum detalhe sobre o pedido..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-3 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none transition focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40"
                  />
                </div>
              </div>
            </section>

            {/* Forma de pagamento */}
            <section className="rounded-xl border border-[#C9A96E]/15 bg-[#2E2820]/60 p-6 backdrop-blur-sm">
              <h2 className="mb-6 font-serif text-lg font-semibold text-[#C9A96E]">
                Forma de Pagamento
              </h2>

              <div className="flex flex-wrap gap-3">
                {FORMAS_PAGAMENTO.map((forma) => {
                  const isActive = formaPagamento === forma
                  return (
                    <button
                      key={forma}
                      type="button"
                      onClick={() => setFormaPagamento(forma)}
                      className={`rounded-lg border px-6 py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                        isActive
                          ? 'border-[#B8860B] bg-gradient-to-r from-[#B8860B] to-[#DAA520] text-white shadow-lg shadow-[#B8860B]/20'
                          : 'border-[#C9A96E]/20 bg-[#1A1612] text-[#E8D5B0]/70 hover:border-[#C9A96E]/40 hover:text-[#E8D5B0]'
                      }`}
                    >
                      {forma === 'PIX' && '💳 '}
                      {forma === 'Cartão' && '💳 '}
                      {forma === 'Dinheiro' && '💵 '}
                      {forma}
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Botão Finalizar */}
            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enviando ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Gerando pedido...
                </>
              ) : (
                <>
                  🛍️ Finalizar Pedido
                </>
              )}
            </button>
          </form>

          {/* ── Coluna da direita: Resumo do carrinho ── */}
          <aside className="lg:col-span-2">
            <div className="sticky top-6 rounded-xl border border-[#C9A96E]/15 bg-[#2E2820]/60 p-6 backdrop-blur-sm">
              <h2 className="mb-6 font-serif text-lg font-semibold text-[#C9A96E]">
                Resumo do Carrinho
              </h2>

              {/* Lista de itens */}
              <div className="space-y-4">
                {itens.map((item) => {
                  const preco = getPreco(item)
                  const subtotal = preco * item.quantidade
                  const isPromocao =
                    item.produto.promocao && item.produto.preco_promocional

                  return (
                    <div
                      key={item.produto.id}
                      className="flex items-start justify-between gap-3 border-b border-[#C9A96E]/10 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#F8F1E9]">
                          {item.produto.nome}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-[#E8D5B0]/60">
                          <span>Qtd: {item.quantidade}</span>
                          <span>×</span>
                          <span
                            className={
                              isPromocao
                                ? 'font-semibold text-[#B8860B]'
                                : 'text-[#E8D5B0]/60'
                            }
                          >
                            {isPromocao && (
                              <span className="mr-1 text-[10px] text-[#E8D5B0]/30 line-through">
                                {formatPrice(item.produto.preco)}
                              </span>
                            )}
                            {formatPrice(preco)}
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-[#F8F1E9]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Total */}
              <div className="mt-6 flex items-center justify-between border-t border-[#C9A96E]/15 pt-4">
                <span className="text-sm font-medium text-[#E8D5B0]/80">Total</span>
                <span className="text-2xl font-bold text-[#B8860B] drop-shadow-sm">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
