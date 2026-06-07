'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, Search, Menu, X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { CategoriaIconView } from '@/components/categoria-icon'
import SearchModal from '@/components/search-modal'
import type { Categoria } from '@/types'

interface HeaderProps {
  categorias?: Categoria[]
  /** URL da logo (se vazio, mostra texto) */
  logoUrl?: string
}

export default function Header({ categorias = [], logoUrl = '/logo.png' }: HeaderProps) {
  const [clickCount, setClickCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { totalItens, toggleCart } = useCart()
  const catScrollRef = useRef<HTMLDivElement>(null)

  /* ── Admin easter egg ── */
  const tapAdmin = useCallback(() => {
    const next = clickCount + 1
    setClickCount(next)
    if (next >= 5) {
      setClickCount(0)
      router.push('/admin')
    }
  }, [clickCount, router])

  /* ── Scroll horizontal das categorias com as setas ── */
  const scrollCats = useCallback((dir: 'left' | 'right') => {
    const el = catScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }, [])

  const isActive = (path: string) => pathname === path
  const categoriaAtiva = pathname.startsWith('/categoria/')
    ? pathname.split('/categoria/')[1] ?? null
    : null

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          HEADER FIXO — duas linhas
          ═══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-[#1A1612]/95 backdrop-blur-xl border-b border-[#C9A96E]/15 shadow-lg shadow-black/20">
        {/* ── Linha 1: Logo | Busca | Carrinho ── */}
        <div className="flex items-center justify-between h-14 lg:h-16 px-4 lg:px-6">
          {/* Esquerda: Hamburguer (mobile) + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only (abre sidebar) */}
            <button
              type="button"
              onClick={() => setSidebarOpen(v => !v)}
              className="lg:hidden flex items-center justify-center w-9 h-9 text-[#E8D5B0] hover:text-[#C9A96E] transition-colors"
              aria-label="Menu de categorias"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <Link
              href="/"
              onClick={(e) => { e.stopPropagation(); tapAdmin() }}
              className="flex items-center gap-2 select-none group"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Stylo Nails"
                  className="h-8 lg:h-10 w-auto object-contain"
                />
              ) : (
                <>
                  <span className="text-xl lg:text-2xl leading-none group-hover:scale-110 transition-transform duration-300">
                    💅
                  </span>
                  <span className="font-['Cormorant_Garamond',serif] text-lg lg:text-xl font-semibold text-[#C9A96E] tracking-wide group-hover:text-[#E8D5B0] transition-colors">
                    <span className="lg:hidden">SN</span>
                    <span className="hidden lg:inline">Stylo Nails</span>
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Centro: Busca (desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 w-full rounded-full border border-[#C9A96E]/20 bg-[#2E2820]/80 px-4 py-2 text-sm text-[#E8D5B0]/40 transition-all hover:border-[#C9A96E]/40 hover:text-[#E8D5B0]/60"
            >
              <Search size={16} className="shrink-0" />
              <span>Buscar produtos...</span>
              <span className="ml-auto text-[10px] border border-[#C9A96E]/20 rounded px-1.5 py-0.5 text-[#E8D5B0]/30">⌘K</span>
            </button>
          </div>

          {/* Direita: Busca (mobile) + Carrinho */}
          <div className="flex items-center gap-1">
            {/* Busca — mobile */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 text-[#E8D5B0] hover:text-[#C9A96E] transition-colors"
              aria-label="Buscar produtos"
            >
              <Search size={20} />
            </button>

            {/* Carrinho */}
            <button
              type="button"
              onClick={toggleCart}
              className="relative flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 text-[#E8D5B0] hover:text-[#C9A96E] transition-colors"
              aria-label="Carrinho de compras"
            >
              <ShoppingBag size={20} />
              {totalItens > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-bold text-[#1A1612] bg-[#C9A96E] rounded-full leading-none animate-scale-in">
                  {totalItens > 99 ? '99+' : totalItens}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Linha 2: Categorias (scroll horizontal) ── */}
        {categorias.length > 0 && (
          <div className="relative border-t border-[#C9A96E]/10">
            {/* Seta esquerda */}
            <button
              onClick={() => scrollCats('left')}
              className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-2 bg-gradient-to-r from-[#1A1612] to-transparent text-[#E8D5B0]/50 hover:text-[#C9A96E] transition-colors lg:hidden"
              aria-label="Anterior"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Scroll container */}
            <div
              ref={catScrollRef}
              className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5 px-4 lg:px-6 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Link "Início" */}
              <Link
                href="/"
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] lg:text-xs font-medium transition-all ${
                  pathname === '/'
                    ? 'bg-[#C9A96E] text-[#1A1612]'
                    : 'text-[#E8D5B0]/70 hover:text-[#C9A96E] hover:bg-[#C9A96E]/10 border border-transparent hover:border-[#C9A96E]/20'
                }`}
              >
                Início
              </Link>

              {categorias.map((cat) => {
                const isAtiva = cat.slug === categoriaAtiva
                return (
                  <Link
                    key={cat.id}
                    href={`/categoria/${cat.slug}`}
                    className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] lg:text-xs font-medium transition-all whitespace-nowrap ${
                      isAtiva
                        ? 'bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30'
                        : 'text-[#E8D5B0]/70 hover:text-[#C9A96E] hover:bg-[#C9A96E]/10 border border-transparent hover:border-[#C9A96E]/20'
                    }`}
                  >
                    <CategoriaIconView slug={cat.slug} size={12} />
                    {cat.nome}
                  </Link>
                )
              })}
            </div>

            {/* Seta direita */}
            <button
              onClick={() => scrollCats('right')}
              className="absolute right-0 top-0 bottom-0 z-10 flex items-center px-2 bg-gradient-to-l from-[#1A1612] to-transparent text-[#E8D5B0]/50 hover:text-[#C9A96E] transition-colors lg:hidden"
              aria-label="Próximo"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════
          SIDEBAR DRAWER — mobile only (abre do ☰)
          ═══════════════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${
          sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Scrim */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Drawer */}
        <aside
          className={`absolute left-0 top-0 h-full w-72 bg-[#2E2820] shadow-2xl shadow-black/50 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Logo no drawer */}
          <div className="px-6 py-6 border-b border-white/10">
            <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
              <span className="text-2xl">💅</span>
              <span className="text-xl font-semibold text-[#C9A96E] tracking-wider uppercase">
                Stylo Nails
              </span>
            </Link>
          </div>

          {/* Categorias no drawer */}
          <nav className="flex-1 overflow-y-auto py-4 max-h-[calc(100vh-5rem)]">
            <ul className="space-y-1 px-2">
              {categorias.map((cat) => {
                const isAtiva = cat.slug === categoriaAtiva
                return (
                  <li key={cat.id}>
                    <Link
                      href={`/categoria/${cat.slug}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-r-lg text-sm transition-all duration-200 border-l-4 ${
                        isAtiva
                          ? 'border-l-[#C9A96E] bg-[#3A3228] text-[#C9A96E] font-medium'
                          : 'border-l-transparent text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 shrink-0">
                        <CategoriaIconView slug={cat.slug} size={16} />
                      </span>
                      <span>{cat.nome}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* ── Admin escondidinho no rodapé do drawer ── */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
            <button
              onClick={() => { setSidebarOpen(false); router.push('/admin') }}
              className="w-full text-center text-[10px] text-white/10 hover:text-[#C9A96E]/40 transition-colors tracking-widest uppercase"
              aria-label="Admin"
            >
              • • •
            </button>
          </div>
        </aside>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SEARCH MODAL
          ═══════════════════════════════════════════════════════ */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ═══════════════════════════════════════════════════════
          BOTTOM NAV — mobile only
          ═══════════════════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-14 bg-[#1A1612]/95 backdrop-blur-xl border-t border-[#C9A96E]/20 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-around h-full px-2">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide transition-colors ${
              isActive('/')
                ? 'text-[#C9A96E]'
                : 'text-[#E8D5B0]/60 hover:text-[#E8D5B0]'
            }`}
          >
            <span className="text-lg leading-none mb-0.5">🏠</span>
            <span>Início</span>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide text-[#E8D5B0]/60 hover:text-[#E8D5B0] transition-colors"
          >
            <span className="text-lg leading-none mb-0.5">📂</span>
            <span>Catálogo</span>
          </button>

          <button
            type="button"
            onClick={toggleCart}
            className="relative flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide text-[#E8D5B0]/60 hover:text-[#E8D5B0] transition-colors"
          >
            <span className="text-lg leading-none mb-0.5">🛒</span>
            <span>Carrinho</span>
            {totalItens > 0 && (
              <span className="absolute top-0 right-2 flex items-center justify-center min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold text-[#1A1612] bg-[#C9A96E] rounded-full leading-none">
                {totalItens > 99 ? '99+' : totalItens}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={tapAdmin}
            className="flex flex-col items-center justify-center w-14 h-full text-[10px] tracking-wide text-[#E8D5B0]/60 opacity-0 pointer-events-auto transition-colors"
            aria-label="Admin"
          >
            <span className="text-lg leading-none mb-0.5">✨</span>
            <span>Admin</span>
          </button>
        </div>
      </nav>

      {/* Spacers */}
      <div className="h-14 lg:h-16" />
      {categorias.length > 0 && <div className="h-[2.125rem]" />}
      <div className="lg:hidden h-14" />
    </>
  )
}
