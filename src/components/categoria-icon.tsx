'use client'

import { getCategoriaIcon } from '@/lib/categoria-icons'

export function CategoriaIconView({
  slug,
  size = 18,
  className = '',
}: {
  slug: string
  size?: number
  className?: string
}) {
  const { icon: Icon } = getCategoriaIcon(slug)
  return <Icon size={size} className={`text-[#C9A96E] ${className}`} aria-hidden="true" />
}
