'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronUp, ChevronDown, Pencil, LogOut, Eye, ArrowLeft, ShoppingBag, Tag, Save, X, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Categoria, Produto } from '@/types'

const supabase = createClient()
const PASS = 'admin123'

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/* ─── Login Screen ─── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (senha === PASS) {
      onLogin()
    } else {
      setErro(true)
      setSenha('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1612] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[#C9A96E]/20 bg-[#2E2820] p-8 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A96E] to-[#B8860B] text-2xl">🔒</div>
          <h1 className="font-serif text-2xl font-bold text-[#C9A96E]">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-[#E8D5B0]/60">Stylo Nails — Área Restrita</p>
        </div>
        <div className="mb-6">
          <label htmlFor="admin-password" className="mb-2 block text-sm font-medium text-[#E8D5B0]/80">Senha de acesso</label>
          <input
            id="admin-password"
            type="password"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErro(false) }}
            placeholder="Digite a senha"
            autoFocus
            className={`w-full rounded-lg border bg-[#1A1612] px-4 py-3 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none transition-colors focus:ring-2 focus:ring-[#C9A96E]/50 ${erro ? 'border-red-500' : 'border-[#C9A96E]/20'}`}
          />
          {erro && <p className="mt-2 text-xs text-red-400">Senha incorreta. Tente novamente.</p>}
        </div>
        <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]">Entrar</button>
      </form>
    </div>
  )
}

/* ─── Preview Card ─── */
function PreviewCard({ produto }: { produto: Produto }) {
  const precoAtual = produto.promocao && produto.preco_promocional ? produto.preco_promocional : produto.preco

  return (
    <div className="group flex w-56 flex-shrink-0 flex-col overflow-hidden rounded-xl bg-[#2E2820] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30">
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-[#1A1612]">
        {produto.promocao && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">🔥 OFERTA</span>
        )}
        {produto.imagem_url ? (
          <img src={produto.imagem_url} alt={produto.nome} className="h-full w-full object-cover" />
        ) : (
          <span className="select-none text-4xl opacity-30">💅</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="truncate text-sm font-medium text-[#F8F1E9]">{produto.nome}</h3>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-bold text-[#C9A96E]">{formatPrice(precoAtual)}</span>
          {produto.promocao && produto.preco_promocional != null && (
            <span className="text-xs text-white/40 line-through">{formatPrice(produto.preco)}</span>
          )}
        </div>
        <button className="mt-1 w-full rounded-lg bg-[#C9A96E] px-3 py-2 text-xs font-semibold text-[#1A1612] transition-all hover:bg-[#DAA520] active:scale-[0.97]">Adicionar</button>
      </div>
    </div>
  )
}

/* ─── Admin Panel ─── */
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [secao, setSecao] = useState<'categorias' | 'produtos' | 'preview'>('produtos')

  // Edit state - categoria
  const [editCatId, setEditCatId] = useState<number | null>(null)
  const [editCatNome, setEditCatNome] = useState('')

  // Edit state - produto
  const [editProdId, setEditProdId] = useState<number | null>(null)
  const [editProd, setEditProd] = useState<Partial<Produto>>({})

  // Feedback
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  // Filter state
  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null)

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 2000)
  }

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categorias').select('*').order('ordem'),
      supabase.from('produtos').select('*').order('ordem'),
    ])
    if (catRes.data) setCategorias(catRes.data)
    if (prodRes.data) setProdutos(prodRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const saveToServer = async (table: string, id: number, data: any) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id, data, password: PASS }),
      })
      if (!res.ok) throw new Error(await res.text())
      showFeedback('✅ Salvo!')
    } catch (e: any) {
      showFeedback('❌ Erro ao salvar: ' + e.message)
    }
    setSaving(false)
  }

  /* ── Categoria handlers ── */
  const startEditCat = (cat: Categoria) => {
    setEditCatId(cat.id)
    setEditCatNome(cat.nome)
  }

  const saveCat = async () => {
    if (editCatId === null) return
    setCategorias(prev => prev.map(c => c.id === editCatId ? { ...c, nome: editCatNome } : c))
    await saveToServer('categorias', editCatId, { nome: editCatNome })
    setEditCatId(null)
  }

  const moveCat = async (id: number, dir: 'up' | 'down') => {
    setCategorias(prev => {
      const idx = prev.findIndex(c => c.id === id)
      if (idx === -1) return prev
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const arr = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
      const reordered = arr.map((c, i) => ({ ...c, ordem: i + 1 }))
      // Save reorder
      fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'categorias', action: 'reorder', data: reordered.map(c => ({ id: c.id, ordem: c.ordem })), password: PASS }),
      })
      return reordered
    })
  }

  /* ── Produto handlers ── */
  const startEditProd = (prod: Produto) => {
    setEditProdId(prod.id)
    setEditProd({ nome: prod.nome, preco: prod.preco, promocao: prod.promocao, preco_promocional: prod.preco_promocional, destaque: prod.destaque })
  }

  const saveProd = async () => {
    if (editProdId === null) return
    setProdutos(prev => prev.map(p => p.id === editProdId ? { ...p, ...editProd } : p))
    await saveToServer('produtos', editProdId, {
      nome: editProd.nome,
      preco: editProd.preco,
      promocao: editProd.promocao,
      preco_promocional: editProd.promocao ? editProd.preco_promocional : null,
      destaque: editProd.destaque,
    })
    setEditProdId(null)
  }

  const togglePromocao = (id: number) => {
    setProdutos(prev => prev.map(p => {
      if (p.id !== id) return p
      const nova = !p.promocao
      return { ...p, promocao: nova, preco_promocional: nova ? Number((p.preco * 0.8).toFixed(2)) : null }
    }))
  }

  // Filtered products
  const produtosFiltrados = filtroCategoria
    ? produtos.filter(p => p.categoria_id === filtroCategoria)
    : produtos

  // Produtos agrupados por categoria (para exibição)
  const produtosPorCategoria = filtroCategoria 
    ? [{ categoria: categorias.find(c => c.id === filtroCategoria), produtos: produtosFiltrados }]
    : categorias.map(cat => ({ categoria: cat, produtos: produtos.filter(p => p.categoria_id === cat.id) }))

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1A1612]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#C9A96E] border-t-transparent" />
          <p className="text-sm text-[#E8D5B0]/60">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1612] text-[#F8F1E9]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#C9A96E]/15 bg-[#1A1612]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛠️</span>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#C9A96E]">Admin</h1>
              <p className="text-[10px] text-[#E8D5B0]/40 leading-tight">Stylo Nails</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {feedback && <span className="text-xs text-green-400">{feedback}</span>}
            {saving && <span className="text-xs text-[#C9A96E]">Salvando...</span>}
            <a href="/" className="flex items-center gap-1.5 rounded-lg border border-[#C9A96E]/20 px-3 py-2 text-xs font-medium text-[#E8D5B0]/70 transition-all hover:border-[#C9A96E]/40 hover:text-[#C9A96E]">
              <ArrowLeft size={14} /> Voltar ao Site
            </a>
            <button onClick={onLogout} className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20">
              <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Nav */}
        <nav className="mb-6 flex gap-1 rounded-xl bg-[#2E2820] p-1">
          {[
            { key: 'categorias' as const, label: 'Categorias', icon: Tag },
            { key: 'produtos' as const, label: `Produtos (${produtos.length})`, icon: ShoppingBag },
            { key: 'preview' as const, label: 'Prévia do Site', icon: Eye },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSecao(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                secao === key ? 'bg-[#C9A96E] text-[#1A1612] shadow-lg' : 'text-[#E8D5B0]/60 hover:text-[#C9A96E]'
              }`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>

        {/* ═══ CATEGORIAS ═══ */}
        {secao === 'categorias' && (
          <section>
            <h2 className="mb-4 font-serif text-xl font-semibold text-[#C9A96E]">📂 Categorias</h2>
            <div className="space-y-2">
              {categorias.map((cat, idx) => (
                <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-[#C9A96E]/10 bg-[#2E2820] px-4 py-3 transition-all hover:border-[#C9A96E]/20">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1A1612] text-xs font-bold text-[#C9A96E]/60">{idx + 1}</span>

                  {editCatId === cat.id ? (
                    <input type="text" value={editCatNome} onChange={e => setEditCatNome(e.target.value)}
                      className="flex-1 rounded-md border border-[#C9A96E]/30 bg-[#1A1612] px-3 py-1.5 text-sm text-[#F8F1E9] outline-none focus:ring-2 focus:ring-[#C9A96E]/50" autoFocus />
                  ) : (
                    <span className="flex-1 text-sm font-medium">{cat.nome}</span>
                  )}

                  <span className="text-xs text-[#E8D5B0]/40">{produtos.filter(p => p.categoria_id === cat.id).length} itens</span>

                  <div className="flex items-center gap-1">
                    <button onClick={() => moveCat(cat.id, 'up')} disabled={idx === 0}
                      className="rounded-md p-1.5 text-[#E8D5B0]/40 transition-all hover:bg-[#1A1612] hover:text-[#C9A96E] disabled:opacity-20 disabled:cursor-not-allowed">
                      <ChevronUp size={16} />
                    </button>
                    <button onClick={() => moveCat(cat.id, 'down')} disabled={idx === categorias.length - 1}
                      className="rounded-md p-1.5 text-[#E8D5B0]/40 transition-all hover:bg-[#1A1612] hover:text-[#C9A96E] disabled:opacity-20 disabled:cursor-not-allowed">
                      <ChevronDown size={16} />
                    </button>

                    {editCatId === cat.id ? (
                      <>
                        <button onClick={saveCat} className="rounded-md bg-green-500/10 p-1.5 text-green-400 transition-all hover:bg-green-500/20"><Save size={16} /></button>
                        <button onClick={() => setEditCatId(null)} className="rounded-md p-1.5 text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400"><X size={16} /></button>
                      </>
                    ) : (
                      <button onClick={() => startEditCat(cat)} className="rounded-md p-1.5 text-[#E8D5B0]/40 transition-all hover:bg-[#1A1612] hover:text-[#C9A96E]"><Pencil size={16} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ PRODUTOS ═══ */}
        {secao === 'produtos' && (
          <section>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-xl font-semibold text-[#C9A96E]">📦 Produtos</h2>
              
              {/* Filter by category */}
              <select
                value={filtroCategoria ?? ''}
                onChange={e => setFiltroCategoria(e.target.value ? Number(e.target.value) : null)}
                className="ml-auto rounded-lg border border-[#C9A96E]/20 bg-[#2E2820] px-3 py-1.5 text-xs text-[#E8D5B0] outline-none focus:ring-2 focus:ring-[#C9A96E]/50"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome} ({produtos.filter(p => p.categoria_id === cat.id).length})</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {produtosPorCategoria.map(({ categoria, produtos: prods }) => {
                if (!categoria || prods.length === 0) return null
                return (
                  <div key={categoria.id}>
                    <h3 className="mb-2 text-sm font-semibold text-[#C9A96E]/80">{categoria.nome}</h3>
                    <div className="space-y-1.5">
                      {prods.map(prod => {
                        const editing = editProdId === prod.id
                        return (
                          <div key={prod.id} className="rounded-xl border border-[#C9A96E]/10 bg-[#2E2820] px-4 py-2.5 transition-all hover:border-[#C9A96E]/20">
                            {editing ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <span className="shrink-0 text-xs text-[#E8D5B0]/40">#{prod.id}</span>
                                  <input type="text" value={editProd.nome ?? ''}
                                    onChange={e => setEditProd(p => ({ ...p, nome: e.target.value }))}
                                    className="flex-1 rounded-md border border-[#C9A96E]/30 bg-[#1A1612] px-3 py-1.5 text-sm text-[#F8F1E9] outline-none focus:ring-2 focus:ring-[#C9A96E]/50"
                                    placeholder="Nome do produto" />
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-[#E8D5B0]/50">Preço:</label>
                                    <input type="number" step="0.01" value={editProd.preco ?? 0}
                                      onChange={e => setEditProd(p => ({ ...p, preco: parseFloat(e.target.value) || 0 }))}
                                      className="w-24 rounded-md border border-[#C9A96E]/30 bg-[#1A1612] px-3 py-1.5 text-sm text-[#F8F1E9] outline-none focus:ring-2 focus:ring-[#C9A96E]/50" />
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={editProd.promocao ?? false}
                                      onChange={() => setEditProd(p => {
                                        const nova = !p.promocao
                                        return { ...p, promocao: nova, preco_promocional: nova ? Number(((p.preco ?? 0) * 0.8).toFixed(2)) : null }
                                      })}
                                      className="h-4 w-4 rounded border-[#C9A96E]/30 bg-[#1A1612] text-[#C9A96E] focus:ring-[#C9A96E]/50" />
                                    <span className="text-xs text-[#E8D5B0]/70">Em promoção</span>
                                  </label>
                                  {editProd.promocao && (
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-[#E8D5B0]/50">Preço promocional:</label>
                                      <input type="number" step="0.01" value={editProd.preco_promocional ?? 0}
                                        onChange={e => setEditProd(p => ({ ...p, preco_promocional: parseFloat(e.target.value) || 0 }))}
                                        className="w-24 rounded-md border border-red-500/30 bg-[#1A1612] px-3 py-1.5 text-sm text-red-300 outline-none focus:ring-2 focus:ring-red-500/50" />
                                    </div>
                                  )}
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={editProd.destaque ?? false}
                                      onChange={() => setEditProd(p => ({ ...p, destaque: !p.destaque }))}
                                      className="h-4 w-4 rounded border-[#C9A96E]/30 bg-[#1A1612] text-[#C9A96E] focus:ring-[#C9A96E]/50" />
                                    <Star size={12} className="text-[#C9A96E]" />
                                    <span className="text-xs text-[#E8D5B0]/70">Destaque</span>
                                  </label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button onClick={saveProd} className="flex items-center gap-1.5 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 transition-all hover:bg-green-500/20"><Save size={14} /> Salvar</button>
                                  <button onClick={() => { setEditProdId(null); setEditProd({}) }} className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400"><X size={14} /> Cancelar</button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                {prod.imagem_url && (
                                  <img src={prod.imagem_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                                )}
                                <span className="shrink-0 text-xs text-[#E8D5B0]/30">#{prod.id}</span>
                                <span className="min-w-0 flex-1 truncate text-sm font-medium">{prod.nome}</span>
                                <span className="shrink-0 text-sm text-[#C9A96E]">{formatPrice(prod.preco)}</span>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  {prod.promocao && <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">PROMO</span>}
                                  {prod.destaque && <span className="rounded-full bg-[#C9A96E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#C9A96E]">DESTAQUE</span>}
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <button onClick={() => startEditProd(prod)} className="rounded-md p-1.5 text-[#E8D5B0]/40 transition-all hover:bg-[#1A1612] hover:text-[#C9A96E]"><Pencil size={16} /></button>
                                  <button onClick={() => togglePromocao(prod.id)}
                                    className={`rounded-md p-1.5 transition-all ${prod.promocao ? 'text-red-400 hover:bg-red-500/10' : 'text-[#E8D5B0]/40 hover:bg-[#1A1612] hover:text-[#C9A96E]'}`}>
                                    <Tag size={16} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ═══ PRÉVIA ═══ */}
        {secao === 'preview' && (
          <section>
            <h2 className="mb-4 font-serif text-xl font-semibold text-[#C9A96E]">👁️ Prévia — Como aparece no site</h2>
            <div className="overflow-hidden rounded-2xl border border-[#C9A96E]/15">
              <div className="border-b border-[#C9A96E]/10 bg-[#2E2820] px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💅</span>
                  <span className="font-serif text-lg font-bold text-[#C9A96E]">Stylo Nails</span>
                  <span className="ml-auto text-xs text-[#E8D5B0]/40">Esmalteria Premium</span>
                </div>
              </div>
              <div className="bg-[#1A1612] p-6">
                <div className="mb-8 overflow-hidden rounded-xl border border-[#C9A96E]/15 bg-gradient-to-br from-[#2E2820] via-[#3A3228] to-[#2E2820] p-6 sm:p-8">
                  <h3 className="mb-2 font-serif text-2xl font-bold text-[#C9A96E]">Beleza que começa nas pontas dos dedos 💅</h3>
                  <p className="mb-4 text-sm text-[#E8D5B0]/70">Produtos premium para unhas impecáveis.</p>
                  <span className="inline-block rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-5 py-2 text-xs font-semibold text-white">Ver Destaques</span>
                </div>

                <div className="mb-6">
                  <h4 className="mb-4 font-serif text-lg font-semibold text-[#C9A96E]">✨ Produtos em Destaque</h4>
                  <div className="flex flex-wrap gap-4">
                    {produtos.filter(p => p.ativo && p.destaque).slice(0, 4).map(prod => (
                      <PreviewCard key={prod.id} produto={prod} />
                    ))}
                    {produtos.filter(p => p.ativo && p.destaque).length === 0 && (
                      <p className="text-sm text-[#E8D5B0]/40">Nenhum produto em destaque ainda. Marque produtos como "Destaque" na aba Produtos.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-4 font-serif text-lg font-semibold text-[#C9A96E]">📂 Categorias</h4>
                  <div className="flex flex-wrap gap-2">
                    {categorias.map(cat => (
                      <span key={cat.id} className="rounded-full border border-[#C9A96E]/20 bg-[#2E2820] px-4 py-2 text-sm text-[#E8D5B0]/70">{cat.nome}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#E8D5B0]/30">* Prévia ilustrativa baseada nos dados reais do banco.</p>
          </section>
        )}

        <div className="mt-10 border-t border-[#C9A96E]/10 py-6 text-center text-xs text-[#E8D5B0]/30">
          Stylo Nails — Painel Administrativo
        </div>
      </div>
    </div>
  )
}

/* ─── Page ─── */
export default function AdminPage() {
  const [logado, setLogado] = useState(false)
  if (!logado) return <LoginScreen onLogin={() => setLogado(true)} />
  return <AdminPanel onLogout={() => setLogado(false)} />
}
