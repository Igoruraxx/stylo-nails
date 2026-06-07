'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [clickCount, setClickCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { totalItens } = useCart()

  const handleLogoClick = useCallback(() => {
    const next = clickCount + 1
    setClickCount(next)
    if (next >= 5) {
      setClickCount(0)
      router.push('/admin')
    }
  }, [clickCount, router])

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev
      onToggleSidebar?.()
      return next
    })
  }, [onToggleSidebar])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#1A1612]/80 backdrop-blur-xl border-b border-[#C9A96E]/20">
      {/* Mobile hamburger */}
      <button
        onClick={handleToggleSidebar}
        className="lg:hidden flex items-center justify-center w-10 h-10 text-[#E8D5B0] hover:text-[#C9A96E] transition-colors"
        aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Spacer to keep logo centered on mobile */}
      <div className="lg:hidden w-10" />

      {/* Logo — admin easter egg: 5 clicks */}
      <button
        onClick={handleLogoClick}
        className="font-['Cormorant_Garamond',serif] text-[1.5rem] leading-none text-[#C9A96E] hover:text-[#E8D5B0] transition-colors tracking-wide cursor-pointer bg-transparent border-none"
      >
        Stylo Nails
      </button>

      {/* Desktop navigation slot */}
      <nav className="hidden lg:flex items-center gap-8">
        {/* Links serão adicionados posteriormente */}
      </nav>

      {/* Cart button with badge */}
      <Link
        href="/cart"
        className="relative flex items-center justify-center w-10 h-10 text-[#E8D5B0] hover:text-[#C9A96E] transition-colors"
        aria-label="Carrinho de compras"
      >
        <ShoppingBag size={22} />
        {totalItens > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-[#1A1612] bg-[#C9A96E] rounded-full">
            {totalItens > 99 ? '99+' : totalItens}
          </span>
        )}
      </Link>
    </header>
  )
}
