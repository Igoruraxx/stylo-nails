'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import CartPanel from '@/components/cart-panel'

/**
 * CartModal — Modal centralizado com animação dinâmica de "subida".
 * Gerencia seu próprio ciclo de animação (entrada/ saída) e
 * desmonta o DOM ao finalizar o fechamento.
 */
export default function CartModal() {
  const { cartOpen, closeCart } = useCart()

  const [mounted, setMounted] = useState(false)
  const [exiting, setExiting] = useState(false)
  const prevOpen = useRef(false)

  /* ── Ciclo de montagem / animação ── */
  useEffect(() => {
    if (cartOpen && !prevOpen.current) {
      /* Abrindo: monta no DOM, dispara animação de entrada */
      setMounted(true)
      setExiting(false)
    } else if (!cartOpen && prevOpen.current) {
      /* Fechando: dispara animação de saída, depois desmonta */
      setExiting(true)
      const timer = setTimeout(() => {
        setMounted(false)
        setExiting(false)
      }, 250) /* mesma duração da transição de saída */
      return () => clearTimeout(timer)
    }
    prevOpen.current = cartOpen
  }, [cartOpen])

  const handleClose = useCallback(() => {
    closeCart()
  }, [closeCart])

  /* ── Clique no backdrop fecha ── */
  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }, [handleClose])

  if (!mounted) return null

  return (
    <div
      className={`cart-modal-root fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ${
        exiting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      style={{ fontFamily: 'var(--font-jost), ui-sans-serif, system-ui, sans-serif' }}
      role="dialog"
      aria-modal="true"
      aria-label="Carrinho de compras"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-md ${
          exiting ? 'cart-backdrop-exit' : 'animate-backdrop-fade'
        }`}
        onClick={handleBackdrop}
      />

      {/* Modal panel */}
      <div
        className={`relative flex max-h-[85vh] w-full max-w-[500px] flex-col overflow-hidden rounded-2xl border border-[#C9A96E]/20 bg-[#F8F1E9] text-[#1A1612] shadow-2xl shadow-black/50 ${
          exiting ? 'cart-modal-exit' : 'animate-cart-rise'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <CartPanel onClose={handleClose} />
      </div>
    </div>
  )
}
