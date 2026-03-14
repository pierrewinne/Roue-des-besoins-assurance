import { describe, it, expect } from 'vitest'
import {
  getProfilQuestions,
  getQuadrantQuestions,
  getVisibleQuadrantQuestions,
  isProfilComplete,
  isQuadrantComplete,
  getQuadrantProgress,
  PROFIL_QUESTION_IDS,
  QUADRANT_QUESTION_IDS,
} from './quadrant-mapping.ts'

describe('getProfilQuestions', () => {
  it('returns all 8 profil questions', () => {
    expect(getProfilQuestions()).toHaveLength(8)
  })

  it('returns questions matching PROFIL_QUESTION_IDS', () => {
    const ids = getProfilQuestions().map(q => q.id)
    expect(ids).toEqual(PROFIL_QUESTION_IDS)
  })
})

describe('getQuadrantQuestions', () => {
  it('returns correct count for biens', () => {
    expect(getQuadrantQuestions('biens')).toHaveLength(QUADRANT_QUESTION_IDS.biens.length)
  })

  it('returns correct count for personnes', () => {
    expect(getQuadrantQuestions('personnes')).toHaveLength(QUADRANT_QUESTION_IDS.personnes.length)
  })

  it('returns empty array for projets (no questions)', () => {
    expect(getQuadrantQuestions('projets')).toHaveLength(0)
  })

  it('returns questions for futur', () => {
    expect(getQuadrantQuestions('futur')).toHaveLength(QUADRANT_QUESTION_IDS.futur.length)
  })
})

describe('getVisibleQuadrantQuestions', () => {
  it('filters out questions whose dependencies are not met', () => {
    // biens includes home_specifics which depends on housing_type in [house, townhouse]
    const visible = getVisibleQuadrantQuestions('biens', { housing_type: 'apartment', vehicle_count: 0 })
    const ids = visible.map(q => q.id)
    expect(ids).not.toContain('home_specifics')
    expect(ids).not.toContain('vehicle_details')
  })

  it('includes questions whose dependencies are met', () => {
    const visible = getVisibleQuadrantQuestions('biens', { housing_type: 'house', vehicle_count: 2 })
    const ids = visible.map(q => q.id)
    expect(ids).toContain('home_specifics')
    expect(ids).toContain('vehicle_details')
  })
})

describe('isProfilComplete', () => {
  const baseProfile = {
    residence_status: 'resident_gdl',
    age_range: '36_45',
    family_status: 'single',
    professional_status: 'employee',
    income_contributors: 'one',
    life_event: ['none'],
    income_range: '5k_8k',
  }

  it('returns true when all visible required profil questions are answered', () => {
    // single has no children_count dependency, so 7 answers suffice
    expect(isProfilComplete(baseProfile)).toBe(true)
  })

  it('returns false when a required answer is missing', () => {
    const { age_range: _, ...incomplete } = baseProfile
    expect(isProfilComplete(incomplete)).toBe(false)
  })

  it('returns true when children_count is answered for family with children', () => {
    expect(isProfilComplete({
      ...baseProfile,
      family_status: 'couple_with_children',
      children_count: 2,
    })).toBe(true)
  })

  it('returns false when children_count is missing for family with children', () => {
    expect(isProfilComplete({
      ...baseProfile,
      family_status: 'couple_with_children',
    })).toBe(false)
  })
})

describe('isQuadrantComplete', () => {
  it('returns true for projets (no questions)', () => {
    expect(isQuadrantComplete('projets', {})).toBe(true)
  })

  it('returns false when biens has no answers', () => {
    expect(isQuadrantComplete('biens', {})).toBe(false)
  })

  it('returns true when all visible biens questions answered (no vehicles)', () => {
    const answers = {
      housing_status: 'tenant',
      housing_type: 'apartment',
      home_contents_value: 'less_20k',
      valuable_possessions: ['none'],
      security_measures: ['none'],
      vehicle_count: 0,
      home_coverage_existing: 'none',
    }
    expect(isQuadrantComplete('biens', answers)).toBe(true)
  })
})

describe('getQuadrantProgress', () => {
  it('returns 0/0 for projets (no questions)', () => {
    expect(getQuadrantProgress('projets', {})).toEqual({ answered: 0, total: 0 })
  })

  it('returns correct progress for partially answered biens', () => {
    const progress = getQuadrantProgress('biens', {
      housing_status: 'tenant',
      housing_type: 'apartment',
      vehicle_count: 0,
    })
    expect(progress.answered).toBe(3)
    expect(progress.total).toBeGreaterThan(3)
  })

  it('counts only visible required questions in total', () => {
    // With apartment (no home_specifics) and 0 vehicles (no vehicle_details/usage/coverage/options)
    const progress = getQuadrantProgress('biens', {
      housing_type: 'apartment',
      vehicle_count: 0,
    })
    // housing_status, housing_type, home_contents_value, valuable_possessions,
    // security_measures, vehicle_count, home_coverage_existing = 7
    // (valuable_total_estimate hidden because valuable_possessions unanswered)
    expect(progress.total).toBeLessThan(QUADRANT_QUESTION_IDS.biens.length)
  })
})
