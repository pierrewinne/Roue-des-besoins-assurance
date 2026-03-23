import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary.tsx'

const originalConsoleError = console.error

beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

function ThrowingChild(): React.ReactNode {
  throw new Error('Boom!')
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <p>Content</p>
      </ErrorBoundary>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders error fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument()
  })

  it('renders retry button in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('Recharger la page')).toBeInTheDocument()
  })

  it('calls window.location.reload on retry', () => {
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    screen.getByText('Recharger la page').click()
    expect(reloadMock).toHaveBeenCalled()
  })

  it('logs error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    expect(console.error).toHaveBeenCalled()
  })
})
