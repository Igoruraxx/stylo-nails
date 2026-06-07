'use client'

import { createContext, useContext, useReducer, useEffect, useState, useCallback, ReactNode } from 'react'
import type { Produto, CartItem } from '@/types'

type CartAction =
  | { type: 'ADD_ITEM'; produto: Produto }
  | { type: 'REMOVE_ITEM'; produtoId: number }
  | { type: 'UPDATE_QTY'; produtoId: number; quantidade: number }
  | { type: 'CLEAR' }

interface CartContextType {
  itens: CartItem[]
  total: number
  totalItens: number
  adicionar: (produto: Produto) => void
  remover: (produtoId: number) => void
  atualizarQtd: (produtoId: number, quantidade: number) => void
  limpar: () => void
  /** Modal do carrinho — aberto? */
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existente = state.find(i => i.produto.id === action.produto.id)
      if (existente) {
        return state.map(i =>
          i.produto.id === action.produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      }
      return [...state, { produto: action.produto, quantidade: 1 }]
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.produto.id !== action.produtoId)
    case 'UPDATE_QTY':
      return state.map(i =>
        i.produto.id === action.produtoId
          ? { ...i, quantidade: Math.max(1, action.quantidade) }
          : i
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, dispatch] = useReducer(cartReducer, [], () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stylo-cart')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('stylo-cart', JSON.stringify(itens))
  }, [itens])

  /* ── Travar scroll do body quando modal está aberto ── */
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [cartOpen])

  /* ── ESC fecha o modal ── */
  useEffect(() => {
    if (!cartOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [cartOpen])

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const toggleCart = useCallback(() => setCartOpen(v => !v), [])

  const total = itens.reduce((acc, i) => {
    const preco = i.produto.promocao && i.produto.preco_promocional
      ? i.produto.preco_promocional
      : i.produto.preco
    return acc + preco * i.quantidade
  }, 0)

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <CartContext.Provider
      value={{
        itens,
        total,
        totalItens,
        adicionar: (produto) => dispatch({ type: 'ADD_ITEM', produto }),
        remover: (produtoId) => dispatch({ type: 'REMOVE_ITEM', produtoId }),
        atualizarQtd: (produtoId, quantidade) =>
          dispatch({ type: 'UPDATE_QTY', produtoId, quantidade }),
        limpar: () => dispatch({ type: 'CLEAR' }),
        cartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider')
  return ctx
}
