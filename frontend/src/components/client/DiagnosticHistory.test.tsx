import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DiagnosticHistory from './DiagnosticHistory.tsx'

function renderComponent(props: Parameters<typeof DiagnosticHistory>[0]) {
  return render(
    <MemoryRouter>
      <DiagnosticHistory {...props} />
    </MemoryRouter>
  )
}

describe('DiagnosticHistory', () => {
  it('returns null when empty and no error', () => {
    const { container } = renderComponent({ diagnostics: [] })
    expect(container.innerHTML).toBe('')
  })

  it('renders title when diagnostics exist', () => {
    renderComponent({
      diagnostics: [{ id: 'd1', global_score: 42, created_at: '2026-03-10T12:00:00Z' }],
    })
    expect(screen.getByText('Mes diagnostics précédents')).toBeInTheDocument()
  })

  it('formats date in French locale', () => {
    renderComponent({
      diagnostics: [{ id: 'd1', global_score: 42, created_at: '2026-03-10T12:00:00Z' }],
    })
    expect(screen.getByText('10 mars 2026')).toBeInTheDocument()
  })

  it('renders score with /100', () => {
    renderComponent({
      diagnostics: [{ id: 'd1', global_score: 42, created_at: '2026-03-10T12:00:00Z' }],
    })
    expect(screen.getByText('42/100')).toBeInTheDocument()
  })

  it('links to /results/:id', () => {
    renderComponent({
      diagnostics: [{ id: 'd1', global_score: 42, created_at: '2026-03-10T12:00:00Z' }],
    })
    const link = screen.getByText('10 mars 2026').closest('a')
    expect(link).toHaveAttribute('href', '/results/d1')
  })

  it('renders error message when provided', () => {
    renderComponent({ diagnostics: [], error: 'Chargement impossible' })
    expect(screen.getByText('Chargement impossible')).toBeInTheDocument()
  })

  it('renders component when error exists even if diagnostics are empty', () => {
    renderComponent({ diagnostics: [], error: 'Erreur' })
    expect(screen.getByText('Mes diagnostics précédents')).toBeInTheDocument()
  })
})
