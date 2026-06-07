'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import type { Categoria } from '@/types'

interface StoreLayoutProps {
  categorias: Categoria[]
  children: React.ReactNode
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function StoreLayout({
  categorias,
  children,
  sidebarOpen,
  onToggleSidebar,
}: StoreLayoutProps) {
  const pathname = usePathname()

  // Extract active category slug from /categoria/[slug]
  const categoriaAtiva = pathname.startsWith('/categoria/')
    ? pathname.split('/categoria/')[1] ?? null
    : null

  return (
    <>
      <style>{`
        /* ── Mobile-first: stacked single-column ── */
        .store-grid {
          display: grid;
          min-height: 100vh;
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr auto;
          grid-template-areas:
            'hd'
            'main'
            'ft';
        }

        /* ── Desktop: 2‑column with sb / main ── */
        @media (min-width: 1024px) {
          .store-grid {
            grid-template-columns: 220px 1fr;
            grid-template-rows: auto 1fr auto;
            grid-template-areas:
              'hd  hd'
              'sb  main'
              'ft  ft';
          }
        }
      `}</style>

      <div className="store-grid">
        {/* ── Header spacer ──
             Header lives in the root layout and is position: fixed.
             This spacer accounts for its height so content isn't hidden. ── */}
        <div style={{ gridArea: 'hd' }} className="h-16" />

        {/* ── Mobile sidebar drawer (slide-in) ── */}
        <div
          className={`
            fixed inset-0 z-[60]
            ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}
            lg:hidden
          `}
          onClick={onToggleSidebar}
        >
          {/* Scrim overlay */}
          <div
            className={`
              absolute inset-0 bg-black/60 transition-opacity duration-300
              ${sidebarOpen ? 'opacity-100' : 'opacity-0'}
            `}
          />

          {/* Drawer panel */}
          <aside
            className={`
              absolute left-0 top-0 h-full w-72
              bg-[#0d0d0d] shadow-2xl
              transition-transform duration-300 ease-in-out
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar categorias={categorias} categoriaAtiva={categoriaAtiva} />
          </aside>
        </div>

        {/* ── Desktop sidebar ── */}
        <aside
          style={{ gridArea: 'sb' }}
          className="hidden overflow-hidden lg:block"
        >
          <Sidebar categorias={categorias} categoriaAtiva={categoriaAtiva} />
        </aside>

        {/* ── Main content (scrollável) ── */}
        <main
          style={{ gridArea: 'main' }}
          className="overflow-y-auto"
        >
          {children}
        </main>

        {/* ── Footer spacer ── */}
        <div style={{ gridArea: 'ft' }} />
      </div>
    </>
  )
}
