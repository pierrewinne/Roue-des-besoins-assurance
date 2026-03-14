// Video constants — Teaser 36s "Reveal Concentrique"
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

// Quadrant colors — exact match with app NeedsWheel.tsx
export const QUADRANT_SEGMENTS = [
  {
    key: 'biens' as const,
    lines: ['Protection', 'des biens'],
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
    lines: ['Protection', 'des personnes'],
    angle: 45,
    outerGrad: ['#1D4ED8', '#3B82F6'],
    innerGrad: ['#2563EB', '#60A5FA'],
    glowColor: 'rgba(37, 99, 235, 0.40)',
    icons: [
      { src: '/icons/wheel/personnes-couple.png', anglePct: 0.20, radiusPct: 0.55 },
      { src: '/icons/wheel/personnes-travel.png', anglePct: 0.50, radiusPct: 0.55 },
      { src: '/icons/wheel/personnes-accidents.png', anglePct: 0.80, radiusPct: 0.55 },
    ],
  },
  {
    key: 'projets' as const,
    lines: ['Protection', 'des projets'],
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
    lines: ['Protection', 'du futur'],
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

// Demo diagnostic fill (shared between Diagnostic and Results scenes)
export const DEMO_FILL_TARGETS = [0.78, 0.92, 0.45, 0.65] as const
export const DEMO_FILL_COLORS = [SCORE_COLORS.moderate, SCORE_COLORS.high, SCORE_COLORS.low, SCORE_COLORS.moderate] as const

// Font
export const FONT_HEADLINE = "'BaloiseCreateHeadline','Inter',sans-serif"
export const FONT_BODY = "'BaloiseCreateText','Inter',sans-serif"

// Scene timing (frames at 30fps)
export const S = {
  // Scene 1: "VOUS" (0-3s)
  ORIGIN_START: 0,
  ORIGIN_END: 3 * FPS,
  // Scene 2: Wheel build (3-10s)
  BUILD_START: 3 * FPS,
  BUILD_END: 10 * FPS,
  // Scene 3: Diagnostic (10-20s)
  DIAG_START: 10 * FPS,
  DIAG_END: 20 * FPS,
  // Scene 4: Results (20-28s)
  RESULTS_START: 20 * FPS,
  RESULTS_END: 28 * FPS,
  // Scene 5: Close (28-36s)
  CLOSE_START: 28 * FPS,
  CLOSE_END: 36 * FPS,
} as const
