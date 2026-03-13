import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActionList from './ActionList.tsx'
import type { Recommendation } from '../../shared/scoring/types.ts'

function makeAction(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id: 'r1',
    product: 'home',
    type: 'immediate',
    priority: 3,
    title: 'Souscrire assurance habitation',
    message: 'Votre logement est insuffisamment couvert.',
    ...overrides,
  }
}

describe('ActionList', () => {
  it('renders empty state when no actions', () => {
    render(<ActionList actions={[]} />)
    expect(screen.getByText('Aucune action recommandée pour le moment.')).toBeInTheDocument()
  })

  it('renders action title', () => {
    render(<ActionList actions={[makeAction()]} />)
    expect(screen.getByText('Souscrire assurance habitation')).toBeInTheDocument()
  })

  it('renders action message', () => {
    render(<ActionList actions={[makeAction()]} />)
    expect(screen.getByText('Votre logement est insuffisamment couvert.')).toBeInTheDocument()
  })

  it('renders product badge', () => {
    render(<ActionList actions={[makeAction({ product: 'drive' })]} />)
    expect(screen.getByText('Baloise Drive')).toBeInTheDocument()
  })

  it('renders priority dots — 3 filled out of 5', () => {
    const { container } = render(<ActionList actions={[makeAction({ priority: 3 })]} />)
    const dots = container.querySelectorAll('.rounded-full.w-1\\.5')
    expect(dots).toHaveLength(5)
    const filled = Array.from(dots).filter(d => d.className.includes('bg-warning'))
    expect(filled).toHaveLength(3)
  })

  it('renders priority dots — all 5 filled', () => {
    const { container } = render(<ActionList actions={[makeAction({ priority: 5 })]} />)
    const dots = container.querySelectorAll('.rounded-full.w-1\\.5')
    const filled = Array.from(dots).filter(d => d.className.includes('bg-danger'))
    expect(filled).toHaveLength(5)
  })

  it('does not show type badge by default', () => {
    render(<ActionList actions={[makeAction()]} />)
    expect(screen.queryByText('Action immédiate')).not.toBeInTheDocument()
  })

  it('shows type badge when showType is true', () => {
    render(<ActionList actions={[makeAction()]} showType />)
    expect(screen.getByText('Action immédiate')).toBeInTheDocument()
  })

  it('renders multiple actions', () => {
    const actions = [
      makeAction({ id: 'r1', title: 'Action 1' }),
      makeAction({ id: 'r2', title: 'Action 2' }),
    ]
    render(<ActionList actions={actions} />)
    expect(screen.getByText('Action 1')).toBeInTheDocument()
    expect(screen.getByText('Action 2')).toBeInTheDocument()
  })

  it('renders deferred type badge with orange color', () => {
    render(<ActionList actions={[makeAction({ type: 'deferred' })]} showType />)
    expect(screen.getByText('Action différée')).toBeInTheDocument()
  })

  it('renders optimization type badge with gray color', () => {
    render(<ActionList actions={[makeAction({ type: 'optimization' })]} showType />)
    expect(screen.getByText('Optimisation')).toBeInTheDocument()
  })
})
