import { NEED_COLORS } from '../../lib/constants.ts'
import type { Recommendation } from '../../shared/scoring/types.ts'

/** Baloise design tokens for @react-pdf/renderer (CSS variables not supported) */
export const BALOISE = {
  navy: '#000d6e',
  navyDark: '#000739',
  navyLight: '#e5e7f0',
  white: '#ffffff',
  grey50: '#fafafa',
  grey100: '#f6f6f6',
  grey200: '#e8e8e8',
  grey300: '#b6b6b6',
  grey400: '#747474',
} as const

export const ACTION_STYLES: Record<Recommendation['type'], { bg: string; border: string }> = {
  immediate: { bg: '#ffeef1', border: NEED_COLORS.high },
  event: { bg: '#fff9e8', border: NEED_COLORS.moderate },
  deferred: { bg: BALOISE.grey100, border: BALOISE.grey300 },
  optimization: { bg: '#e9fbf7', border: '#00b28f' },
}

export const PRIORITY_DOTS = [0, 1, 2, 3, 4] as const

export interface AdvisorInfo {
  name: string
  email?: string
  phone?: string
}
