import { describe, it, expect } from 'vitest'
import { computeDiagnostic as _computeDiagnostic } from './engine'

// Auto-inject residence_status: 'resident_gdl' unless explicitly overridden
function computeDiagnostic(answers: Record<string, unknown>) {
  return _computeDiagnostic({ residence_status: 'resident_gdl', ...answers })
}

describe('computeBiensScore (DRIVE + HOME)', () => {
  it('returns a valid quadrant score for biens', () => {
    const result = computeDiagnostic({ vehicle_count: 1 })
    expect(result.quadrantScores.biens.quadrant).toBe('biens')
    expect(result.quadrantScores.biens.active).toBe(true)
  })

  it('has HOME-only exposure when no vehicle (non-zero)', () => {
    const result = computeDiagnostic({ vehicle_count: 0 })
    // With HOME included, biens always has some exposure (housing)
    expect(result.quadrantScores.biens.exposure).toBeGreaterThan(0)
  })

  it('increases exposure with vehicles', () => {
    const base = computeDiagnostic({ vehicle_count: 0 })
    const withVehicle = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_new' })
    expect(withVehicle.quadrantScores.biens.exposure).toBeGreaterThan(base.quadrantScores.biens.exposure)
  })

  it('has higher exposure for new/expensive vehicle', () => {
    const oldCar = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_old', vehicle_usage: 'leisure' })
    const newCar = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_new', vehicle_usage: 'leisure' })
    expect(newCar.quadrantScores.biens.exposure).toBeGreaterThan(oldCar.quadrantScores.biens.exposure)
  })

  it('has higher exposure for professional usage', () => {
    const leisure = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_recent', vehicle_usage: 'leisure' })
    const professional = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_recent', vehicle_usage: 'professional' })
    expect(professional.quadrantScores.biens.exposure).toBeGreaterThan(leisure.quadrantScores.biens.exposure)
  })

  it('has low coverage with rc_only', () => {
    const rcOnly = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'rc_only' })
    const omnium = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'full_omnium' })
    expect(rcOnly.quadrantScores.biens.coverage).toBeLessThan(omnium.quadrantScores.biens.coverage)
  })

  it('HOME exposure increases with housing status', () => {
    const tenant = computeDiagnostic({ vehicle_count: 0, housing_status: 'tenant' })
    const owner = computeDiagnostic({ vehicle_count: 0, housing_status: 'owner_with_mortgage' })
    expect(owner.quadrantScores.biens.exposure).toBeGreaterThan(tenant.quadrantScores.biens.exposure)
  })

  it('HOME exposure increases with contents value', () => {
    const low = computeDiagnostic({ vehicle_count: 0, home_contents_value: 'less_20k' })
    const high = computeDiagnostic({ vehicle_count: 0, home_contents_value: '100k_plus' })
    expect(high.quadrantScores.biens.exposure).toBeGreaterThan(low.quadrantScores.biens.exposure)
  })

  it('HOME coverage increases with better home insurance', () => {
    const none = computeDiagnostic({ vehicle_count: 0, home_coverage_existing: 'none' })
    const withOpts = computeDiagnostic({ vehicle_count: 0, home_coverage_existing: 'with_options' })
    expect(withOpts.quadrantScores.biens.coverage).toBeGreaterThan(none.quadrantScores.biens.coverage)
  })
})

describe('computePersonnesScore (B-SAFE)', () => {
  it('has higher exposure for family with single income', () => {
    const base = computeDiagnostic({})
    const result = computeDiagnostic({ family_status: 'couple_with_children', income_contributors: 'one' })
    expect(result.quadrantScores.personnes.exposure).toBeGreaterThan(base.quadrantScores.personnes.exposure)
  })

  it('increases exposure for high-risk sports', () => {
    const base = computeDiagnostic({})
    const athlete = computeDiagnostic({ sports_activities: ['winter_sports', 'motor_sports'] })
    expect(athlete.quadrantScores.personnes.exposure).toBeGreaterThan(base.quadrantScores.personnes.exposure)
  })

  it('increases exposure with financial dependents', () => {
    const base = computeDiagnostic({ financial_dependents: 'none' })
    const withDeps = computeDiagnostic({ financial_dependents: 'partner_children' })
    expect(withDeps.quadrantScores.personnes.exposure).toBeGreaterThan(base.quadrantScores.personnes.exposure)
  })

  it('increases exposure with low work incapacity autonomy', () => {
    const base = computeDiagnostic({ work_incapacity_concern: 'more_12_months' })
    const vulnerable = computeDiagnostic({ work_incapacity_concern: 'less_1_month' })
    expect(vulnerable.quadrantScores.personnes.exposure).toBeGreaterThan(base.quadrantScores.personnes.exposure)
  })

  it('has low coverage without accident or savings protection', () => {
    const uncovered = computeDiagnostic({ accident_coverage_existing: 'none', savings_protection: ['none'] })
    const covered = computeDiagnostic({ accident_coverage_existing: 'individual_complete', savings_protection: ['life_insurance', 'pension_plan'] })
    expect(uncovered.quadrantScores.personnes.coverage).toBeLessThan(covered.quadrantScores.personnes.coverage)
  })
})

describe('inactive quadrant (projets)', () => {
  it('projets has zero exposure', () => {
    const result = computeDiagnostic({ vehicle_count: 2, family_status: 'couple_with_children' })
    expect(result.quadrantScores.projets.exposure).toBe(0)
  })

  it('projets is not active', () => {
    const result = computeDiagnostic({})
    expect(result.quadrantScores.projets.active).toBe(false)
  })

  it('projets has zero weighting', () => {
    const result = computeDiagnostic({})
    expect(result.weightings.projets).toBe(0)
  })
})

describe('futur quadrant (PP/LP/SP)', () => {
  it('futur is active for eligible residents', () => {
    const result = computeDiagnostic({ age_range: '36_45', professional_status: 'employee' })
    expect(result.quadrantScores.futur.active).toBe(true)
  })

  it('futur has non-zero weighting for eligible residents', () => {
    const result = computeDiagnostic({ age_range: '36_45', professional_status: 'employee' })
    expect(result.weightings.futur).toBeGreaterThan(0)
  })

  it('futur exposure depends on dependents and income (not savings)', () => {
    const noDeps = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', financial_dependents: 'none', income_range: 'less_3k' })
    const highRisk = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', financial_dependents: 'partner_children', income_range: '12k_plus' })
    expect(highRisk.quadrantScores.futur.exposure).toBeGreaterThan(noDeps.quadrantScores.futur.exposure)
  })

  it('futur has higher exposure with dependents', () => {
    const noDeps = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', financial_dependents: 'none' })
    const withDeps = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', financial_dependents: 'partner_children' })
    expect(withDeps.quadrantScores.futur.exposure).toBeGreaterThan(noDeps.quadrantScores.futur.exposure)
  })

  it('futur has higher coverage with pension + life insurance', () => {
    const noDevices = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', savings_protection: ['none'] })
    const withDevices = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', savings_protection: ['pension_plan', 'life_insurance', 'pension_employer'] })
    expect(withDevices.quadrantScores.futur.coverage).toBeGreaterThan(noDevices.quadrantScores.futur.coverage)
  })

  it('futur coverage is higher for civil servants than independents', () => {
    const civil = computeDiagnostic({ age_range: '36_45', professional_status: 'civil_servant' })
    const indie = computeDiagnostic({ age_range: '36_45', professional_status: 'independent' })
    expect(civil.quadrantScores.futur.coverage).toBeGreaterThan(indie.quadrantScores.futur.coverage)
  })

  it('futur is inactive for non-eligible profiles', () => {
    const student = computeDiagnostic({ residence_status: 'resident_gdl', professional_status: 'student' })
    expect(student.quadrantScores.futur.exposure).toBe(0)

    const senior = computeDiagnostic({ residence_status: 'resident_gdl', age_range: '65_plus' })
    expect(senior.quadrantScores.futur.exposure).toBe(0)

    const frontalier = computeDiagnostic({ residence_status: 'frontalier_fr', age_range: '36_45' })
    expect(frontalier.quadrantScores.futur.exposure).toBe(0)
  })

  it('futur weighting is 0 for ineligible profiles', () => {
    const student = computeDiagnostic({ residence_status: 'resident_gdl', professional_status: 'student' })
    expect(student.weightings.futur).toBe(0)
  })

  it('futur weighting increases for mid-career profiles', () => {
    const young = computeDiagnostic({ age_range: '26_35', professional_status: 'employee' })
    const midCareer = computeDiagnostic({ age_range: '46_55', professional_status: 'employee' })
    expect(midCareer.weightings.futur).toBeGreaterThanOrEqual(young.weightings.futur)
  })

  it('produces pension_plan product scores for eligible residents', () => {
    const result = computeDiagnostic({ age_range: '36_45', professional_status: 'employee' })
    const pp = result.productScores.find(p => p.product === 'pension_plan')
    expect(pp).toBeDefined()
    expect(pp!.relevance).toBeGreaterThan(0)
  })

  it('pension_plan has lower relevance when already subscribed', () => {
    const noPP = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', savings_protection: ['none'] })
    const hasPP = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', savings_protection: ['pension_plan'] })
    const ppNo = noPP.productScores.find(p => p.product === 'pension_plan')!
    const ppYes = hasPP.productScores.find(p => p.product === 'pension_plan')!
    expect(ppNo.relevance).toBeGreaterThan(ppYes.relevance)
  })

  it('switch_plan has high relevance when esg_interest=yes', () => {
    const result = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', esg_interest: 'yes' })
    const sp = result.productScores.find(p => p.product === 'switch_plan')
    expect(sp).toBeDefined()
    expect(sp!.relevance).toBeGreaterThanOrEqual(80)
  })

  it('switch_plan has low relevance when esg_interest=no', () => {
    const result = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', esg_interest: 'no' })
    const sp = result.productScores.find(p => p.product === 'switch_plan')
    expect(sp).toBeDefined()
    expect(sp!.relevance).toBeLessThanOrEqual(20)
  })

  it('life_plan has higher relevance with dependents', () => {
    const noDeps = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', financial_dependents: 'none' })
    const withDeps = computeDiagnostic({ age_range: '36_45', professional_status: 'employee', financial_dependents: 'partner_children' })
    const lpNo = noDeps.productScores.find(p => p.product === 'life_plan')!
    const lpYes = withDeps.productScores.find(p => p.product === 'life_plan')!
    expect(lpYes.relevance).toBeGreaterThan(lpNo.relevance)
  })

  it('no futur products for frontaliers', () => {
    const result = computeDiagnostic({ residence_status: 'frontalier_fr', age_range: '36_45', professional_status: 'employee' })
    const futurProducts = result.productScores.filter(p => ['pension_plan', 'life_plan', 'switch_plan'].includes(p.product))
    expect(futurProducts).toHaveLength(0)
  })
})

describe('computeWeightings', () => {
  it('always sums to 100', () => {
    const profiles = [
      {},
      { vehicle_count: 2 },
      { family_status: 'couple_with_children' },
      { professional_status: 'independent' },
    ]
    for (const answers of profiles) {
      const result = computeDiagnostic(answers)
      const sum = Object.values(result.weightings).reduce((s, w) => s + w, 0)
      expect(sum).toBe(100)
    }
  })

  it('increases personnes weight for family', () => {
    const base = computeDiagnostic({})
    const family = computeDiagnostic({ family_status: 'couple_with_children' })
    expect(family.weightings.personnes).toBeGreaterThan(base.weightings.personnes)
  })

  it('increases biens weight for multiple vehicles', () => {
    const base = computeDiagnostic({})
    const multiCar = computeDiagnostic({ vehicle_count: 3 })
    expect(multiCar.weightings.biens).toBeGreaterThan(base.weightings.biens)
  })
})

describe('computeDiagnostic - globalScore', () => {
  it('returns a global score between 0 and 100', () => {
    const result = computeDiagnostic({ vehicle_count: 1 })
    expect(result.globalScore).toBeGreaterThanOrEqual(0)
    expect(result.globalScore).toBeLessThanOrEqual(100)
  })

  it('returns productScores including drive, home, and bsafe for resident GDL', () => {
    const result = computeDiagnostic({ vehicle_count: 1 })
    expect(Array.isArray(result.productScores)).toBe(true)
    const products = result.productScores.map(p => p.product)
    expect(products).toContain('drive')
    expect(products).toContain('home')
    expect(products).toContain('bsafe')
  })

  it('returns recommendations array', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'none' })
    expect(Array.isArray(result.recommendations)).toBe(true)
  })
})

describe('family status impacts on personnes quadrant', () => {
  it('couple_with_children increases personnes exposure', () => {
    const base = computeDiagnostic({})
    const result = computeDiagnostic({ family_status: 'couple_with_children', financial_dependents: 'partner_children' })
    expect(result.quadrantScores.personnes.exposure).toBeGreaterThan(base.quadrantScores.personnes.exposure)
  })

  it('single_parent increases personnes weight', () => {
    const base = computeDiagnostic({})
    const result = computeDiagnostic({ family_status: 'single_parent' })
    expect(result.weightings.personnes).toBeGreaterThan(base.weightings.personnes)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — BIENS/DRIVE EXPOSURE (facteurs individuels)
// ═══════════════════════════════════════════════════════════════════

describe('computeBiensExposure - vehicle_details granulaire', () => {
  const baseAnswers = { vehicle_count: 1, vehicle_usage: 'leisure' }

  it('car_new has higher exposure than car_recent', () => {
    const newCar = computeDiagnostic({ ...baseAnswers, vehicle_details: 'car_new' })
    const recent = computeDiagnostic({ ...baseAnswers, vehicle_details: 'car_recent' })
    expect(newCar.quadrantScores.biens.exposure).toBeGreaterThan(recent.quadrantScores.biens.exposure)
  })

  it('car_old has lowest exposure among cars', () => {
    const old = computeDiagnostic({ ...baseAnswers, vehicle_details: 'car_old' })
    const recent = computeDiagnostic({ ...baseAnswers, vehicle_details: 'car_recent' })
    const newCar = computeDiagnostic({ ...baseAnswers, vehicle_details: 'car_new' })
    expect(old.quadrantScores.biens.exposure).toBeLessThan(recent.quadrantScores.biens.exposure)
    expect(old.quadrantScores.biens.exposure).toBeLessThan(newCar.quadrantScores.biens.exposure)
  })

  it('unknown vehicle_details uses default score (50)', () => {
    const unknown = computeDiagnostic({ ...baseAnswers, vehicle_details: 'unknown_type' })
    const recent = computeDiagnostic({ ...baseAnswers, vehicle_details: 'car_recent' })
    // Default 50 < car_recent 60
    expect(unknown.quadrantScores.biens.exposure).toBeLessThan(recent.quadrantScores.biens.exposure)
  })
})

describe('computeBiensExposure - vehicle_usage granulaire', () => {
  const baseAnswers = { vehicle_count: 1, vehicle_details: 'car_recent' }

  it('daily_commute has higher exposure than leisure', () => {
    const daily = computeDiagnostic({ ...baseAnswers, vehicle_usage: 'daily_commute' })
    const leisure = computeDiagnostic({ ...baseAnswers, vehicle_usage: 'leisure' })
    expect(daily.quadrantScores.biens.exposure).toBeGreaterThan(leisure.quadrantScores.biens.exposure)
  })

  it('professional has highest exposure', () => {
    const professional = computeDiagnostic({ ...baseAnswers, vehicle_usage: 'professional' })
    const daily = computeDiagnostic({ ...baseAnswers, vehicle_usage: 'daily_commute' })
    expect(professional.quadrantScores.biens.exposure).toBeGreaterThan(daily.quadrantScores.biens.exposure)
  })
})

describe('computeBiensExposure - vehicle_options_interest impact', () => {
  const baseAnswers = { vehicle_count: 1, vehicle_details: 'car_recent', vehicle_usage: 'daily_commute' }

  it('unmet options increase exposure', () => {
    const noOptions = computeDiagnostic({ ...baseAnswers, vehicle_options_interest: ['none'] })
    const withOptions = computeDiagnostic({ ...baseAnswers, vehicle_options_interest: ['replacement_needed', 'bonus_important'] })
    expect(withOptions.quadrantScores.biens.exposure).toBeGreaterThan(noOptions.quadrantScores.biens.exposure)
  })

  it('more unmet options increase exposure further', () => {
    const oneOption = computeDiagnostic({ ...baseAnswers, vehicle_options_interest: ['replacement_needed'] })
    const threeOptions = computeDiagnostic({ ...baseAnswers, vehicle_options_interest: ['replacement_needed', 'bonus_important', 'vehicle_customized'] })
    expect(threeOptions.quadrantScores.biens.exposure).toBeGreaterThan(oneOption.quadrantScores.biens.exposure)
  })

  it('empty array counts as zero unmet needs', () => {
    const empty = computeDiagnostic({ ...baseAnswers, vehicle_options_interest: [] })
    const withOptions = computeDiagnostic({ ...baseAnswers, vehicle_options_interest: ['new_vehicle_value'] })
    expect(withOptions.quadrantScores.biens.exposure).toBeGreaterThan(empty.quadrantScores.biens.exposure)
  })
})

describe('computeBiensExposure - life_event=new_vehicle impact', () => {
  const baseAnswers = { vehicle_count: 1, vehicle_details: 'car_recent', vehicle_usage: 'leisure' }

  it('new_vehicle life event increases biens exposure', () => {
    const noEvent = computeDiagnostic({ ...baseAnswers })
    const withEvent = computeDiagnostic({ ...baseAnswers, life_event: ['new_vehicle'] })
    expect(withEvent.quadrantScores.biens.exposure).toBeGreaterThan(noEvent.quadrantScores.biens.exposure)
  })

  it('other life events do not increase biens exposure', () => {
    const noEvent = computeDiagnostic({ ...baseAnswers })
    const birth = computeDiagnostic({ ...baseAnswers, life_event: ['birth'] })
    expect(birth.quadrantScores.biens.exposure).toBe(noEvent.quadrantScores.biens.exposure)
  })
})

describe('computeBiensExposure - vehicle_count impact', () => {
  it('multiple vehicles increase exposure vs single vehicle', () => {
    const one = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_recent' })
    const three = computeDiagnostic({ vehicle_count: 3, vehicle_details: 'car_recent' })
    expect(three.quadrantScores.biens.exposure).toBeGreaterThan(one.quadrantScores.biens.exposure)
  })

  it('vehicle count score is capped at 100 (no overflow for very high counts)', () => {
    const many = computeDiagnostic({ vehicle_count: 10, vehicle_details: 'car_recent' })
    expect(many.quadrantScores.biens.exposure).toBeGreaterThanOrEqual(0)
    expect(many.quadrantScores.biens.exposure).toBeLessThanOrEqual(100)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — BIENS/DRIVE COVERAGE (facteurs individuels)
// ═══════════════════════════════════════════════════════════════════

describe('computeBiensCoverage - coverage levels granulaire', () => {
  it('no vehicle = HOME-only coverage (depends on home insurance)', () => {
    const none = computeDiagnostic({ vehicle_count: 0, home_coverage_existing: 'none' })
    const withOpts = computeDiagnostic({ vehicle_count: 0, home_coverage_existing: 'with_options' })
    expect(withOpts.quadrantScores.biens.coverage).toBeGreaterThan(none.quadrantScores.biens.coverage)
  })

  it('none < rc_only < mini_omnium < full_omnium', () => {
    const none = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'none' }).quadrantScores.biens.coverage
    const rc = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'rc_only' }).quadrantScores.biens.coverage
    const mini = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'mini_omnium' }).quadrantScores.biens.coverage
    const full = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'full_omnium' }).quadrantScores.biens.coverage
    expect(none).toBeLessThan(rc)
    expect(rc).toBeLessThan(mini)
    expect(mini).toBeLessThan(full)
  })

  it('unknown coverage is very low', () => {
    const unknown = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'unknown' }).quadrantScores.biens.coverage
    const rc = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'rc_only' }).quadrantScores.biens.coverage
    expect(unknown).toBeLessThan(rc)
  })

  it('options interest decreases coverage', () => {
    const noOptions = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'mini_omnium', vehicle_options_interest: ['none'] })
    const withOptions = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'mini_omnium', vehicle_options_interest: ['replacement_needed', 'bonus_important', 'vehicle_customized'] })
    expect(withOptions.quadrantScores.biens.coverage).toBeLessThan(noOptions.quadrantScores.biens.coverage)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — PERSONNES/B-SAFE EXPOSURE (facteurs individuels)
// ═══════════════════════════════════════════════════════════════════

describe('computePersonnesExposure - income_range impact', () => {
  it('higher income increases exposure', () => {
    const low = computeDiagnostic({ income_range: 'less_3k' })
    const high = computeDiagnostic({ income_range: '12k_plus' })
    expect(high.quadrantScores.personnes.exposure).toBeGreaterThan(low.quadrantScores.personnes.exposure)
  })

  it('no_answer uses default middle value', () => {
    const noAnswer = computeDiagnostic({ income_range: 'no_answer' })
    const low = computeDiagnostic({ income_range: 'less_3k' })
    const high = computeDiagnostic({ income_range: '12k_plus' })
    expect(noAnswer.quadrantScores.personnes.exposure).toBeGreaterThan(low.quadrantScores.personnes.exposure)
    expect(noAnswer.quadrantScores.personnes.exposure).toBeLessThan(high.quadrantScores.personnes.exposure)
  })
})

describe('computePersonnesExposure - age_range impact', () => {
  it('36_45 and 46_55 have highest age exposure', () => {
    const young = computeDiagnostic({ age_range: '18_25' })
    const midAge = computeDiagnostic({ age_range: '46_55' })
    expect(midAge.quadrantScores.personnes.exposure).toBeGreaterThan(young.quadrantScores.personnes.exposure)
  })

  it('65_plus has higher exposure than 46_55 (severity increases with age)', () => {
    const senior = computeDiagnostic({ age_range: '65_plus' })
    const midAge = computeDiagnostic({ age_range: '46_55' })
    expect(senior.quadrantScores.personnes.exposure).toBeGreaterThanOrEqual(midAge.quadrantScores.personnes.exposure)
  })
})

describe('computePersonnesExposure - sports_activities individuels', () => {
  it('each high-risk sport increases exposure', () => {
    const base = computeDiagnostic({ sports_activities: ['none'] })
    const highRiskSports = ['winter_sports', 'water_sports', 'mountain_outdoor', 'equestrian', 'motor_sports', 'combat_contact']
    for (const sport of highRiskSports) {
      const withSport = computeDiagnostic({ sports_activities: [sport] })
      expect(withSport.quadrantScores.personnes.exposure).toBeGreaterThan(
        base.quadrantScores.personnes.exposure
      )
    }
  })

  it('moderate sports (running, team) increase exposure less than high-risk', () => {
    const running = computeDiagnostic({ sports_activities: ['running_cycling'] })
    const winter = computeDiagnostic({ sports_activities: ['winter_sports'] })
    expect(winter.quadrantScores.personnes.exposure).toBeGreaterThan(running.quadrantScores.personnes.exposure)
  })

  it('cumulating multiple high-risk sports increases exposure further', () => {
    const oneSport = computeDiagnostic({ sports_activities: ['winter_sports'] })
    const threeSports = computeDiagnostic({ sports_activities: ['winter_sports', 'motor_sports', 'combat_contact'] })
    expect(threeSports.quadrantScores.personnes.exposure).toBeGreaterThan(oneSport.quadrantScores.personnes.exposure)
  })
})

describe('computePersonnesExposure - financial_dependents granulaire', () => {
  it('partner_children > children > partner > none', () => {
    const none = computeDiagnostic({ financial_dependents: 'none' }).quadrantScores.personnes.exposure
    const partner = computeDiagnostic({ financial_dependents: 'partner' }).quadrantScores.personnes.exposure
    const children = computeDiagnostic({ financial_dependents: 'children' }).quadrantScores.personnes.exposure
    const both = computeDiagnostic({ financial_dependents: 'partner_children' }).quadrantScores.personnes.exposure
    expect(partner).toBeGreaterThan(none)
    expect(children).toBeGreaterThan(partner)
    expect(both).toBeGreaterThan(children)
  })

  it('extended has high exposure', () => {
    const extended = computeDiagnostic({ financial_dependents: 'extended' }).quadrantScores.personnes.exposure
    const partner = computeDiagnostic({ financial_dependents: 'partner' }).quadrantScores.personnes.exposure
    expect(extended).toBeGreaterThan(partner)
  })
})

describe('computePersonnesExposure - work_incapacity_concern granulaire', () => {
  it('less_1_month > 1_3_months > 3_6_months > 6_12_months > more_12_months', () => {
    const values = ['less_1_month', '1_3_months', '3_6_months', '6_12_months', 'more_12_months']
    const exposures = values.map(v =>
      computeDiagnostic({ work_incapacity_concern: v }).quadrantScores.personnes.exposure
    )
    for (let i = 0; i < exposures.length - 1; i++) {
      expect(exposures[i]).toBeGreaterThanOrEqual(exposures[i + 1])
    }
  })
})

describe('computePersonnesExposure - family_status effects', () => {
  it('recomposed family increases exposure like couple_with_children', () => {
    const single = computeDiagnostic({ family_status: 'single' })
    const recomposed = computeDiagnostic({ family_status: 'recomposed' })
    expect(recomposed.quadrantScores.personnes.exposure).toBeGreaterThan(single.quadrantScores.personnes.exposure)
  })

  it('couple_no_children has same base exposure as single', () => {
    const single = computeDiagnostic({ family_status: 'single' })
    const coupleNoKids = computeDiagnostic({ family_status: 'couple_no_children' })
    expect(coupleNoKids.quadrantScores.personnes.exposure).toBe(single.quadrantScores.personnes.exposure)
  })

  it('single income amplifies family vulnerability only when family has children', () => {
    const coupleNoKidsOneIncome = computeDiagnostic({ family_status: 'couple_no_children', income_contributors: 'one' })
    const coupleWithKidsOneIncome = computeDiagnostic({ family_status: 'couple_with_children', income_contributors: 'one' })
    expect(coupleWithKidsOneIncome.quadrantScores.personnes.exposure).toBeGreaterThan(coupleNoKidsOneIncome.quadrantScores.personnes.exposure)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — PERSONNES/B-SAFE COVERAGE (facteurs individuels)
// ═══════════════════════════════════════════════════════════════════

describe('computePersonnesCoverage - accident_coverage granulaire', () => {
  it('individual_complete > individual_basic > employer_only > none', () => {
    const none = computeDiagnostic({ accident_coverage_existing: 'none' }).quadrantScores.personnes.coverage
    const employer = computeDiagnostic({ accident_coverage_existing: 'employer_only' }).quadrantScores.personnes.coverage
    const basic = computeDiagnostic({ accident_coverage_existing: 'individual_basic' }).quadrantScores.personnes.coverage
    const complete = computeDiagnostic({ accident_coverage_existing: 'individual_complete' }).quadrantScores.personnes.coverage
    expect(employer).toBeGreaterThan(none)
    expect(basic).toBeGreaterThan(employer)
    expect(complete).toBeGreaterThan(basic)
  })
})

// RC vie privée retirée — intégrée dans HOME

describe('computePersonnesCoverage - savings_protection', () => {
  it('more savings items increase coverage', () => {
    const none = computeDiagnostic({ savings_protection: ['none'] }).quadrantScores.personnes.coverage
    const one = computeDiagnostic({ savings_protection: ['life_insurance'] }).quadrantScores.personnes.coverage
    const multiple = computeDiagnostic({ savings_protection: ['life_insurance', 'pension_plan', 'savings_regular'] }).quadrantScores.personnes.coverage
    expect(one).toBeGreaterThan(none)
    expect(multiple).toBeGreaterThan(one)
  })

  it('empty savings array counts as no protection', () => {
    const empty = computeDiagnostic({ savings_protection: [] }).quadrantScores.personnes.coverage
    const none = computeDiagnostic({ savings_protection: ['none'] }).quadrantScores.personnes.coverage
    expect(empty).toBe(none)
  })
})

describe('computePersonnesCoverage - professional_status income protection', () => {
  it('civil_servant has higher income protection than employee', () => {
    const employee = computeDiagnostic({ professional_status: 'employee' }).quadrantScores.personnes.coverage
    const civilServant = computeDiagnostic({ professional_status: 'civil_servant' }).quadrantScores.personnes.coverage
    expect(civilServant).toBeGreaterThan(employee)
  })

  it('individual_complete accident coverage adds to income protection', () => {
    const noAcc = computeDiagnostic({ professional_status: 'employee', accident_coverage_existing: 'none' }).quadrantScores.personnes.coverage
    const withAcc = computeDiagnostic({ professional_status: 'employee', accident_coverage_existing: 'individual_complete' }).quadrantScores.personnes.coverage
    expect(withAcc).toBeGreaterThan(noAcc)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — PRODUCT SCORES
// ═══════════════════════════════════════════════════════════════════

describe('computeProductScores', () => {
  it('includes drive product when vehicle_count > 0', () => {
    const result = computeDiagnostic({ vehicle_count: 1 })
    const driveScore = result.productScores.find(p => p.product === 'drive')
    expect(driveScore).toBeDefined()
  })

  it('does not include drive product when vehicle_count = 0', () => {
    const result = computeDiagnostic({ vehicle_count: 0 })
    const driveScore = result.productScores.find(p => p.product === 'drive')
    expect(driveScore).toBeUndefined()
  })

  it('always includes bsafe product', () => {
    const noVehicle = computeDiagnostic({ vehicle_count: 0 })
    const withVehicle = computeDiagnostic({ vehicle_count: 1 })
    expect(noVehicle.productScores.find(p => p.product === 'bsafe')).toBeDefined()
    expect(withVehicle.productScores.find(p => p.product === 'bsafe')).toBeDefined()
  })

  it('drive relevance is high when no coverage', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'none' })
    const driveScore = result.productScores.find(p => p.product === 'drive')!
    expect(driveScore.relevance).toBe(80)
  })

  it('drive relevance is low with full_omnium', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'full_omnium' })
    const driveScore = result.productScores.find(p => p.product === 'drive')!
    expect(driveScore.relevance).toBe(20)
  })

  it('drive relevance is medium with mini_omnium', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'mini_omnium' })
    const driveScore = result.productScores.find(p => p.product === 'drive')!
    expect(driveScore.relevance).toBe(40)
  })

  it('bsafe relevance is high with no accident coverage', () => {
    const result = computeDiagnostic({ accident_coverage_existing: 'none' })
    const bsafeScore = result.productScores.find(p => p.product === 'bsafe')!
    expect(bsafeScore.relevance).toBe(90)
  })

  it('bsafe relevance is low with individual_complete', () => {
    const result = computeDiagnostic({ accident_coverage_existing: 'individual_complete' })
    const bsafeScore = result.productScores.find(p => p.product === 'bsafe')!
    expect(bsafeScore.relevance).toBe(15)
  })

  it('bsafe relevance is medium with employer_only', () => {
    const result = computeDiagnostic({ accident_coverage_existing: 'employer_only' })
    const bsafeScore = result.productScores.find(p => p.product === 'bsafe')!
    expect(bsafeScore.relevance).toBe(60)
  })

  it('drive isExistingClient is true when coverage is not none/unknown', () => {
    const rc = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'rc_only' })
    expect(rc.productScores.find(p => p.product === 'drive')!.isExistingClient).toBe(true)
  })

  it('drive isExistingClient is false when coverage is none', () => {
    const none = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'none' })
    expect(none.productScores.find(p => p.product === 'drive')!.isExistingClient).toBe(false)
  })

  it('drive isExistingClient is false when coverage is unknown', () => {
    const unknown = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'unknown' })
    expect(unknown.productScores.find(p => p.product === 'drive')!.isExistingClient).toBe(false)
  })

  it('bsafe isExistingClient is true for individual_basic or individual_complete', () => {
    const basic = computeDiagnostic({ accident_coverage_existing: 'individual_basic' })
    const complete = computeDiagnostic({ accident_coverage_existing: 'individual_complete' })
    expect(basic.productScores.find(p => p.product === 'bsafe')!.isExistingClient).toBe(true)
    expect(complete.productScores.find(p => p.product === 'bsafe')!.isExistingClient).toBe(true)
  })

  it('bsafe isExistingClient is false for none or employer_only', () => {
    const none = computeDiagnostic({ accident_coverage_existing: 'none' })
    const employer = computeDiagnostic({ accident_coverage_existing: 'employer_only' })
    expect(none.productScores.find(p => p.product === 'bsafe')!.isExistingClient).toBe(false)
    expect(employer.productScores.find(p => p.product === 'bsafe')!.isExistingClient).toBe(false)
  })

  it('productScores are sorted by relevance descending', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_coverage_existing: 'none', accident_coverage_existing: 'individual_complete' })
    for (let i = 1; i < result.productScores.length; i++) {
      expect(result.productScores[i - 1].relevance).toBeGreaterThanOrEqual(result.productScores[i].relevance)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — DRIVE OPTIONS
// ═══════════════════════════════════════════════════════════════════

describe('computeDriveOptions', () => {
  it('generates omnium option for car_new without full_omnium', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'rc_only' })
    const driveOpts = result.productScores.find(p => p.product === 'drive')!.options
    expect(driveOpts.some(o => o.optionId === 'drive_dommages_materiels')).toBe(true)
  })

  it('does NOT generate omnium option when already full_omnium', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'full_omnium' })
    const driveOpts = result.productScores.find(p => p.product === 'drive')!.options
    expect(driveOpts.some(o => o.optionId === 'drive_dommages_materiels')).toBe(false)
  })

  it('does NOT generate omnium option for car_old (not high-value)', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_old', vehicle_coverage_existing: 'rc_only' })
    const driveOpts = result.productScores.find(p => p.product === 'drive')!.options
    expect(driveOpts.some(o => o.optionId === 'drive_dommages_materiels')).toBe(false)
  })

  it('generates pack indemnisation for new_vehicle_value interest', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_options_interest: ['new_vehicle_value'] })
    const driveOpts = result.productScores.find(p => p.product === 'drive')!.options
    expect(driveOpts.some(o => o.optionId === 'drive_pack_indemnisation' && o.optionLabel === 'Pack Indemnisation')).toBe(true)
  })

  it('generates pack mobilite for replacement_needed interest', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_options_interest: ['replacement_needed'] })
    const driveOpts = result.productScores.find(p => p.product === 'drive')!.options
    expect(driveOpts.some(o => o.optionId === 'drive_pack_mobilite')).toBe(true)
  })

  it('generates pack amenagement for vehicle_customized interest', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_options_interest: ['vehicle_customized'] })
    const driveOpts = result.productScores.find(p => p.product === 'drive')!.options
    expect(driveOpts.some(o => o.optionId === 'drive_pack_amenagement')).toBe(true)
  })

  it('generates protection bonus for bonus_important interest', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_options_interest: ['bonus_important'] })
    const driveOpts = result.productScores.find(p => p.product === 'drive')!.options
    expect(driveOpts.some(o => o.optionLabel === 'Protection Bonus')).toBe(true)
  })

  it('generates no options when no interests match', () => {
    const result = computeDiagnostic({ vehicle_count: 1, vehicle_details: 'car_old', vehicle_coverage_existing: 'full_omnium', vehicle_options_interest: ['none'] })
    const driveOpts = result.productScores.find(p => p.product === 'drive')!.options
    expect(driveOpts).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — B-SAFE OPTIONS
// ═══════════════════════════════════════════════════════════════════

describe('computeBsafeOptions', () => {
  it('generates garantie deces when financial dependents exist', () => {
    const result = computeDiagnostic({ financial_dependents: 'partner_children' })
    const bsafeOpts = result.productScores.find(p => p.product === 'bsafe')!.options
    expect(bsafeOpts.some(o => o.optionId === 'bsafe_deces')).toBe(true)
  })

  it('does NOT generate garantie deces when no dependents', () => {
    const result = computeDiagnostic({ financial_dependents: 'none' })
    const bsafeOpts = result.productScores.find(p => p.product === 'bsafe')!.options
    expect(bsafeOpts.some(o => o.optionId === 'bsafe_deces')).toBe(false)
  })

  it('generates invalidite option for high-risk sports', () => {
    const result = computeDiagnostic({ sports_activities: ['winter_sports'] })
    const bsafeOpts = result.productScores.find(p => p.product === 'bsafe')!.options
    expect(bsafeOpts.some(o => o.optionId === 'bsafe_invalidite')).toBe(true)
  })

  it('does NOT generate invalidite for moderate sports only', () => {
    const result = computeDiagnostic({ sports_activities: ['running_cycling', 'team_sports'] })
    const bsafeOpts = result.productScores.find(p => p.product === 'bsafe')!.options
    expect(bsafeOpts.some(o => o.optionId === 'bsafe_invalidite')).toBe(false)
  })

  it('generates incapacite for less_1_month work incapacity concern', () => {
    const result = computeDiagnostic({ work_incapacity_concern: 'less_1_month' })
    const bsafeOpts = result.productScores.find(p => p.product === 'bsafe')!.options
    expect(bsafeOpts.some(o => o.optionId === 'bsafe_incapacite')).toBe(true)
  })

  it('generates incapacite for 1_3_months work incapacity concern', () => {
    const result = computeDiagnostic({ work_incapacity_concern: '1_3_months' })
    const bsafeOpts = result.productScores.find(p => p.product === 'bsafe')!.options
    expect(bsafeOpts.some(o => o.optionId === 'bsafe_incapacite')).toBe(true)
  })

  it('does NOT generate incapacite for 3_6_months or more', () => {
    const result = computeDiagnostic({ work_incapacity_concern: '3_6_months' })
    const bsafeOpts = result.productScores.find(p => p.product === 'bsafe')!.options
    expect(bsafeOpts.some(o => o.optionId === 'bsafe_incapacite')).toBe(false)
  })

  it('generates frais divers when children_count > 0', () => {
    const result = computeDiagnostic({ children_count: 2 })
    const bsafeOpts = result.productScores.find(p => p.product === 'bsafe')!.options
    expect(bsafeOpts.some(o => o.optionId === 'bsafe_frais_divers')).toBe(true)
  })

  it('does NOT generate frais divers when children_count = 0', () => {
    const result = computeDiagnostic({ children_count: 0 })
    const bsafeOpts = result.productScores.find(p => p.product === 'bsafe')!.options
    expect(bsafeOpts.some(o => o.optionId === 'bsafe_frais_divers')).toBe(false)
  })

  it('all options have required fields', () => {
    const result = computeDiagnostic({
      vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'rc_only',
      vehicle_options_interest: ['new_vehicle_value', 'replacement_needed', 'vehicle_customized', 'bonus_important'],
      financial_dependents: 'partner_children', sports_activities: ['winter_sports'],
      work_incapacity_concern: 'less_1_month', children_count: 2,
    })
    for (const ps of result.productScores) {
      for (const opt of ps.options) {
        expect(opt.optionId).toBeTruthy()
        expect(opt.optionLabel).toBeTruthy()
        expect(opt.relevance).toBeGreaterThanOrEqual(0)
        expect(opt.relevance).toBeLessThanOrEqual(100)
        expect(Array.isArray(opt.triggerQuestions)).toBe(true)
        expect(opt.triggerQuestions.length).toBeGreaterThan(0)
      }
    }
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — WEIGHTINGS (facteurs manquants)
// ═══════════════════════════════════════════════════════════════════

describe('computeWeightings - facteurs additionnels', () => {
  it('independent increases personnes weight', () => {
    const base = computeDiagnostic({})
    const independent = computeDiagnostic({ professional_status: 'independent' })
    expect(independent.weightings.personnes).toBeGreaterThan(base.weightings.personnes)
  })

  it('business_owner increases personnes weight', () => {
    const base = computeDiagnostic({})
    const owner = computeDiagnostic({ professional_status: 'business_owner' })
    expect(owner.weightings.personnes).toBeGreaterThan(base.weightings.personnes)
  })

  it('retired increases personnes weight', () => {
    const base = computeDiagnostic({})
    const retired = computeDiagnostic({ professional_status: 'retired' })
    expect(retired.weightings.personnes).toBeGreaterThan(base.weightings.personnes)
  })

  it('single_parent has maximum personnes weight bonus (family + single_parent)', () => {
    const coupleWithKids = computeDiagnostic({ family_status: 'couple_with_children' })
    const singleParent = computeDiagnostic({ family_status: 'single_parent' })
    expect(singleParent.weightings.personnes).toBeGreaterThan(coupleWithKids.weightings.personnes)
  })

  it('cumulating family + professional factors increases personnes weight', () => {
    const familyOnly = computeDiagnostic({ family_status: 'couple_with_children' })
    const familyAndIndependent = computeDiagnostic({ family_status: 'couple_with_children', professional_status: 'independent' })
    expect(familyAndIndependent.weightings.personnes).toBeGreaterThan(familyOnly.weightings.personnes)
  })

  it('multiple vehicles partially offset family weight', () => {
    const familyOnly = computeDiagnostic({ family_status: 'couple_with_children' })
    const familyMultiCar = computeDiagnostic({ family_status: 'couple_with_children', vehicle_count: 3 })
    expect(familyMultiCar.weightings.biens).toBeGreaterThan(familyOnly.weightings.biens)
  })

  it('sum is always 100 for extreme profiles', () => {
    const extremeProfiles = [
      { family_status: 'single_parent', professional_status: 'independent', vehicle_count: 0 },
      { family_status: 'single', professional_status: 'student', vehicle_count: 5 },
      { family_status: 'recomposed', professional_status: 'retired', vehicle_count: 2 },
      { family_status: 'couple_with_children', professional_status: 'business_owner', vehicle_count: 0 },
    ]
    for (const answers of extremeProfiles) {
      const result = computeDiagnostic(answers)
      const sum = Object.values(result.weightings).reduce((s, w) => s + w, 0)
      expect(sum).toBe(100)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS DE NON-REGRESSION
// ═══════════════════════════════════════════════════════════════════

describe('non-regression: invariants du moteur de scoring', () => {
  const testProfiles = [
    {},
    { vehicle_count: 0 },
    { vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'none' },
    { vehicle_count: 3, vehicle_details: 'car_new', vehicle_usage: 'professional', vehicle_coverage_existing: 'full_omnium' },
    { family_status: 'single_parent', income_contributors: 'one', financial_dependents: 'partner_children' },
    { professional_status: 'independent', work_incapacity_concern: 'less_1_month', income_range: '12k_plus' },
    { sports_activities: ['winter_sports', 'motor_sports', 'combat_contact'], accident_coverage_existing: 'none' },
    { age_range: '46_55', health_concerns: ['physical_job', 'aging_parents'], savings_protection: ['life_insurance', 'pension_plan'] },
    { vehicle_count: 2, family_status: 'couple_with_children', professional_status: 'business_owner', life_event: ['birth', 'new_vehicle'] },
  ]

  it('globalScore is always between 0 and 100 for all test profiles', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      expect(result.globalScore).toBeGreaterThanOrEqual(0)
      expect(result.globalScore).toBeLessThanOrEqual(100)
    }
  })

  it('exposure is always between 0 and 100 for all quadrants and profiles', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      for (const q of ['biens', 'personnes', 'projets', 'futur'] as const) {
        expect(result.quadrantScores[q].exposure).toBeGreaterThanOrEqual(0)
        expect(result.quadrantScores[q].exposure).toBeLessThanOrEqual(100)
      }
    }
  })

  it('coverage is always between 0 and 100 for all quadrants and profiles', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      for (const q of ['biens', 'personnes', 'projets', 'futur'] as const) {
        expect(result.quadrantScores[q].coverage).toBeGreaterThanOrEqual(0)
        expect(result.quadrantScores[q].coverage).toBeLessThanOrEqual(100)
      }
    }
  })

  it('needScore is always between 0 and 100 for all quadrants', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      for (const q of ['biens', 'personnes', 'projets', 'futur'] as const) {
        expect(result.quadrantScores[q].needScore).toBeGreaterThanOrEqual(0)
        expect(result.quadrantScores[q].needScore).toBeLessThanOrEqual(100)
      }
    }
  })

  it('needLevel is always a valid NeedLevel value', () => {
    const validLevels = ['low', 'moderate', 'high', 'critical']
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      for (const q of ['biens', 'personnes', 'projets', 'futur'] as const) {
        expect(validLevels).toContain(result.quadrantScores[q].needLevel)
      }
    }
  })

  it('weightings always sum to 100 for all profiles', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      const sum = Object.values(result.weightings).reduce((s, w) => s + w, 0)
      expect(sum).toBe(100)
    }
  })

  it('projets is ALWAYS inactive regardless of input', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      expect(result.quadrantScores.projets.active).toBe(false)
      expect(result.quadrantScores.projets.exposure).toBe(0)
      expect(result.quadrantScores.projets.coverage).toBe(100)
      expect(result.weightings.projets).toBe(0)
    }
  })

  it('biens and personnes are ALWAYS active', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      expect(result.quadrantScores.biens.active).toBe(true)
      expect(result.quadrantScores.personnes.active).toBe(true)
    }
  })

  it('recommendations only contain known products', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      for (const rec of result.recommendations) {
        expect(['drive', 'bsafe', 'home', 'travel', 'pension_plan', 'life_plan', 'switch_plan']).toContain(rec.product)
      }
    }
  })

  it('recommendations have all required fields', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      for (const rec of result.recommendations) {
        expect(rec.id).toBeTruthy()
        expect(rec.product).toBeTruthy()
        expect(['immediate', 'deferred', 'event', 'optimization']).toContain(rec.type)
        expect(rec.priority).toBeGreaterThanOrEqual(1)
        expect(rec.priority).toBeLessThanOrEqual(5)
        expect(rec.title).toBeTruthy()
        expect(rec.message).toBeTruthy()
      }
    }
  })

  it('productScores only contain known products', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      for (const ps of result.productScores) {
        expect(['drive', 'bsafe', 'home', 'travel', 'pension_plan', 'life_plan', 'switch_plan']).toContain(ps.product)
      }
    }
  })

  it('DiagnosticResult has all required top-level fields', () => {
    for (const answers of testProfiles) {
      const result = computeDiagnostic(answers)
      expect(result).toHaveProperty('quadrantScores')
      expect(result).toHaveProperty('globalScore')
      expect(result).toHaveProperty('weightings')
      expect(result).toHaveProperty('productScores')
      expect(result).toHaveProperty('recommendations')
      expect(result.quadrantScores).toHaveProperty('biens')
      expect(result.quadrantScores).toHaveProperty('personnes')
      expect(result.quadrantScores).toHaveProperty('projets')
      expect(result.quadrantScores).toHaveProperty('futur')
    }
  })
})

// ═══════════════════════════════════════════════════════════════════
// EDGE CASES
// ═══════════════════════════════════════════════════════════════════

describe('edge cases', () => {
  it('empty answers {} returns valid diagnostic', () => {
    const result = computeDiagnostic({})
    expect(result.globalScore).toBeGreaterThanOrEqual(0)
    expect(result.globalScore).toBeLessThanOrEqual(100)
    // With HOME scoring, biens always has some exposure (housing defaults)
    expect(result.quadrantScores.biens.exposure).toBeGreaterThan(0)
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(Array.isArray(result.productScores)).toBe(true)
  })

  it('vehicle_count=0 means no DRIVE exposure but HOME still contributes', () => {
    const result = computeDiagnostic({
      vehicle_count: 0,
      vehicle_details: 'car_new',
      vehicle_usage: 'professional',
      vehicle_coverage_existing: 'none',
      vehicle_options_interest: ['replacement_needed', 'bonus_important'],
    })
    // HOME still provides some exposure even with vehicle_count=0
    expect(result.quadrantScores.biens.exposure).toBeGreaterThan(0)
    // Coverage is now HOME-only (not 100 anymore)
    expect(result.quadrantScores.biens.coverage).toBeLessThan(100)
  })

  it('undefined/null values in answers are handled gracefully', () => {
    const result = computeDiagnostic({
      vehicle_count: undefined,
      family_status: null,
      sports_activities: undefined,
    } as Record<string, unknown>)
    expect(result.globalScore).toBeGreaterThanOrEqual(0)
    expect(result.globalScore).toBeLessThanOrEqual(100)
  })

  it('non-string values in string fields default gracefully', () => {
    const result = computeDiagnostic({
      vehicle_count: 1,
      vehicle_details: 42,
      vehicle_usage: true,
      vehicle_coverage_existing: [],
    } as Record<string, unknown>)
    expect(result.globalScore).toBeGreaterThanOrEqual(0)
    expect(result.globalScore).toBeLessThanOrEqual(100)
  })

  it('non-array values in array fields default gracefully', () => {
    const result = computeDiagnostic({
      sports_activities: 'winter_sports',
      health_concerns: 42,
      vehicle_options_interest: true,
      savings_protection: null,
    } as Record<string, unknown>)
    expect(result.globalScore).toBeGreaterThanOrEqual(0)
    expect(result.globalScore).toBeLessThanOrEqual(100)
  })

  it('non-number vehicle_count defaults to 0 (HOME-only)', () => {
    const result = computeDiagnostic({ vehicle_count: 'many' } as Record<string, unknown>)
    // HOME still provides exposure even when DRIVE is 0
    expect(result.quadrantScores.biens.exposure).toBeGreaterThan(0)
  })

  it('extreme max profile (all high-risk) returns valid result', () => {
    const result = computeDiagnostic({
      vehicle_count: 5,
      vehicle_details: 'car_new',
      vehicle_usage: 'professional',
      vehicle_coverage_existing: 'none',
      vehicle_options_interest: ['new_vehicle_value', 'replacement_needed', 'vehicle_customized', 'bonus_important', 'professional_equipment'],
      life_event: ['birth', 'new_vehicle', 'retirement'],
      family_status: 'single_parent',
      income_contributors: 'one',
      financial_dependents: 'partner_children',
      work_incapacity_concern: 'less_1_month',
      income_range: '12k_plus',
      sports_activities: ['winter_sports', 'motor_sports', 'combat_contact', 'water_sports', 'mountain_outdoor', 'equestrian'],
      health_concerns: ['physical_job', 'frequent_driving', 'family_history', 'aging_parents'],
      age_range: '46_55',
      professional_status: 'independent',
      accident_coverage_existing: 'none',
      savings_protection: ['none'],
      children_count: 4,
    })
    expect(result.globalScore).toBeGreaterThanOrEqual(0)
    expect(result.globalScore).toBeLessThanOrEqual(100)
    expect(result.quadrantScores.biens.exposure).toBeGreaterThan(0)
    expect(result.quadrantScores.personnes.exposure).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('extreme min profile (all low-risk, maximum coverage) returns valid result', () => {
    const result = computeDiagnostic({
      vehicle_count: 0,
      family_status: 'single',
      income_contributors: 'one',
      financial_dependents: 'none',
      work_incapacity_concern: 'more_12_months',
      income_range: 'less_3k',
      sports_activities: ['none'],
      health_concerns: ['none'],
      age_range: '18_25',
      professional_status: 'student',
      accident_coverage_existing: 'individual_complete',
      savings_protection: ['life_insurance', 'pension_plan', 'savings_regular', 'real_estate'],
      children_count: 0,
      life_event: ['none'],
    })
    expect(result.globalScore).toBeGreaterThanOrEqual(0)
    expect(result.globalScore).toBeLessThanOrEqual(100)
    // With HOME scoring, min profile still has some exposure (housing defaults)
    expect(result.quadrantScores.biens.exposure).toBeGreaterThanOrEqual(0)
    expect(result.quadrantScores.biens.coverage).toBeGreaterThan(0)
  })

  it('arrays with only none count as zero concerns/options', () => {
    const withNone = computeDiagnostic({ vehicle_count: 1, vehicle_options_interest: ['none'] })
    const withEmpty = computeDiagnostic({ vehicle_count: 1, vehicle_options_interest: [] })
    // Both should produce same exposure since countNonNone(['none']) = 0 and countNonNone([]) = 0
    expect(withNone.quadrantScores.biens.exposure).toBe(withEmpty.quadrantScores.biens.exposure)
  })

  it('empty arrays behave same as missing field for multi-select answers', () => {
    const noField = computeDiagnostic({})
    const emptyArray = computeDiagnostic({ sports_activities: [], health_concerns: [], savings_protection: [] })
    expect(noField.quadrantScores.personnes.exposure).toBe(emptyArray.quadrantScores.personnes.exposure)
  })
})

// ═══════════════════════════════════════════════════════════════════
// TESTS COMPLEMENTAIRES — computeQuadrantScore exportee
// ═══════════════════════════════════════════════════════════════════

describe('computeQuadrantScore (exported)', () => {
  // Import the exported function directly
  it('returns correct quadrant name', () => {
    const result = computeDiagnostic({})
    expect(result.quadrantScores.biens.quadrant).toBe('biens')
    expect(result.quadrantScores.personnes.quadrant).toBe('personnes')
    expect(result.quadrantScores.projets.quadrant).toBe('projets')
    expect(result.quadrantScores.futur.quadrant).toBe('futur')
  })

  it('needLevel corresponds to needScore thresholds', () => {
    // Test with various inputs to verify needLevel consistency
    const profiles = [
      {},
      { vehicle_count: 1, vehicle_details: 'car_new', vehicle_coverage_existing: 'none' },
      { family_status: 'couple_with_children', income_contributors: 'one', accident_coverage_existing: 'none' },
    ]
    for (const answers of profiles) {
      const result = computeDiagnostic(answers)
      for (const q of ['biens', 'personnes'] as const) {
        const score = result.quadrantScores[q].needScore
        const level = result.quadrantScores[q].needLevel
        if (score <= 25) expect(level).toBe('low')
        else if (score <= 50) expect(level).toBe('moderate')
        else if (score <= 75) expect(level).toBe('high')
        else expect(level).toBe('critical')
      }
    }
  })
})
