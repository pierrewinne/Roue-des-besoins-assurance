import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import UniverseCard from './UniverseCard.tsx'
import type { QuadrantScore } from '../../shared/scoring/types.ts'

const activeScore: QuadrantScore = {
  quadrant: 'biens',
  exposure: 72,
  coverage: 35,
  needScore: 68,
  needLevel: 'high',
  active: true,
}

const inactiveScore: QuadrantScore = {
  quadrant: 'biens',
  exposure: 0,
  coverage: 0,
  needScore: 0,
  needLevel: 'low',
  active: false,
}

const lowScore: QuadrantScore = {
  quadrant: 'personnes',
  exposure: 20,
  coverage: 85,
  needScore: 15,
  needLevel: 'low',
  active: true,
}

const moderateScore: QuadrantScore = {
  quadrant: 'projets',
  exposure: 50,
  coverage: 50,
  needScore: 45,
  needLevel: 'moderate',
  active: true,
}

describe('UniverseCard', () => {
  it('renders nothing when score.active is false', () => {
    const { container } = render(
      <UniverseCard universe="biens" score={inactiveScore} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the quadrant label', () => {
    render(<UniverseCard universe="biens" score={activeScore} />)
    expect(screen.getByText('Protection des biens')).toBeInTheDocument()
  })

  it('shows correct need level badge for high need', () => {
    render(<UniverseCard universe="biens" score={activeScore} />)
    expect(screen.getByText('Action requise')).toBeInTheDocument()
  })

  it('shows correct need level badge for low need', () => {
    render(<UniverseCard universe="personnes" score={lowScore} />)
    expect(screen.getByText('Bien couvert')).toBeInTheDocument()
  })

  it('shows correct need level badge for moderate need', () => {
    render(<UniverseCard universe="projets" score={moderateScore} />)
    expect(screen.getByText('À améliorer')).toBeInTheDocument()
  })

  it('shows need message', () => {
    render(<UniverseCard universe="biens" score={activeScore} />)
    expect(
      screen.getByText('Des lacunes ont été identifiées dans votre couverture.'),
    ).toBeInTheDocument()
  })

  it('does not show detail bars by default', () => {
    render(<UniverseCard universe="biens" score={activeScore} />)
    expect(screen.queryByText('Exposition au risque')).not.toBeInTheDocument()
    expect(screen.queryByText('Niveau de couverture')).not.toBeInTheDocument()
  })

  it('shows detail bars when showDetails=true', () => {
    render(
      <UniverseCard universe="biens" score={activeScore} showDetails />,
    )
    expect(screen.getByText('Exposition au risque')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
    expect(screen.getByText('Niveau de couverture')).toBeInTheDocument()
    expect(screen.getByText('35%')).toBeInTheDocument()
    expect(screen.getByText('Score de besoin')).toBeInTheDocument()
    expect(screen.getByText('68/100')).toBeInTheDocument()
  })
})
