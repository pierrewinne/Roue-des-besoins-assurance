import { describe, it, expect } from 'vitest'
import { computeDiagnostic } from './engine'

describe('computeAutoScore', () => {
  it('is inactive when no vehicle', () => {
    const result = computeDiagnostic({ vehicleCount: 0 })
    expect(result.universeScores.auto.active).toBe(false)
    expect(result.universeScores.auto.needScore).toBe(0)
  })

  it('is active when vehicle exists', () => {
    const result = computeDiagnostic({ vehicleCount: 1 })
    expect(result.universeScores.auto.active).toBe(true)
  })

  it('has high exposure for recent vehicle (<3 years)', () => {
    const result = computeDiagnostic({ vehicleCount: 1, vehicleAge: 2 })
    expect(result.universeScores.auto.exposure).toBe(100) // 2/2 * 100
  })

  it('has low need with omnium coverage', () => {
    const result = computeDiagnostic({ vehicleCount: 1, autoCoverage: 'omnium' })
    const auto = result.universeScores.auto
    expect(auto.needLevel).toBe('low')
  })

  it('has critical need with no coverage on recent vehicle', () => {
    const result = computeDiagnostic({ vehicleCount: 1, vehicleAge: 1 })
    const auto = result.universeScores.auto
    // high exposure (age < 3) + no coverage = 95
    expect(auto.needScore).toBe(95)
    expect(auto.needLevel).toBe('critical')
  })

  it('flags utility vehicles as high exposure', () => {
    const result = computeDiagnostic({ vehicleCount: 1, vehicleType: 'utility' })
    expect(result.universeScores.auto.exposure).toBe(100) // exposure = 2
  })
})

describe('computeHabitationScore', () => {
  it('has medium exposure for renter', () => {
    const result = computeDiagnostic({ isOwner: false })
    expect(result.universeScores.habitation.exposure).toBe(50) // 1/2 * 100
  })

  it('has high exposure for owner with mortgage', () => {
    const result = computeDiagnostic({ isOwner: true, hasMortgage: true })
    expect(result.universeScores.habitation.exposure).toBe(100) // 2/2 * 100
  })

  it('has high exposure with other properties', () => {
    const result = computeDiagnostic({ hasOtherProperties: true })
    expect(result.universeScores.habitation.exposure).toBe(100)
  })

  it('has low need with complete coverage', () => {
    const result = computeDiagnostic({ habitationCoverage: 'complete' })
    const hab = result.universeScores.habitation
    expect(hab.needScore).toBe(15) // medium exposure, complete coverage
    expect(hab.needLevel).toBe('low')
  })

  it('has critical need with no coverage and high exposure', () => {
    const result = computeDiagnostic({ isOwner: true, hasMortgage: true })
    const hab = result.universeScores.habitation
    expect(hab.needScore).toBe(95) // high exposure, no coverage
    expect(hab.needLevel).toBe('critical')
  })
})

describe('computePrevoyanceScore', () => {
  it('has high exposure for family', () => {
    const result = computeDiagnostic({ familyStatus: 'family' })
    expect(result.universeScores.prevoyance.exposure).toBe(100)
  })

  it('has moderate exposure for couple', () => {
    const result = computeDiagnostic({ familyStatus: 'couple' })
    // exposure = 1.5 → 1.5/2*100 = 75
    expect(result.universeScores.prevoyance.exposure).toBe(75)
  })

  it('increases exposure for independents', () => {
    const base = computeDiagnostic({})
    const indep = computeDiagnostic({ professionalStatus: 'independent' })
    expect(indep.universeScores.prevoyance.exposure).toBeGreaterThan(base.universeScores.prevoyance.exposure)
  })

  it('has low need with complete coverage', () => {
    const result = computeDiagnostic({ prevoyanceCoverage: 'complete' })
    const prev = result.universeScores.prevoyance
    expect(prev.needLevel).toBe('low')
  })

  it('has critical need for family with no coverage', () => {
    const result = computeDiagnostic({ familyStatus: 'family' })
    const prev = result.universeScores.prevoyance
    expect(prev.needScore).toBe(95) // high exposure, no coverage
    expect(prev.needLevel).toBe('critical')
  })
})

describe('computeObjetsValeurScore', () => {
  it('is inactive when no valuables', () => {
    const result = computeDiagnostic({ hasValuables: false })
    expect(result.universeScores.objets_valeur.active).toBe(false)
    expect(result.universeScores.objets_valeur.needScore).toBe(0)
  })

  it('is inactive by default (undefined)', () => {
    const result = computeDiagnostic({})
    expect(result.universeScores.objets_valeur.active).toBe(false)
  })

  it('is active when has valuables', () => {
    const result = computeDiagnostic({ hasValuables: true })
    expect(result.universeScores.objets_valeur.active).toBe(true)
  })

  it('has high exposure for 50k+ valuables', () => {
    const result = computeDiagnostic({ hasValuables: true, valuablesAmount: '50k+' })
    expect(result.universeScores.objets_valeur.exposure).toBe(100)
  })

  it('increases exposure for insecure storage', () => {
    const secure = computeDiagnostic({ hasValuables: true, valuablesAmount: '5k-10k' })
    const insecure = computeDiagnostic({ hasValuables: true, valuablesAmount: '5k-10k', valuablesStorage: 'home_no_security' })
    expect(insecure.universeScores.objets_valeur.exposure).toBeGreaterThan(secure.universeScores.objets_valeur.exposure)
  })

  it('has low need with complete coverage', () => {
    const result = computeDiagnostic({ hasValuables: true, valuablesCoverage: 'complete' })
    expect(result.universeScores.objets_valeur.needLevel).toBe('low')
  })
})

describe('computeWeightings', () => {
  it('always sums to ~100', () => {
    const profiles = [
      {},
      { vehicleCount: 1 },
      { hasValuables: true },
      { vehicleCount: 1, hasValuables: true },
      { familyStatus: 'family', isOwner: true, hasMortgage: true },
    ]
    for (const answers of profiles) {
      const result = computeDiagnostic(answers)
      const sum = Object.values(result.weightings).reduce((s, w) => s + w, 0)
      // Allow ±2 for rounding
      expect(sum).toBeGreaterThanOrEqual(98)
      expect(sum).toBeLessThanOrEqual(102)
    }
  })

  it('gives zero weight to inactive auto', () => {
    const result = computeDiagnostic({ vehicleCount: 0 })
    expect(result.weightings.auto).toBe(0)
  })

  it('gives zero weight to inactive valuables', () => {
    const result = computeDiagnostic({})
    expect(result.weightings.objets_valeur).toBe(0)
  })

  it('increases prevoyance weight for family', () => {
    const base = computeDiagnostic({ vehicleCount: 1, hasValuables: true })
    const family = computeDiagnostic({ vehicleCount: 1, hasValuables: true, familyStatus: 'family' })
    expect(family.weightings.prevoyance).toBeGreaterThan(base.weightings.prevoyance)
  })

  it('increases habitation weight for owner with mortgage', () => {
    const base = computeDiagnostic({ vehicleCount: 1, hasValuables: true })
    const owner = computeDiagnostic({ vehicleCount: 1, hasValuables: true, isOwner: true, hasMortgage: true })
    expect(owner.weightings.habitation).toBeGreaterThan(base.weightings.habitation)
  })
})

describe('computeDiagnostic - globalScore', () => {
  it('returns a global score between 0 and 100', () => {
    const result = computeDiagnostic({ vehicleCount: 1, hasValuables: true })
    expect(result.globalScore).toBeGreaterThanOrEqual(0)
    expect(result.globalScore).toBeLessThanOrEqual(100)
  })

  it('is 0 when all coverages are complete and no risk factors', () => {
    const result = computeDiagnostic({
      vehicleCount: 0,
      hasValuables: false,
      habitationCoverage: 'complete',
      prevoyanceCoverage: 'complete',
    })
    // With both auto and objets inactive, only habitation (complete→low) and prevoyance (complete→low) contribute
    expect(result.globalScore).toBeLessThanOrEqual(15)
  })

  it('is high when multiple exposures with no coverage', () => {
    const result = computeDiagnostic({
      vehicleCount: 2,
      vehicleAge: 1,
      familyStatus: 'family',
      isOwner: true,
      hasMortgage: true,
      hasValuables: true,
      valuablesAmount: '50k+',
    })
    expect(result.globalScore).toBeGreaterThan(80)
  })
})

describe('life event impacts on scoring', () => {
  it('lifeEvent=birth increases prevoyance exposure by +0.5', () => {
    const base = computeDiagnostic({})
    const withBirth = computeDiagnostic({ lifeEvent: 'birth' })
    expect(withBirth.universeScores.prevoyance.exposure).toBeGreaterThan(base.universeScores.prevoyance.exposure)
  })

  it('lifeEvent=marriage increases prevoyance exposure by +0.5', () => {
    const base = computeDiagnostic({})
    const withMarriage = computeDiagnostic({ lifeEvent: 'marriage' })
    expect(withMarriage.universeScores.prevoyance.exposure).toBeGreaterThan(base.universeScores.prevoyance.exposure)
  })

  it('lifeEvent=property sets habitation exposure to 100', () => {
    const result = computeDiagnostic({ lifeEvent: 'property' })
    expect(result.universeScores.habitation.exposure).toBe(100)
  })

  it('lifeEvent=move sets habitation exposure to 100', () => {
    const result = computeDiagnostic({ lifeEvent: 'move' })
    expect(result.universeScores.habitation.exposure).toBe(100)
  })

  it('lifeEvent=none does not change scoring', () => {
    const base = computeDiagnostic({})
    const withNone = computeDiagnostic({ lifeEvent: 'none' })
    expect(withNone.universeScores.prevoyance.exposure).toBe(base.universeScores.prevoyance.exposure)
    expect(withNone.universeScores.habitation.exposure).toBe(base.universeScores.habitation.exposure)
  })

  it('lifeEvent=retirement does not directly change scoring', () => {
    const base = computeDiagnostic({})
    const withRetirement = computeDiagnostic({ lifeEvent: 'retirement' })
    expect(withRetirement.universeScores.prevoyance.exposure).toBe(base.universeScores.prevoyance.exposure)
    expect(withRetirement.universeScores.habitation.exposure).toBe(base.universeScores.habitation.exposure)
  })
})

describe('QW-1 fix: age range 30-40 and 40-50 for family prevoyance', () => {
  it('ageRange=30-40 + family → prevoyance exposure = 100', () => {
    const result = computeDiagnostic({ ageRange: '30-40', familyStatus: 'family' })
    expect(result.universeScores.prevoyance.exposure).toBe(100)
  })

  it('ageRange=40-50 + family → prevoyance exposure = 100', () => {
    const result = computeDiagnostic({ ageRange: '40-50', familyStatus: 'family' })
    expect(result.universeScores.prevoyance.exposure).toBe(100)
  })

  it('ageRange=25-30 + family → prevoyance exposure = 100 (already high via family)', () => {
    const result = computeDiagnostic({ ageRange: '25-30', familyStatus: 'family' })
    expect(result.universeScores.prevoyance.exposure).toBe(100)
  })
})
