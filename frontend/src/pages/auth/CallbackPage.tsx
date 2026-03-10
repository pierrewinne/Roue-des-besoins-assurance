import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.ts'
import Spinner from '../../components/ui/Spinner.tsx'

export default function CallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard', { replace: true })
      }
    })
  }, [navigate])

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
