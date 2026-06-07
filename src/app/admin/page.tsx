'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronUp, ChevronDown, Pencil, LogOut, Eye, ArrowLeft, ShoppingBag, Tag, Save, X, Star, Plus, Upload } from 'lucide-react'
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
  const [secao, setSecao] = useState<'categorias' | 'produtos' | 'preview'>('categorias')

  // Edit state - categoria
  const [editCatId, setEditCatId] = useState<number | null>(null)
  const [editCatNome, setEditCatNome] = useState('')

  // Edit state - produto
  const [editProdId, setEditProdId] = useState<number | null>(null)
  const [editProd, setEditProd] = useState<Partial<Produto>>({})

  // New category
  const [novaCatAberta, setNovaCatAberta] = useState(false)
  const [novaCatNome, setNovaCatNome] = useState('')
  const [novaCatSlug, setNovaCatSlug] = useState('')

  // New product
  const [novoProdAberto, setNovoProdAberto] = useState(false)
  const [novoProd, setNovoProd] = useState({ categoria_id: 0, nome: '', preco: 0, promocao: false, preco_promocional: 0, destaque: false })
  const [novoProdImg, setNovoProdImg] = useState<File | null>(null)
  const [novoProdImgPreview, setNovoProdImgPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Feedback
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  // Filter state
  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Edit modal state
  const [editModalProd, setEditModalProd] = useState<Produto | null>(null)
  const [editModalData, setEditModalData] = useState<Partial<Produto>>({})
  const [editModalImg, setEditModalImg] = useState<File | null>(null)
  const [editModalImgPreview, setEditModalImgPreview] = useState('')
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 2500)
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
      showFeedback('❌ Erro: ' + e.message)
    }
    setSaving(false)
  }

  /* ── INSERT via API ── */
  const insertToServer = async (table: string, data: any) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, data, password: PASS, action: 'insert' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      showFeedback('✅ Criado!')
      return json.id as number
    } catch (e: any) {
      showFeedback('❌ Erro: ' + e.message)
      return null
    } finally {
      setSaving(false)
    }
  }

  /* ── Upload imagem pro Storage ── */
  const uploadImage = async (file: File, pasta: string): Promise<string | null> => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${pasta}/admin-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('produtos')
        .upload(fileName, file, { upsert: true })
      if (uploadErr) throw new Error(uploadErr.message)
      const { data: { publicUrl } } = supabase.storage.from('produtos').getPublicUrl(fileName)
      return publicUrl
    } catch (e: any) {
      showFeedback('❌ Erro upload: ' + e.message)
      return null
    } finally {
      setUploading(false)
    }
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

  const criarCategoria = async () => {
    if (!novaCatNome.trim()) return
    const slug = novaCatSlug.trim() || novaCatNome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const novaOrdem = categorias.length + 1
    const id = await insertToServer('categorias', {
      nome: novaCatNome.trim(),
      slug,
      ordem: novaOrdem,
      ativo: true,
    })
    if (id) {
      setCategorias(prev => [...prev, { id, nome: novaCatNome.trim(), slug, ordem: novaOrdem, ativo: true, descricao: null, imagem_url: null, created_at: '', updated_at: '' }])
      setNovaCatAberta(false)
      setNovaCatNome('')
      setNovaCatSlug('')
    }
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
      fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'categorias', action: 'reorder', data: reordered.map(c => ({ id: c.id, ordem: c.ordem })), password: PASS }),
      })
      return reordered
    })
  }

  /* ── Produto handlers ── */
  const openEditModal = (prod: Produto) => {
    setEditModalProd(prod)
    setEditModalData({
      nome: prod.nome,
      preco: prod.preco,
      promocao: prod.promocao,
      preco_promocional: prod.preco_promocional,
      destaque: prod.destaque,
      descricao: prod.descricao,
    })
    setEditModalImg(null)
    setEditModalImgPreview('')
  }

  const saveProd = async () => {
    if (!editModalProd) return
    const id = editModalProd.id
    let imagem_url = editModalProd.imagem_url

    // Upload new image if selected
    if (editModalImg) {
      const cat = categorias.find(c => c.id === editModalProd.categoria_id)
      const pasta = cat?.slug || `cat-${editModalProd.categoria_id}`
      const url = await uploadImage(editModalImg, pasta)
      if (url) imagem_url = url
    }

    const data: any = {
      nome: editModalData.nome,
      preco: editModalData.preco,
      promocao: editModalData.promocao,
      preco_promocional: editModalData.promocao ? editModalData.preco_promocional : null,
      destaque: editModalData.destaque,
      descricao: editModalData.descricao || null,
    }
    if (imagem_url !== editModalProd.imagem_url) {
      data.imagem_url = imagem_url
    }

    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...data, imagem_url: imagem_url || p.imagem_url } : p))
    await saveToServer('produtos', id, data)
    setEditModalProd(null)
  }

  const togglePromocao = (id: number) => {
    setProdutos(prev => prev.map(p => {
      if (p.id !== id) return p
      const nova = !p.promocao
      return { ...p, promocao: nova, preco_promocional: nova ? Number((p.preco * 0.8).toFixed(2)) : null }
    }))
  }

  /* ── Criar Produto ── */
  const handleNovoProdImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNovoProdImg(file)
    const reader = new FileReader()
    reader.onload = () => setNovoProdImgPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const criarProduto = async () => {
    if (!novoProd.nome.trim() || !novoProd.categoria_id) {
      showFeedback('⚠️ Preencha nome e selecione uma categoria')
      return
    }

    let imagem_url: string | null = null
    if (novoProdImg) {
      const cat = categorias.find(c => c.id === novoProd.categoria_id)
      const pasta = cat?.slug || `cat-${novoProd.categoria_id}`
      imagem_url = await uploadImage(novoProdImg, pasta)
      if (!imagem_url) return
    }

    const id = await insertToServer('produtos', {
      categoria_id: novoProd.categoria_id,
      nome: novoProd.nome.trim(),
      preco: novoProd.preco,
      promocao: novoProd.promocao,
      preco_promocional: novoProd.promocao ? novoProd.preco_promocional || Number((novoProd.preco * 0.8).toFixed(2)) : null,
      destaque: novoProd.destaque,
      imagem_url,
      ordem: produtos.filter(p => p.categoria_id === novoProd.categoria_id).length + 1,
      ativo: true,
    })

    if (id) {
      await fetchData() // recarrega tudo
      setNovoProdAberto(false)
      setNovoProd({ categoria_id: 0, nome: '', preco: 0, promocao: false, preco_promocional: 0, destaque: false })
      setNovoProdImg(null)
      setNovoProdImgPreview('')
    }
  }

  // Filtered + searched products
  const produtosFiltrados = (filtroCategoria
    ? produtos.filter(p => p.categoria_id === filtroCategoria)
    : produtos
  ).filter(p => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return p.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
  })

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
            {feedback && <span className={`text-xs ${feedback.includes('❌') ? 'text-red-400' : 'text-green-400'}`}>{feedback}</span>}
            {saving && <span className="text-xs text-[#C9A96E]">Salvando...</span>}
            {uploading && <span className="text-xs text-[#C9A96E]">Enviando foto...</span>}
            <a href="/" className="flex items-center gap-1.5 rounded-lg border border-[#C9A96E]/20 px-3 py-2 text-xs font-medium text-[#E8D5B0]/70 transition-all hover:border-[#C9A96E]/40 hover:text-[#C9A96E]">
              <ArrowLeft size={14} /> Voltar
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
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-[#C9A96E]">📂 Categorias</h2>
              <button onClick={() => setNovaCatAberta(true)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.97]">
                <Plus size={14} /> Adicionar Categoria
              </button>
            </div>

            {/* ── Nova Categoria ── */}
            {novaCatAberta && (
              <div className="mb-4 rounded-xl border border-[#C9A96E]/20 bg-[#2E2820] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-[#C9A96E]">Nova Categoria</span>
                </div>
                <div className="space-y-3">
                  <input type="text" value={novaCatNome} onChange={e => setNovaCatNome(e.target.value)}
                    placeholder="Nome da categoria"
                    className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-2.5 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40" />
                  <input type="text" value={novaCatSlug} onChange={e => setNovaCatSlug(e.target.value)}
                    placeholder="Slug (deixar vazio = automático)"
                    className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-2.5 text-sm text-[#E8D5B0]/70 placeholder-[#E8D5B0]/30 outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40" />
                  <div className="flex items-center gap-2">
                    <button onClick={criarCategoria} disabled={!novaCatNome.trim() || saving}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500/20 px-4 py-2 text-xs font-medium text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Save size={14} /> Criar
                    </button>
                    <button onClick={() => { setNovaCatAberta(false); setNovaCatNome(''); setNovaCatSlug('') }}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400">
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

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
              
              {/* Busca */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="🔍 Buscar produto por nome..."
                  className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#2E2820] pl-9 pr-4 py-2 text-xs text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#E8D5B0]/30 hover:text-[#C9A96E]">
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={filtroCategoria ?? ''}
                onChange={e => setFiltroCategoria(e.target.value ? Number(e.target.value) : null)}
                className="rounded-lg border border-[#C9A96E]/20 bg-[#2E2820] px-3 py-2 text-xs text-[#E8D5B0] outline-none focus:ring-2 focus:ring-[#C9A96E]/50"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome} ({produtos.filter(p => p.categoria_id === cat.id).length})</option>
                ))}
              </select>

              <button onClick={() => setNovoProdAberto(true)}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-4 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.97]">
                <Plus size={14} /> Adicionar Produto
              </button>
            </div>

            {/* ── Novo Produto ── */}
            {novoProdAberto && (
              <div className="mb-6 rounded-xl border border-[#C9A96E]/20 bg-[#2E2820] p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#C9A96E]">
                  <Plus size={16} /> Novo Produto
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Nome */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-[#E8D5B0]/60">Nome do Produto *</label>
                    <input type="text" value={novoProd.nome} onChange={e => setNovoProd(p => ({ ...p, nome: e.target.value }))}
                      placeholder="Ex: Esmalte Vermelho"
                      className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-2.5 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40" />
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="mb-1 block text-xs text-[#E8D5B0]/60">Categoria *</label>
                    <select value={novoProd.categoria_id} onChange={e => setNovoProd(p => ({ ...p, categoria_id: Number(e.target.value) }))}
                      className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-2.5 text-sm text-[#F8F1E9] outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40">
                      <option value={0}>Selecione...</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* Preço */}
                  <div>
                    <label className="mb-1 block text-xs text-[#E8D5B0]/60">Preço (R$)</label>
                    <input type="number" step="0.01" min="0" value={novoProd.preco} onChange={e => setNovoProd(p => ({ ...p, preco: parseFloat(e.target.value) || 0 }))}
                      className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-2.5 text-sm text-[#F8F1E9] outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40" />
                  </div>

                  {/* Upload foto */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-[#E8D5B0]/60">Foto do Produto</label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-lg border border-dashed border-[#C9A96E]/30 bg-[#1A1612] px-5 py-4 text-xs text-[#E8D5B0]/50 transition-all hover:border-[#C9A96E]/50 hover:text-[#C9A96E]">
                        <Upload size={18} />
                        {novoProdImg ? 'Trocar foto' : 'Escolher foto da galeria'}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleNovoProdImg} className="hidden" />
                      {novoProdImgPreview && (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#C9A96E]/20">
                          <img src={novoProdImgPreview} alt="Preview" className="h-full w-full object-cover" />
                          <button onClick={() => { setNovoProdImg(null); setNovoProdImgPreview('') }}
                            className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                            style={{ fontSize: 11 }}>×</button>
                        </div>
                      )}
                      {novoProdImg && (
                        <span className="text-[10px] text-[#E8D5B0]/40">{novoProdImg.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center gap-6 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={novoProd.promocao} onChange={() => setNovoProd(p => ({ ...p, promocao: !p.promocao, preco_promocional: !p.promocao ? Number((p.preco * 0.8).toFixed(2)) : 0 }))}
                        className="h-4 w-4 rounded border-[#C9A96E]/30 bg-[#1A1612] text-[#C9A96E] focus:ring-[#C9A96E]/50" />
                      <span className="text-xs text-[#E8D5B0]/70">Em promoção</span>
                    </label>
                    {novoProd.promocao && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-[#E8D5B0]/50">Preço promocional:</label>
                        <input type="number" step="0.01" value={novoProd.preco_promocional} onChange={e => setNovoProd(p => ({ ...p, preco_promocional: parseFloat(e.target.value) || 0 }))}
                          className="w-24 rounded-md border border-red-500/30 bg-[#1A1612] px-3 py-1.5 text-sm text-red-300 outline-none focus:ring-2 focus:ring-red-500/50" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={novoProd.destaque} onChange={() => setNovoProd(p => ({ ...p, destaque: !p.destaque }))}
                        className="h-4 w-4 rounded border-[#C9A96E]/30 bg-[#1A1612] text-[#C9A96E] focus:ring-[#C9A96E]/50" />
                      <Star size={12} className="text-[#C9A96E]" />
                      <span className="text-xs text-[#E8D5B0]/70">Destaque</span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <button onClick={criarProduto} disabled={!novoProd.nome.trim() || !novoProd.categoria_id || saving || uploading}
                      className="flex items-center gap-1.5 rounded-lg bg-green-500/20 px-5 py-2.5 text-xs font-medium text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed">
                      {uploading ? 'Enviando foto...' : <><Save size={14} /> Criar Produto</>}
                    </button>
                    <button onClick={() => { setNovoProdAberto(false); setNovoProd({ categoria_id: 0, nome: '', preco: 0, promocao: false, preco_promocional: 0, destaque: false }); setNovoProdImg(null); setNovoProdImgPreview('') }}
                      className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-xs font-medium text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400">
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {produtosPorCategoria.map(({ categoria, produtos: prods }) => {
                if (!categoria || prods.length === 0) return null
                return (
                  <div key={categoria.id}>
                    <h3 className="mb-2 text-sm font-semibold text-[#C9A96E]/80">{categoria.nome}</h3>
                    <div className="space-y-1.5">
                      {prods.map(prod => (
                        <div key={prod.id}
                          className="flex items-center gap-3 rounded-xl border border-[#C9A96E]/10 bg-[#2E2820] px-4 py-2.5 transition-all hover:border-[#C9A96E]/20 hover:bg-[#2E2820]/80 cursor-pointer"
                          onClick={() => openEditModal(prod)}>
                          {prod.imagem_url ? (
                            <img src={prod.imagem_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A1612] text-lg opacity-30">💅</div>
                          )}
                          <span className="shrink-0 text-[10px] text-[#E8D5B0]/30 w-7">#{prod.id}</span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{prod.nome}</span>
                          <span className="shrink-0 text-sm text-[#C9A96E]">{formatPrice(prod.preco)}</span>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {prod.promocao && <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">PROMO</span>}
                            {prod.destaque && <span className="rounded-full bg-[#C9A96E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#C9A96E]">DESTAQUE</span>}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); openEditModal(prod) }}
                            className="rounded-md p-1.5 text-[#E8D5B0]/40 transition-all hover:bg-[#1A1612] hover:text-[#C9A96E]">
                            <Pencil size={16} />
                          </button>
                        </div>
                      ))}
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

        {/* ═══ EDIT PRODUCT MODAL ═══ */}
        {editModalProd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
            onClick={() => setEditModalProd(null)}>
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#C9A96E]/20 bg-[#2E2820] shadow-2xl"
              onClick={e => e.stopPropagation()}>
              
              {/* Fechar */}
              <button onClick={() => setEditModalProd(null)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/60 hover:bg-black/70 hover:text-white transition-all">
                <X size={18} />
              </button>

              <div className="grid md:grid-cols-2">
                {/* ── Foto grande ── */}
                <div className="relative flex min-h-[250px] md:min-h-full items-center justify-center bg-[#1A1612] rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden">
                  {editModalImgPreview ? (
                    <img src={editModalImgPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : editModalProd.imagem_url ? (
                    <img src={editModalProd.imagem_url} alt={editModalProd.nome} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#E8D5B0]/20">
                      <span className="text-6xl">💅</span>
                      <span className="text-xs">Sem foto</span>
                    </div>
                  )}
                  {/* Upload na foto */}
                  <button onClick={() => editFileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-2 text-xs text-white/70 hover:bg-black/80 hover:text-white backdrop-blur-sm transition-all">
                    <Upload size={14} /> {editModalProd.imagem_url ? 'Trocar' : 'Adicionar foto'}
                  </button>
                  <input ref={editFileInputRef} type="file" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setEditModalImg(file)
                    const reader = new FileReader()
                    reader.onload = () => setEditModalImgPreview(reader.result as string)
                    reader.readAsDataURL(file)
                  }} className="hidden" />
                </div>

                {/* ── Informações ── */}
                <div className="flex flex-col gap-5 p-6">
                  {/* ID + Categoria */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#E8D5B0]/30">#{editModalProd.id}</span>
                    <span className="rounded-full bg-[#C9A96E]/10 px-3 py-1 text-[10px] font-medium text-[#C9A96E]">
                      {categorias.find(c => c.id === editModalProd.categoria_id)?.nome || `Cat ${editModalProd.categoria_id}`}
                    </span>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#E8D5B0]/40">Nome</label>
                    <input type="text" value={editModalData.nome ?? ''}
                      onChange={e => setEditModalData(p => ({ ...p, nome: e.target.value }))}
                      className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-2.5 text-sm text-[#F8F1E9] outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40 font-medium" />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#E8D5B0]/40">Descrição</label>
                    <textarea value={editModalData.descricao ?? ''} rows={2}
                      onChange={e => setEditModalData(p => ({ ...p, descricao: e.target.value }))}
                      className="w-full resize-none rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-2.5 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40"
                      placeholder="Descrição do produto..." />
                  </div>

                  {/* Preços */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wider text-[#E8D5B0]/40">Preço (R$)</label>
                      <input type="number" step="0.01" value={editModalData.preco ?? 0}
                        onChange={e => setEditModalData(p => ({ ...p, preco: parseFloat(e.target.value) || 0 }))}
                        className="w-full rounded-lg border border-[#C9A96E]/20 bg-[#1A1612] px-4 py-2.5 text-sm text-[#F8F1E9] outline-none focus:border-[#B8860B] focus:ring-1 focus:ring-[#B8860B]/40" />
                    </div>
                    {editModalData.promocao && (
                      <div>
                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-red-400/60">Preço Promocional</label>
                        <input type="number" step="0.01" value={editModalData.preco_promocional ?? 0}
                          onChange={e => setEditModalData(p => ({ ...p, preco_promocional: parseFloat(e.target.value) || 0 }))}
                          className="w-full rounded-lg border border-red-500/30 bg-[#1A1612] px-4 py-2.5 text-sm text-red-300 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/40" />
                      </div>
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editModalData.promocao ?? false}
                        onChange={() => setEditModalData(p => {
                          const nova = !p.promocao
                          return { ...p, promocao: nova, preco_promocional: nova ? Number(((p.preco ?? 0) * 0.8).toFixed(2)) : null }
                        })}
                        className="h-4 w-4 rounded border-[#C9A96E]/30 bg-[#1A1612] text-[#C9A96E] focus:ring-[#C9A96E]/50" />
                      <span className="text-xs text-[#E8D5B0]/70">Em promoção</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editModalData.destaque ?? false}
                        onChange={() => setEditModalData(p => ({ ...p, destaque: !p.destaque }))}
                        className="h-4 w-4 rounded border-[#C9A96E]/30 bg-[#1A1612] text-[#C9A96E] focus:ring-[#C9A96E]/50" />
                      <Star size={12} className="text-[#C9A96E]" />
                      <span className="text-xs text-[#E8D5B0]/70">Destaque</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editModalData.ativo ?? true}
                        onChange={() => setEditModalData(p => ({ ...p, ativo: !(p.ativo ?? true) }))}
                        className="h-4 w-4 rounded border-[#C9A96E]/30 bg-[#1A1612] text-[#C9A96E] focus:ring-[#C9A96E]/50" />
                      <span className="text-xs text-[#E8D5B0]/70">Ativo</span>
                    </label>
                  </div>

                  {/* Ações */}
                  <div className="mt-auto flex items-center gap-3 pt-3 border-t border-[#C9A96E]/10">
                    <button onClick={saveProd} disabled={saving || uploading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
                      {saving || uploading ? 'Salvando...' : <><Save size={16} /> Salvar Alterações</>}
                    </button>
                    <button onClick={() => setEditModalProd(null)}
                      className="flex items-center gap-1.5 rounded-lg px-5 py-3 text-sm font-medium text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
