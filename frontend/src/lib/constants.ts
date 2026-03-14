import type { Quadrant, Product } from '../shared/scoring/types.ts'
import type { IconName } from '../components/ui/Icon.tsx'

export const QUADRANT_LABELS: Record<Quadrant, string> = {
  biens: 'Protection des biens',
  personnes: 'Protection des personnes',
  projets: 'Protection des projets',
  futur: 'Protection du futur',
}

export const QUADRANT_SHORT_LABELS: Record<Quadrant, string> = {
  biens: 'Biens',
  personnes: 'Personnes',
  projets: 'Projets',
  futur: 'Futur',
}

export const QUADRANT_COLORS: Record<Quadrant, string> = {
  biens: '#293485',
  personnes: '#0014aa',
  projets: '#00b28f',
  futur: '#9f52cc',
}

export const NEED_COLORS = {
  low: '#168741',
  moderate: '#c97612',
  high: '#d9304c',
  critical: '#99172d',
} as const

export const NEED_LABELS = {
  low: 'Besoin faible',
  moderate: 'Besoin modéré',
  high: 'Besoin élevé',
  critical: 'Besoin critique',
} as const

export const NEED_BADGE_LABELS = {
  low: 'Bien couvert',
  moderate: 'À améliorer',
  high: 'Action requise',
  critical: 'Action requise',
} as const

export const NEED_BADGE_COLORS = {
  low: 'green',
  moderate: 'orange',
  high: 'red',
  critical: 'red',
} as const

export const NEED_MESSAGES = {
  low: 'Votre protection est adaptée à votre situation.',
  moderate: 'Quelques améliorations pourraient renforcer votre couverture.',
  high: 'Des lacunes ont été identifiées dans votre couverture.',
  critical: 'Votre couverture est insuffisante. Une action rapide est recommandée.',
} as const

export const NEED_LEGEND_MESSAGES = {
  low: 'Votre protection est adaptée',
  moderate: 'Des améliorations sont possibles',
  high: 'Action recommandée',
  critical: 'Action recommandée',
} as const

export const ACTION_TYPE_LABELS = {
  immediate: 'Action immédiate',
  deferred: 'Action différée',
  event: 'Événement de vie',
  optimization: 'Optimisation',
} as const

export function getScoreColorClass(score: number): string {
  if (score <= 25) return 'text-success'
  if (score <= 50) return 'text-warning'
  return 'text-danger'
}

export const PRODUCT_BADGE_COLORS: Record<Product, 'green' | 'orange' | 'red' | 'blue'> = {
  drive: 'orange',
  home: 'red',
  travel: 'green',
  bsafe: 'blue',
  pension_plan: 'blue',
  life_plan: 'blue',
  switch_plan: 'green',
  solde_restant_du: 'green',
  kids_plan: 'green',
}

/* ─── Wheel Config (4 quadrants) ─── */

export const QUADRANT_WHEEL_LABELS: Record<Quadrant, { lines: [string, string]; subtitle: string }> = {
  biens: { lines: ['Vos', 'biens'], subtitle: '~1m30' },
  personnes: { lines: ['Vos', 'personnes'], subtitle: '~2 min' },
  projets: { lines: ['Vos', 'projets'], subtitle: 'Bientôt' },
  futur: { lines: ['Votre', 'futur'], subtitle: '~1 min' },
}

export const QUADRANT_WHEEL_COLORS: Record<Quadrant, { base: string; light: string; dark: string; glow: string }> = {
  biens: { base: '#293485', light: '#3d4691', dark: '#1a2260', glow: 'rgba(41, 52, 133, 0.30)' },
  personnes: { base: '#0014aa', light: '#0029d4', dark: '#000d6e', glow: 'rgba(0, 20, 170, 0.30)' },
  projets: { base: '#00b28f', light: '#2dd4bf', dark: '#008a6e', glow: 'rgba(0, 178, 143, 0.30)' },
  futur: { base: '#9f52cc', light: '#b87ee6', dark: '#7b3da3', glow: 'rgba(159, 82, 204, 0.30)' },
}

export const PRODUCT_LABELS: Record<Product, string> = {
  drive: 'Baloise Drive',
  home: 'Baloise Home',
  travel: 'Baloise Travel',
  bsafe: 'Baloise B-Safe',
  pension_plan: 'Baloise Pension Plan',
  life_plan: 'Baloise Life Plan',
  switch_plan: 'Baloise Switch Plan',
  solde_restant_du: 'Solde Restant Dû',
  kids_plan: 'Kids Plan',
}

export const QUADRANT_PRODUCTS: Record<Quadrant, string> = {
  biens: 'DRIVE · HOME',
  personnes: 'B-SAFE · TRAVEL',
  futur: 'Pension Plan · Life Plan',
  projets: 'Solde Restant Dû · Kids Plan',
}

export const QUADRANT_ICONS: Record<Quadrant, IconName> = {
  biens: 'home',
  personnes: 'shield-check',
  projets: 'car',
  futur: 'gift',
}

export const QUADRANT_ORDER: Quadrant[] = ['biens', 'personnes', 'projets', 'futur']

// Angles for each quadrant on the wheel (clockwise from top)
export const QUADRANT_ANGLES: Record<Quadrant, number> = {
  biens: 0,
  personnes: 90,
  projets: 180,
  futur: 270,
}

/* ─── Product Design Tokens ─── */

export const PRODUCT_COLORS: Record<Product, { primary: string; accent: string; light: string; dark: string; bg: string }> = {
  drive: { primary: '#fa9319', accent: '#ffbe19', light: '#ffecbc', dark: '#b24a00', bg: '#fff9e8' },
  home: { primary: '#d9304c', accent: '#ff596f', light: '#ffd7d7', dark: '#99172d', bg: '#ffeef1' },
  travel: { primary: '#00b28f', accent: '#21d9ac', light: '#cbf2ec', dark: '#1b5951', bg: '#e9fbf7' },
  bsafe: { primary: '#0014aa', accent: '#56a7f5', light: '#e5f1fe', dark: '#000a55', bg: '#e5f1fe' },
  pension_plan: { primary: '#7b3da3', accent: '#b87ee6', light: '#f0e4fa', dark: '#5a2d78', bg: '#f7f0fc' },
  life_plan: { primary: '#9f52cc', accent: '#c48ae6', light: '#f0e4fa', dark: '#7b3da3', bg: '#f7f0fc' },
  switch_plan: { primary: '#00b28f', accent: '#21d9ac', light: '#cbf2ec', dark: '#1b5951', bg: '#e9fbf7' },
  solde_restant_du: { primary: '#00b28f', accent: '#21d9ac', light: '#cbf2ec', dark: '#1b5951', bg: '#e9fbf7' },
  kids_plan: { primary: '#00b28f', accent: '#21d9ac', light: '#cbf2ec', dark: '#1b5951', bg: '#e9fbf7' },
}

export const PRODUCT_ICONS: Record<Product, IconName> = {
  drive: 'car',
  home: 'home',
  travel: 'plane',
  bsafe: 'shield-check',
  pension_plan: 'gift',
  life_plan: 'shield-check',
  switch_plan: 'leaf',
  solde_restant_du: 'home',
  kids_plan: 'users',
}

export const TRANSITION = {
  duration: '300ms',
  easing: 'cubic-bezier(0.25, 0.8, 0.5, 1)',
} as const

export const PAGE_TRANSITION_STYLE = { animation: 'bal-fade-in 400ms cubic-bezier(0.25,0.8,0.5,1) both' } as const

export function getPriorityBarColor(filled: boolean, priority: number): string {
  if (!filled) return 'bg-grey-100'
  if (priority >= 4) return 'bg-danger'
  if (priority >= 3) return 'bg-warning'
  return 'bg-grey-300'
}

