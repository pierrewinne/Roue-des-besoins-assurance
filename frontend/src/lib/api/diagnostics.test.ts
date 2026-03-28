import { describe, it, expect } from 'vitest'
import { hydrateDiagnostic } from './diagnostics.ts'

function makeRawDiag(overrides = {}) {
  return {
    id: 'diag-001',
    scores: {
      biens: { quadrant: 'biens', exposure: 50, coverage: 50, needScore: 55, needLevel: 'high', active: true },
      personnes: { quadrant: 'personnes', exposure: 40, coverage: 60, needScore: 40, needLevel: 'moderate', active: true },
      projets: { quadrant: 'projets', exposure: 0, coverage: 100, needScore: 0, needLevel: 'low', active: false },
      futur: { quadrant: 'futur', exposure: 70, coverage: 30, needScore: 80, needLevel: 'critical', active: true },
    },
    global_score: 65,
    weightings: { biens: 35, personnes: 35, projets: 0, futur: 30 },
    created_at: '2026-03-15T10:00:00Z',
    scoring_version: 'v1',
    ...overrides,
  }
}

function makeAction(overrides = {}) {
  return {
    id: 'act-001',
    type: 'immediate',
    universe: 'drive',
    priority: 5,
    title: 'Test action',
    description: 'Test description',
    ...overrides,
  }
}

describe('hydrateDiagnostic', () => {
  it('hydrates a raw diagnostic into DiagnosticResult', () => {
    const result = hydrateDiagnostic(makeRawDiag())
    expect(result.id).toBe('diag-001')
    expect(result.createdAt).toBe('2026-03-15T10:00:00Z')
    expect(result.scoringVersion).toBe('v1')
    expect(result.globalScore).toBe(65)
    expect(result.weightings.biens).toBe(35)
    expect(result.quadrantScores.biens.quadrant).toBe('biens')
    expect(result.quadrantScores.futur.active).toBe(true)
    expect(result.quadrantScores.projets.active).toBe(false)
  })

  it('recomputes needLevel from needScore (not trusting DB value)', () => {
    const raw = makeRawDiag()
    // Intentionally corrupt needLevel in raw data
    ;(raw.scores as any).biens.needLevel = 'low'
    ;(raw.scores as any).biens.needScore = 80

    const result = hydrateDiagnostic(raw)
    // Should be recomputed as 'critical' (>75), not 'low'
    expect(result.quadrantScores.biens.needLevel).toBe('critical')
  })

  it('hydrates actions into recommendations', () => {
    const actions = [
      makeAction({ id: 'a1', type: 'immediate', universe: 'drive', priority: 5 }),
      makeAction({ id: 'a2', type: 'deferred', universe: 'home', priority: 3 }),
    ]
    const result = hydrateDiagnostic(makeRawDiag(), actions)
    expect(result.recommendations).toHaveLength(2)
    expect(result.recommendations[0].id).toBe('a1')
    expect(result.recommendations[0].product).toBe('drive')
    expect(result.recommendations[0].type).toBe('immediate')
    expect(result.recommendations[0].priority).toBe(5)
    expect(result.recommendations[1].product).toBe('home')
  })

  it('handles empty actions array', () => {
    const result = hydrateDiagnostic(makeRawDiag(), [])
    expect(result.recommendations).toHaveLength(0)
  })

  it('handles no actions parameter (defaults to empty)', () => {
    const result = hydrateDiagnostic(makeRawDiag())
    expect(result.recommendations).toHaveLength(0)
  })

  it('defaults universe to drive when null', () => {
    const actions = [makeAction({ universe: null })]
    const result = hydrateDiagnostic(makeRawDiag(), actions)
    expect(result.recommendations[0].product).toBe('drive')
  })

  it('handles futur products (pension_plan, life_plan, switch_plan)', () => {
    const actions = [
      makeAction({ id: 'f1', universe: 'pension_plan' }),
      makeAction({ id: 'f2', universe: 'life_plan' }),
      makeAction({ id: 'f3', universe: 'switch_plan' }),
    ]
    const result = hydrateDiagnostic(makeRawDiag(), actions)
    expect(result.recommendations[0].product).toBe('pension_plan')
    expect(result.recommendations[1].product).toBe('life_plan')
    expect(result.recommendations[2].product).toBe('switch_plan')
  })

  it('handles null description in action', () => {
    const actions = [makeAction({ description: null })]
    const result = hydrateDiagnostic(makeRawDiag(), actions)
    expect(result.recommendations[0].message).toBe('')
  })

  it('converts global_score to number', () => {
    // Supabase may return numeric as string
    const result = hydrateDiagnostic(makeRawDiag({ global_score: '72' as any }))
    expect(result.globalScore).toBe(72)
    expect(typeof result.globalScore).toBe('number')
  })

  it('defaults scoringVersion to v1 when missing', () => {
    const result = hydrateDiagnostic(makeRawDiag({ scoring_version: undefined }))
    expect(result.scoringVersion).toBe('v1')
  })

  it('productScores is always an empty array (server does not return them)', () => {
    const result = hydrateDiagnostic(makeRawDiag())
    expect(result.productScores).toEqual([])
  })
})
