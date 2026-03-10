import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Spinner from '../../components/ui/Spinner.tsx'

export default function CallbackPage() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, isLoading, navigate])

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 10000)
    return () => clearTimeout(timer)
  }, [])

  if (timedOut && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <p className="text-slate-900 font-medium mb-2">La connexion a échoué</p>
          <p className="text-slate-500 text-sm mb-6">Le lien est peut-être expiré ou invalide.</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-sm font-medium text-primary-700 hover:text-primary-600 transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Spinner className="mb-5" />
        <p className="text-slate-600 font-medium">Connexion en cours...</p>
        <p className="text-slate-400 text-sm mt-1">Vous allez être redirigé automatiquement.</p>
      </div>
    </div>
  )
}
