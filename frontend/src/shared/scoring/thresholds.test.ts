import { describe, it, expect } from 'vitest'
import { getNeedLevel, getNeedColor, NEED_MATRIX, computeNeedFromMatrix } from './thresholds'

describe('getNeedLevel', () => {
  it('returns low for scores 0-25', () => {
    expect(getNeedLevel(0)).toBe('low')
    expect(getNeedLevel(10)).toBe('low')
    expect(getNeedLevel(25)).toBe('low')
  })

  it('returns moderate for scores 26-50', () => {
    expect(getNeedLevel(26)).toBe('moderate')
    expect(getNeedLevel(35)).toBe('moderate')
    expect(getNeedLevel(50)).toBe('moderate')
  })

  it('returns high for scores 51-75', () => {
    expect(getNeedLevel(51)).toBe('high')
    expect(getNeedLevel(60)).toBe('high')
    expect(getNeedLevel(75)).toBe('high')
  })

  it('returns critical for scores above 75', () => {
    expect(getNeedLevel(76)).toBe('critical')
    expect(getNeedLevel(85)).toBe('critical')
    expect(getNeedLevel(100)).toBe('critical')
  })
})

describe('getNeedColor', () => {
  it('returns correct colors for each level', () => {
    expect(getNeedColor('low')).toBe('#168741')
    expect(getNeedColor('moderate')).toBe('#c97612')
    expect(getNeedColor('high')).toBe('#d9304c')
    expect(getNeedColor('critical')).toBe('#99172d')
  })
})

describe('NEED_MATRIX', () => {
  it('has correct dimensions (3x3)', () => {
    expect(NEED_MATRIX).toHaveLength(3)
    for (const row of NEED_MATRIX) {
      expect(row).toHaveLength(3)
    }
  })

  it('increases need when coverage decreases (left to right)', () => {
    for (const row of NEED_MATRIX) {
      expect(row[0]).toBeLessThan(row[1])
      expect(row[1]).toBeLessThan(row[2])
    }
  })

  it('increases need when exposure increases (top to bottom) for same coverage', () => {
    for (let col = 0; col < 3; col++) {
      expect(NEED_MATRIX[0][col]).toBeLessThanOrEqual(NEED_MATRIX[1][col])
      expect(NEED_MATRIX[1][col]).toBeLessThanOrEqual(NEED_MATRIX[2][col])
    }
  })
})

describe('computeNeedFromMatrix', () => {
  it('returns correct value for exact indices', () => {
    expect(computeNeedFromMatrix(0, 0)).toBe(10)  // low exposure, complete coverage
    expect(computeNeedFromMatrix(0, 2)).toBe(40)  // low exposure, no coverage
    expect(computeNeedFromMatrix(2, 2)).toBe(95)  // high exposure, no coverage
    expect(computeNeedFromMatrix(1, 1)).toBe(60)  // medium exposure, partial coverage
  })

  it('clamps out-of-range values', () => {
    expect(computeNeedFromMatrix(-1, 0)).toBe(10)  // clamped to row 0
    expect(computeNeedFromMatrix(5, 0)).toBe(35)   // clamped to row 2
    expect(computeNeedFromMatrix(0, -1)).toBe(10)  // clamped to col 0
    expect(computeNeedFromMatrix(0, 5)).toBe(40)   // clamped to col 2
  })

  it('rounds fractional indices', () => {
    expect(computeNeedFromMatrix(0.4, 0)).toBe(10)  // rounds to 0
    expect(computeNeedFromMatrix(0.6, 0)).toBe(15)  // rounds to 1
    expect(computeNeedFromMatrix(1.5, 1)).toBe(85)  // rounds to 2
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — SEUILS (THRESHOLDS)
// ═══════════════════════════════════════════════════════════════════

describe('getNeedLevel - bornes exactes', () => {
  it('returns low for score = 0 (minimum)', () => {
    expect(getNeedLevel(0)).toBe('low')
  })

  it('returns low for score = 25 (boundary)', () => {
    expect(getNeedLevel(25)).toBe('low')
  })

  it('returns moderate for score = 26 (just above low boundary)', () => {
    expect(getNeedLevel(26)).toBe('moderate')
  })

  it('returns moderate for score = 50 (boundary)', () => {
    expect(getNeedLevel(50)).toBe('moderate')
  })

  it('returns high for score = 51 (just above moderate boundary)', () => {
    expect(getNeedLevel(51)).toBe('high')
  })

  it('returns high for score = 75 (boundary)', () => {
    expect(getNeedLevel(75)).toBe('high')
  })

  it('returns critical for score = 76 (just above high boundary)', () => {
    expect(getNeedLevel(76)).toBe('critical')
  })

  it('returns critical for score = 100 (maximum)', () => {
    expect(getNeedLevel(100)).toBe('critical')
  })
})

describe('NEED_MATRIX - valeurs specifiques', () => {
  it('low exposure + complete coverage = minimal need (10)', () => {
    expect(NEED_MATRIX[0][0]).toBe(10)
  })

  it('high exposure + no coverage = maximal need (95)', () => {
    expect(NEED_MATRIX[2][2]).toBe(95)
  })

  it('medium exposure + partial coverage = moderate need (60)', () => {
    expect(NEED_MATRIX[1][1]).toBe(60)
  })

  it('all values in matrix are between 0 and 100', () => {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        expect(NEED_MATRIX[row][col]).toBeGreaterThanOrEqual(0)
        expect(NEED_MATRIX[row][col]).toBeLessThanOrEqual(100)
      }
    }
  })

  it('diagonal values increase from top-left to bottom-right', () => {
    expect(NEED_MATRIX[0][0]).toBeLessThan(NEED_MATRIX[1][1])
    expect(NEED_MATRIX[1][1]).toBeLessThan(NEED_MATRIX[2][2])
  })
})

describe('computeNeedFromMatrix - edge cases extremes', () => {
  it('negative indices are clamped to 0', () => {
    expect(computeNeedFromMatrix(-100, -100)).toBe(NEED_MATRIX[0][0])
  })

  it('very large indices are clamped to 2', () => {
    expect(computeNeedFromMatrix(1000, 1000)).toBe(NEED_MATRIX[2][2])
  })

  it('mixed extreme indices work correctly', () => {
    expect(computeNeedFromMatrix(-5, 1000)).toBe(NEED_MATRIX[0][2])
    expect(computeNeedFromMatrix(1000, -5)).toBe(NEED_MATRIX[2][0])
  })
})

describe('getNeedColor - exhaustivite', () => {
  it('each need level has a distinct color', () => {
    const colors = new Set([
      getNeedColor('low'),
      getNeedColor('moderate'),
      getNeedColor('high'),
      getNeedColor('critical'),
    ])
    expect(colors.size).toBe(4)
  })

  it('colors are valid hex strings', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/
    expect(getNeedColor('low')).toMatch(hexRegex)
    expect(getNeedColor('moderate')).toMatch(hexRegex)
    expect(getNeedColor('high')).toMatch(hexRegex)
    expect(getNeedColor('critical')).toMatch(hexRegex)
  })
})
