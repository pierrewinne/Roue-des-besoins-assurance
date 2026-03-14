// Video constants — Teaser 36s "Reveal Concentrique" V2
export const FPS = 30
export const WIDTH = 1920
export const HEIGHT = 1080
export const DURATION_SECONDS = 36
export const TOTAL_FRAMES = FPS * DURATION_SECONDS

// Baloise palette
export const NAVY = '#000D6E'
export const NAVY_DARK = '#000739'
export const NAVY_MID = '#0A1F8C'
export const WHITE = '#FFFFFF'
export const GREY_300 = '#b6b6b6'

// Quadrant colors — video-optimized gradients (brighter for contrast)
export const QUADRANT_SEGMENTS = [
  {
    key: 'biens' as const,
    lines: ['Vos', 'biens'],
    angle: 315,
    outerGrad: ['#3D4691', '#6B78C4'],
    innerGrad: ['#4E5BA6', '#8890D0'],
    glowColor: 'rgba(78, 91, 166, 0.40)',
    icons: [
      { src: '/icons/wheel/biens-house.png', anglePct: 0.15, radiusPct: 0.55 },
      { src: '/icons/wheel/biens-car.png', anglePct: 0.40, radiusPct: 0.55 },
      { src: '/icons/wheel/biens-motorcycle.png', anglePct: 0.65, radiusPct: 0.55 },
      { src: '/icons/wheel/biens-watch.png', anglePct: 0.88, radiusPct: 0.55 },
    ],
  },
  {
    key: 'personnes' as const,
    lines: ['Vos', 'proches'],
    angle: 45,
    outerGrad: ['#0014aa', '#1D4ED8'],
    innerGrad: ['#1D3FD1', '#4A6AE8'],
    glowColor: 'rgba(0, 20, 170, 0.40)',
    icons: [
      { src: '/icons/wheel/personnes-couple.png', anglePct: 0.20, radiusPct: 0.55 },
      { src: '/icons/wheel/personnes-travel.png', anglePct: 0.50, radiusPct: 0.55 },
      { src: '/icons/wheel/personnes-accidents.png', anglePct: 0.80, radiusPct: 0.55 },
    ],
  },
  {
    key: 'projets' as const,
    lines: ['Vos', 'projets'],
    angle: 225,
    outerGrad: ['#008A6E', '#2DD4AE'],
    innerGrad: ['#00b28f', '#4ECDB2'],
    glowColor: 'rgba(0, 178, 143, 0.35)',
    icons: [
      { src: '/icons/wheel/projets-dream-house.png', anglePct: 0.25, radiusPct: 0.55 },
      { src: '/icons/wheel/projets-savings.png', anglePct: 0.55, radiusPct: 0.55 },
      { src: '/icons/wheel/projets-lightbulb.png', anglePct: 0.82, radiusPct: 0.55 },
    ],
  },
  {
    key: 'futur' as const,
    lines: ['Votre', 'avenir'],
    angle: 135,
    outerGrad: ['#7B3DA6', '#B86EE0'],
    innerGrad: ['#9f52cc', '#C084E4'],
    glowColor: 'rgba(159, 82, 204, 0.35)',
    icons: [
      { src: '/icons/wheel/futur-retirement.png', anglePct: 0.25, radiusPct: 0.55 },
      { src: '/icons/wheel/futur-pension.png', anglePct: 0.55, radiusPct: 0.55 },
      { src: '/icons/wheel/futur-umbrella.png', anglePct: 0.82, radiusPct: 0.55 },
    ],
  },
] as const

// Scoring colors
export const SCORE_COLORS = {
  low: '#168741',
  moderate: '#c97612',
  high: '#d9304c',
  critical: '#99172d',
} as const

// Wheel geometry (matching app viewBox 500x500)
export const WHEEL = {
  VIEWBOX: 500,
  CX: 250,
  CY: 250,
  CENTER_R: 46,
  INNER_R1: 54,
  INNER_R2: 130,
  RING_GAP: 3,
  OUTER_R1: 133,
  OUTER_R2: 228,
  HALF: 45,
} as const

// Demo diagnostic fill (shared between Analyse and Results scenes)
export const DEMO_FILL_TARGETS = [0.78, 0.92, 0.45, 0.65] as const
export const DEMO_FILL_COLORS = [SCORE_COLORS.moderate, SCORE_COLORS.high, SCORE_COLORS.low, SCORE_COLORS.moderate] as const

// Font
export const FONT_HEADLINE = "'BaloiseCreateHeadline','Inter',sans-serif"
export const FONT_BODY = "'BaloiseCreateText','Inter',sans-serif"

// Scene timing V2 — 5 actes (frames at 30fps)
export const S = {
  // Act 1: L'angle mort (0-5s)
  ACT1_START: 0,
  ACT1_END: 5 * FPS,
  // Act 2: Wheel Build (5-12s)
  ACT2_START: 5 * FPS,
  ACT2_END: 12 * FPS,
  // Act 3: Analyse flash (12-17s)
  ACT3_START: 12 * FPS,
  ACT3_END: 17 * FPS,
  // Act 4: Révélation (17-30s)
  ACT4_START: 17 * FPS,
  ACT4_END: 30 * FPS,
  // Act 5: Close (30-36s)
  ACT5_START: 30 * FPS,
  ACT5_END: 36 * FPS,
} as const
