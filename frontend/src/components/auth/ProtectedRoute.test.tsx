import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.tsx'

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('../../contexts/AuthContext.tsx', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderWithRouter(requiredRole?: 'client' | 'advisor') {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={<ProtectedRoute requiredRole={requiredRole} />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Client Login Page</div>} />
        <Route path="/conseiller/login" element={<div>Advisor Login Page</div>} />
        <Route path="/dashboard" element={<div>Client Dashboard</div>} />
        <Route path="/conseiller/dashboard" element={<div>Advisor Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows spinner while loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isLoading: true,
      profileError: false,
    })

    const { container } = renderWithRouter()
    // Spinner renders an animated div
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to client login when not authenticated (no requiredRole)', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      profileError: false,
    })

    renderWithRouter()
    expect(screen.getByText('Client Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to client login when not authenticated with client role', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      profileError: false,
    })

    renderWithRouter('client')
    expect(screen.getByText('Client Login Page')).toBeInTheDocument()
  })

  it('redirects to advisor login when not authenticated with advisor role', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      profileError: false,
    })

    renderWithRouter('advisor')
    expect(screen.getByText('Advisor Login Page')).toBeInTheDocument()
  })

  it('shows spinner while profile is loading (user exists, no profile yet)', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: null,
      isLoading: false,
      profileError: false,
    })

    const { container } = renderWithRouter('client')
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to login when profile fails to load', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: null,
      isLoading: false,
      profileError: true,
    })

    renderWithRouter('client')
    expect(screen.getByText('Client Login Page')).toBeInTheDocument()
  })

  it('redirects advisor to advisor dashboard when accessing client route', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { id: 'user-1', role: 'advisor' },
      isLoading: false,
      profileError: false,
    })

    renderWithRouter('client')
    expect(screen.getByText('Advisor Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects client to client dashboard when accessing advisor route', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { id: 'user-1', role: 'client' },
      isLoading: false,
      profileError: false,
    })

    renderWithRouter('advisor')
    expect(screen.getByText('Client Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated with correct client role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { id: 'user-1', role: 'client' },
      isLoading: false,
      profileError: false,
    })

    renderWithRouter('client')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children when authenticated with correct advisor role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { id: 'user-1', role: 'advisor' },
      isLoading: false,
      profileError: false,
    })

    renderWithRouter('advisor')
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children when authenticated with no requiredRole', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: null,
      isLoading: false,
      profileError: false,
    })

    renderWithRouter()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
