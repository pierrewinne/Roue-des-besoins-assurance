import { describe, it, expect } from 'vitest'
import {
  asString, asNumber, asStringArray,
  countNonNone, includesAny,
  HIGH_RISK_SPORTS, POG_FRONTALIER,
  isResidentGDL, isResidentOrFrontalier, isTravelEligible, isFuturEligible,
} from './answer-helpers.ts'

// ── Type guards ──

describe('asString', () => {
  it('returns string as-is', () => {
    expect(asString('hello')).toBe('hello')
  })
  it('returns empty string for number', () => {
    expect(asString(42)).toBe('')
  })
  it('returns empty string for undefined', () => {
    expect(asString(undefined)).toBe('')
  })
  it('returns empty string for null', () => {
    expect(asString(null)).toBe('')
  })
  it('returns empty string for boolean', () => {
    expect(asString(true)).toBe('')
  })
  it('returns empty string for array', () => {
    expect(asString(['a'])).toBe('')
  })
})

describe('asNumber', () => {
  it('returns number as-is', () => {
    expect(asNumber(42)).toBe(42)
  })
  it('returns 0 for string', () => {
    expect(asNumber('hello')).toBe(0)
  })
  it('returns 0 for undefined', () => {
    expect(asNumber(undefined)).toBe(0)
  })
  it('returns 0 for null', () => {
    expect(asNumber(null)).toBe(0)
  })
  it('returns 0 for boolean', () => {
    expect(asNumber(true)).toBe(0)
  })
  it('handles zero correctly', () => {
    expect(asNumber(0)).toBe(0)
  })
})

describe('asStringArray', () => {
  it('returns string array as-is', () => {
    expect(asStringArray(['a', 'b'])).toEqual(['a', 'b'])
  })
  it('filters out non-string elements', () => {
    expect(asStringArray(['a', 42, 'b', true])).toEqual(['a', 'b'])
  })
  it('returns empty array for non-array', () => {
    expect(asStringArray('hello')).toEqual([])
  })
  it('returns empty array for undefined', () => {
    expect(asStringArray(undefined)).toEqual([])
  })
  it('returns empty array for null', () => {
    expect(asStringArray(null)).toEqual([])
  })
})

// ── Array utilities ──

describe('countNonNone', () => {
  it('counts strings that are not "none"', () => {
    expect(countNonNone(['a', 'b', 'c'])).toBe(3)
  })
  it('excludes "none" from count', () => {
    expect(countNonNone(['a', 'none', 'b'])).toBe(2)
  })
  it('returns 0 for array of only "none"', () => {
    expect(countNonNone(['none'])).toBe(0)
  })
  it('returns 0 for empty array', () => {
    expect(countNonNone([])).toBe(0)
  })
  it('returns 0 for non-array', () => {
    expect(countNonNone('hello')).toBe(0)
  })
  it('returns 0 for undefined', () => {
    expect(countNonNone(undefined)).toBe(0)
  })
  it('ignores non-string elements', () => {
    expect(countNonNone([42, true, 'a'])).toBe(1)
  })
})

describe('includesAny', () => {
  it('returns true if array includes at least one value', () => {
    expect(includesAny(['a', 'b', 'c'], ['b', 'd'])).toBe(true)
  })
  it('returns false if array includes none of the values', () => {
    expect(includesAny(['a', 'b'], ['c', 'd'])).toBe(false)
  })
  it('returns false for empty array', () => {
    expect(includesAny([], ['a'])).toBe(false)
  })
  it('returns false for empty values', () => {
    expect(includesAny(['a'], [])).toBe(false)
  })
})

// ── Constants ──

describe('HIGH_RISK_SPORTS', () => {
  it('contains expected sports', () => {
    expect(HIGH_RISK_SPORTS).toContain('winter_sports')
    expect(HIGH_RISK_SPORTS).toContain('combat_contact')
    expect(HIGH_RISK_SPORTS).toHaveLength(6)
  })
})

describe('POG_FRONTALIER', () => {
  it('contains 3 frontalier codes', () => {
    expect(POG_FRONTALIER).toEqual(['frontalier_fr', 'frontalier_be', 'frontalier_de'])
  })
})

// ── Eligibility functions ──

describe('isResidentGDL', () => {
  it('returns true for resident_gdl', () => {
    expect(isResidentGDL({ residence_status: 'resident_gdl' })).toBe(true)
  })
  it('returns false for frontalier', () => {
    expect(isResidentGDL({ residence_status: 'frontalier_fr' })).toBe(false)
  })
  it('returns false for empty answers (restrictive)', () => {
    expect(isResidentGDL({})).toBe(false)
  })
  it('returns false for undefined residence', () => {
    expect(isResidentGDL({ residence_status: undefined })).toBe(false)
  })
})

describe('isResidentOrFrontalier', () => {
  it('returns true for resident_gdl', () => {
    expect(isResidentOrFrontalier({ residence_status: 'resident_gdl' })).toBe(true)
  })
  it('returns true for frontalier_fr', () => {
    expect(isResidentOrFrontalier({ residence_status: 'frontalier_fr' })).toBe(true)
  })
  it('returns true for frontalier_be', () => {
    expect(isResidentOrFrontalier({ residence_status: 'frontalier_be' })).toBe(true)
  })
  it('returns true for frontalier_de', () => {
    expect(isResidentOrFrontalier({ residence_status: 'frontalier_de' })).toBe(true)
  })
  it('returns false for "other"', () => {
    expect(isResidentOrFrontalier({ residence_status: 'other' })).toBe(false)
  })
  it('returns false for empty answers', () => {
    expect(isResidentOrFrontalier({})).toBe(false)
  })
})

describe('isTravelEligible', () => {
  it('returns true for resident under 80', () => {
    expect(isTravelEligible({ residence_status: 'resident_gdl', age_range: '36_45' })).toBe(true)
  })
  it('returns true for frontalier under 80', () => {
    expect(isTravelEligible({ residence_status: 'frontalier_fr', age_range: '56_65' })).toBe(true)
  })
  it('returns false for 80_plus', () => {
    expect(isTravelEligible({ residence_status: 'resident_gdl', age_range: '80_plus' })).toBe(false)
  })
  it('returns false for non-eligible residence', () => {
    expect(isTravelEligible({ residence_status: 'other', age_range: '36_45' })).toBe(false)
  })
  it('returns false for empty answers', () => {
    expect(isTravelEligible({})).toBe(false)
  })
})

describe('isFuturEligible', () => {
  it('returns true for resident, working age, active profession', () => {
    expect(isFuturEligible({ residence_status: 'resident_gdl', age_range: '36_45', professional_status: 'employee' })).toBe(true)
  })
  it('returns false for non-resident', () => {
    expect(isFuturEligible({ residence_status: 'frontalier_fr', age_range: '36_45', professional_status: 'employee' })).toBe(false)
  })
  it('returns false for 65_plus', () => {
    expect(isFuturEligible({ residence_status: 'resident_gdl', age_range: '65_plus', professional_status: 'employee' })).toBe(false)
  })
  it('returns false for 80_plus', () => {
    expect(isFuturEligible({ residence_status: 'resident_gdl', age_range: '80_plus', professional_status: 'employee' })).toBe(false)
  })
  it('returns false for student', () => {
    expect(isFuturEligible({ residence_status: 'resident_gdl', age_range: '18_25', professional_status: 'student' })).toBe(false)
  })
  it('returns false for inactive', () => {
    expect(isFuturEligible({ residence_status: 'resident_gdl', age_range: '36_45', professional_status: 'inactive' })).toBe(false)
  })
  it('returns true for independent', () => {
    expect(isFuturEligible({ residence_status: 'resident_gdl', age_range: '46_55', professional_status: 'independent' })).toBe(true)
  })
  it('returns false for empty answers', () => {
    expect(isFuturEligible({})).toBe(false)
  })
})
