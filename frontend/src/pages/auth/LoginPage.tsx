import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../../components/ui/Button.tsx'
import Input from '../../components/ui/Input.tsx'
import Icon from '../../components/ui/Icon.tsx'
import NeedsWheel from '../../components/landing/NeedsWheel.tsx'

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
      } else if (msg.includes('Invalid login credentials') || msg.includes('User already registered')) {
        setError('Identifiants incorrects ou compte inexistant.')
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
      {/* ── Left panel: brand + wheel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle radial spotlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.03) 0%, transparent 60%)' }}
        />

        <div className="relative z-10 max-w-md w-full">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-14">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white font-bold text-sm">RB</span>
            </div>
            <span className="text-white/70 font-bold tracking-tight">Roue des Besoins</span>
          </div>

          {/* Wheel diagram */}
          <NeedsWheel className="w-full max-w-[320px] mx-auto mb-12" />

          {/* Value proposition */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-3 leading-snug">
              Évaluez et optimisez votre
              <br />
              couverture d'assurance
            </h2>
            <p className="text-primary-200 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
              Un diagnostic personnalisé en quelques minutes pour identifier vos besoins réels.
            </p>

            {/* Benefits */}
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

        {/* Bottom trust */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <span className="flex items-center gap-1.5 text-[11px] text-primary-400/50">
            <Icon name="lock" size={12} strokeWidth={1.5} />
            Données chiffrées et confidentielles
          </span>
        </div>
      </div>

      {/* ── Right panel: form ── */}
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
                {/* Form header */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-primary-700 mb-1.5">
                    {mode === 'advisor'
                      ? 'Espace conseiller'
                      : authMode === 'signup'
                        ? 'Créez votre compte'
                        : 'Accédez à votre espace'}
                  </h2>
                  <p className="text-sm text-grey-400">
                    {mode === 'advisor'
                      ? 'Connectez-vous pour gérer vos clients.'
                      : authMode === 'signup'
                        ? 'Créez un compte pour démarrer votre diagnostic.'
                        : 'Recevez un lien de connexion sécurisé par email.'}
                  </p>
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
                    {isSubmitting
                      ? 'Chargement...'
                      : mode === 'client' && authMode === 'login'
                        ? 'Recevoir mon lien de connexion'
                        : authMode === 'signup'
                          ? 'Créer mon compte'
                          : 'Se connecter'}
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

                {/* Mode switch */}
                <div className="mt-10 pt-6 border-t border-grey-100 text-center">
                  {mode === 'client' ? (
                    <button
                      type="button"
                      onClick={() => { setMode('advisor'); setAuthMode('login'); setError(''); setPassword('') }}
                      className="text-sm text-grey-300 hover:text-primary-700 transition-colors"
                    >
                      Vous êtes conseiller ?{' '}
                      <span className="font-bold text-primary-700">Accès professionnel</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setMode('client'); setAuthMode('login'); setError(''); setPassword('') }}
                      className="text-sm text-grey-300 hover:text-primary-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Icon name="chevron-left" size={14} strokeWidth={2} />
                      Retour à l'accès client
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
