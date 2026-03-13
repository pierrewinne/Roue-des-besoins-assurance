import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../../components/ui/Button.tsx'
import Input from '../../components/ui/Input.tsx'
import Icon from '../../components/ui/Icon.tsx'

export default function AdvisorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, profile, isLoading, signInWithEmail } = useAuth()
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
      await signInWithEmail(email, password)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Database error') || msg.includes('unexpected_failure')) {
        setError('Service momentanément indisponible. Veuillez réessayer dans quelques instants.')
      } else if (msg.includes('Invalid login credentials')) {
        setError('Identifiants incorrects. Vérifiez votre email et mot de passe.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel: professional branding (desktop only) */}
      <div className="hidden lg:flex lg:w-[48%] bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.03) 0%, transparent 60%)' }}
        />
        <div className="relative z-10 max-w-md w-full text-center">
          <div className="flex items-center justify-center gap-3 mb-14">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white font-bold text-sm">RB</span>
            </div>
            <span className="text-white/70 font-bold tracking-tight">Roue des Besoins</span>
            <span className="text-xs bg-white/10 text-white/70 ring-1 ring-white/10 px-2 py-0.5 rounded-full font-bold">Conseiller</span>
          </div>

          <div className="w-20 h-20 bg-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-8 ring-1 ring-white/[0.08]">
            <Icon name="users" size={36} strokeWidth={1.5} className="text-white/60" />
          </div>

          <h2 className="text-xl font-bold text-white mb-3 leading-snug">
            Pilotez les diagnostics
            <br />
            de vos clients
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
            Visualisez les besoins, suivez les scores et générez des rapports PDF pour accompagner vos clients.
          </p>

          <div className="flex items-center justify-center gap-6 text-xs">
            <span className="flex items-center gap-1.5 text-primary-300">
              <Icon name="users" size={15} strokeWidth={1.5} />
              Portefeuille clients
            </span>
            <span className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1.5 text-primary-300">
              <Icon name="chart-pie" size={15} strokeWidth={1.5} />
              Diagnostics détaillés
            </span>
            <span className="w-px h-3 bg-white/10" />
            <span className="flex items-center gap-1.5 text-primary-300">
              <Icon name="document" size={15} strokeWidth={1.5} />
              Rapports PDF
            </span>
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <span className="flex items-center gap-1.5 text-[11px] text-primary-400/50">
            <Icon name="lock" size={12} strokeWidth={1.5} />
            Accès réservé aux conseillers habilités
          </span>
        </div>
      </div>

      {/* Right panel: login form */}
      <div className="flex-1 flex flex-col bg-white min-h-screen">
        {/* Mobile hero band */}
        <div className="lg:hidden bg-gradient-to-b from-primary-950 to-primary-900 px-6 pt-10 pb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-white/10">
              <span className="text-white font-bold text-xs">RB</span>
            </div>
            <span className="text-white/70 font-bold text-sm">Roue des Besoins</span>
            <span className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full font-bold">Conseiller</span>
          </div>
          <p className="text-primary-200 text-xs">Espace professionnel</p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary-700 mb-1.5">Espace conseiller</h2>
              <p className="text-sm text-grey-400">
                Connectez-vous pour gérer vos clients.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-danger-light text-danger text-sm rounded-lg ring-1 ring-danger/10">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="prenom.nom@baloise.lu"
              />

              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            {/* Back to client */}
            <div className="mt-10 pt-6 border-t border-grey-100 text-center">
              <Link
                to="/login"
                className="text-sm text-grey-300 hover:text-primary-700 transition-colors inline-flex items-center gap-1.5"
              >
                <Icon name="chevron-left" size={14} strokeWidth={2} />
                Accès client
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
