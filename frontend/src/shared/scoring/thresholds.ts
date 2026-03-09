import type { NeedLevel } from './types.ts'

export function getNeedLevel(needScore: number): NeedLevel {
  if (needScore <= 25) return 'low'
  if (needScore <= 50) return 'moderate'
  if (needScore <= 75) return 'high'
  return 'critical'
}

export function getNeedColor(level: NeedLevel): string {
  switch (level) {
    case 'low': return '#22c55e'
    case 'moderate': return '#f97316'
    case 'high': return '#ef4444'
    case 'critical': return '#ef4444'
  }
}

// Exposure x Coverage matrix → need score
// Rows: exposure level (low/medium/high)
// Cols: coverage level (complete/partial/none)
export const NEED_MATRIX: number[][] = [
  // complete, partial, none
  [10, 35, 40],   // low exposure
  [15, 60, 85],   // medium exposure
  [35, 85, 95],   // high exposure
]

export function computeNeedFromMatrix(exposureLevel: number, coverageLevel: number): number {
  // exposureLevel: 0=low, 1=medium, 2=high
  // coverageLevel: 0=complete, 1=partial, 2=none
  const row = Math.min(Math.max(Math.round(exposureLevel), 0), 2)
  const col = Math.min(Math.max(Math.round(coverageLevel), 0), 2)
  return NEED_MATRIX[row][col]
}
