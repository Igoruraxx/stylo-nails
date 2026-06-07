'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import CartPanel from '@/components/cart-panel'

/**
 * CartModal — Slide-in panel da direita (estilo Stripe/Linear).
 * Gerencia animação de entrada/saída com spring CSS.
 */
export default function CartModal() {
  const { cartOpen, closeCart } = useCart()

  const [mounted, setMounted] = useState(false)
  const [animation, setAnimation] = useState<'enter' | 'exit' | ''>('')

  useEffect(() => {
    if (cartOpen && !mounted) {
      setMounted(true)
      // micro delay pra montar no DOM antes de animar
      requestAnimationFrame(() => setAnimation('enter'))
    } else if (!cartOpen && mounted) {
      setAnimation('exit')
      const timer = setTimeout(() => {
        setMounted(false)
        setAnimation('')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [cartOpen, mounted])

  const handleClose = useCallback(() => closeCart(), [closeCart])

  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose()
  }, [handleClose])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-[100] ${
        animation === 'exit' ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      style={{ fontFamily: 'var(--font-jost), ui-sans-serif, system-ui, sans-serif' }}
      role="dialog"
      aria-modal="true"
      aria-label="Carrinho de compras"
    >
      {/* Backdrop com blur */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${
          animation === 'enter' ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdrop}
      />

      {/* Painel deslizando da direita */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-[440px] shadow-2xl shadow-black/60 ${
          animation === 'enter' ? 'cart-enter' : 'cart-exit'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex h-full flex-col bg-gradient-to-b from-[#1A1612] to-[#151210] border-l border-[#C9A96E]/15">
          <CartPanel onClose={handleClose} />
        </div>
      </div>
    </div>
  )
}
