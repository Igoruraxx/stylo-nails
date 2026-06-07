'use client'

import { useState, useEffect, FormEvent, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast, Toaster } from 'sonner'
import { useCart } from '@/lib/cart-context'
import type { CartItem } from '@/types'

/* ── Número da loja no WhatsApp (com DDI 55) ── */
const STORE_WHATSAPP = '5562994402492'

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

  /* ── Validação: libera com nome + endereço apenas ── */
  const podeEnviar = nome.trim().length > 0 && endereco.trim().length > 0

  /* ── Monta mensagem do WhatsApp ── */
  const buildWhatsAppMessage = useCallback(() => {
    const linhasItens = itens
      .map((item, i) => {
        const preco = getPreco(item)
        const subtotal = preco * item.quantidade
        return `${i + 1}. *${item.produto.nome}* — ${item.quantidade}x ${formatPrice(subtotal)}`
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
      formaPagamento ? `💳 *Pagamento:* ${formaPagamento}` : '',
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
      toast.error('Preencha seu nome e endereço de entrega')
      return
    }

    setEnviando(true)

    const mensagem = buildWhatsAppMessage()
    const link = `https://wa.me/${STORE_WHATSAPP}?text=${mensagem}`

    // Salvar pedido no banco e incrementar vendas
    ;(async () => {
      try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        
        await supabase.from('pedidos').insert({
          cliente_nome: nome.trim(),
          cliente_whatsapp: '',
          itens: itens.map(i => ({ produto_id: i.produto.id, nome: i.produto.nome, quantidade: i.quantidade, preco: getPreco(i) })),
          total,
          forma_pagamento: formaPagamento || 'Não informado',
          observacao: `${endereco.trim()}${observacao.trim() ? ' | ' + observacao.trim() : ''}`,
          status: 'pendente',
        })

        for (const item of itens) {
          // Pega valor atual e incrementa
          const { data: prod } = await supabase.from('produtos')
            .select('total_vendas')
            .eq('id', item.produto.id)
            .maybeSingle()
          const qtd = (prod?.total_vendas || 0) + item.quantidade
          await supabase.from('produtos')
            .update({ total_vendas: qtd })
            .eq('id', item.produto.id)
        }
      } catch (e) {
        console.warn('Erro ao salvar pedido:', e)
      }
    })()

    toast.success('Pedido gerado com sucesso!', {
      description: 'Abrindo WhatsApp para enviar seu pedido...',
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
            className="flex items-center gap-2"
          >
            <img src="/logo.png" alt="Stylo Nails" className="h-8 w-auto object-contain" />
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
                Dados para Entrega
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
              <h2 className="mb-6 font-serif text-lg font-semibold text-[#C9A96E]">
                Forma de Pagamento
                <span className="ml-1 text-xs font-normal text-white/40">(opcional)</span>
              </h2>

              <div className="flex flex-wrap gap-3">
                {FORMAS_PAGAMENTO.map((forma) => {
                  const isActive = formaPagamento === forma
                  return (
                    <button
                      key={forma}
                      type="button"
                      onClick={() => setFormaPagamento(forma === formaPagamento ? null : forma)}
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

              {/* ── TOTAL: preto com animação chamativa ── */}
              <div className="relative mt-6 overflow-hidden rounded-xl border border-[#C9A96E]/20 bg-gradient-to-br from-[#F8F1E9] to-[#E8D5B0] px-5 py-4 shadow-lg">
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

              {/* ── Botão Confirmar Pedido com WhatsApp ── */}
              <button
                type="submit"
                disabled={!podeEnviar || enviando}
                onClick={handleSubmit}
                className={`mt-5 flex w-full items-center justify-center gap-3 rounded-lg px-6 py-4 text-base font-semibold shadow-lg transition-all active:scale-[0.98] ${
                  !podeEnviar || enviando
                    ? 'cursor-not-allowed bg-[#2E2820] text-[#E8D5B0]/30 shadow-none'
                    : 'bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white hover:brightness-110 animate-btn-pulse'
                }`}
              >
                {enviando ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando pedido...
                  </>
                ) : (
                  <>
                    {/* Ícone do WhatsApp SVG */}
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>Confirmar Pedido</span>
                  </>
                )}
              </button>

              {/* ── Hint dos campos obrigatórios ── */}
              {!podeEnviar && (
                <p className="mt-3 text-center text-[11px] text-[#E8D5B0]/40">
                  {!nome.trim() && '✏️ Preencha seu nome '}
                  {!endereco.trim() && '📍 Informe o endereço'}
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
