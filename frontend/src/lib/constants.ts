export const UNIVERSE_LABELS = {
  auto: 'Auto / Mobilité',
  habitation: 'Habitation / Propriétaire',
  prevoyance: 'Prévoyance',
  objets_valeur: 'Objets de valeur',
} as const

export const UNIVERSE_COLORS = {
  auto: '#3b82f6',
  habitation: '#8b5cf6',
  prevoyance: '#ec4899',
  objets_valeur: '#f59e0b',
} as const

export const NEED_COLORS = {
  low: '#22c55e',
  moderate: '#f97316',
  high: '#ef4444',
  critical: '#ef4444',
} as const

export const NEED_LABELS = {
  low: 'Besoin faible',
  moderate: 'Besoin modéré',
  high: 'Besoin élevé',
  critical: 'Besoin critique',
} as const

export type Universe = keyof typeof UNIVERSE_LABELS
