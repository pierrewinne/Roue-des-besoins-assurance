import { describe, it, expect } from 'vitest'
import { getNeedLevel, getNeedColor, NEED_MATRIX, computeNeedFromMatrix, toMatrixLevel } from './thresholds'

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

describe('NEED_MATRIX (5×5)', () => {
  it('has correct dimensions (5x5)', () => {
    expect(NEED_MATRIX).toHaveLength(5)
    for (const row of NEED_MATRIX) {
      expect(row).toHaveLength(5)
    }
  })

  it('increases need when coverage decreases (left to right)', () => {
    for (const row of NEED_MATRIX) {
      for (let col = 0; col < 4; col++) {
        expect(row[col]).toBeLessThan(row[col + 1])
      }
    }
  })

  it('increases need when exposure increases (top to bottom) for same coverage', () => {
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 4; row++) {
        expect(NEED_MATRIX[row][col]).toBeLessThanOrEqual(NEED_MATRIX[row + 1][col])
      }
    }
  })

  it('all values in matrix are between 0 and 100', () => {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        expect(NEED_MATRIX[row][col]).toBeGreaterThanOrEqual(0)
        expect(NEED_MATRIX[row][col]).toBeLessThanOrEqual(100)
      }
    }
  })

  it('diagonal values increase from top-left to bottom-right', () => {
    for (let i = 0; i < 4; i++) {
      expect(NEED_MATRIX[i][i]).toBeLessThan(NEED_MATRIX[i + 1][i + 1])
    }
  })

  it('corner values match expected needs', () => {
    expect(NEED_MATRIX[0][0]).toBe(5)   // very low exposure, complete coverage
    expect(NEED_MATRIX[4][4]).toBe(98)  // very high exposure, no coverage
    expect(NEED_MATRIX[0][4]).toBe(45)  // very low exposure, no coverage
    expect(NEED_MATRIX[4][0]).toBe(40)  // very high exposure, complete coverage
  })

  it('center value is moderate (55)', () => {
    expect(NEED_MATRIX[2][2]).toBe(55)
  })
})

describe('toMatrixLevel', () => {
  it('maps 0-20 to level 0', () => {
    expect(toMatrixLevel(0)).toBe(0)
    expect(toMatrixLevel(10)).toBe(0)
    expect(toMatrixLevel(20)).toBe(0)
  })

  it('maps 21-40 to level 1', () => {
    expect(toMatrixLevel(21)).toBe(1)
    expect(toMatrixLevel(30)).toBe(1)
    expect(toMatrixLevel(40)).toBe(1)
  })

  it('maps 41-60 to level 2', () => {
    expect(toMatrixLevel(41)).toBe(2)
    expect(toMatrixLevel(50)).toBe(2)
    expect(toMatrixLevel(60)).toBe(2)
  })

  it('maps 61-80 to level 3', () => {
    expect(toMatrixLevel(61)).toBe(3)
    expect(toMatrixLevel(70)).toBe(3)
    expect(toMatrixLevel(80)).toBe(3)
  })

  it('maps 81-100 to level 4', () => {
    expect(toMatrixLevel(81)).toBe(4)
    expect(toMatrixLevel(90)).toBe(4)
    expect(toMatrixLevel(100)).toBe(4)
  })
})

describe('computeNeedFromMatrix', () => {
  it('returns correct value for exact indices', () => {
    expect(computeNeedFromMatrix(0, 0)).toBe(5)   // very low exposure, complete coverage
    expect(computeNeedFromMatrix(0, 4)).toBe(45)  // very low exposure, no coverage
    expect(computeNeedFromMatrix(4, 4)).toBe(98)  // very high exposure, no coverage
    expect(computeNeedFromMatrix(2, 2)).toBe(55)  // medium exposure, partial coverage
  })

  it('clamps out-of-range values', () => {
    expect(computeNeedFromMatrix(-1, 0)).toBe(5)   // clamped to row 0
    expect(computeNeedFromMatrix(7, 0)).toBe(40)   // clamped to row 4
    expect(computeNeedFromMatrix(0, -1)).toBe(5)   // clamped to col 0
    expect(computeNeedFromMatrix(0, 7)).toBe(45)   // clamped to col 4
  })

  it('rounds fractional indices', () => {
    expect(computeNeedFromMatrix(0.4, 0)).toBe(5)   // rounds to 0
    expect(computeNeedFromMatrix(0.6, 0)).toBe(10)  // rounds to 1
    expect(computeNeedFromMatrix(2.5, 2)).toBe(70)  // rounds to 3
  })
})

describe('computeNeedFromMatrix - edge cases extremes', () => {
  it('negative indices are clamped to 0', () => {
    expect(computeNeedFromMatrix(-100, -100)).toBe(NEED_MATRIX[0][0])
  })

  it('very large indices are clamped to 4', () => {
    expect(computeNeedFromMatrix(1000, 1000)).toBe(NEED_MATRIX[4][4])
  })

  it('mixed extreme indices work correctly', () => {
    expect(computeNeedFromMatrix(-5, 1000)).toBe(NEED_MATRIX[0][4])
    expect(computeNeedFromMatrix(1000, -5)).toBe(NEED_MATRIX[4][0])
  })
})

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
