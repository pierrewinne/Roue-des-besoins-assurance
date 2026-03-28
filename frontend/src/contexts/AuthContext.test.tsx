import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import { render, screen, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext.tsx'

// ── Mock supabase ──
let authStateCallback: (event: string, session: unknown) => void

const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignInWithOtp = vi.fn()
const mockSignOut = vi.fn()
const mockSelectEqSingle = vi.fn()
const mockUnsubscribe = vi.fn()

vi.mock('../lib/supabase.ts', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        authStateCallback = cb
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
      },
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithOtp: (...args: unknown[]) => mockSignInWithOtp(...args),
      signOut: () => mockSignOut(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => mockSelectEqSingle(),
        }),
      }),
    }),
  },
}))

function TestConsumer() {
  const auth = useAuth()
  const [lastError, setLastError] = useState('')
  return (
    <div>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="user">{auth.user ? 'logged-in' : 'none'}</span>
      <span data-testid="profile-role">{auth.profile?.role ?? 'none'}</span>
      <span data-testid="profile-error">{String(auth.profileError)}</span>
      <span data-testid="last-error">{lastError}</span>
      <button onClick={() => auth.signInWithEmail('a@b.com', 'pw').catch(e => setLastError(e.message))}>sign-in</button>
      <button onClick={() => auth.signUpWithEmail('a@b.com', 'pw', 'Jean', 'Dupont').catch(e => setLastError(e.message))}>sign-up</button>
      <button onClick={() => auth.signInWithMagicLink('a@b.com').catch(e => setLastError(e.message))}>magic-link</button>
      <button onClick={() => auth.signOut().catch(e => setLastError(e.message))}>sign-out</button>
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSelectEqSingle.mockResolvedValue({ data: { id: 'u1', role: 'client', first_name: 'Jean', last_name: null, email: 'a@b.com', phone: null }, error: null })
})

describe('AuthProvider', () => {
  it('starts in loading state and resolves after getSession', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    // Initially loading while getSession resolves
    await act(async () => {})
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('sets user when onAuthStateChange fires with session', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => {
      authStateCallback('SIGNED_IN', { user: { id: 'u1' } })
    })
    expect(screen.getByTestId('user')).toHaveTextContent('logged-in')
    expect(screen.getByTestId('loading')).toHaveTextContent('false')
  })

  it('fetches profile on auth state change', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => {
      authStateCallback('SIGNED_IN', { user: { id: 'u1' } })
    })
    expect(mockSelectEqSingle).toHaveBeenCalled()
    expect(screen.getByTestId('profile-role')).toHaveTextContent('client')
  })

  it('sets profileError when profile fetch fails', async () => {
    mockSelectEqSingle.mockResolvedValue({ data: null, error: new Error('fail') })
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => {
      authStateCallback('SIGNED_IN', { user: { id: 'u1' } })
    })
    expect(screen.getByTestId('profile-error')).toHaveTextContent('true')
  })

  it('clears profile when session is null', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => {
      authStateCallback('SIGNED_IN', { user: { id: 'u1' } })
    })
    await act(async () => {
      authStateCallback('SIGNED_OUT', null)
    })
    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('profile-role')).toHaveTextContent('none')
  })

  it('cleans up subscription on unmount', () => {
    const { unmount } = render(<AuthProvider><TestConsumer /></AuthProvider>)
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})

describe('signInWithEmail', () => {
  it('calls supabase signInWithPassword and fetches profile', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { session: {}, user: { id: 'u1' } }, error: null })
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => {
      screen.getByText('sign-in').click()
    })
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' })
    expect(mockSelectEqSingle).toHaveBeenCalled()
  })

  it('surfaces error on supabase failure', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: {}, error: new Error('bad creds') })
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => { screen.getByText('sign-in').click() })
    expect(screen.getByTestId('last-error')).toHaveTextContent('bad creds')
  })
})

describe('signUpWithEmail', () => {
  it('calls supabase signUp with role=client', async () => {
    mockSignUp.mockResolvedValue({ data: { session: {}, user: { id: 'u2' } }, error: null })
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => {
      screen.getByText('sign-up').click()
    })
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pw',
      options: { data: { role: 'client', first_name: 'Jean', last_name: 'Dupont' } },
    })
  })

  it('surfaces error on supabase failure', async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: new Error('exists') })
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => { screen.getByText('sign-up').click() })
    expect(screen.getByTestId('last-error')).toHaveTextContent('exists')
  })
})

describe('signInWithMagicLink', () => {
  it('calls supabase signInWithOtp with correct redirect', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => {
      screen.getByText('magic-link').click()
    })
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'a@b.com',
      options: { emailRedirectTo: expect.stringContaining('/auth/callback') },
    })
  })
})

describe('signOut', () => {
  it('clears state on successful sign out', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    mockSignInWithPassword.mockResolvedValue({ data: { session: {}, user: { id: 'u1' } }, error: null })
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => { screen.getByText('sign-in').click() })
    await act(async () => { screen.getByText('sign-out').click() })
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('surfaces error on supabase failure', async () => {
    mockSignOut.mockResolvedValue({ error: new Error('nope') })
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await act(async () => { screen.getByText('sign-out').click() })
    expect(screen.getByTestId('last-error')).toHaveTextContent('nope')
  })
})

describe('useAuth outside provider', () => {
  it('throws when used outside AuthProvider', () => {
    function BadConsumer() { useAuth(); return null }
    expect(() => render(<BadConsumer />)).toThrow('useAuth must be used within AuthProvider')
  })
})
