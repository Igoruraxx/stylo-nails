'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import CartPanel from '@/components/cart-panel'
import type { Categoria } from '@/types'

interface StoreLayoutProps {
  categorias: Categoria[]
  children: React.ReactNode
}

export default function StoreLayout({ categorias, children }: StoreLayoutProps) {
  const pathname = usePathname()

  // Extract active category slug from /categoria/[slug]
  const categoriaAtiva = pathname.startsWith('/categoria/')
    ? pathname.split('/categoria/')[1] ?? null
    : null

  return (
    <>
      <style>{`
        .store-grid {
          display: grid;
          min-height: 100vh;
          /* Mobile: single column, everything stacked */
          grid-template-columns: 1fr;
          grid-template-rows: auto auto 1fr auto auto;
          grid-template-areas:
            'hd'
            'sb'
            'main'
            'rp'
            'ft';
        }

        @media (min-width: 1024px) {
          .store-grid {
            /* Desktop: 3-column layout as specified */
            grid-template-columns: 220px 1fr 272px;
            grid-template-rows: auto 1fr auto;
            grid-template-areas:
              'hd hd hd'
              'sb main rp'
              'ft ft ft';
          }
        }
      `}</style>

      <div className="store-grid">
        {/* ── Header spacer ──
             Header lives in the root layout and is position: fixed.
             This spacer accounts for its height so content isn't hidden. ── */}
        <div style={{ gridArea: 'hd' }} className="h-16" />

        {/* ── Sidebar ── */}
        <aside style={{ gridArea: 'sb' }} className="overflow-hidden">
          <Sidebar categorias={categorias} categoriaAtiva={categoriaAtiva} />
        </aside>

        {/* ── Main content (scrollável) ── */}
        <main
          style={{ gridArea: 'main' }}
          className="overflow-y-auto"
        >
          {children}
        </main>

        {/* ── Cart Panel ── */}
        <aside style={{ gridArea: 'rp' }} className="overflow-hidden">
          <CartPanel />
        </aside>

        {/* ── Footer spacer ── */}
        <div style={{ gridArea: 'ft' }} />
      </div>
    </>
  )
}
