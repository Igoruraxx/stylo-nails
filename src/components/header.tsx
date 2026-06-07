'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Search, Shield } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import SearchModal from '@/components/search-modal'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [bagBounce, setBagBounce] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { totalItens, toggleCart } = useCart()

  /* ── Badge bounce animation when count changes ── */
  const prevTotal = useRef(totalItens)
  useEffect(() => {
    if (totalItens !== prevTotal.current && totalItens > 0) {
      setBagBounce(true)
      const t = setTimeout(() => setBagBounce(false), 400)
      prevTotal.current = totalItens
      return () => clearTimeout(t)
    }
    prevTotal.current = totalItens
  }, [totalItens])

  /* ── Ctrl+K / Cmd+K abre busca ── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* ═══ Search Modal ═══ */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ═══════════════════════════════════════════════════════
          TOP HEADER
          ═══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 lg:h-16 bg-[#1A1612]/90 backdrop-blur-xl border-b border-[#C9A96E]/20">
        {/* Logo */}
        <Link
          href="/"
          className="font-['Cormorant_Garamond',serif] text-xl lg:text-[1.5rem] leading-none text-[#C9A96E] hover:text-[#E8D5B0] transition-colors tracking-wide cursor-pointer select-none"
        >
          <span className="lg:hidden">SN</span>
          <span className="hidden lg:inline">Stylo Nails</span>
        </Link>

        {/* Desktop middle nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {/* Futuros links aqui */}
        </nav>

        {/* Actions — search + admin + cart */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 🔍 Busca */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/5 px-3 py-2 text-xs text-[#E8D5B0]/50 hover:text-[#C9A96E] hover:border-[#C9A96E]/20 transition-all"
            aria-label="Buscar produtos"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-md border border-white/5 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-mono text-[#E8D5B0]/30">
              ⌘K
            </kbd>
          </button>

          {/* 🔐 Admin (sempre visível no desktop) */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg border border-white/5 px-3 py-2 text-xs text-[#E8D5B0]/50 hover:text-[#C9A96E] hover:border-[#C9A96E]/20 transition-all"
          >
            <Shield size={14} />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* 🛒 Carrinho */}
          <button
            type="button"
            onClick={toggleCart}
            className="relative flex items-center justify-center w-10 h-10 text-[#E8D5B0] hover:text-[#C9A96E] transition-colors"
            aria-label="Carrinho de compras"
          >
            <ShoppingBag size={22} />
            {totalItens > 0 && (
              <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-[#1A1612] bg-[#C9A96E] rounded-full leading-none transition-all ${
                bagBounce ? 'animate-badge-bounce' : ''
              }`}>
                {totalItens > 99 ? '99+' : totalItens}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          BOTTOM NAV — mobile only
          ═══════════════════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#1A1612]/90 backdrop-blur-xl border-t border-[#C9A96E]/20 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around h-full px-2">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide transition-colors ${
              isActive('/') ? 'text-[#C9A96E]' : 'text-[#E8D5B0]/60 hover:text-[#E8D5B0]'
            }`}
          >
            <span className="text-xl leading-none mb-0.5">🏠</span>
            <span>Home</span>
          </Link>

          {/* Busca */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide text-[#E8D5B0]/60 hover:text-[#E8D5B0] transition-colors"
          >
            <span className="text-xl leading-none mb-0.5">🔍</span>
            <span>Buscar</span>
          </button>

          {/* Catálogo */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide text-[#E8D5B0]/60 hover:text-[#E8D5B0] transition-colors"
          >
            <span className="text-xl leading-none mb-0.5">📂</span>
            <span>Catálogo</span>
          </button>

          {/* Carrinho */}
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

          {/* Admin (visível no mobile) */}
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide text-[#E8D5B0]/60 hover:text-[#E8D5B0] transition-colors"
          >
            <span className="text-xl leading-none mb-0.5">⚙️</span>
            <span>Admin</span>
          </Link>
        </div>
      </nav>

      {/* Spacer */}
      <div className="lg:hidden h-16" />
    </>
  )
}
