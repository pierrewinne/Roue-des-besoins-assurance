import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProfilCTA from './ProfilCTA.tsx'

describe('ProfilCTA', () => {
  it('renders heading', () => {
    render(<ProfilCTA onNavigate={vi.fn()} />)
    expect(screen.getByText('Commencez par votre profil')).toBeInTheDocument()
  })

  it('renders CTA button', () => {
    render(<ProfilCTA onNavigate={vi.fn()} />)
    expect(screen.getByText('Compléter mon profil')).toBeInTheDocument()
  })

  it('calls onNavigate when button is clicked', () => {
    const onNavigate = vi.fn()
    render(<ProfilCTA onNavigate={onNavigate} />)
    screen.getByText('Compléter mon profil').click()
    expect(onNavigate).toHaveBeenCalledOnce()
  })
})
