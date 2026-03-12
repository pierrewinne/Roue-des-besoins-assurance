import { describe, it, expect } from 'vitest'
import { generateRecommendations } from './rules'
import type { Quadrant, QuadrantScore } from './types'
import { computeDiagnostic } from './engine'

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

  it('only generates drive and bsafe recommendations', () => {
    const result = computeDiagnostic({
      vehicle_count: 1,
      vehicle_details: 'car_new',
      vehicle_coverage_existing: 'none',
      family_status: 'couple_with_children',
      income_contributors: 'one',
      accident_coverage_existing: 'none',
      sports_activities: ['winter_sports'],
    })
    const products = [...new Set(result.recommendations.map(r => r.product))]
    for (const p of products) {
      expect(['drive', 'bsafe']).toContain(p)
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

  it('income_contributors=two + family does NOT generate "Protéger votre famille"', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      family_status: 'couple_with_children',
      income_contributors: 'two',
      accident_coverage_existing: 'none',
    })
    expect(recommendations.some(r => r.title.includes('Protéger votre famille'))).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — REGLES DRIVE MANQUANTES
// ═══════════════════════════════════════════════════════════════════

describe('drive_03: electric vehicle protection', () => {
  it('recommends protection for electric vehicle without full_omnium', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_details: 'electric',
      vehicle_coverage_existing: 'rc_only',
    })
    const rec = recommendations.find(r => r.id === 'drive_03_electric_no_protection')
    expect(rec).toBeDefined()
    expect(rec!.type).toBe('immediate')
    expect(rec!.priority).toBe(4)
    expect(rec!.title).toContain('électrique')
  })

  it('does NOT trigger for electric with full_omnium', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_details: 'electric',
      vehicle_coverage_existing: 'full_omnium',
    })
    expect(recommendations.find(r => r.id === 'drive_03_electric_no_protection')).toBeUndefined()
  })

  it('does NOT trigger for non-electric vehicle', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1,
      vehicle_details: 'car_new',
      vehicle_coverage_existing: 'rc_only',
    })
    expect(recommendations.find(r => r.id === 'drive_03_electric_no_protection')).toBeUndefined()
  })
})

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

describe('bsafe_06: aging parents coverage', () => {
  it('triggers when health_concerns includes aging_parents', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      health_concerns: ['aging_parents'],
    })
    const rec = recommendations.find(r => r.id === 'bsafe_06_aging_parents')
    expect(rec).toBeDefined()
    expect(rec!.optionId).toBe('bsafe_aide_menagere')
    expect(rec!.type).toBe('deferred')
    expect(rec!.priority).toBe(3)
  })

  it('does NOT trigger without aging_parents concern', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      health_concerns: ['physical_job', 'frequent_driving'],
    })
    expect(recommendations.find(r => r.id === 'bsafe_06_aging_parents')).toBeUndefined()
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

describe('bsafe_09: physical exposure', () => {
  it('triggers for physical_job + no personal coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      health_concerns: ['physical_job'],
      accident_coverage_existing: 'none',
    })
    const rec = recommendations.find(r => r.id === 'bsafe_09_physical_exposure')
    expect(rec).toBeDefined()
    expect(rec!.priority).toBe(3)
    expect(rec!.optionId).toBe('bsafe_hospitalisation')
  })

  it('triggers for frequent_driving + employer_only', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      health_concerns: ['frequent_driving'],
      accident_coverage_existing: 'employer_only',
    })
    expect(recommendations.find(r => r.id === 'bsafe_09_physical_exposure')).toBeDefined()
  })

  it('does NOT trigger with individual_basic coverage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      health_concerns: ['physical_job'],
      accident_coverage_existing: 'individual_basic',
    })
    expect(recommendations.find(r => r.id === 'bsafe_09_physical_exposure')).toBeUndefined()
  })

  it('does NOT trigger without physical_job or frequent_driving', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      health_concerns: ['family_history', 'aging_parents'],
      accident_coverage_existing: 'none',
    })
    expect(recommendations.find(r => r.id === 'bsafe_09_physical_exposure')).toBeUndefined()
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
      vehicle_details: 'electric',
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
      vehicle_count: 1, vehicle_details: 'electric', vehicle_coverage_existing: 'none',
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

  it('triggers for electric', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { ...baseAnswers, vehicle_details: 'electric' })
    expect(recommendations.find(r => r.id === 'drive_01_recent_no_omnium')).toBeDefined()
  })

  it('triggers for suv_crossover', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, { ...baseAnswers, vehicle_details: 'suv_crossover' })
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

  it('triggers for replacement_needed interest even with occasional usage', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      vehicle_count: 1, vehicle_usage: 'occasional',
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

  it('marriage/property_purchase/move/renovation/career_change do not trigger event rules', () => {
    const scores = makeScores()
    const recommendations = generateRecommendations(scores, {
      life_event: ['marriage', 'property_purchase', 'move', 'renovation', 'career_change'],
    })
    const eventRecs = recommendations.filter(r => r.type === 'event')
    expect(eventRecs).toHaveLength(0)
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

describe('rules - non-regression: no home/travel products', () => {
  it('no recommendation ever references home product', () => {
    const allAnswers = {
      vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'none',
      vehicle_usage: 'professional', vehicle_options_interest: ['new_vehicle_value'],
      family_status: 'couple_with_children', income_contributors: 'one',
      professional_status: 'independent', accident_coverage_existing: 'none',
      sports_activities: ['winter_sports'], health_concerns: ['physical_job', 'aging_parents'],
      work_incapacity_concern: 'less_1_month', income_range: '8k_12k',
      life_event: ['birth', 'new_vehicle', 'retirement', 'divorce'],
      housing_status: 'owner_with_mortgage', savings_protection: ['none'],
      children_count: 2, age_range: '46_55',
    }
    const result = computeDiagnostic(allAnswers)
    for (const rec of result.recommendations) {
      expect(rec.product).not.toBe('home')
      expect(rec.product).not.toBe('travel')
    }
  })
})
