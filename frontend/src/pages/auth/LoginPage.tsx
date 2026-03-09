import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../../components/ui/Button.tsx'
import Card from '../../components/ui/Card.tsx'

export default function LoginPage() {
  const [mode, setMode] = useState<'client' | 'advisor'>('client')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signInWithEmail, signUpWithEmail, signInWithMagicLink } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (mode === 'client') {
        if (authMode === 'signup') {
          await signUpWithEmail(email, password, 'client', firstName, lastName)
          navigate('/dashboard')
        } else {
          await signInWithMagicLink(email)
          setMagicLinkSent(true)
        }
      } else {
        if (authMode === 'signup') {
          await signUpWithEmail(email, password, 'advisor', firstName, lastName)
        } else {
          await signInWithEmail(email, password)
        }
        navigate('/advisor')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-xl">{'\u2713'}</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">V\u00e9rifiez votre bo\u00eete mail</h2>
          <p className="text-gray-600 mb-4">
            Un lien de connexion a \u00e9t\u00e9 envoy\u00e9 \u00e0 <strong>{email}</strong>.
            Cliquez sur le lien pour acc\u00e9der \u00e0 votre espace.
          </p>
          <Button variant="ghost" onClick={() => setMagicLinkSent(false)}>
            Utiliser une autre adresse
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">RB</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Roue des Besoins</h1>
          <p className="text-gray-500 mt-1">Diagnostic assurance personnalis\u00e9</p>
        </div>

        <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => { setMode('client'); setAuthMode('login') }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'client' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Client
          </button>
          <button
            onClick={() => { setMode('advisor'); setAuthMode('login') }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'advisor' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Conseiller
          </button>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
            )}

            {authMode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pr\u00e9nom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="votre@email.com"
              />
            </div>

            {(mode === 'advisor' || authMode === 'signup') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Chargement...' :
                mode === 'client' && authMode === 'login' ? 'Recevoir le lien de connexion' :
                authMode === 'signup' ? 'Cr\u00e9er un compte' : 'Se connecter'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {authMode === 'login' ? 'Cr\u00e9er un compte' : 'J\'ai d\u00e9j\u00e0 un compte'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
