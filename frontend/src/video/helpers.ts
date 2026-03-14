import { interpolate, Easing } from 'remotion'
import { WHEEL } from './constants'

const { CX, CY } = WHEEL

// Hoisted easing functions — avoid per-call closure allocation
const EASE_OUT_CUBIC = Easing.out(Easing.cubic)
const EASE_IN_CUBIC = Easing.in(Easing.cubic)
const EASE_OUT_BACK = Easing.out(Easing.back(1.05))

/** Fade in opacity over a frame range */
export function fadeIn(frame: number, start: number, duration = 20): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT_CUBIC,
  })
}

/** Fade out opacity */
export function fadeOut(frame: number, start: number, duration = 15): number {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_IN_CUBIC,
  })
}

/** Slide up from offset */
export function slideUp(frame: number, start: number, distance = 30, duration = 20): number {
  return interpolate(frame, [start, start + duration], [distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT_CUBIC,
  })
}

/** Scale with overshoot */
export function scaleIn(frame: number, start: number, duration = 18): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT_BACK,
  })
}

/** Arc draw progress 0-1 */
export function arcDraw(frame: number, start: number, duration = 25): number {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT_CUBIC,
  })
}

/** Subtle breathing pulse */
export function pulse(frame: number, speed = 0.02, amount = 0.005): number {
  return 1 + Math.sin(frame * speed * Math.PI * 2) * amount
}

// ─── SVG geometry helpers ───────────────────────────────────

export function polarXY(r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)]
}

export function arcSectorPath(r1: number, r2: number, a1: number, a2: number): string {
  const [ox1, oy1] = polarXY(r2, a1)
  const [ox2, oy2] = polarXY(r2, a2)
  const [ix2, iy2] = polarXY(r1, a2)
  const [ix1, iy1] = polarXY(r1, a1)
  const lg = ((a2 - a1 + 360) % 360) > 180 ? 1 : 0
  return `M${ox1},${oy1} A${r2},${r2} 0 ${lg} 1 ${ox2},${oy2} L${ix2},${iy2} A${r1},${r1} 0 ${lg} 0 ${ix1},${iy1} Z`
}

/** Gradient direction from angle */
export function gradientCoords(angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return {
    x1: `${50 - cos * 50}%`,
    y1: `${50 - sin * 50}%`,
    x2: `${50 + cos * 50}%`,
    y2: `${50 + sin * 50}%`,
  }
}
