import { describe, it, expect } from 'vitest'
import { generateActions } from './rules'
import type { Universe, UniverseScore } from './types'
import { computeDiagnostic } from './engine'

function makeScore(universe: Universe, overrides: Partial<UniverseScore> = {}): UniverseScore {
  return {
    universe,
    exposure: 50,
    coverage: 50,
    needScore: 60,
    needLevel: 'high',
    active: true,
    ...overrides,
  }
}

function makeScores(overrides: Partial<Record<Universe, Partial<UniverseScore>>> = {}): Record<Universe, UniverseScore> {
  return {
    auto: makeScore('auto', overrides.auto),
    habitation: makeScore('habitation', overrides.habitation),
    prevoyance: makeScore('prevoyance', overrides.prevoyance),
    objets_valeur: makeScore('objets_valeur', overrides.objets_valeur),
  }
}

describe('generateActions', () => {
  it('returns empty array for inactive universes', () => {
    const scores = makeScores({
      auto: { active: false, needLevel: 'critical' },
      habitation: { active: false },
      prevoyance: { active: false },
      objets_valeur: { active: false },
    })
    const actions = generateActions(scores, {})
    expect(actions).toHaveLength(0)
  })

  it('sorts actions by priority descending', () => {
    const result = computeDiagnostic({
      vehicleCount: 1,
      vehicleAge: 1,
      isOwner: false,
      habitationCoverage: 'none',
      familyStatus: 'family',
      incomeSource: 'one',
      hasValuables: true,
      valuablesAmount: '50k+',
      valuablesCoverage: 'none',
    })
    for (let i = 1; i < result.actions.length; i++) {
      expect(result.actions[i - 1].priority).toBeGreaterThanOrEqual(result.actions[i].priority)
    }
  })
})

describe('auto rules', () => {
  it('generates immediate action for critical auto need', () => {
    const scores = makeScores({ auto: { needLevel: 'critical', active: true } })
    const actions = generateActions(scores, {})
    const autoActions = actions.filter(a => a.universe === 'auto')
    expect(autoActions.some(a => a.type === 'immediate' && a.priority === 5)).toBe(true)
  })

  it('recommends omnium for recent vehicle with RC only', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { vehicleAge: 2, autoCoverage: 'rc' })
    const autoActions = actions.filter(a => a.universe === 'auto')
    expect(autoActions.some(a => a.title.includes('véhicule récent'))).toBe(true)
  })

  it('recommends optimization for old vehicle with omnium', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { vehicleAge: 10, autoCoverage: 'omnium' })
    const autoActions = actions.filter(a => a.universe === 'auto')
    expect(autoActions.some(a => a.title.includes('Optimiser'))).toBe(true)
  })
})

describe('habitation rules', () => {
  it('generates MRH action for uninsured renter', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { isOwner: false, habitationCoverage: 'none' })
    const habActions = actions.filter(a => a.universe === 'habitation')
    expect(habActions.some(a => a.priority === 5 && a.title.includes('logement'))).toBe(true)
  })

  it('generates mortgage insurance action for owner with mortgage', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { isOwner: true, hasMortgage: true })
    const habActions = actions.filter(a => a.universe === 'habitation')
    expect(habActions.some(a => a.title.includes('emprunteur'))).toBe(true)
  })

  it('generates critical action for critical habitation need', () => {
    const scores = makeScores({ habitation: { needLevel: 'critical' } })
    const actions = generateActions(scores, {})
    const habActions = actions.filter(a => a.universe === 'habitation')
    expect(habActions.some(a => a.priority === 5 && a.title.includes('couverture habitation'))).toBe(true)
  })
})

describe('prevoyance rules', () => {
  it('generates protection action for single-income family', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { familyStatus: 'family', incomeSource: 'one' })
    const prevActions = actions.filter(a => a.universe === 'prevoyance')
    expect(prevActions.some(a => a.priority === 5 && a.title.includes('famille'))).toBe(true)
  })

  it('generates action for uncovered independent worker', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { professionalStatus: 'independent', prevoyanceCoverage: 'none' })
    const prevActions = actions.filter(a => a.universe === 'prevoyance')
    expect(prevActions.some(a => a.title.includes('incapacité'))).toBe(true)
  })

  it('generates bilan action for high/critical need', () => {
    const scores = makeScores({ prevoyance: { needLevel: 'high' } })
    const actions = generateActions(scores, {})
    const prevActions = actions.filter(a => a.universe === 'prevoyance')
    expect(prevActions.some(a => a.title.includes('bilan prévoyance'))).toBe(true)
  })
})

describe('objets_valeur rules', () => {
  it('generates insurance action for high-value uninsured items', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { valuablesAmount: '50k+', valuablesCoverage: 'none' })
    const objActions = actions.filter(a => a.universe === 'objets_valeur')
    expect(objActions.some(a => a.title.includes('Assurer'))).toBe(true)
  })

  it('generates security action for insecure storage', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { valuablesStorage: 'home_no_security' })
    const objActions = actions.filter(a => a.universe === 'objets_valeur')
    expect(objActions.some(a => a.title.includes('Sécuriser'))).toBe(true)
  })

  it('does not generate actions for inactive valuables', () => {
    const scores = makeScores({ objets_valeur: { active: false } })
    const actions = generateActions(scores, { valuablesAmount: '50k+', valuablesCoverage: 'none' })
    const objActions = actions.filter(a => a.universe === 'objets_valeur')
    expect(objActions).toHaveLength(0)
  })
})

describe('life event actions', () => {
  it('lifeEvent=property generates habitation event action with productName', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { lifeEvent: 'property' })
    const habEvent = actions.find(a => a.universe === 'habitation' && a.type === 'event')
    expect(habEvent).toBeDefined()
    expect(habEvent!.priority).toBe(5)
    expect(habEvent!.productName).toBe('Baloise Home Protect')
  })

  it('lifeEvent=birth generates prevoyance event action with productName', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { lifeEvent: 'birth' })
    const prevEvent = actions.find(a => a.universe === 'prevoyance' && a.type === 'event')
    expect(prevEvent).toBeDefined()
    expect(prevEvent!.priority).toBe(5)
    expect(prevEvent!.productName).toBe('Baloise Bsafe')
  })

  it('lifeEvent=retirement generates prevoyance event action with priority 4', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { lifeEvent: 'retirement' })
    const prevEvent = actions.find(a => a.universe === 'prevoyance' && a.type === 'event')
    expect(prevEvent).toBeDefined()
    expect(prevEvent!.priority).toBe(4)
    expect(prevEvent!.productName).toBe('Baloise Bsafe')
  })

  it('lifeEvent=none generates no event actions', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { lifeEvent: 'none' })
    const eventActions = actions.filter(a => a.type === 'event')
    expect(eventActions).toHaveLength(0)
  })
})

describe('productName on all actions', () => {
  it('auto actions have productName containing Baloise Drive', () => {
    const scores = makeScores({ auto: { needLevel: 'critical', active: true } })
    const actions = generateActions(scores, { vehicleAge: 2, autoCoverage: 'rc' })
    const autoActions = actions.filter(a => a.universe === 'auto')
    expect(autoActions.length).toBeGreaterThan(0)
    for (const a of autoActions) {
      expect(a.productName).toContain('Baloise Drive')
    }
  })

  it('habitation actions have productName containing Baloise Home', () => {
    const scores = makeScores({ habitation: { needLevel: 'critical' } })
    const actions = generateActions(scores, { isOwner: false, habitationCoverage: 'none' })
    const habActions = actions.filter(a => a.universe === 'habitation')
    expect(habActions.length).toBeGreaterThan(0)
    for (const a of habActions) {
      expect(a.productName).toContain('Baloise Home')
    }
  })

  it('prevoyance actions have productName containing Baloise Bsafe', () => {
    const scores = makeScores({ prevoyance: { needLevel: 'high' } })
    const actions = generateActions(scores, { familyStatus: 'family', incomeSource: 'one' })
    const prevActions = actions.filter(a => a.universe === 'prevoyance')
    expect(prevActions.length).toBeGreaterThan(0)
    for (const a of prevActions) {
      expect(a.productName).toContain('Baloise Bsafe')
    }
  })

  it('objets_valeur actions have productName containing Art & Collections', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { valuablesAmount: '50k+', valuablesCoverage: 'none', valuablesStorage: 'home_no_security' })
    const objActions = actions.filter(a => a.universe === 'objets_valeur')
    expect(objActions.length).toBeGreaterThan(0)
    for (const a of objActions) {
      expect(a.productName).toContain('Art & Collections')
    }
  })
})

describe('incomeSource correction', () => {
  it('incomeSource=one + family generates "Protéger votre famille"', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { familyStatus: 'family', incomeSource: 'one' })
    expect(actions.some(a => a.title.includes('Protéger votre famille'))).toBe(true)
  })

  it('incomeSource=two + family does NOT generate "Protéger votre famille"', () => {
    const scores = makeScores()
    const actions = generateActions(scores, { familyStatus: 'family', incomeSource: 'two' })
    expect(actions.some(a => a.title.includes('Protéger votre famille'))).toBe(false)
  })
})
