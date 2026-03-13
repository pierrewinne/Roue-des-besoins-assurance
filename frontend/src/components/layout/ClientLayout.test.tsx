import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ClientLayout from './ClientLayout.tsx'

const mockSignOut = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../contexts/AuthContext.tsx', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
    profile: { first_name: 'Jean', last_name: 'Dupont', email: 'jean@test.com', role: 'client' },
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

function renderLayout(path = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ClientLayout />
    </MemoryRouter>
  )
}

describe('ClientLayout', () => {
  it('renders the brand badge "RB"', () => {
    renderLayout()
    expect(screen.getAllByText('RB').length).toBeGreaterThan(0)
  })

  it('renders the brand name', () => {
    renderLayout()
    expect(screen.getByText('Roue des Besoins')).toBeInTheDocument()
  })

  it('renders the dashboard nav link', () => {
    renderLayout()
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
  })

  it('renders user avatar with first letter of first_name', () => {
    renderLayout()
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('renders user name', () => {
    renderLayout()
    expect(screen.getByText('Jean')).toBeInTheDocument()
  })

  it('renders sign-out button', () => {
    renderLayout()
    expect(screen.getByText('Déconnexion')).toBeInTheDocument()
  })

  it('calls signOut and navigates to /login on click', async () => {
    mockSignOut.mockResolvedValue(undefined)
    renderLayout()
    await act(async () => {
      screen.getByText('Déconnexion').click()
    })
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('shows error when signOut fails', async () => {
    mockSignOut.mockRejectedValue(new Error('fail'))
    renderLayout()
    await act(async () => {
      screen.getByText('Déconnexion').click()
    })
    expect(screen.getByText('Impossible de se déconnecter. Veuillez réessayer.')).toBeInTheDocument()
  })

  it('renders footer with "Roue des Besoins Assurance"', () => {
    renderLayout()
    expect(screen.getByText('Roue des Besoins Assurance')).toBeInTheDocument()
  })

  it('renders footer with "Diagnostic personnalisé"', () => {
    renderLayout()
    expect(screen.getByText('Diagnostic personnalisé')).toBeInTheDocument()
  })

  it('renders an Outlet placeholder (main area exists)', () => {
    const { container } = renderLayout()
    expect(container.querySelector('main')).toBeInTheDocument()
  })
})
