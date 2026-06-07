import Link from 'next/link'
import type { Categoria } from '@/types'

interface SidebarProps {
  categorias: Categoria[]
  categoriaAtiva: string | null
}

const categoriaEmojis: Record<string, string> = {
  unhas: '💅',
  esmaltacao: '💅',
  gel: '✨',
  acrilico: '💎',
  'fibra-de-vidro': '🧊',
  decoracao: '🎨',
  manicure: '💅',
  pedicure: '🦶',
  alongamento: '📏',
  tratamento: '💆',
  maquiagem: '💄',
  sobrancelha: '👁️',
  cilios: '👁️',
  default: '💅',
}

export default function Sidebar({ categorias, categoriaAtiva }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[#2E2820] flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">💅</span>
          <span className="text-xl font-semibold text-[#C9A96E] tracking-wider uppercase">
            Stylo Nails
          </span>
        </Link>
      </div>

      {/* Lista de categorias */}
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
                  <span className="text-lg leading-none">
                    {categoriaEmojis[cat.slug] ?? categoriaEmojis.default}
                  </span>
                  <span>{cat.nome}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Scrollbar fina customizada */}
      <style>{`
        .scrollbar-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .scrollbar-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </aside>
  )
}
