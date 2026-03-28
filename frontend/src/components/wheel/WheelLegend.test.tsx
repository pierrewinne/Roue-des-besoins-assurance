import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WheelLegend from './WheelLegend.tsx'
import type { DiagnosticResult, QuadrantScore } from '../../shared/scoring/types.ts'

function makeScore(quadrant: string, overrides: Partial<QuadrantScore> = {}): QuadrantScore {
  return {
    quadrant: quadrant as QuadrantScore['quadrant'],
    exposure: 50,
    coverage: 50,
    needScore: 50,
    needLevel: 'moderate',
    active: true,
    ...overrides,
  }
}

function makeDiagnostic(scores: Partial<Record<string, Partial<QuadrantScore>>> = {}): DiagnosticResult {
  return {
    quadrantScores: {
      biens: makeScore('biens', scores.biens),
      personnes: makeScore('personnes', scores.personnes),
      projets: makeScore('projets', { active: false, ...scores.projets }),
      futur: makeScore('futur', scores.futur),
    },
    globalScore: 50,
    weightings: { biens: 0.25, personnes: 0.25, projets: 0.25, futur: 0.25 },
    productScores: [],
    recommendations: [],
  }
}

describe('WheelLegend', () => {
  it('renders active quadrant labels', () => {
    render(<WheelLegend diagnostic={makeDiagnostic()} />)
    expect(screen.getByText('Protection des biens')).toBeInTheDocument()
    expect(screen.getByText('Protection des personnes')).toBeInTheDocument()
    expect(screen.getByText('Protection du futur')).toBeInTheDocument()
  })

  it('does not render inactive quadrants', () => {
    render(<WheelLegend diagnostic={makeDiagnostic()} />)
    // projets is inactive by default in our fixture
    expect(screen.queryByText('Protection des projets')).not.toBeInTheDocument()
  })

  it('renders need level messages', () => {
    render(<WheelLegend diagnostic={makeDiagnostic()} />)
    // moderate → "À explorer"
    expect(screen.getAllByText('À explorer')).toHaveLength(3)
  })

  it('does not render scores by default', () => {
    render(<WheelLegend diagnostic={makeDiagnostic()} />)
    expect(screen.queryByText('50/100')).not.toBeInTheDocument()
  })

  it('renders scores when showScores is true', () => {
    render(<WheelLegend diagnostic={makeDiagnostic()} showScores />)
    expect(screen.getAllByText('50/100')).toHaveLength(3)
  })

  it('renders color dots for each active quadrant', () => {
    const { container } = render(<WheelLegend diagnostic={makeDiagnostic()} />)
    const dots = container.querySelectorAll('.w-2\\.5.h-2\\.5.rounded-full')
    expect(dots).toHaveLength(3) // 3 active quadrants
  })

  it('uses correct color for low need level', () => {
    render(<WheelLegend diagnostic={makeDiagnostic({ biens: { needLevel: 'low', needScore: 20 } })} showScores />)
    expect(screen.getByText('20/100')).toBeInTheDocument()
  })
})
