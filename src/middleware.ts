import { NextRequest, NextResponse } from 'next/server'

/* ── Rate limit simples (em memória) ──
   Em produção, usar Redis ou Vercel KV. Para este projeto,
   um Map em memória é suficiente pois o middleware roda
   em single-instance no serverless. */
const rateMap = new Map<string, { count: number; resetAt: number }>()
const MAX_REQ = 10
const WINDOW_MS = 60_000 // 1 minuto

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Só limitar rota /api/admin
  if (!pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Identifica o IP (Vercel ou fallback)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1'

  const now = Date.now()
  const entry = rateMap.get(ip)

  if (!entry || now > entry.resetAt) {
    // Nova janela
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  entry.count++

  if (entry.count > MAX_REQ) {
    return NextResponse.json(
      { error: 'Muitas requisições. Aguarde 1 minuto.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
          'X-RateLimit-Limit': String(MAX_REQ),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
