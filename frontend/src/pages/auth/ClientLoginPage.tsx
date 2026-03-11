import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../../components/ui/Button.tsx'
import Input from '../../components/ui/Input.tsx'
import Icon from '../../components/ui/Icon.tsx'
import NeedsWheel from '../../components/landing/NeedsWheel.tsx'

const isDev = import.meta.env.DEV

export default function ClientLoginPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [signupPending, setSignupPending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [devPasswordLogin, setDevPasswordLogin] = useState(isDev)
  const { user, profile, isLoading, signUpWithEmail, signInWithEmail, signInWithMagicLink } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user && profile) {
      navigate(profile.role === 'advisor' ? '/conseiller/dashboard' : '/dashboard', { replace: true })
    }
  }, [user, profile, isLoading, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (authMode === 'signup') {
        await signUpWithEmail(email, password, firstName, lastName)
        setSignupPending(true)
      } else if (devPasswordLogin) {
        await signInWithEmail(email, password)
      } else {
        await signInWithMagicLink(email)
        setMagicLinkSent(true)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.')
      } else if (msg.includes('Database error') || msg.includes('unexpected_failure')) {
        setError('Service momentanément indisponible. Veuillez réessayer dans quelques instants.')
      } else if (msg.includes('User already registered')) {
        setError('Un compte existe déjà avec cette adresse email.')
      } else if (msg.includes('Password should be')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isConfirmation = signupPending || magicLinkSent

  return (
    <div className="min-h-screen flex">
      {/* Left panel: brand + wheel (desktop only) */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.03) 0%, transparent 60%)' }}
        />
        <div className="relative z-10 max-w-md w-full">
          <div className="flex items-center justify-center gap-3 mb-14">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white font-bold text-sm">RB</span>
            </div>
            <span className="text-white/70 font-bold tracking-tight">Roue des Besoins</span>
          </div>
          <NeedsWheel className="w-full max-w-[320px] mx-auto mb-12" />
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-3 leading-snug">
              Évaluez et optimisez votre
              <br />
              couverture d'assurance
            </h2>
            <p className="text-primary-200 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
              Un diagnostic personnalisé en quelques minutes pour identifier vos besoins réels.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs">
              <span className="flex items-center gap-1.5 text-primary-300">
                <Icon name="shield-check" size={15} strokeWidth={1.5} />
                4 univers
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5 text-primary-300">
                <Icon name="badge-check" size={15} strokeWidth={1.5} />
                Recommandations
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5 text-primary-300">
                <Icon name="document" size={15} strokeWidth={1.5} />
                Rapport PDF
              </span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <span className="flex items-center gap-1.5 text-[11px] text-primary-400/50">
            <Icon name="lock" size={12} strokeWidth={1.5} />
            Données chiffrées et confidentielles
          </span>
        </div>
      </div>

      {/* Right panel: form */}
      <div className="flex-1 flex flex-col bg-white min-h-screen">
        {/* Mobile hero band */}
        {!isConfirmation && (
          <div className="lg:hidden bg-gradient-to-b from-primary-950 to-primary-900 px-6 pt-10 pb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                <span className="text-white font-bold text-xs">RB</span>
              </div>
              <span className="text-white/70 font-bold text-sm">Roue des Besoins</span>
            </div>
            <NeedsWheel className="w-48 mx-auto mb-5" />
            <p className="text-primary-200 text-xs">Diagnostic assurance personnalisé</p>
          </div>
        )}

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {signupPending ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-[#e8f3ec] rounded-xl flex items-center justify-center mx-auto mb-5 ring-1 ring-[#168741]/10">
                  <Icon name="check" size={28} strokeWidth={2} className="text-[#168741]" />
                </div>
                <h2 className="text-xl font-bold text-primary-700 mb-2">Compte créé</h2>
                <p className="text-grey-400 mb-6 text-sm leading-relaxed">
                  Un email de confirmation a été envoyé à{' '}
                  <span className="font-bold text-primary-700">{email}</span>.
                  Cliquez sur le lien pour activer votre compte.
                </p>
                <button
                  onClick={() => { setSignupPending(false); setAuthMode('login') }}
                  className="text-sm font-bold text-primary-700 hover:text-primary-600 transition-colors"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : magicLinkSent ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-[#e8f3ec] rounded-xl flex items-center justify-center mx-auto mb-5 ring-1 ring-[#168741]/10">
                  <Icon name="check" size={28} strokeWidth={2} className="text-[#168741]" />
                </div>
                <h2 className="text-xl font-bold text-primary-700 mb-2">Vérifiez votre boîte mail</h2>
                <p className="text-grey-400 mb-6 text-sm leading-relaxed">
                  Un lien de connexion a été envoyé à{' '}
                  <span className="font-bold text-primary-700">{email}</span>.
                  Cliquez sur le lien pour accéder à votre espace.
                </p>
                <button
                  onClick={() => setMagicLinkSent(false)}
                  className="text-sm font-bold text-primary-700 hover:text-primary-600 transition-colors"
                >
                  Utiliser une autre adresse
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-primary-700 mb-1.5">
                    {authMode === 'signup' ? 'Créez votre compte' : 'Accédez à votre espace'}
                  </h2>
                  <p className="text-sm text-grey-400">
                    {authMode === 'signup'
                      ? 'Créez un compte pour démarrer votre diagnostic.'
                      : devPasswordLogin
                        ? 'Connectez-vous avec votre email et mot de passe.'
                        : 'Recevez un lien de connexion sécurisé par email.'}
                  </p>
                  {isDev && authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setDevPasswordLogin(!devPasswordLogin)}
                      className="mt-2 text-xs text-amber-600 hover:text-amber-500 font-mono"
                    >
                      [DEV] {devPasswordLogin ? 'Magic link' : 'Mot de passe'}
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-[#ffeef1] text-[#d9304c] text-sm rounded-lg ring-1 ring-[#d9304c]/10">
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

                  {(authMode === 'signup' || devPasswordLogin) && (
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
                    {isSubmitting
                      ? 'Chargement...'
                      : authMode === 'signup'
                        ? 'Créer mon compte'
                        : devPasswordLogin
                          ? 'Se connecter'
                          : 'Recevoir mon lien de connexion'}
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                      className="text-sm font-bold text-primary-700 hover:text-primary-600 transition-colors"
                    >
                      {authMode === 'login' ? 'Créer un compte' : 'J\'ai déjà un compte'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
