export const UNIVERSE_LABELS = {
  auto: 'Auto / Mobilité',
  habitation: 'Habitation / Propriétaire',
  prevoyance: 'Prévoyance',
  objets_valeur: 'Objets de valeur',
} as const

export const UNIVERSE_SHORT_LABELS = {
  auto: 'Auto',
  habitation: 'Habitation',
  prevoyance: 'Prévoyance',
  objets_valeur: 'Objets',
} as const

export const UNIVERSE_COLORS = {
  auto: '#293485',
  habitation: '#656ea8',
  prevoyance: '#0014aa',
  objets_valeur: '#3d4691',
} as const

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
} as const

export type Universe = keyof typeof UNIVERSE_LABELS

export function getScoreColorClass(score: number): string {
  if (score <= 25) return 'text-[#168741]'
  if (score <= 50) return 'text-[#c97612]'
  return 'text-[#d9304c]'
}

/* ─── Trivial Pursuit Wheel Config ─── */

export const UNIVERSE_WHEEL_LABELS: Record<Universe, { lines: [string, string]; subtitle: string }> = {
  auto: { lines: ['Vos', 'd\u00e9placements'], subtitle: '~2 min' },
  habitation: { lines: ['Votre', 'logement'], subtitle: '~2 min' },
  prevoyance: { lines: ['Votre', 'famille'], subtitle: '~1 min' },
  objets_valeur: { lines: ['Vos biens', 'pr\u00e9cieux'], subtitle: '~2 min' },
} as const

export const UNIVERSE_WHEEL_COLORS: Record<Universe, { base: string; light: string; dark: string; glow: string }> = {
  auto: { base: '#293485', light: '#3d4691', dark: '#1a2260', glow: 'rgba(41, 52, 133, 0.30)' },
  habitation: { base: '#0014aa', light: '#0029d4', dark: '#000d6e', glow: 'rgba(0, 20, 170, 0.30)' },
  prevoyance: { base: '#00b28f', light: '#2dd4bf', dark: '#008a6e', glow: 'rgba(0, 178, 143, 0.30)' },
  objets_valeur: { base: '#9f52cc', light: '#b87ee6', dark: '#7b3da3', glow: 'rgba(159, 82, 204, 0.30)' },
} as const

export const UNIVERSE_ICONS: Record<Universe, 'car' | 'home' | 'shield' | 'gift'> = {
  auto: 'car',
  habitation: 'home',
  prevoyance: 'shield',
  objets_valeur: 'gift',
} as const

export const UNIVERSE_ORDER: Universe[] = ['prevoyance', 'habitation', 'objets_valeur', 'auto']

// Angles for each universe on the wheel (clockwise from top)
export const UNIVERSE_ANGLES: Record<Universe, number> = {
  prevoyance: 0,
  habitation: 90,
  objets_valeur: 180,
  auto: 270,
} as const

// Quadrant mapping for NeedsWheel (new dual-ring layout)
export const UNIVERSE_TO_QUADRANT: Record<Universe, number> = {
  auto: 0,          // biens
  prevoyance: 1,    // personnes
  objets_valeur: 2, // futur
  habitation: 3,    // projets
} as const

export const QUADRANT_TO_UNIVERSE = ['auto', 'prevoyance', 'objets_valeur', 'habitation'] as const satisfies readonly Universe[]
