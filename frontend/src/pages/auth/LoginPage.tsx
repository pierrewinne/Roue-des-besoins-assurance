import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../../components/ui/Button.tsx'
import Input from '../../components/ui/Input.tsx'
import Icon from '../../components/ui/Icon.tsx'

export default function LoginPage() {
  const [mode, setMode] = useState<'client' | 'advisor'>('client')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [signupPending, setSignupPending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, profile, isLoading, signInWithEmail, signUpWithEmail, signInWithMagicLink } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user) {
      navigate(profile?.role === 'advisor' ? '/advisor' : '/dashboard', { replace: true })
    }
  }, [user, profile, isLoading, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (mode === 'client') {
        if (authMode === 'signup') {
          await signUpWithEmail(email, password, 'client', firstName, lastName)
          setSignupPending(true)
        } else {
          await signInWithMagicLink(email)
          setMagicLinkSent(true)
        }
      } else {
        if (authMode === 'signup') {
          await signUpWithEmail(email, password, 'advisor', firstName, lastName)
          setSignupPending(true)
        } else {
          await signInWithEmail(email, password)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Database error') || msg.includes('unexpected_failure')) {
        setError('Service momentanément indisponible. Veuillez réessayer dans quelques instants.')
      } else if (msg.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.')
      } else if (msg.includes('User already registered')) {
        setError('Un compte existe déjà avec cet email.')
      } else if (msg.includes('Password should be')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.')
      } else {
        setError(msg || 'Une erreur est survenue')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (signupPending) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-elevated border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-5 ring-1 ring-emerald-600/10">
            <Icon name="check" size={28} strokeWidth={2} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Compte créé</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Un email de confirmation a été envoyé à <span className="font-medium text-slate-700">{email}</span>.
            Cliquez sur le lien pour activer votre compte.
          </p>
          <button
            onClick={() => { setSignupPending(false); setAuthMode('login') }}
            className="text-sm font-medium text-primary-700 hover:text-primary-600 transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-elevated border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-5 ring-1 ring-emerald-600/10">
            <Icon name="check" size={28} strokeWidth={2} className="text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">V&eacute;rifiez votre bo&icirc;te mail</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            Un lien de connexion a été envoyé à <span className="font-medium text-slate-700">{email}</span>.
            Cliquez sur le lien pour accéder à votre espace.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="text-sm font-medium text-primary-700 hover:text-primary-600 transition-colors"
          >
            Utiliser une autre adresse
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-[420px] w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary-700 rounded-xl flex items-center justify-center mx-auto mb-5">
            <span className="text-white font-bold text-xl">RB</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Roue des Besoins</h1>
          <p className="text-slate-500 mt-2 text-sm">Diagnostic assurance personnalisé</p>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-1 mb-8">
          <button
            onClick={() => { setMode('client'); setAuthMode('login') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === 'client'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Client
          </button>
          <button
            onClick={() => { setMode('advisor'); setAuthMode('login') }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              mode === 'advisor'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Conseiller
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-elevated border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg ring-1 ring-rose-600/10">
                {error}
              </div>
            )}

            {authMode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Prénom" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                <Input label="Nom" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
            />

            {(mode === 'advisor' || authMode === 'signup') && (
              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Chargement...' :
                mode === 'client' && authMode === 'login' ? 'Recevoir le lien de connexion' :
                authMode === 'signup' ? 'Créer un compte' : 'Se connecter'}
            </Button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm font-medium text-primary-700 hover:text-primary-600 transition-colors"
              >
                {authMode === 'login' ? 'Créer un compte' : 'J\'ai déjà un compte'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Icon name="lock" size={14} strokeWidth={2} />
            Connexion sécurisée
          </span>
          <span className="text-slate-300">&middot;</span>
          <span>Données confidentielles</span>
        </div>
      </div>
    </div>
  )
}
