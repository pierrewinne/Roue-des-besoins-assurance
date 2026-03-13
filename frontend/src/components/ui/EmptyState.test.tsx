import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from './EmptyState.tsx'

describe('EmptyState', () => {
  it('renders description text', () => {
    render(<EmptyState icon="search" description="No results found" />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders the icon as SVG', () => {
    const { container } = render(<EmptyState icon="search" description="Test" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<EmptyState icon="search" title="Oops" description="Nothing here" />)
    expect(screen.getByText('Oops')).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    render(<EmptyState icon="search" description="Nothing here" />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders action slot when provided', () => {
    render(<EmptyState icon="search" description="Test" action={<button>Retry</button>} />)
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('does not render action slot when not provided', () => {
    render(<EmptyState icon="search" description="Test" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('returns null for unknown icon name', () => {
    const { container } = render(<EmptyState icon={'unknown' as never} description="Test" />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })
})
