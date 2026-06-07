import type { ComponentType } from 'react'
import {
  Palette, Sparkles, Gem, Heart, Drill, Eye, Wand, Box,
  Wind, Scissors, Ruler, Package, Droplets, Paintbrush, FlaskConical,
  Shield, Beaker, Feather, Wrench, Cpu, SprayCan, Star, type LucideProps,
} from 'lucide-react'

export interface CategoriaIcon {
  icon: ComponentType<LucideProps>
  label: string
}

/**
 * Mapa de slug da categoria → ícone Lucide + label semântica.
 * Escolhidos manualmente baseado no significado de cada categoria.
 */
const categoriaIconMap: Record<string, CategoriaIcon> = {
  'esmaltes':              { icon: Palette,     label: 'Esmaltes' },
  'esmaltes-em-gel':       { icon: Droplets,     label: 'Esmalte em Gel' },
  'unhas-posticas':        { icon: Sparkles,    label: 'Unhas Postiças' },
  'acessorios':            { icon: Gem,         label: 'Acessórios' },
  'cuidados':              { icon: Heart,       label: 'Cuidados' },
  'brocas':                { icon: Drill,       label: 'Brocas' },
  'cola-para-extensao-de-cilios': { icon: Eye,  label: 'Cola para Cílios' },
  'decoracao':             { icon: Wand,        label: 'Decoração' },
  'descartaveis':          { icon: Box,         label: 'Descartáveis' },
  'eletronicos':           { icon: Cpu,         label: 'Eletrônicos' },
  'fibras':                { icon: Feather,     label: 'Fibras' },
  'lixas':                 { icon: Scissors,    label: 'Lixas' },
  'moldes':                { icon: Ruler,       label: 'Moldes' },
  'outros':                { icon: Package,     label: 'Outros' },
  'oleo-de-cuticulas':     { icon: Droplets,    label: 'Óleo Cutículas' },
  'pinceis':               { icon: Paintbrush,  label: 'Pincéis' },
  'preparadores':          { icon: FlaskConical,label: 'Preparadores' },
  'produtos-para-cabelos': { icon: SprayCan,    label: 'Cabelos' },
  'top-coat':              { icon: Shield,      label: 'Top Coat' },
  'geis':                  { icon: Beaker,      label: 'Géis' },
}

/** Fallback universal */
const defaultIcon: CategoriaIcon = { icon: Star, label: 'Categoria' }

/**
 * Retorna o ícone + label para uma categoria pelo slug.
 */
export function getCategoriaIcon(slug: string): CategoriaIcon {
  if (categoriaIconMap[slug]) return categoriaIconMap[slug]
  for (const [key, val] of Object.entries(categoriaIconMap)) {
    if (slug.startsWith(key) || key.startsWith(slug)) return val
  }
  return defaultIcon
}
