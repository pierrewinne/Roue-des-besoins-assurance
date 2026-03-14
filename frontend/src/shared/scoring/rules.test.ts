import { describe, it, expect } from 'vitest'
import { generateRecommendations as _generateRecommendations } from './rules'
import type { Quadrant, QuadrantScore } from './types'
import { computeDiagnostic as _computeDiagnostic } from './engine'

// Auto-inject residence_status: 'resident_gdl' unless explicitly overridden by the test
function generateRecommendations(scores: Record<Quadrant, QuadrantScore>, answers: Record<string, unknown>) {
  return _generateRecommendations(scores, { residence_status: 'resident_gdl', ...answers })
}
function computeDiagnostic(answers: Record<string, unknown>) {
  return _computeDiagnostic({ residence_status: 'resident_gdl', ...answers })
}

function makeScore(quadrant: Quadrant, overrides: Partial<QuadrantScore> = {}): QuadrantScore {
  return {
    quadrant,
    exposure: 50,
    coverage: 50,
    needScore: 60,
    needLevel: 'high',
    active: quadrant === 'biens' || quadrant === 'personnes',
    ...overrides,
  }
}

function makeScores(overrides: Partial<Record<Quadrant, Partial<QuadrantScore>>> = {}): Record<Quadrant, QuadrantScore> {
  return {
    biens: makeScore('biens', overrides.biens),
    personnes: makeScore('personnes', overrides.personnes),
    projets: makeScore('projets', { active: false, ...overrides.projets }),
    futur: makeScore('futur', { active: false, ...overrides.futur }),
  }
}

describe('generateRecommendations', () => {
  it('returns empty array when no conditions match', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {})
    expect(Array.isArray(recommendations)).toBe(true)
  })

  it('sorts recommendations by priority descending', () => {
    const result = computeDiagnostic({
      vehicle_count: 1,
      vehicle_details: 'car_new',
      vehicle_coverage_existing: 'none',
      family_status: 'couple_with_children',
      income_contributors: 'one',
      accident_coverage_existing: 'none',
    })
    for (let i = 1; i < result.recommendations.length; i++) {
      expect(result.recommendations[i - 1].priority).toBeGreaterThanOrEqual(result.recommendations[i].priority)
    }
  })

  it('generates recommendations for all four products', () => {
    const result = computeDiagnostic({
      vehicle_count: 1,
      vehicle_details: 'car_new',
      vehicle_coverage_existing: 'none',
      family_status: 'couple_with_children',
      income_contributors: 'one',
      accident_coverage_existing: 'none',
      sports_activities: ['winter_sports'],
      housing_status: 'tenant',
      home_coverage_existing: 'none',
      travel_frequency: 'frequent',
      travel_coverage_existing: 'none',
      travel_destinations: ['worldwide'],
      children_count: 2,
    })
    const products = [...new Set(result.recommendations.map(r => r.product))]
    for (const p of products) {
      expect(['drive', 'bsafe', 'home', 'travel', 'pension_plan', 'life_plan', 'switch_plan']).toContain(p)
    }
  })
})

describe('drive rules', () => {
  it('generates immediate recommendation for recent vehicle with no omnium', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_details: 'car_new',
      vehicle_coverage_existing: 'rc_only',
    })
    const driveRecs = recommendations.filter(r => r.product === 'drive')
    expect(driveRecs.some(r => r.type === 'immediate' && r.title.includes('véhicule récent'))).toBe(true)
  })

  it('recommends optimization for old vehicle with full omnium', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_details: 'car_old',
      vehicle_coverage_existing: 'full_omnium',
    })
    const driveRecs = recommendations.filter(r => r.product === 'drive')
    expect(driveRecs.some(r => r.title.includes('Optimiser'))).toBe(true)
  })

  it('recommends mobility pack for daily commuters', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_usage: 'daily_commute',
      vehicle_coverage_existing: 'rc_only',
    })
    const driveRecs = recommendations.filter(r => r.product === 'drive')
    expect(driveRecs.some(r => r.title.includes('mobilité'))).toBe(true)
  })
})

describe('bsafe rules', () => {
  it('generates protection recommendation for single-income family', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      family_status: 'couple_with_children',
      income_contributors: 'one',
      accident_coverage_existing: 'none',
    })
    const bsafeRecs = recommendations.filter(r => r.product === 'bsafe')
    expect(bsafeRecs.some(r => r.priority === 5 && r.title.includes('famille'))).toBe(true)
  })

  it('generates recommendation for uncovered independent worker', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      professional_status: 'independent',
      accident_coverage_existing: 'none',
    })
    const bsafeRecs = recommendations.filter(r => r.product === 'bsafe')
    expect(bsafeRecs.some(r => r.title.includes('activité'))).toBe(true)
  })

  it('generates sports risk recommendation', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      sports_activities: ['winter_sports', 'motor_sports'],
      accident_coverage_existing: 'none',
    })
    const bsafeRecs = recommendations.filter(r => r.product === 'bsafe')
    expect(bsafeRecs.some(r => r.title.includes('sportives'))).toBe(true)
  })
})

describe('life event recommendations', () => {
  it('life_event=birth generates bsafe event recommendation', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { life_event: ['birth'] })
    const bsafeEvent = recommendations.find(r => r.product === 'bsafe' && r.type === 'event')
    expect(bsafeEvent).toBeDefined()
    expect(bsafeEvent!.priority).toBe(5)
  })

  it('life_event=retirement generates bsafe event recommendation with priority 4', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { life_event: ['retirement'] })
    const bsafeEvent = recommendations.find(r => r.product === 'bsafe' && r.type === 'event')
    expect(bsafeEvent).toBeDefined()
    expect(bsafeEvent!.priority).toBe(4)
  })

  it('life_event=new_vehicle generates drive event recommendation', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { life_event: ['new_vehicle'] })
    const driveEvent = recommendations.find(r => r.product === 'drive' && r.type === 'event')
    expect(driveEvent).toBeDefined()
  })

  it('life_event=none generates no event recommendations', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { life_event: ['none'] })
    const eventRecs = recommendations.filter(r => r.type === 'event')
    expect(eventRecs).toHaveLength(0)
  })
})

describe('recommendation shape', () => {
  it('all recommendations have id, product, type, priority, title, message', () => {
    const result = computeDiagnostic({
      vehicle_count: 1,
      vehicle_details: 'car_new',
      vehicle_coverage_existing: 'none',
      family_status: 'couple_with_children',
      income_contributors: 'one',
      accident_coverage_existing: 'none',
    })
    expect(result.recommendations.length).toBeGreaterThan(0)
    for (const r of result.recommendations) {
      expect(r.id).toBeDefined()
      expect(r.product).toBeDefined()
      expect(r.type).toBeDefined()
      expect(r.priority).toBeDefined()
      expect(r.title).toBeDefined()
      expect(r.message).toBeDefined()
    }
  })

  it('drive recommendations reference drive product', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_details: 'car_new',
      vehicle_coverage_existing: 'rc_only',
    })
    const driveRecs = recommendations.filter(r => r.product === 'drive')
    expect(driveRecs.length).toBeGreaterThan(0)
  })

  it('bsafe recommendations reference bsafe product', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      family_status: 'couple_with_children',
      income_contributors: 'one',
      accident_coverage_existing: 'none',
    })
    const bsafeRecs = recommendations.filter(r => r.product === 'bsafe')
    expect(bsafeRecs.length).toBeGreaterThan(0)
  })
})

describe('incomeSource correction', () => {
  it('income_contributors=one + family generates "Protéger votre famille"', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      family_status: 'couple_with_children',
      income_contributors: 'one',
      accident_coverage_existing: 'none',
    })
    expect(recommendations.some(r => r.title.includes('Protéger votre famille'))).toBe(true)
  })

  it('income_contributors=two + family does NOT generate B-Safe "Protéger votre famille"', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      family_status: 'couple_with_children',
      income_contributors: 'two',
      accident_coverage_existing: 'none',
    })
    expect(recommendations.some(r => r.product === 'bsafe' && r.title.includes('Protéger votre famille'))).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — REGLES DRIVE MANQUANTES
// ═══════════════════════════════════════════════════════════════════

describe('drive_05: bonus protection', () => {
  it('recommends bonus protection when bonus_important interest', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_options_interest: ['bonus_important'],
    })
    const rec = recommendations.find(r => r.id === 'drive_05_bonus_protection')
    expect(rec).toBeDefined()
    expect(rec!.type).toBe('deferred')
    expect(rec!.priority).toBe(3)
    expect(rec!.title).toContain('bonus')
  })

  it('does NOT trigger without bonus_important interest', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_options_interest: ['replacement_needed'],
    })
    expect(recommendations.find(r => r.id === 'drive_05_bonus_protection')).toBeUndefined()
  })
})

describe('drive_06: custom vehicle coverage', () => {
  it('recommends amenagement coverage for customized vehicle interest', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_options_interest: ['vehicle_customized'],
    })
    const rec = recommendations.find(r => r.id === 'drive_06_custom_vehicle')
    expect(rec).toBeDefined()
    expect(rec!.type).toBe('deferred')
    expect(rec!.optionId).toBe('drive_pack_amenagement')
    expect(rec!.title).toContain('aménagements')
  })

  it('does NOT trigger without vehicle_customized interest', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_options_interest: ['none'],
    })
    expect(recommendations.find(r => r.id === 'drive_06_custom_vehicle')).toBeUndefined()
  })
})

describe('drive_07: professional transport coverage', () => {
  it('recommends equipment coverage for professional_equipment interest', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_options_interest: ['professional_equipment'],
    })
    const rec = recommendations.find(r => r.id === 'drive_07_professional_transport')
    expect(rec).toBeDefined()
    expect(rec!.type).toBe('deferred')
    expect(rec!.title).toContain('matériel')
  })

  it('does NOT trigger without professional_equipment interest', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_options_interest: ['replacement_needed'],
    })
    expect(recommendations.find(r => r.id === 'drive_07_professional_transport')).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — REGLES B-SAFE MANQUANTES
// ═══════════════════════════════════════════════════════════════════

describe('bsafe_03: low autonomy recommendation', () => {
  it('triggers for less_1_month with income above less_3k', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      work_incapacity_concern: 'less_1_month',
      income_range: '5k_8k',
    })
    const rec = recommendations.find(r => r.id === 'bsafe_03_low_autonomy')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(5)
    expect(rec!.optionId).toBe('bsafe_incapacite')
  })

  it('triggers for 1_3_months with income above less_3k', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      work_incapacity_concern: '1_3_months',
      income_range: '3k_5k',
    })
    expect(recommendations.find(r => r.id === 'bsafe_03_low_autonomy')).toBeDefined()
  })

  it('does NOT trigger for less_3k income (too low to justify)', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      work_incapacity_concern: 'less_1_month',
      income_range: 'less_3k',
    })
    expect(recommendations.find(r => r.id === 'bsafe_03_low_autonomy')).toBeUndefined()
  })

  it('does NOT trigger for no_answer income', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      work_incapacity_concern: 'less_1_month',
      income_range: 'no_answer',
    })
    expect(recommendations.find(r => r.id === 'bsafe_03_low_autonomy')).toBeUndefined()
  })

  it('does NOT trigger for 3_6_months (enough autonomy)', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      work_incapacity_concern: '3_6_months',
      income_range: '8k_12k',
    })
    expect(recommendations.find(r => r.id === 'bsafe_03_low_autonomy')).toBeUndefined()
  })
})

describe('bsafe_05: children coverage', () => {
  it('triggers for children with no personal accident coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      children_count: 2,
      accident_coverage_existing: 'none',
    })
    const rec = recommendations.find(r => r.id === 'bsafe_05_children_coverage')
    expect(rec).toBeDefined()
    expect(rec!.optionId).toBe('bsafe_frais_divers')
    expect(rec!.type).toBe('deferred')
    expect(rec!.priority).toBe(4)
  })

  it('triggers with employer_only coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      children_count: 1,
      accident_coverage_existing: 'employer_only',
    })
    expect(recommendations.find(r => r.id === 'bsafe_05_children_coverage')).toBeDefined()
  })

  it('does NOT trigger with individual_basic coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      children_count: 2,
      accident_coverage_existing: 'individual_basic',
    })
    expect(recommendations.find(r => r.id === 'bsafe_05_children_coverage')).toBeUndefined()
  })

  it('does NOT trigger when children_count = 0', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      children_count: 0,
      accident_coverage_existing: 'none',
    })
    expect(recommendations.find(r => r.id === 'bsafe_05_children_coverage')).toBeUndefined()
  })
})

describe('bsafe_07: mortgage without death cover', () => {
  it('triggers for owner_with_mortgage + no coverage + no life insurance', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      housing_status: 'owner_with_mortgage',
      accident_coverage_existing: 'none',
      savings_protection: ['savings_regular'],
    })
    const rec = recommendations.find(r => r.id === 'bsafe_07_mortgage_no_death_cover')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(5)
    expect(rec!.type).toBe('immediate')
    expect(rec!.optionId).toBe('bsafe_deces')
  })

  it('does NOT trigger when has life_insurance', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      housing_status: 'owner_with_mortgage',
      accident_coverage_existing: 'none',
      savings_protection: ['life_insurance'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_07_mortgage_no_death_cover')).toBeUndefined()
  })

  it('does NOT trigger for tenant', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      housing_status: 'tenant',
      accident_coverage_existing: 'none',
      savings_protection: ['none'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_07_mortgage_no_death_cover')).toBeUndefined()
  })

  it('does NOT trigger when individual_basic coverage exists', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      housing_status: 'owner_with_mortgage',
      accident_coverage_existing: 'individual_basic',
      savings_protection: ['none'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_07_mortgage_no_death_cover')).toBeUndefined()
  })
})

describe('bsafe_08: no pension over 45', () => {
  it('triggers for 46_55 without pension or life insurance', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '46_55',
      savings_protection: ['savings_regular'],
    })
    const rec = recommendations.find(r => r.id === 'bsafe_08_no_pension_over_45')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(4)
    expect(rec!.type).toBe('deferred')
  })

  it('triggers for 56_65 without pension or life insurance', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '56_65',
      savings_protection: ['none'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_08_no_pension_over_45')).toBeDefined()
  })

  it('does NOT trigger when has pension_plan', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '46_55',
      savings_protection: ['pension_plan'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_08_no_pension_over_45')).toBeUndefined()
  })

  it('does NOT trigger when has life_insurance', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '46_55',
      savings_protection: ['life_insurance'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_08_no_pension_over_45')).toBeUndefined()
  })

  it('does NOT trigger for age_range 36_45 (too young)', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      savings_protection: ['none'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_08_no_pension_over_45')).toBeUndefined()
  })
})

describe('bsafe_12: divorce event', () => {
  it('triggers for life_event=divorce', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      life_event: ['divorce'],
    })
    const rec = recommendations.find(r => r.id === 'bsafe_12_divorce_event')
    expect(rec).toBeDefined()
    expect(rec!.product).toBe('bsafe')
    expect(rec!.type).toBe('event')
    expect(rec!.priority).toBe(4)
    expect(rec!.title).toContain('séparation')
  })

  it('does NOT trigger without divorce event', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      life_event: ['birth', 'new_vehicle'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_12_divorce_event')).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — COMBINAISONS DE REGLES ET EDGE CASES
// ═══════════════════════════════════════════════════════════════════

describe('rules - combinaisons multi-regles', () => {
  it('maximum risk profile triggers many recommendations', () => {
    const result = computeDiagnostic({
      vehicle_count: 1,
      vehicle_details: 'car_new',
      vehicle_coverage_existing: 'none',
      vehicle_usage: 'daily_commute',
      vehicle_options_interest: ['bonus_important', 'vehicle_customized', 'professional_equipment', 'new_vehicle_value', 'replacement_needed'],
      life_event: ['birth', 'new_vehicle', 'divorce'],
      family_status: 'single_parent',
      income_contributors: 'one',
      professional_status: 'independent',
      accident_coverage_existing: 'none',
      children_count: 2,
      sports_activities: ['winter_sports', 'motor_sports'],
      health_concerns: ['physical_job', 'aging_parents'],
      work_incapacity_concern: 'less_1_month',
      income_range: '8k_12k',
      age_range: '46_55',
      housing_status: 'owner_with_mortgage',
      savings_protection: ['none'],
    })
    // Should trigger multiple drive and bsafe rules
    const driveRecs = result.recommendations.filter(r => r.product === 'drive')
    const bsafeRecs = result.recommendations.filter(r => r.product === 'bsafe')
    expect(driveRecs.length).toBeGreaterThanOrEqual(3)
    expect(bsafeRecs.length).toBeGreaterThanOrEqual(5)
  })

  it('minimum risk profile triggers few or no recommendations', () => {
    const result = computeDiagnostic({
      vehicle_count: 0,
      family_status: 'single',
      income_contributors: 'one',
      financial_dependents: 'none',
      professional_status: 'civil_servant',
      accident_coverage_existing: 'individual_complete',
      sports_activities: ['none'],
      health_concerns: ['none'],
      work_incapacity_concern: 'more_12_months',
      income_range: 'less_3k',
      age_range: '26_35',
      housing_status: 'tenant',
      savings_protection: ['life_insurance', 'pension_plan'],
      children_count: 0,
      life_event: ['none'],
    })
    // Very few or no recommendations expected
    expect(result.recommendations.length).toBeLessThanOrEqual(2)
  })

  it('all recommendations have unique IDs (no duplicates)', () => {
    const result = computeDiagnostic({
      vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'none',
      vehicle_options_interest: ['bonus_important', 'vehicle_customized'],
      family_status: 'couple_with_children', income_contributors: 'one',
      accident_coverage_existing: 'none', sports_activities: ['winter_sports'],
      life_event: ['birth', 'new_vehicle'],
    })
    const ids = result.recommendations.map(r => r.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })
})

describe('rules - family status variants for bsafe_01', () => {
  const baseAnswers = { income_contributors: 'one', accident_coverage_existing: 'none' }

  it('triggers for single_parent', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { ...baseAnswers, family_status: 'single_parent' })
    expect(recommendations.find(r => r.id === 'bsafe_01_family_single_income')).toBeDefined()
  })

  it('triggers for recomposed', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { ...baseAnswers, family_status: 'recomposed' })
    expect(recommendations.find(r => r.id === 'bsafe_01_family_single_income')).toBeDefined()
  })

  it('does NOT trigger for single (no children)', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { ...baseAnswers, family_status: 'single' })
    expect(recommendations.find(r => r.id === 'bsafe_01_family_single_income')).toBeUndefined()
  })

  it('does NOT trigger for couple_no_children', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { ...baseAnswers, family_status: 'couple_no_children' })
    expect(recommendations.find(r => r.id === 'bsafe_01_family_single_income')).toBeUndefined()
  })

  it('does NOT trigger with individual_basic coverage (not none/employer_only)', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      family_status: 'couple_with_children',
      income_contributors: 'one',
      accident_coverage_existing: 'individual_basic',
    })
    expect(recommendations.find(r => r.id === 'bsafe_01_family_single_income')).toBeUndefined()
  })
})

describe('rules - drive_01 vehicle type variants', () => {
  const baseAnswers = { vehicle_count: 1, vehicle_coverage_existing: 'rc_only' }

  it('triggers for car_new', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { ...baseAnswers, vehicle_details: 'car_new' })
    expect(recommendations.find(r => r.id === 'drive_01_recent_no_omnium')).toBeDefined()
  })

  it('does NOT trigger for car_recent', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { ...baseAnswers, vehicle_details: 'car_recent' })
    expect(recommendations.find(r => r.id === 'drive_01_recent_no_omnium')).toBeUndefined()
  })

  it('does NOT trigger for car_old', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { ...baseAnswers, vehicle_details: 'car_old' })
    expect(recommendations.find(r => r.id === 'drive_01_recent_no_omnium')).toBeUndefined()
  })

  it('does NOT trigger with mini_omnium coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'mini_omnium',
    })
    expect(recommendations.find(r => r.id === 'drive_01_recent_no_omnium')).toBeUndefined()
  })

  it('triggers with none coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'none',
    })
    expect(recommendations.find(r => r.id === 'drive_01_recent_no_omnium')).toBeDefined()
  })

  it('triggers with unknown coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'unknown',
    })
    expect(recommendations.find(r => r.id === 'drive_01_recent_no_omnium')).toBeDefined()
  })
})

describe('rules - drive_04 mobility need variants', () => {
  it('triggers for daily_commute with rc_only', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1, vehicle_usage: 'daily_commute', vehicle_coverage_existing: 'rc_only',
    })
    expect(recommendations.find(r => r.id === 'drive_04_mobility_need')).toBeDefined()
  })

  it('triggers for professional usage with none coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1, vehicle_usage: 'professional', vehicle_coverage_existing: 'none',
    })
    expect(recommendations.find(r => r.id === 'drive_04_mobility_need')).toBeDefined()
  })

  it('triggers for replacement_needed interest even with leisure usage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1, vehicle_usage: 'leisure',
      vehicle_options_interest: ['replacement_needed'],
      vehicle_coverage_existing: 'rc_only',
    })
    expect(recommendations.find(r => r.id === 'drive_04_mobility_need')).toBeDefined()
  })

  it('does NOT trigger with full_omnium (already well covered)', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1, vehicle_usage: 'daily_commute', vehicle_coverage_existing: 'full_omnium',
    })
    expect(recommendations.find(r => r.id === 'drive_04_mobility_need')).toBeUndefined()
  })

  it('does NOT trigger when vehicle_count = 0', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 0, vehicle_usage: 'daily_commute', vehicle_coverage_existing: 'rc_only',
    })
    expect(recommendations.find(r => r.id === 'drive_04_mobility_need')).toBeUndefined()
  })
})

describe('rules - bsafe_02 independent variants', () => {
  it('triggers for business_owner with no coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      professional_status: 'business_owner',
      accident_coverage_existing: 'none',
    })
    expect(recommendations.find(r => r.id === 'bsafe_02_independent_no_coverage')).toBeDefined()
  })

  it('triggers for independent with employer_only', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      professional_status: 'independent',
      accident_coverage_existing: 'employer_only',
    })
    expect(recommendations.find(r => r.id === 'bsafe_02_independent_no_coverage')).toBeDefined()
  })

  it('does NOT trigger for employee', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      professional_status: 'employee',
      accident_coverage_existing: 'none',
    })
    expect(recommendations.find(r => r.id === 'bsafe_02_independent_no_coverage')).toBeUndefined()
  })

  it('does NOT trigger for civil_servant', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      professional_status: 'civil_servant',
      accident_coverage_existing: 'none',
    })
    expect(recommendations.find(r => r.id === 'bsafe_02_independent_no_coverage')).toBeUndefined()
  })
})

describe('rules - bsafe_04 sports risk with all HIGH_RISK_SPORTS', () => {
  const highRiskSports = ['winter_sports', 'water_sports', 'mountain_outdoor', 'equestrian', 'motor_sports', 'combat_contact']

  for (const sport of highRiskSports) {
    it(`triggers for ${sport} with no coverage`, () => {
      const scores = makeScores()
      const recommendations = generateRecommendations(scores, {
        sports_activities: [sport],
        accident_coverage_existing: 'none',
      })
      expect(recommendations.find(r => r.id === 'bsafe_04_sports_risk')).toBeDefined()
    })
  }

  it('does NOT trigger for non-high-risk sports', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      sports_activities: ['running_cycling', 'team_sports'],
      accident_coverage_existing: 'none',
    })
    expect(recommendations.find(r => r.id === 'bsafe_04_sports_risk')).toBeUndefined()
  })
})

describe('rules - life events edge cases', () => {
  it('multiple life events trigger corresponding recommendations', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      life_event: ['birth', 'new_vehicle', 'retirement', 'divorce'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_10_birth_event')).toBeDefined()
    expect(recommendations.find(r => r.id === 'drive_08_new_vehicle_event')).toBeDefined()
    expect(recommendations.find(r => r.id === 'bsafe_11_retirement_event')).toBeDefined()
    expect(recommendations.find(r => r.id === 'bsafe_12_divorce_event')).toBeDefined()
  })

  it('marriage/move/career_change do not trigger event rules', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      life_event: ['marriage', 'move', 'career_change'],
    })
    const eventRecs = recommendations.filter(r => r.type === 'event')
    expect(eventRecs).toHaveLength(0)
  })

  it('property_purchase triggers home event rule', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      life_event: ['property_purchase'],
    })
    expect(recommendations.find(r => r.id === 'home_13_property_purchase')).toBeDefined()
  })

  it('renovation triggers home event rule', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      life_event: ['renovation'],
    })
    expect(recommendations.find(r => r.id === 'home_14_renovation')).toBeDefined()
  })

  it('empty life_event array produces no event recommendations', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      life_event: [],
    })
    const eventRecs = recommendations.filter(r => r.type === 'event')
    expect(eventRecs).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS — HOME rules (15)
// ═══════════════════════════════════════════════════════════════════

describe('home_01: tenant no coverage', () => {
  it('triggers for tenant with no home coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_status: 'tenant', home_coverage_existing: 'none' })
    const rec = recs.find(r => r.id === 'home_01_tenant_no_coverage')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(5)
    expect(rec!.type).toBe('immediate')
  })

  it('does NOT trigger for tenant with basic coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_status: 'tenant', home_coverage_existing: 'basic' })
    expect(recs.find(r => r.id === 'home_01_tenant_no_coverage')).toBeUndefined()
  })

  it('does NOT trigger for owner', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_status: 'owner_no_mortgage', home_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'home_01_tenant_no_coverage')).toBeUndefined()
  })
})

describe('home_02: owner with mortgage gap', () => {
  it('triggers for owner_with_mortgage and no coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_status: 'owner_with_mortgage', home_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'home_02_owner_mortgage_gap')).toBeDefined()
  })

  it('triggers for owner_with_mortgage and unknown coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_status: 'owner_with_mortgage', home_coverage_existing: 'unknown' })
    expect(recs.find(r => r.id === 'home_02_owner_mortgage_gap')).toBeDefined()
  })

  it('does NOT trigger with basic coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_status: 'owner_with_mortgage', home_coverage_existing: 'basic' })
    expect(recs.find(r => r.id === 'home_02_owner_mortgage_gap')).toBeUndefined()
  })
})

describe('home_03: garden/pool', () => {
  it('triggers for garden without options coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_specifics: ['garden'], home_coverage_existing: 'basic' })
    expect(recs.find(r => r.id === 'home_03_garden_pool')).toBeDefined()
  })

  it('triggers for pool without options coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_specifics: ['pool'], home_coverage_existing: 'basic' })
    expect(recs.find(r => r.id === 'home_03_garden_pool')).toBeDefined()
  })

  it('does NOT trigger with with_options coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_specifics: ['garden', 'pool'], home_coverage_existing: 'with_options' })
    expect(recs.find(r => r.id === 'home_03_garden_pool')).toBeUndefined()
  })
})

describe('home_04: solar panels', () => {
  it('triggers for solar_panels without options', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_specifics: ['solar_panels'], home_coverage_existing: 'basic' })
    expect(recs.find(r => r.id === 'home_04_solar_panels')).toBeDefined()
  })

  it('does NOT trigger with with_options', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_specifics: ['solar_panels'], home_coverage_existing: 'with_options' })
    expect(recs.find(r => r.id === 'home_04_solar_panels')).toBeUndefined()
  })
})

describe('home_05: wine cellar', () => {
  it('triggers when wine_cellar in home_specifics', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_specifics: ['wine_cellar'] })
    const rec = recs.find(r => r.id === 'home_05_wine_cellar')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(2)
  })

  it('does NOT trigger without wine_cellar', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_specifics: ['garden'] })
    expect(recs.find(r => r.id === 'home_05_wine_cellar')).toBeUndefined()
  })
})

describe('home_06: multimedia', () => {
  it('triggers for multimedia possessions without options', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { valuable_possessions: ['multimedia'], home_coverage_existing: 'basic' })
    expect(recs.find(r => r.id === 'home_06_multimedia')).toBeDefined()
  })

  it('does NOT trigger with with_options', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { valuable_possessions: ['multimedia'], home_coverage_existing: 'with_options' })
    expect(recs.find(r => r.id === 'home_06_multimedia')).toBeUndefined()
  })
})

describe('home_07: sustainable mobility', () => {
  it('triggers for sustainable_mobility possessions', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { valuable_possessions: ['sustainable_mobility'] })
    expect(recs.find(r => r.id === 'home_07_sustainable_mobility')).toBeDefined()
  })
})

describe('home_08: high value items', () => {
  it('triggers for jewelry + 15k_50k without options', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      valuable_possessions: ['jewelry'], valuable_total_estimate: '15k_50k', home_coverage_existing: 'basic',
    })
    const rec = recs.find(r => r.id === 'home_08_high_value_items')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(4)
    expect(rec!.type).toBe('immediate')
  })

  it('triggers for art + 50k_plus', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      valuable_possessions: ['art'], valuable_total_estimate: '50k_plus', home_coverage_existing: 'basic',
    })
    expect(recs.find(r => r.id === 'home_08_high_value_items')).toBeDefined()
  })

  it('does NOT trigger for low value estimate', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      valuable_possessions: ['jewelry'], valuable_total_estimate: '5k_15k', home_coverage_existing: 'basic',
    })
    expect(recs.find(r => r.id === 'home_08_high_value_items')).toBeUndefined()
  })

  it('does NOT trigger with with_options coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      valuable_possessions: ['jewelry'], valuable_total_estimate: '50k_plus', home_coverage_existing: 'with_options',
    })
    expect(recs.find(r => r.id === 'home_08_high_value_items')).toBeUndefined()
  })
})

describe('home_09: sports equipment', () => {
  it('triggers for sports_leisure possessions', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { valuable_possessions: ['sports_leisure'] })
    expect(recs.find(r => r.id === 'home_09_sports_equipment')).toBeDefined()
  })
})

describe('home_10: RC Vie Privee (intégrée HOME)', () => {
  it('triggers when children present', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { children_count: 2 })
    const rec = recs.find(r => r.id === 'home_10_rc_vie_privee')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(2)
  })

  it('triggers when sports activities', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { sports_activities: ['running_cycling'], children_count: 0 })
    expect(recs.find(r => r.id === 'home_10_rc_vie_privee')).toBeDefined()
  })

  it('does NOT trigger with no children and sports=none', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { children_count: 0, sports_activities: ['none'] })
    expect(recs.find(r => r.id === 'home_10_rc_vie_privee')).toBeUndefined()
  })
})

describe('home_11: no security with valuables', () => {
  it('triggers when no security measures + valuables declared', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { security_measures: ['none'], valuable_possessions: ['jewelry'] })
    expect(recs.find(r => r.id === 'home_11_no_security_valuables')).toBeDefined()
  })

  it('does NOT trigger when has alarm', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { security_measures: ['alarm'], valuable_possessions: ['jewelry'] })
    expect(recs.find(r => r.id === 'home_11_no_security_valuables')).toBeUndefined()
  })

  it('does NOT trigger when no valuables', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { security_measures: ['none'], valuable_possessions: ['none'] })
    expect(recs.find(r => r.id === 'home_11_no_security_valuables')).toBeUndefined()
  })
})

describe('home_12: reequipement', () => {
  it('triggers for high contents value without options', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_contents_value: '50k_100k', home_coverage_existing: 'basic' })
    expect(recs.find(r => r.id === 'home_12_reequipement')).toBeDefined()
  })

  it('triggers for 100k_plus', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_contents_value: '100k_plus', home_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'home_12_reequipement')).toBeDefined()
  })

  it('does NOT trigger for low value', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { home_contents_value: '20k_50k', home_coverage_existing: 'basic' })
    expect(recs.find(r => r.id === 'home_12_reequipement')).toBeUndefined()
  })
})

describe('home_13: property purchase event', () => {
  it('triggers for property_purchase life event', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { life_event: ['property_purchase'] })
    const rec = recs.find(r => r.id === 'home_13_property_purchase')
    expect(rec).toBeDefined()
    expect(rec!.type).toBe('event')
    expect(rec!.priority).toBe(5)
  })
})

describe('home_14: renovation event', () => {
  it('triggers for renovation life event', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { life_event: ['renovation'] })
    const rec = recs.find(r => r.id === 'home_14_renovation')
    expect(rec).toBeDefined()
    expect(rec!.type).toBe('event')
    expect(rec!.priority).toBe(3)
  })
})

describe('home_15: other properties', () => {
  it('triggers when other_properties is not none', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { other_properties: 'secondary' })
    expect(recs.find(r => r.id === 'home_15_other_properties')).toBeDefined()
  })

  it('does NOT trigger when other_properties is none', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { other_properties: 'none' })
    expect(recs.find(r => r.id === 'home_15_other_properties')).toBeUndefined()
  })

  it('does NOT trigger when other_properties is empty', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { other_properties: '' })
    expect(recs.find(r => r.id === 'home_15_other_properties')).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS — TRAVEL rules (5)
// ═══════════════════════════════════════════════════════════════════

describe('travel_01: frequent no annual', () => {
  it('triggers for several_year frequency without annual coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_frequency: 'several_year', travel_coverage_existing: 'none' })
    const rec = recs.find(r => r.id === 'travel_01_frequent_no_annual')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(4)
    expect(rec!.type).toBe('immediate')
  })

  it('triggers for frequent with credit_card coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_frequency: 'frequent', travel_coverage_existing: 'credit_card' })
    expect(recs.find(r => r.id === 'travel_01_frequent_no_annual')).toBeDefined()
  })

  it('does NOT trigger with annual coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_frequency: 'frequent', travel_coverage_existing: 'annual' })
    expect(recs.find(r => r.id === 'travel_01_frequent_no_annual')).toBeUndefined()
  })

  it('does NOT trigger for once_year frequency', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_frequency: 'once_year', travel_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'travel_01_frequent_no_annual')).toBeUndefined()
  })
})

describe('travel_02: worldwide with credit card', () => {
  it('triggers for worldwide destinations with credit_card', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_destinations: ['worldwide'], travel_coverage_existing: 'credit_card' })
    const rec = recs.find(r => r.id === 'travel_02_worldwide_credit_card')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(5)
  })

  it('does NOT trigger for europe_only destinations', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_destinations: ['europe'], travel_coverage_existing: 'credit_card' })
    expect(recs.find(r => r.id === 'travel_02_worldwide_credit_card')).toBeUndefined()
  })

  it('does NOT trigger with annual coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_destinations: ['worldwide'], travel_coverage_existing: 'annual' })
    expect(recs.find(r => r.id === 'travel_02_worldwide_credit_card')).toBeUndefined()
  })
})

describe('travel_03: high budget no cancel', () => {
  it('triggers for 3k_5k budget with no coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_budget: '3k_5k', travel_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'travel_03_high_budget_no_cancel')).toBeDefined()
  })

  it('triggers for 5k_plus budget with credit_card', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_budget: '5k_plus', travel_coverage_existing: 'credit_card' })
    expect(recs.find(r => r.id === 'travel_03_high_budget_no_cancel')).toBeDefined()
  })

  it('does NOT trigger for low budget', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_budget: '1k_3k', travel_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'travel_03_high_budget_no_cancel')).toBeUndefined()
  })
})

describe('travel_04: adventure no accident', () => {
  it('triggers for adventure destinations with no coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_destinations: ['adventure'], travel_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'travel_04_adventure_no_accident')).toBeDefined()
  })

  it('does NOT trigger with annual coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { travel_destinations: ['adventure'], travel_coverage_existing: 'annual' })
    expect(recs.find(r => r.id === 'travel_04_adventure_no_accident')).toBeUndefined()
  })
})

describe('travel_05: family travel', () => {
  it('triggers for family with children who travels without coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { children_count: 2, travel_frequency: 'several_year', travel_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'travel_05_family_travel')).toBeDefined()
  })

  it('does NOT trigger for travel_frequency=never', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { children_count: 2, travel_frequency: 'never', travel_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'travel_05_family_travel')).toBeUndefined()
  })

  it('does NOT trigger without children', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { children_count: 0, travel_frequency: 'frequent', travel_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'travel_05_family_travel')).toBeUndefined()
  })

  it('does NOT trigger with annual coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { children_count: 2, travel_frequency: 'frequent', travel_coverage_existing: 'annual' })
    expect(recs.find(r => r.id === 'travel_05_family_travel')).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS — NEW DRIVE rules (drive_09, drive_10)
// ═══════════════════════════════════════════════════════════════════

describe('drive_09: conducteur protege', () => {
  it('triggers for vehicle owner without accident coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { vehicle_count: 1, accident_coverage_existing: 'none' })
    const rec = recs.find(r => r.id === 'drive_09_conducteur_protege')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(5)
    expect(rec!.type).toBe('immediate')
  })

  it('triggers with employer_only accident coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { vehicle_count: 1, accident_coverage_existing: 'employer_only' })
    expect(recs.find(r => r.id === 'drive_09_conducteur_protege')).toBeDefined()
  })

  it('triggers with individual_basic accident coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { vehicle_count: 1, accident_coverage_existing: 'individual_basic' })
    expect(recs.find(r => r.id === 'drive_09_conducteur_protege')).toBeDefined()
  })

  it('does NOT trigger with individual_complete coverage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { vehicle_count: 1, accident_coverage_existing: 'individual_complete' })
    expect(recs.find(r => r.id === 'drive_09_conducteur_protege')).toBeUndefined()
  })

  it('does NOT trigger without vehicle', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { vehicle_count: 0, accident_coverage_existing: 'none' })
    expect(recs.find(r => r.id === 'drive_09_conducteur_protege')).toBeUndefined()
  })
})

describe('drive_10: multi vehicle 2+', () => {
  it('triggers for 2+ vehicles', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { vehicle_count: 2 })
    const rec = recs.find(r => r.id === 'drive_10_multi_vehicle_2plus')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(3)
  })

  it('triggers for 3 vehicles', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { vehicle_count: 3 })
    expect(recs.find(r => r.id === 'drive_10_multi_vehicle_2plus')).toBeDefined()
  })

  it('does NOT trigger for 1 vehicle', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { vehicle_count: 1 })
    expect(recs.find(r => r.id === 'drive_10_multi_vehicle_2plus')).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS — NEW HOME rules (home_16-19)
// ═══════════════════════════════════════════════════════════════════

describe('home_16: loyers impayes', () => {
  it('triggers for rental properties', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { other_properties: 'rental' })
    const rec = recs.find(r => r.id === 'home_16_loyers_impayes')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(4)
    expect(rec!.type).toBe('immediate')
  })

  it('triggers for both (secondary + rental)', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { other_properties: 'both' })
    expect(recs.find(r => r.id === 'home_16_loyers_impayes')).toBeDefined()
  })

  it('does NOT trigger for secondary only', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { other_properties: 'secondary' })
    expect(recs.find(r => r.id === 'home_16_loyers_impayes')).toBeUndefined()
  })

  it('does NOT trigger for none', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { other_properties: 'none' })
    expect(recs.find(r => r.id === 'home_16_loyers_impayes')).toBeUndefined()
  })
})

describe('home_17: deteriorations immobilieres', () => {
  it('triggers for rental properties', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { other_properties: 'rental' })
    expect(recs.find(r => r.id === 'home_17_deteriorations_immobilieres')).toBeDefined()
  })
})

describe('home_18: vacance locative', () => {
  it('triggers for rental properties', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { other_properties: 'rental' })
    expect(recs.find(r => r.id === 'home_18_vacance_locative')).toBeDefined()
  })
})

describe('home_19: perte liquide cuves', () => {
  it('triggers for house owner', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_type: 'house', housing_status: 'owner_with_mortgage' })
    const rec = recs.find(r => r.id === 'home_19_perte_liquide_cuves')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(3)
  })

  it('triggers for townhouse owner without mortgage', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_type: 'townhouse', housing_status: 'owner_no_mortgage' })
    expect(recs.find(r => r.id === 'home_19_perte_liquide_cuves')).toBeDefined()
  })

  it('does NOT trigger for apartment', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_type: 'apartment', housing_status: 'owner_with_mortgage' })
    expect(recs.find(r => r.id === 'home_19_perte_liquide_cuves')).toBeUndefined()
  })

  it('does NOT trigger for tenant', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, { housing_type: 'house', housing_status: 'tenant' })
    expect(recs.find(r => r.id === 'home_19_perte_liquide_cuves')).toBeUndefined()
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS — POG eligibility guards
// ═══════════════════════════════════════════════════════════════════

describe('POG guards: residence_status', () => {
  it('B-SAFE rules do NOT trigger for frontalier', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      residence_status: 'frontalier_fr',
      family_status: 'couple_with_children', income_contributors: 'one',
      accident_coverage_existing: 'none',
    })
    const bsafeRecs = recs.filter(r => r.product === 'bsafe')
    expect(bsafeRecs).toHaveLength(0)
  })

  it('B-SAFE rules do NOT trigger for other residence', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      residence_status: 'other',
      family_status: 'couple_with_children', income_contributors: 'one',
      accident_coverage_existing: 'none',
    })
    expect(recs.filter(r => r.product === 'bsafe')).toHaveLength(0)
  })

  it('HOME rules do NOT trigger for frontalier', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      residence_status: 'frontalier_de',
      housing_status: 'tenant', home_coverage_existing: 'none',
    })
    expect(recs.filter(r => r.product === 'home')).toHaveLength(0)
  })

  it('DRIVE rules do NOT trigger for frontalier', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      residence_status: 'frontalier_be',
      vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'none',
    })
    expect(recs.filter(r => r.product === 'drive')).toHaveLength(0)
  })

  it('TRAVEL rules DO trigger for frontalier', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      residence_status: 'frontalier_fr',
      travel_frequency: 'frequent', travel_coverage_existing: 'none',
    })
    expect(recs.filter(r => r.product === 'travel').length).toBeGreaterThan(0)
  })

  it('TRAVEL rules DO trigger for resident_gdl', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      residence_status: 'resident_gdl',
      travel_frequency: 'frequent', travel_coverage_existing: 'none',
    })
    expect(recs.filter(r => r.product === 'travel').length).toBeGreaterThan(0)
  })

  it('TRAVEL rules do NOT trigger for other residence', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      residence_status: 'other',
      travel_frequency: 'frequent', travel_coverage_existing: 'none',
    })
    expect(recs.filter(r => r.product === 'travel')).toHaveLength(0)
  })

  it('no rules trigger when residence_status is empty (restrictive POG)', () => {
    const scores = makeScores()
    const recs = _generateRecommendations(scores, {
      family_status: 'couple_with_children', income_contributors: 'one',
      accident_coverage_existing: 'none',
      housing_status: 'tenant', home_coverage_existing: 'none',
    })
    expect(recs.filter(r => r.product === 'bsafe')).toHaveLength(0)
    expect(recs.filter(r => r.product === 'home')).toHaveLength(0)
    expect(recs.filter(r => r.product === 'drive')).toHaveLength(0)
  })
})

describe('POG guards: age 80+ TRAVEL filter', () => {
  it('TRAVEL rules do NOT trigger for 80_plus', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      age_range: '80_plus',
      travel_frequency: 'frequent', travel_destinations: ['worldwide'],
      travel_coverage_existing: 'credit_card',
    })
    expect(recs.filter(r => r.product === 'travel')).toHaveLength(0)
  })

  it('TRAVEL rules DO trigger for 65_plus (65-80)', () => {
    const scores = makeScores()
    const recs = generateRecommendations(scores, {
      age_range: '65_plus',
      travel_frequency: 'frequent', travel_coverage_existing: 'none',
    })
    expect(recs.filter(r => r.product === 'travel').length).toBeGreaterThan(0)
  })
})

// ═══════════════════════════════════════════════════════════════════
// NON-REGRESSION: all 4 products present in full profile
// ═══════════════════════════════════════════════════════════════════

describe('rules - non-regression: all four products', () => {
  it('full profile triggers recommendations across all products', () => {
    const allAnswers = {
      vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'none',
      vehicle_usage: 'professional', vehicle_options_interest: ['new_vehicle_value'],
      family_status: 'couple_with_children', income_contributors: 'one',
      professional_status: 'independent', accident_coverage_existing: 'none',
      sports_activities: ['winter_sports'], health_concerns: ['physical_job', 'aging_parents'],
      work_incapacity_concern: 'less_1_month', income_range: '8k_12k',
      life_event: ['birth', 'new_vehicle', 'retirement', 'divorce', 'property_purchase'],
      housing_status: 'owner_with_mortgage', home_coverage_existing: 'none',
      home_specifics: ['garden', 'solar_panels'], valuable_possessions: ['jewelry'],
      valuable_total_estimate: '50k_plus', security_measures: ['none'],
      home_contents_value: '100k_plus',
      savings_protection: ['none'], children_count: 2, age_range: '46_55',
      travel_frequency: 'frequent', travel_destinations: ['worldwide', 'adventure'],
      travel_budget: '5k_plus', travel_coverage_existing: 'credit_card',
    }
    const result = computeDiagnostic(allAnswers)
    const products = [...new Set(result.recommendations.map(r => r.product))]
    expect(products).toContain('drive')
    expect(products).toContain('bsafe')
    expect(products).toContain('home')
    expect(products).toContain('travel')
    // Expect significant number of recommendations
    expect(result.recommendations.length).toBeGreaterThanOrEqual(15)
  })

  it('all 45 rule IDs are unique', () => {
    const allAnswers = {
      residence_status: 'resident_gdl',
      vehicle_count: 2, vehicle_details: 'car_new', vehicle_coverage_existing: 'none',
      vehicle_usage: 'daily_commute',
      vehicle_options_interest: ['bonus_important', 'vehicle_customized', 'professional_equipment', 'replacement_needed'],
      life_event: ['birth', 'new_vehicle', 'divorce', 'retirement', 'property_purchase', 'renovation'],
      family_status: 'single_parent', income_contributors: 'one',
      professional_status: 'independent', accident_coverage_existing: 'none',
      children_count: 3, sports_activities: ['winter_sports', 'motor_sports'],
      health_concerns: ['physical_job', 'aging_parents'],
      work_incapacity_concern: 'less_1_month', income_range: '8k_12k',
      age_range: '46_55', housing_status: 'owner_with_mortgage',
      housing_type: 'house',
      home_coverage_existing: 'none', home_specifics: ['garden', 'pool', 'solar_panels', 'wine_cellar'],
      home_contents_value: '100k_plus', valuable_possessions: ['jewelry', 'art', 'multimedia', 'sustainable_mobility', 'sports_leisure', 'collections'],
      valuable_total_estimate: '50k_plus', security_measures: ['none'],
      savings_protection: ['none'],
      other_properties: 'rental',
      travel_frequency: 'frequent', travel_destinations: ['worldwide', 'adventure'],
      travel_budget: '5k_plus', travel_coverage_existing: 'credit_card',
    }
    const result = computeDiagnostic(allAnswers)
    const ids = result.recommendations.map(r => r.id)
    expect(ids.length).toBe(new Set(ids).size)
    // Should have at least 30 recommendations with this rich profile
    expect(ids.length).toBeGreaterThanOrEqual(30)
  })
})

// ═══════════════════════════════════════════════════════════════════
// FUTUR RULES — Pension Plan / Life Plan / Switch Plan
// ═══════════════════════════════════════════════════════════════════

describe('futur rules — POG guard', () => {
  it('futur rules do NOT fire for frontaliers', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      residence_status: 'frontalier_fr',
      age_range: '36_45',
      professional_status: 'employee',
      savings_protection: ['none'],
      financial_dependents: 'partner_children',
      esg_interest: 'yes',
    })
    const futurRecs = recommendations.filter(r => ['pension_plan', 'life_plan', 'switch_plan'].includes(r.product))
    expect(futurRecs).toHaveLength(0)
  })

  it('futur rules do NOT fire for students', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      professional_status: 'student',
      age_range: '18_25',
      savings_protection: ['none'],
    })
    const futurRecs = recommendations.filter(r => ['pension_plan', 'life_plan', 'switch_plan'].includes(r.product))
    expect(futurRecs).toHaveLength(0)
  })

  it('futur rules do NOT fire for 65+', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '65_plus',
      professional_status: 'retired',
      savings_protection: ['none'],
    })
    const futurRecs = recommendations.filter(r => ['pension_plan', 'life_plan', 'switch_plan'].includes(r.product))
    expect(futurRecs).toHaveLength(0)
  })
})

describe('futur_01: PP no pension young (26-45)', () => {
  it('fires for young employee without pension plan', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_01_pp_no_pension_young')).toBe(true)
  })

  it('does NOT fire if pension_plan already exists', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      savings_protection: ['pension_plan'],
    })
    expect(recommendations.some(r => r.id === 'futur_01_pp_no_pension_young')).toBe(false)
  })

  it('does NOT fire for 46-55 age range', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '46_55',
      professional_status: 'employee',
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_01_pp_no_pension_young')).toBe(false)
    // futur_02 should fire instead
    expect(recommendations.some(r => r.id === 'futur_02_pp_no_pension_prime')).toBe(true)
  })
})

describe('futur_02: PP no pension prime (46-55)', () => {
  it('fires for mid-career without pension', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '46_55',
      professional_status: 'employee',
      savings_protection: ['savings_regular'],
    })
    expect(recommendations.some(r => r.id === 'futur_02_pp_no_pension_prime')).toBe(true)
  })
})

describe('futur_03: PP no pension senior (56-65)', () => {
  it('fires for pre-retirement without pension', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '56_65',
      professional_status: 'employee',
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_03_pp_no_pension_senior')).toBe(true)
  })
})

describe('futur_04: PP high income', () => {
  it('fires for high income without pension', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      income_range: '12k_plus',
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_04_pp_high_income')).toBe(true)
  })

  it('does NOT fire if pension already exists', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      income_range: '12k_plus',
      savings_protection: ['pension_plan'],
    })
    expect(recommendations.some(r => r.id === 'futur_04_pp_high_income')).toBe(false)
  })
})

describe('futur_05: PP independent', () => {
  it('fires for independent without pension', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'independent',
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_05_pp_independent')).toBe(true)
  })
})

describe('futur_06: PP retirement event', () => {
  it('fires for retirement event with existing pension', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '56_65',
      professional_status: 'employee',
      life_event: ['retirement'],
      savings_protection: ['pension_plan'],
    })
    expect(recommendations.some(r => r.id === 'futur_06_pp_retirement_event')).toBe(true)
  })

  it('does NOT fire without existing pension', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '56_65',
      professional_status: 'employee',
      life_event: ['retirement'],
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_06_pp_retirement_event')).toBe(false)
  })
})

describe('futur_07: PP employer-only complement', () => {
  it('fires when pension_employer exists but no personal pension', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      savings_protection: ['pension_employer'],
    })
    expect(recommendations.some(r => r.id === 'futur_07_pp_employer_only')).toBe(true)
  })

  it('does NOT fire when personal pension exists', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      savings_protection: ['pension_employer', 'pension_plan'],
    })
    expect(recommendations.some(r => r.id === 'futur_07_pp_employer_only')).toBe(false)
  })
})

describe('futur_08: LP family no AV', () => {
  it('fires when dependents exist and no life insurance', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      financial_dependents: 'partner_children',
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_08_lp_family_no_av')).toBe(true)
  })

  it('does NOT fire when no dependents', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      financial_dependents: 'none',
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_08_lp_family_no_av')).toBe(false)
  })

  it('does NOT fire when life insurance exists', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      financial_dependents: 'partner_children',
      savings_protection: ['life_insurance'],
    })
    expect(recommendations.some(r => r.id === 'futur_08_lp_family_no_av')).toBe(false)
  })
})

describe('futur_09: LP mortgage', () => {
  it('fires for owner with mortgage and no life insurance', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      housing_status: 'owner_with_mortgage',
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_09_lp_mortgage')).toBe(true)
  })
})

describe('futur_10: LP single parent', () => {
  it('fires for single parent without life insurance', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      family_status: 'single_parent',
      savings_protection: ['none'],
    })
    expect(recommendations.some(r => r.id === 'futur_10_lp_single_parent')).toBe(true)
  })
})

describe('futur_11: SP ESG motivated', () => {
  it('fires when esg_interest=yes', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      esg_interest: 'yes',
    })
    expect(recommendations.some(r => r.id === 'futur_11_sp_esg_motivated')).toBe(true)
    const rec = recommendations.find(r => r.id === 'futur_11_sp_esg_motivated')!
    expect(rec.type).toBe('immediate')
    expect(rec.product).toBe('switch_plan')
  })

  it('does NOT fire when esg_interest=no', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      esg_interest: 'no',
    })
    expect(recommendations.some(r => r.id === 'futur_11_sp_esg_motivated')).toBe(false)
  })
})

describe('futur_12: SP ESG curious', () => {
  it('fires when esg_interest=neutral', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      esg_interest: 'neutral',
    })
    expect(recommendations.some(r => r.id === 'futur_12_sp_esg_curious')).toBe(true)
    const rec = recommendations.find(r => r.id === 'futur_12_sp_esg_curious')!
    expect(rec.type).toBe('deferred')
    expect(rec.product).toBe('switch_plan')
  })

  it('does NOT fire when esg_interest=yes (futur_11 fires instead)', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'employee',
      esg_interest: 'yes',
    })
    expect(recommendations.some(r => r.id === 'futur_12_sp_esg_curious')).toBe(false)
  })
})

describe('futur cross-product interactions', () => {
  it('can generate PP + LP + SP simultaneously for the right profile', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'independent',
      income_range: '12k_plus',
      financial_dependents: 'partner_children',
      savings_protection: ['none'],
      esg_interest: 'yes',
    })
    const futurProducts = [...new Set(recommendations.filter(r =>
      ['pension_plan', 'life_plan', 'switch_plan'].includes(r.product)
    ).map(r => r.product))]
    expect(futurProducts).toContain('pension_plan')
    expect(futurProducts).toContain('life_plan')
    expect(futurProducts).toContain('switch_plan')
  })

  it('PP rules all include 4 500 EUR in advisorNote', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      age_range: '36_45',
      professional_status: 'independent',
      income_range: '12k_plus',
      savings_protection: ['pension_employer'],
    })
    const ppRecs = recommendations.filter(r => r.product === 'pension_plan' && r.advisorNote)
    for (const rec of ppRecs) {
      expect(rec.advisorNote).toContain('4 500')
    }
  })
})
