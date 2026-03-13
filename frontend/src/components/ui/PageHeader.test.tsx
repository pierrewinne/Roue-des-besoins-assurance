import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PageHeader from './PageHeader.tsx'

function renderHeader(props: Parameters<typeof PageHeader>[0]) {
  return render(
    <MemoryRouter>
      <PageHeader {...props} />
    </MemoryRouter>
  )
}

describe('PageHeader', () => {
  it('renders the title', () => {
    renderHeader({ title: 'Mon dashboard' })
    expect(screen.getByText('Mon dashboard')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    renderHeader({ title: 'Dashboard', subtitle: 'Bienvenue' })
    expect(screen.getByText('Bienvenue')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    renderHeader({ title: 'Dashboard' })
    const subtitles = document.querySelectorAll('p')
    expect(subtitles).toHaveLength(0)
  })

  it('renders back link when provided', () => {
    renderHeader({ title: 'Detail', backLink: { to: '/dashboard', label: 'Retour' } })
    const link = screen.getByText('Retour')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/dashboard')
  })

  it('does not render back link when not provided', () => {
    renderHeader({ title: 'Dashboard' })
    expect(screen.queryByText('Retour')).not.toBeInTheDocument()
  })

  it('renders actions slot', () => {
    renderHeader({ title: 'Dashboard', actions: <button>Export</button> })
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('does not render actions when not provided', () => {
    renderHeader({ title: 'Dashboard' })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
