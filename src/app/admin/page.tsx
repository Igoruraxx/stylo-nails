'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Pencil, LogOut, Eye, ArrowLeft, ShoppingBag, Tag, Palette, Save, X, Star } from 'lucide-react'
import type { Categoria, Produto } from '@/types'

/* ──────────────────────────────────────────
   Mock-data (mesmo do site)
   ────────────────────────────────────────── */
const mockCategorias: Categoria[] = [
  { id: 1, nome: 'Unhas em Gel',        slug: 'unhas-em-gel',        descricao: 'Alongamento e blindagem em gel',    imagem_url: null, ordem: 1, ativo: true },
  { id: 2, nome: 'Esmaltação',          slug: 'esmaltacao',          descricao: 'Esmaltação tradicional e em gel',   imagem_url: null, ordem: 2, ativo: true },
  { id: 3, nome: 'Decoração',           slug: 'decoracao',           descricao: 'Adesivos, francesinha e nail art',  imagem_url: null, ordem: 3, ativo: true },
  { id: 4, nome: 'Alongamento Acrílico',slug: 'alongamento-acrilico',descricao: 'Unhas de acrílico',                  imagem_url: null, ordem: 4, ativo: true },
  { id: 5, nome: 'Fibra de Vidro',      slug: 'fibra-de-vidro',      descricao: 'Alongamento com fibra de vidro',    imagem_url: null, ordem: 5, ativo: true },
  { id: 6, nome: 'Manicure',            slug: 'manicure',            descricao: 'Corte e lixa',                      imagem_url: null, ordem: 6, ativo: true },
  { id: 7, nome: 'Pedicure',            slug: 'pedicure',            descricao: 'Cuidados para os pés',              imagem_url: null, ordem: 7, ativo: true },
  { id: 8, nome: 'Tratamentos',         slug: 'tratamentos',         descricao: 'Hidratação e fortalecedores',       imagem_url: null, ordem: 8, ativo: true },
]

const mockProdutos: Produto[] = [
  { id: 1,  categoria_id: 1, nome: 'Gel Builder',           descricao: 'Base fortalecedora em gel para unhas naturais.',       preco: 89.90, promocao: true,  preco_promocional: 69.90, imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 2,  categoria_id: 1, nome: 'Tips em Gel',           descricao: 'Alongamento com tips e gel UV.',                        preco: 129.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 2,  ativo: true, destaque: true },
  { id: 3,  categoria_id: 2, nome: 'Esmalte em Gel',        descricao: 'Esmaltação em gel com cabine UV (duração 15+ dias).',   preco: 59.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 4,  categoria_id: 2, nome: 'Esmalte Tradicional',   descricao: 'Esmaltação tradicional com secagem natural.',            preco: 35.00, promocao: true,  preco_promocional: 25.00, imagem_url: null, ordem: 2,  ativo: true, destaque: false },
  { id: 5,  categoria_id: 3, nome: 'Francesinha Premium',   descricao: 'Francesinha clássica ou colorida feita à mão.',         preco: 45.00, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 6,  categoria_id: 3, nome: 'Kit Adesivos 3D',       descricao: 'Pacote com 20 adesivos metálicos e florais.',            preco: 29.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 2,  ativo: true, destaque: false },
  { id: 7,  categoria_id: 4, nome: 'Alongamento Acrílico',  descricao: 'Moldagem em acrílico para unhas longas e resistentes.',  preco: 149.90, promocao: true,  preco_promocional: 119.90, imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 8,  categoria_id: 5, nome: 'Fibra de Vidro',        descricao: 'Alongamento natural com fibra de vidro.',               preco: 169.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: false },
  { id: 9,  categoria_id: 6, nome: 'Manicure Completa',     descricao: 'Corte, lixa, cutículas e hidratação.',                   preco: 45.00, promocao: true,  preco_promocional: 35.00, imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 10, categoria_id: 6, nome: 'Corte e Lixa',          descricao: 'Apenas corte e formatação das unhas.',                    preco: 25.00, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 2,  ativo: true, destaque: false },
  { id: 11, categoria_id: 7, nome: 'Pedicure Completo',     descricao: 'Pés: corte, cutículas, hidratação e esmaltação.',         preco: 55.00, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: true },
  { id: 12, categoria_id: 8, nome: 'Hidratação Intensiva',  descricao: 'Hidratação com óleos e cremes fortalecedores.',          preco: 39.90, promocao: false, preco_promocional: null,  imagem_url: null, ordem: 1,  ativo: true, destaque: false },
]

/* ──────────────────────────────────────────
   Utilitários
   ────────────────────────────────────────── */
function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/* ──────────────────────────────────────────
   Componente: Tela de Login
   ────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (senha === 'admin123') {
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
        {/* Logo / Título */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A96E] to-[#B8860B] text-2xl">
            🔒
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#C9A96E]">
            Painel Administrativo
          </h1>
          <p className="mt-1 text-sm text-[#E8D5B0]/60">
            Stylo Nails — Área Restrita
          </p>
        </div>

        {/* Input de senha */}
        <div className="mb-6">
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-medium text-[#E8D5B0]/80"
          >
            Senha de acesso
          </label>
          <input
            id="admin-password"
            type="password"
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value)
              setErro(false)
            }}
            placeholder="Digite a senha"
            autoFocus
            className={`w-full rounded-lg border bg-[#1A1612] px-4 py-3 text-sm text-[#F8F1E9] placeholder-[#E8D5B0]/30 outline-none transition-colors focus:ring-2 focus:ring-[#C9A96E]/50 ${
              erro ? 'border-red-500' : 'border-[#C9A96E]/20'
            }`}
          />
          {erro && (
            <p className="mt-2 text-xs text-red-400">
              Senha incorreta. Tente novamente.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}

/* ──────────────────────────────────────────
   Componente: Card de Prévia (como aparece no site)
   ────────────────────────────────────────── */
function PreviewCard({ produto }: { produto: Produto }) {
  const categoryGradients: Record<number, string> = {
    1: 'from-pink-500 to-purple-600',
    2: 'from-cyan-500 to-blue-600',
    3: 'from-violet-500 to-purple-800',
    4: 'from-teal-400 to-emerald-600',
    5: 'from-rose-400 to-orange-500',
    6: 'from-fuchsia-500 to-pink-600',
    7: 'from-sky-400 to-indigo-600',
    8: 'from-amber-500 to-red-600',
  }

  const gradient =
    categoryGradients[produto.categoria_id] ?? 'from-[#C9A96E] to-[#B8860B]'

  const precoAtual =
    produto.promocao && produto.preco_promocional
      ? produto.preco_promocional
      : produto.preco

  return (
    <div className="group flex w-56 flex-shrink-0 flex-col overflow-hidden rounded-xl bg-[#2E2820] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30">
      {/* Image placeholder */}
      <div
        className={`flex h-36 items-center justify-center bg-gradient-to-br ${gradient}`}
      >
        {produto.promocao && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            🔥 OFERTA
          </span>
        )}
        <span className="select-none text-4xl opacity-30">💅</span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="truncate text-sm font-medium text-[#F8F1E9]">
          {produto.nome}
        </h3>
        {produto.descricao && (
          <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
            {produto.descricao}
          </p>
        )}
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-bold text-[#C9A96E]">
            {formatPrice(precoAtual)}
          </span>
          {produto.promocao && produto.preco_promocional != null && (
            <span className="text-xs text-white/40 line-through">
              {formatPrice(produto.preco)}
            </span>
          )}
        </div>
        <button className="mt-1 w-full rounded-lg bg-[#C9A96E] px-3 py-2 text-xs font-semibold text-[#1A1612] transition-all hover:bg-[#DAA520] active:scale-[0.97]">
          Adicionar
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Componente: Painel Principal (pós-login)
   ────────────────────────────────────────── */
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  /* ── Estado local para edição de categorias ── */
  const [categorias, setCategorias] = useState<Categoria[]>(mockCategorias)
  const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null)
  const [editCatNome, setEditCatNome] = useState('')

  /* ── Estado local para edição de produtos ── */
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos)
  const [editProdutoId, setEditProdutoId] = useState<number | null>(null)
  const [editProdData, setEditProdData] = useState<Partial<Produto>>({})

  /* ── Seção ativa ── */
  const [secao, setSecao] = useState<'categorias' | 'produtos' | 'preview'>('categorias')

  /* ──────────────────────────────────────
     Handlers — Categorias
     ────────────────────────────────────── */
  const startEditCategoria = (cat: Categoria) => {
    setEditCategoriaId(cat.id)
    setEditCatNome(cat.nome)
  }

  const saveEditCategoria = (id: number) => {
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? { ...c, nome: editCatNome } : c)),
    )
    setEditCategoriaId(null)
  }

  const moveCategoria = (id: number, direction: 'up' | 'down') => {
    setCategorias((prev) => {
      const idx = prev.findIndex((c) => c.id === id)
      if (idx === -1) return prev
      if (direction === 'up' && idx === 0) return prev
      if (direction === 'down' && idx === prev.length - 1) return prev
      const arr = [...prev]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
      return arr.map((c, i) => ({ ...c, ordem: i + 1 }))
    })
  }

  /* ──────────────────────────────────────
     Handlers — Produtos
     ────────────────────────────────────── */
  const startEditProduto = (prod: Produto) => {
    setEditProdutoId(prod.id)
    setEditProdData({
      nome: prod.nome,
      preco: prod.preco,
      promocao: prod.promocao,
      preco_promocional: prod.preco_promocional,
      destaque: prod.destaque,
    })
  }

  const saveEditProduto = (id: number) => {
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...editProdData } : p)),
    )
    setEditProdutoId(null)
    setEditProdData({})
  }

  const togglePromocao = (id: number) => {
    setProdutos((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              promocao: !p.promocao,
              preco_promocional: !p.promocao
                ? Number((p.preco * 0.8).toFixed(2))
                : null,
            }
          : p,
      ),
    )
  }

  /* ──────────────────────────────────────
     Render
     ────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#1A1612] text-[#F8F1E9]">
      {/* ── Header do Admin ── */}
      <header className="sticky top-0 z-50 border-b border-[#C9A96E]/15 bg-[#1A1612]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛠️</span>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#C9A96E]">
                Admin
              </h1>
              <p className="text-[10px] text-[#E8D5B0]/40 leading-tight">
                Stylo Nails
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-[#C9A96E]/20 px-3 py-2 text-xs font-medium text-[#E8D5B0]/70 transition-all hover:border-[#C9A96E]/40 hover:text-[#C9A96E]"
            >
              <ArrowLeft size={14} />
              Voltar ao Site
            </a>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* ── Navegação interna ── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <nav className="mb-6 flex gap-1 rounded-xl bg-[#2E2820] p-1">
          {(
            [
              { key: 'categorias', label: 'Categorias', icon: Tag },
              { key: 'produtos', label: 'Produtos', icon: ShoppingBag },
              { key: 'preview', label: 'Prévia do Site', icon: Eye },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSecao(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                secao === key
                  ? 'bg-[#C9A96E] text-[#1A1612] shadow-lg'
                  : 'text-[#E8D5B0]/60 hover:text-[#C9A96E]'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* ─────────────────────────────────────────────
            SEÇÃO: CATEGORIAS
            ───────────────────────────────────────────── */}
        {secao === 'categorias' && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Palette size={20} className="text-[#C9A96E]" />
              <h2 className="font-serif text-xl font-semibold text-[#C9A96E]">
                Categorias
              </h2>
              <span className="ml-auto text-xs text-[#E8D5B0]/40">
                Arraste ou use os botões para reordenar
              </span>
            </div>

            <div className="space-y-2">
              {categorias.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 rounded-xl border border-[#C9A96E]/10 bg-[#2E2820] px-4 py-3 transition-all hover:border-[#C9A96E]/20"
                >
                  {/* Ordem */}
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1A1612] text-xs font-bold text-[#C9A96E]/60">
                    {idx + 1}
                  </span>

                  {/* Nome */}
                  {editCategoriaId === cat.id ? (
                    <input
                      type="text"
                      value={editCatNome}
                      onChange={(e) => setEditCatNome(e.target.value)}
                      className="flex-1 rounded-md border border-[#C9A96E]/30 bg-[#1A1612] px-3 py-1.5 text-sm text-[#F8F1E9] outline-none focus:ring-2 focus:ring-[#C9A96E]/50"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium">
                      {cat.nome}
                    </span>
                  )}

                  {/* Descricao */}
                  <span className="hidden max-w-[200px] truncate text-xs text-[#E8D5B0]/40 sm:block">
                    {cat.descricao}
                  </span>

                  {/* Ações */}
                  <div className="flex items-center gap-1">
                    {/* Reordenar ↑ */}
                    <button
                      onClick={() => moveCategoria(cat.id, 'up')}
                      disabled={idx === 0}
                      className="rounded-md p-1.5 text-[#E8D5B0]/40 transition-all hover:bg-[#1A1612] hover:text-[#C9A96E] disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveCategoria(cat.id, 'down')}
                      disabled={idx === categorias.length - 1}
                      className="rounded-md p-1.5 text-[#E8D5B0]/40 transition-all hover:bg-[#1A1612] hover:text-[#C9A96E] disabled:opacity-20 disabled:cursor-not-allowed"
                      title="Mover para baixo"
                    >
                      <ChevronDown size={16} />
                    </button>

                    {/* Editar / Salvar */}
                    {editCategoriaId === cat.id ? (
                      <button
                        onClick={() => saveEditCategoria(cat.id)}
                        className="rounded-md bg-green-500/10 p-1.5 text-green-400 transition-all hover:bg-green-500/20"
                        title="Salvar"
                      >
                        <Save size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditCategoria(cat)}
                        className="rounded-md p-1.5 text-[#E8D5B0]/40 transition-all hover:bg-[#1A1612] hover:text-[#C9A96E]"
                        title="Editar nome"
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    {editCategoriaId === cat.id && (
                      <button
                        onClick={() => setEditCategoriaId(null)}
                        className="rounded-md p-1.5 text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400"
                        title="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────
            SEÇÃO: PRODUTOS
            ───────────────────────────────────────────── */}
        {secao === 'produtos' && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#C9A96E]" />
              <h2 className="font-serif text-xl font-semibold text-[#C9A96E]">
                Produtos
              </h2>
              <span className="ml-auto text-xs text-[#E8D5B0]/40">
                {produtos.length} itens
              </span>
            </div>

            <div className="space-y-2">
              {produtos.map((prod) => {
                const editing = editProdutoId === prod.id
                return (
                  <div
                    key={prod.id}
                    className="rounded-xl border border-[#C9A96E]/10 bg-[#2E2820] px-4 py-3 transition-all hover:border-[#C9A96E]/20"
                  >
                    {editing ? (
                      /* ── Modo edição ── */
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 text-xs text-[#E8D5B0]/40">
                            #{prod.id}
                          </span>
                          <input
                            type="text"
                            value={editProdData.nome ?? ''}
                            onChange={(e) =>
                              setEditProdData((prev) => ({
                                ...prev,
                                nome: e.target.value,
                              }))
                            }
                            className="flex-1 rounded-md border border-[#C9A96E]/30 bg-[#1A1612] px-3 py-1.5 text-sm text-[#F8F1E9] outline-none focus:ring-2 focus:ring-[#C9A96E]/50"
                            placeholder="Nome do produto"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {/* Preço */}
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-[#E8D5B0]/50">
                              Preço:
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={editProdData.preco ?? 0}
                              onChange={(e) =>
                                setEditProdData((prev) => ({
                                  ...prev,
                                  preco: parseFloat(e.target.value) || 0,
                                }))
                              }
                              className="w-24 rounded-md border border-[#C9A96E]/30 bg-[#1A1612] px-3 py-1.5 text-sm text-[#F8F1E9] outline-none focus:ring-2 focus:ring-[#C9A96E]/50"
                            />
                          </div>

                          {/* Promoção toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editProdData.promocao ?? false}
                              onChange={() =>
                                setEditProdData((prev) => {
                                  const novaPromocao = !prev.promocao
                                  return {
                                    ...prev,
                                    promocao: novaPromocao,
                                    preco_promocional: novaPromocao
                                      ? Number(
                                          (
                                            (prev.preco ?? 0) * 0.8
                                          ).toFixed(2),
                                        )
                                      : null,
                                  }
                                })
                              }
                              className="h-4 w-4 rounded border-[#C9A96E]/30 bg-[#1A1612] text-[#C9A96E] focus:ring-[#C9A96E]/50"
                            />
                            <span className="text-xs text-[#E8D5B0]/70">
                              Em promoção
                            </span>
                          </label>

                          {/* Preço promocional */}
                          {editProdData.promocao && (
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-[#E8D5B0]/50">
                                Preço promocional:
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={editProdData.preco_promocional ?? 0}
                                onChange={(e) =>
                                  setEditProdData((prev) => ({
                                    ...prev,
                                    preco_promocional:
                                      parseFloat(e.target.value) || 0,
                                  }))
                                }
                                className="w-24 rounded-md border border-red-500/30 bg-[#1A1612] px-3 py-1.5 text-sm text-red-300 outline-none focus:ring-2 focus:ring-red-500/50"
                              />
                            </div>
                          )}

                          {/* Destaque */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editProdData.destaque ?? false}
                              onChange={() =>
                                setEditProdData((prev) => ({
                                  ...prev,
                                  destaque: !prev.destaque,
                                }))
                              }
                              className="h-4 w-4 rounded border-[#C9A96E]/30 bg-[#1A1612] text-[#C9A96E] focus:ring-[#C9A96E]/50"
                            />
                            <Star size={12} className="text-[#C9A96E]" />
                            <span className="text-xs text-[#E8D5B0]/70">
                              Destaque
                            </span>
                          </label>
                        </div>

                        {/* Botões salvar/cancelar */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEditProduto(prod.id)}
                            className="flex items-center gap-1.5 rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 transition-all hover:bg-green-500/20"
                          >
                            <Save size={14} />
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditProdutoId(null)
                              setEditProdData({})
                            }}
                            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-400/60 transition-all hover:bg-red-500/10 hover:text-red-400"
                          >
                            <X size={14} />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* ── Modo visualização ── */
                      <div className="flex items-center gap-3">
                        {/* ID */}
                        <span className="shrink-0 text-xs text-[#E8D5B0]/30">
                          #{prod.id}
                        </span>

                        {/* Nome */}
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">
                          {prod.nome}
                        </span>

                        {/* Preço */}
                        <span className="shrink-0 text-sm text-[#C9A96E]">
                          {formatPrice(prod.preco)}
                        </span>

                        {/* Badges */}
                        <div className="flex shrink-0 items-center gap-1.5">
                          {prod.promocao && (
                            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                              PROMO
                            </span>
                          )}
                          {prod.destaque && (
                            <span className="rounded-full bg-[#C9A96E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#C9A96E]">
                              DESTAQUE
                            </span>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => startEditProduto(prod)}
                            className="rounded-md p-1.5 text-[#E8D5B0]/40 transition-all hover:bg-[#1A1612] hover:text-[#C9A96E]"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => togglePromocao(prod.id)}
                            className={`rounded-md p-1.5 transition-all ${
                              prod.promocao
                                ? 'text-red-400 hover:bg-red-500/10'
                                : 'text-[#E8D5B0]/40 hover:bg-[#1A1612] hover:text-[#C9A96E]'
                            }`}
                            title={
                              prod.promocao
                                ? 'Remover promoção'
                                : 'Ativar promoção (20% off)'
                            }
                          >
                            <Tag size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────
            SEÇÃO: PRÉVIA DO SITE
            ───────────────────────────────────────────── */}
        {secao === 'preview' && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Eye size={20} className="text-[#C9A96E]" />
              <h2 className="font-serif text-xl font-semibold text-[#C9A96E]">
                Prévia — Como aparece no site
              </h2>
            </div>

            {/* Simulação do layout do site */}
            <div className="overflow-hidden rounded-2xl border border-[#C9A96E]/15">
              {/* Cabeçalho simulado */}
              <div className="border-b border-[#C9A96E]/10 bg-[#2E2820] px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">💅</span>
                  <span className="font-serif text-lg font-bold text-[#C9A96E]">
                    Stylo Nails
                  </span>
                  <span className="ml-auto text-xs text-[#E8D5B0]/40">
                    Esmalteria Premium
                  </span>
                </div>
              </div>

              {/* Conteúdo simulado */}
              <div className="bg-[#1A1612] p-6">
                {/* Hero simulado */}
                <div className="mb-8 overflow-hidden rounded-xl border border-[#C9A96E]/15 bg-gradient-to-br from-[#2E2820] via-[#3A3228] to-[#2E2820] p-6 sm:p-8">
                  <h3 className="mb-2 font-serif text-2xl font-bold text-[#C9A96E]">
                    Beleza que começa nas pontas dos dedos 💅
                  </h3>
                  <p className="mb-4 text-sm text-[#E8D5B0]/70">
                    Produtos premium para unhas impecáveis.
                  </p>
                  <span className="inline-block rounded-lg bg-gradient-to-r from-[#B8860B] to-[#DAA520] px-5 py-2 text-xs font-semibold text-white">
                    Ver Destaques
                  </span>
                </div>

                {/* Produtos em grid simulado */}
                <div className="mb-6">
                  <h4 className="mb-4 font-serif text-lg font-semibold text-[#C9A96E]">
                    ✨ Produtos em Destaque
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {produtos
                      .filter((p) => p.ativo && p.destaque)
                      .slice(0, 4)
                      .map((prod) => (
                        <PreviewCard key={prod.id} produto={prod} />
                      ))}
                  </div>
                </div>

                {/* Categorias simuladas */}
                <div>
                  <h4 className="mb-4 font-serif text-lg font-semibold text-[#C9A96E]">
                    📂 Categorias
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categorias.slice(0, 6).map((cat) => (
                      <span
                        key={cat.id}
                        className="rounded-full border border-[#C9A96E]/20 bg-[#2E2820] px-4 py-2 text-sm text-[#E8D5B0]/70"
                      >
                        {cat.nome}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-[#E8D5B0]/30">
              * Prévia ilustrativa baseada nos dados atuais. As alterações
              feitas acima refletem nesta visualização.
            </p>
          </section>
        )}

        {/* ── Rodapé ── */}
        <div className="mt-10 border-t border-[#C9A96E]/10 py-6 text-center text-xs text-[#E8D5B0]/30">
          Stylo Nails — Painel Administrativo v0.1
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Page principal
   ────────────────────────────────────────── */
export default function AdminPage() {
  const [logado, setLogado] = useState(false)

  if (!logado) {
    return <LoginScreen onLogin={() => setLogado(true)} />
  }

  return <AdminPanel onLogout={() => setLogado(false)} />
}
