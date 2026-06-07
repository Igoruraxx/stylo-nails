'use client'

import Link from 'next/link'
import { CategoriaIconView } from '@/components/categoria-icon'
import type { Categoria } from '@/types'

interface SidebarProps {
  categorias: Categoria[]
  categoriaAtiva: string | null
}

export default function Sidebar({ categorias, categoriaAtiva }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[#2E2820] flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-gold.png" alt="Stylo Nails" className="h-10 w-10 object-contain" />
          <span className="text-xl font-semibold text-[#C9A96E] tracking-wider uppercase">
            Stylo Nails
          </span>
        </Link>
      </div>

      {/* Lista de categorias com ícones dourados */}
      <nav className="flex-1 overflow-y-auto scrollbar-sidebar py-4">
        <ul className="space-y-1 px-2">
          {categorias.map((cat) => {
            const isAtiva = cat.slug === categoriaAtiva
            return (
              <li key={cat.id}>
                <Link
                  href={`/categoria/${cat.slug}`}
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

      <style>{`
        .scrollbar-sidebar::-webkit-scrollbar { width: 4px; }
        .scrollbar-sidebar::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .scrollbar-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </aside>
  )
}
