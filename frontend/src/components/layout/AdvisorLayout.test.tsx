import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdvisorLayout from './AdvisorLayout.tsx'

const mockSignOut = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../contexts/AuthContext.tsx', () => ({
  useAuth: () => ({
    signOut: mockSignOut,
    profile: { first_name: 'Marie', last_name: 'Martin', email: 'marie@test.com', role: 'advisor' },
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

function renderLayout(path = '/conseiller/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AdvisorLayout />
    </MemoryRouter>
  )
}

describe('AdvisorLayout', () => {
  it('renders the brand badge "RB"', () => {
    renderLayout()
    expect(screen.getAllByText('RB').length).toBeGreaterThan(0)
  })

  it('renders the "Conseiller" badge', () => {
    renderLayout()
    expect(screen.getByText('Conseiller')).toBeInTheDocument()
  })

  it('renders the brand name', () => {
    renderLayout()
    expect(screen.getByText('Roue des Besoins')).toBeInTheDocument()
  })

  it('renders dashboard nav link', () => {
    renderLayout()
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument()
  })

  it('renders user avatar with first letter of first_name', () => {
    renderLayout()
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('renders full name (first + last)', () => {
    renderLayout()
    expect(screen.getByText('Marie Martin')).toBeInTheDocument()
  })

  it('renders sign-out button', () => {
    renderLayout()
    expect(screen.getByText('Déconnexion')).toBeInTheDocument()
  })

  it('calls signOut and navigates to /conseiller/login', async () => {
    mockSignOut.mockResolvedValue(undefined)
    renderLayout()
    await act(async () => {
      screen.getByText('Déconnexion').click()
    })
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/conseiller/login')
  })

  it('shows error when signOut fails', async () => {
    mockSignOut.mockRejectedValue(new Error('fail'))
    renderLayout()
    await act(async () => {
      screen.getByText('Déconnexion').click()
    })
    expect(screen.getByText('Impossible de se déconnecter. Veuillez réessayer.')).toBeInTheDocument()
  })

  it('renders footer with "Espace conseiller"', () => {
    renderLayout()
    expect(screen.getByText('Espace conseiller')).toBeInTheDocument()
  })

  it('renders main area', () => {
    const { container } = renderLayout()
    expect(container.querySelector('main')).toBeInTheDocument()
  })
})
