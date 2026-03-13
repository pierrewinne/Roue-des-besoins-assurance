import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase.ts'
import type { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  role: 'client' | 'advisor'
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  profileError: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)

  async function fetchProfile(userId: string) {
    setProfileError(false)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      setProfile(null)
      setProfileError(true)
      return
    }
    setProfile(data)
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) {
        await fetchProfile(s.user.id)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    setSession(data.session)
    setUser(data.user)
    if (data.user) await fetchProfile(data.user.id)
  }

  async function signUpWithEmail(email: string, password: string, firstName?: string, lastName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'client', first_name: firstName, last_name: lastName },
      },
    })
    if (error) throw error
    if (data.session) {
      setSession(data.session)
      setUser(data.user)
      if (data.user) await fetchProfile(data.user.id)
    }
  }

  async function signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
    setUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, profileError, signInWithEmail, signUpWithEmail, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
