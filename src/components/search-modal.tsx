'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import type { Produto } from '@/types'

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Produto[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { adicionar } = useCart()

  /* ── Esc + foco ── */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  /* ── Busca ── */
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('produtos')
        .select('*')
        .ilike('nome', `%${query.trim()}%`)
        .eq('ativo', true)
        .limit(20)
      setResults(data ?? [])
      setLoading(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  const handleClickOutside = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20 sm:pt-28"
      onClick={handleClickOutside}
    >
      <div className="w-full max-w-xl mx-4 animate-slide-up">
        {/* Input */}
        <div className="relative mb-2">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A96E]/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full rounded-2xl border border-[#C9A96E]/20 bg-[#2E2820] py-4 pl-12 pr-12 text-base text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none shadow-2xl shadow-black/50 transition-all focus:border-[#C9A96E]/40 focus:ring-2 focus:ring-[#C9A96E]/20"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#E8D5B0]/40 hover:text-[#C9A96E] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-[#C9A96E]/10 bg-[#1A1612]/95 backdrop-blur-xl shadow-2xl">
          {query.trim() && loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#C9A96E] border-t-transparent" />
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-[#E8D5B0]/40">Nenhum produto encontrado para "{query}"</p>
            </div>
          )}

          {!query.trim() && (
            <div className="py-8 text-center">
              <Search size={32} className="mx-auto mb-3 text-[#C9A96E]/20" />
              <p className="text-xs text-[#E8D5B0]/30">Digite o nome de um produto para buscar</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y divide-white/5">
              {results.map(prod => {
                const preco = prod.promocao && prod.preco_promocional ? prod.preco_promocional : prod.preco
                return (
                  <div key={prod.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.03]">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#2E2820]">
                      {prod.imagem_url ? (
                        <img src={prod.imagem_url} alt={prod.nome} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg opacity-30">💅</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#F8F1E9]">{prod.nome}</p>
                      <p className="text-xs text-[#C9A96E]">{formatPrice(preco)}</p>
                    </div>
                    <button
                      onClick={() => { adicionar(prod); onClose() }}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#C9A96E] px-3 py-2 text-[11px] font-semibold text-[#1A1612] transition-all hover:bg-[#DAA520] active:scale-[0.95]"
                    >
                      <ShoppingBag size={13} />
                      Add
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
