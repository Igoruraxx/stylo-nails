'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [clickCount, setClickCount] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const { totalItens, toggleCart } = useCart()

  /* ── Admin easter egg (5 taps on logo or hidden admin icon) ── */
  const tapAdmin = useCallback(() => {
    const next = clickCount + 1
    setClickCount(next)
    if (next >= 5) {
      setClickCount(0)
      router.push('/admin')
    }
  }, [clickCount, router])

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          TOP HEADER — fixed, compact on mobile (h-14),
          full height on desktop (h-16)
          ═══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 lg:h-16 bg-[#1A1612]/90 backdrop-blur-xl border-b border-[#C9A96E]/20">
        {/* Logo — mobile: 'SN' gold | desktop: 'Stylo Nails' Cormorant */}
        <Link
          href="/"
          onClick={(e) => {
            e.stopPropagation()
            tapAdmin()
          }}
          className="font-['Cormorant_Garamond',serif] text-xl lg:text-[1.5rem] leading-none text-[#C9A96E] hover:text-[#E8D5B0] transition-colors tracking-wide cursor-pointer select-none"
        >
          <span className="lg:hidden">SN</span>
          <span className="hidden lg:inline">Stylo Nails</span>
        </Link>

        {/* Desktop nav slot — reserved for future links */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* Links serão adicionados posteriormente */}
        </nav>

        {/* Cart icon with badge — always visible in top header */}
        <button
          type="button"
          onClick={toggleCart}
          className="relative flex items-center justify-center w-10 h-10 text-[#E8D5B0] hover:text-[#C9A96E] transition-colors"
          aria-label="Carrinho de compras"
        >
          <ShoppingBag size={22} />
          {totalItens > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-[#1A1612] bg-[#C9A96E] rounded-full leading-none">
              {totalItens > 99 ? '99+' : totalItens}
            </span>
          )}
        </button>
      </header>

      {/* ═══════════════════════════════════════════════════════
          BOTTOM NAV — mobile only (lg:hidden)
          Fixed bottom, 4 icons with gold active state
          ═══════════════════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#1A1612]/90 backdrop-blur-xl border-t border-[#C9A96E]/20 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around h-full px-2">
          {/* 🏠 Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide transition-colors ${
              isActive('/')
                ? 'text-[#C9A96E]'
                : 'text-[#E8D5B0]/60 hover:text-[#E8D5B0]'
            }`}
          >
            <span className="text-xl leading-none mb-0.5">🏠</span>
            <span>Home</span>
          </Link>

          {/* 📂 Catálogo — abre sidebar */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide text-[#E8D5B0]/60 hover:text-[#E8D5B0] transition-colors"
          >
            <span className="text-xl leading-none mb-0.5">📂</span>
            <span>Catálogo</span>
          </button>

          {/* 🛒 Carrinho — abre modal do carrinho */}
          <button
            type="button"
            onClick={toggleCart}
            className="relative flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide text-[#E8D5B0]/60 hover:text-[#E8D5B0] transition-colors"
          >
            <span className="text-xl leading-none mb-0.5">🛒</span>
            <span>Carrinho</span>
            {totalItens > 0 && (
              <span className="absolute top-0 right-2 flex items-center justify-center min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold text-[#1A1612] bg-[#C9A96E] rounded-full leading-none">
                {totalItens > 99 ? '99+' : totalItens}
              </span>
            )}
          </button>

          {/* ✨ Admin — hidden (opacity-0), 5 taps to reveal /admin */}
          <button
            type="button"
            onClick={tapAdmin}
            className="flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide text-[#E8D5B0]/60 opacity-0 pointer-events-auto transition-colors"
            aria-label="Admin"
          >
            <span className="text-xl leading-none mb-0.5">✨</span>
            <span>Admin</span>
          </button>
        </div>
      </nav>

      {/* Spacer compensating for fixed bottom nav on mobile */}
      <div className="lg:hidden h-16" />
    </>
  )
}
