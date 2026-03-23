import type { NeedLevel } from './types.ts'
import { NEED_COLORS } from '../../lib/constants.ts'

export function getNeedLevel(needScore: number): NeedLevel {
  if (needScore <= 25) return 'low'
  if (needScore <= 50) return 'moderate'
  if (needScore <= 75) return 'high'
  return 'critical'
}

export function getNeedColor(level: NeedLevel): string {
  return NEED_COLORS[level]
}

// 5×5 Exposure × Coverage matrix → need score (V2 — replaces 3×3 to reduce discontinuities)
// Rows: exposure level (0=very_low, 1=low, 2=medium, 3=high, 4=very_high)
// Cols: coverage level (0=complete, 1=good, 2=partial, 3=weak, 4=none)
export const NEED_MATRIX: number[][] = [
  //  complete, good,  partial, weak,  none
  [    5,       15,    25,      35,    45],   // very low exposure
  [   10,       25,    40,      55,    65],   // low exposure
  [   20,       40,    55,      70,    80],   // medium exposure
  [   30,       55,    70,      85,    92],   // high exposure
  [   40,       65,    80,      92,    98],   // very high exposure
]

/** Convert a 0-100 score to a 0-4 matrix index (5 levels) */
export function toMatrixLevel(score0to100: number): number {
  if (score0to100 <= 20) return 0
  if (score0to100 <= 40) return 1
  if (score0to100 <= 60) return 2
  if (score0to100 <= 80) return 3
  return 4
}

export function computeNeedFromMatrix(exposureLevel: number, coverageLevel: number): number {
  const row = Math.min(Math.max(Math.round(exposureLevel), 0), 4)
  const col = Math.min(Math.max(Math.round(coverageLevel), 0), 4)
  return NEED_MATRIX[row][col]
}
