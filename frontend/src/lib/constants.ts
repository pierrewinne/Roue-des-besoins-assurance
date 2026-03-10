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
