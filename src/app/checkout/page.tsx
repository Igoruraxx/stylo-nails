'use client'

import { useState, useEffect, FormEvent, useCallback } from 'react'
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
  const [endereco, setEndereco] = useState('')
  const [observacao, setObservacao] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)

  /* ── Redireciona se carrinho vazio ── */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (!carregando && itens.length === 0) {
      router.replace('/')
    }
  }, [carregando, itens.length, router])

  /* ── Validação: todos os campos obrigatórios preenchidos ── */
  const podeEnviar =
    nome.trim().length > 0 &&
    endereco.trim().length > 0 &&
    formaPagamento !== null

  /* ── Monta mensagem do WhatsApp ── */
  const buildWhatsAppMessage = useCallback(() => {
    if (!formaPagamento) return ''

    const linhasItens = itens
      .map((item, i) => {
        const preco = getPreco(item)
        const subtotal = preco * item.quantidade
        const nomeProduto = item.produto.nome
        return `${i + 1}. *${nomeProduto}* — ${item.quantidade}x ${formatPrice(subtotal)}`
      })
      .join('\n')

    const mensagem = [
      '🛍️ *NOVO PEDIDO — Stylo Nails*',
      '',
      '━━━━━━━━━━━━━━━━━━',
      '',
      '👤 *Cliente:*',
      nome.trim() || '(não informado)',
      '',
      '📍 *Endereço de Entrega:*',
      endereco.trim() || '(não informado)',
      '',
      '📋 *Itens do Pedido:*',
      linhasItens,
      '',
      '━━━━━━━━━━━━━━━━━━',
      '',
      `💵 *Total:* ${formatPrice(total)}`,
      `💳 *Pagamento:* ${formaPagamento}`,
      observacao.trim() ? `📝 *Observação:* ${observacao.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    return encodeURIComponent(mensagem)
  }, [itens, total, nome, endereco, formaPagamento, observacao])

  /* ── Se ainda está carregando ou carrinho vazio, mostra nada ── */
  if (carregando || itens.length === 0) {
    return null
  }

  /* ── Manipulador do formulário ── */
  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!podeEnviar) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setEnviando(true)

    const whatsappLimpo = sanitizeWhatsApp(whatsapp || nome)
    const mensagem = buildWhatsAppMessage()
    const link = `https://wa.me/55${whatsappLimpo}?text=${mensagem}`

    toast.success('Pedido gerado com sucesso!', {
      description: 'Você será redirecionado para o WhatsApp.',
      duration: 4000,
    })

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

      {/* ── Header ── */}
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

      {/* ── Conteúdo ── */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="mb-10 font-serif text-3xl font-bold text-[#C9A96E]">
          Finalizar Pedido
        </h1>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* ═══════════════════════════════════════════════
              COLUNA ESQUERDA — Formulário
              ═══════════════════════════════════════════════ */}
          <form
            onSubmit={handleSubmit}
            className="space-y-8 lg:col-span-3"
          >
            {/* ── Dados do Cliente ── */}
            <section className="rounded-xl border border-[#C9A96E]/15 bg-[#2E2820]/60 p-6 backdrop-blur-sm">
              <h2 className="mb-6 font-serif text-lg font-semibold text-[#C9A96E]">
                Dados do Cliente
              </h2>

              <div className="space-y-5">
                {/* Nome (obrigatório) */}
                <div>
                  <label
                    htmlFor="nome"
                    className="mb-1.5 flex items-center gap-1 text-sm font-medium text-[#E8D5B0]/80"
                  >
                    Nome do Cliente
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-3 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none transition focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40"
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label
                    htmlFor="whatsapp"
                    className="mb-1.5 flex items-center gap-1 text-sm font-medium text-[#E8D5B0]/80"
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
                  />
                </div>

                {/* Endereço de Entrega (obrigatório) */}
                <div>
                  <label
                    htmlFor="endereco"
                    className="mb-1.5 flex items-center gap-1 text-sm font-medium text-[#E8D5B0]/80"
                  >
                    Endereço de Entrega
                    <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, número, bairro, cidade, CEP"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-3 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none transition focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40"
                    required
                  />
                </div>

                {/* Observação */}
                <div>
                  <label
                    htmlFor="observacao"
                    className="mb-1.5 flex items-center gap-1 text-sm font-medium text-[#E8D5B0]/80"
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

            {/* ── Forma de Pagamento ── */}
            <section className="rounded-xl border border-[#C9A96E]/15 bg-[#2E2820]/60 p-6 backdrop-blur-sm">
              <h2 className="mb-6 flex items-center gap-1 font-serif text-lg font-semibold text-[#C9A96E]">
                Forma de Pagamento
                <span className="text-red-400 text-base">*</span>
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
          </form>

          {/* ═══════════════════════════════════════════════
              COLUNA DIREITA — Resumo do carrinho
              ═══════════════════════════════════════════════ */}
          <aside className="lg:col-span-2">
            <div className="sticky top-6 rounded-xl border border-[#C9A96E]/15 bg-[#2E2820]/60 p-6 backdrop-blur-sm">
              <h2 className="mb-6 font-serif text-lg font-semibold text-[#C9A96E]">
                Resumo do Carrinho
              </h2>

              {/* ── Lista de itens ── */}
              <div className="space-y-4">
                {itens.map((item, idx) => {
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

              {/* ── TOTAL: preto com animação chamativa ── */}
              <div className="relative mt-6 overflow-hidden rounded-xl border border-[#C9A96E]/20 bg-gradient-to-br from-[#F8F1E9] to-[#E8D5B0] px-5 py-4 shadow-lg">
                {/* Brilho animado que percorre o fundo */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-gold-shimmer" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1A1612]/70">
                    Total
                  </span>
                  <span className="animate-price-pop text-2xl font-black tracking-tight text-[#1A1612]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* ── Botão Finalizar Pedido ── */}
              <button
                type="submit"
                disabled={!podeEnviar || enviando}
                onClick={handleSubmit}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-semibold shadow-lg transition-all active:scale-[0.98] ${
                  !podeEnviar || enviando
                    ? 'cursor-not-allowed bg-[#2E2820] text-[#E8D5B0]/30 shadow-none'
                    : 'bg-gradient-to-r from-[#B8860B] to-[#DAA520] text-white hover:brightness-110 animate-btn-pulse'
                }`}
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

              {/* ── Hint dos campos obrigatórios ── */}
              {!podeEnviar && (
                <p className="mt-3 text-center text-[11px] text-[#E8D5B0]/40">
                  {!nome.trim() && '✏️ Preencha seu nome • '}
                  {!endereco.trim() && '📍 Informe o endereço • '}
                  {!formaPagamento && '💳 Selecione o pagamento'}
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
