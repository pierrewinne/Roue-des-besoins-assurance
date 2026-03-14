// Video constants — Baloise design system
export const FPS = 30
export const WIDTH = 1920
export const HEIGHT = 1080
export const DURATION_SECONDS = 120 // 2 minutes
export const TOTAL_FRAMES = FPS * DURATION_SECONDS

// Colors
export const NAVY = '#000D6E'
export const NAVY_DARK = '#000739'
export const NAVY_MID = '#0A1F8C'
export const WHITE = '#FFFFFF'
export const GREY_300 = '#b6b6b6'
export const GREY_400 = '#747474'

// Quadrant colors
export const QUADRANT_COLORS = {
  biens: { base: '#293485', light: '#4E5BA6', glow: 'rgba(78,91,166,0.4)' },
  personnes: { base: '#0014aa', light: '#3B82F6', glow: 'rgba(37,99,235,0.4)' },
  projets: { base: '#00b28f', light: '#2DD4AE', glow: 'rgba(0,178,143,0.35)' },
  futur: { base: '#9f52cc', light: '#B86EE0', glow: 'rgba(159,82,204,0.35)' },
} as const

// Scoring colors
export const SCORE_COLORS = {
  low: '#168741',
  moderate: '#c97612',
  high: '#d9304c',
  critical: '#99172d',
} as const

// Quadrant labels
export const QUADRANT_LABELS = {
  biens: { line1: 'Protection', line2: 'des biens' },
  personnes: { line1: 'Protection', line2: 'des personnes' },
  projets: { line1: 'Protection', line2: 'des projets' },
  futur: { line1: 'Protection', line2: 'du futur' },
} as const

export const QUADRANT_ORDER = ['biens', 'personnes', 'projets', 'futur'] as const

// Font
export const FONT_HEADLINE = "'Inter', sans-serif"
export const FONT_BODY = "'Inter', sans-serif"

// Easing (matching CSS cubic-bezier(0.25, 0.8, 0.5, 1))
export function baloiseEase(t: number): number {
  // Approximation of cubic-bezier(0.25, 0.8, 0.5, 1)
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Timing (in frames at 30fps)
export const SCENES = {
  // Scene 1: Opening card
  OPENING_START: 0,
  OPENING_END: 4 * FPS, // 0-4s

  // Scene 2: Testimonial quotes (kinetic typography)
  QUOTES_START: 4 * FPS,
  QUOTES_END: 48 * FPS, // 4-48s

  // Scene 3: Confusion montage (floating jargon words)
  CONFUSION_START: 48 * FPS,
  CONFUSION_END: 58 * FPS, // 48-58s

  // Scene 4: First wheel teaser (empty structure)
  WHEEL_TEASE_START: 58 * FPS,
  WHEEL_TEASE_END: 63 * FPS, // 58-63s

  // Scene 5: Pivot card
  PIVOT_START: 63 * FPS,
  PIVOT_END: 71 * FPS, // 63-71s

  // Scene 6: Full wheel reveal
  WHEEL_REVEAL_START: 71 * FPS,
  WHEEL_REVEAL_END: 88 * FPS, // 71-88s

  // Scene 7: App UI teaser
  APP_TEASE_START: 88 * FPS,
  APP_TEASE_END: 100 * FPS, // 88-100s

  // Scene 8: Reaction quotes
  REACTIONS_START: 100 * FPS,
  REACTIONS_END: 110 * FPS, // 100-110s

  // Scene 9: Cliffhanger (score gauge truncated)
  CLIFFHANGER_START: 110 * FPS,
  CLIFFHANGER_END: 115 * FPS, // 110-115s

  // Scene 10: Signature + CTA
  SIGNATURE_START: 115 * FPS,
  SIGNATURE_END: 120 * FPS, // 115-120s
} as const
