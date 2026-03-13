import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from './StatCard.tsx'

describe('StatCard', () => {
  it('renders the value', () => {
    render(<StatCard icon="users" value={42} label="Clients" color="primary" />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(<StatCard icon="users" value={42} label="Clients" color="primary" />)
    expect(screen.getByText('Clients')).toBeInTheDocument()
  })

  it('renders an icon', () => {
    const { container } = render(<StatCard icon="users" value={10} label="Test" color="primary" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('accepts string value', () => {
    render(<StatCard icon="users" value="N/A" label="Score" color="emerald" />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('applies primary color theme', () => {
    const { container } = render(<StatCard icon="users" value={1} label="L" color="primary" />)
    expect(container.querySelector('.bg-primary-50')).toBeInTheDocument()
  })

  it('applies emerald color theme', () => {
    const { container } = render(<StatCard icon="users" value={1} label="L" color="emerald" />)
    expect(container.querySelector('.bg-success-light')).toBeInTheDocument()
  })
})
