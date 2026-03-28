import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../ui/Button.tsx'
import BaloiseLogo from '../ui/BaloiseLogo.tsx'
import { PAGE_TRANSITION_STYLE } from '../../lib/constants.ts'

export default function ClientLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  async function handleSignOut() {
    setSignOutError(false)
    try {
      await signOut()
      navigate('/login')
    } catch {
      setSignOutError(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-grey-50">
      <header className="sticky top-0 z-50 bg-white border-b border-grey-200 shadow-header">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <BaloiseLogo variant="light" height={24} />
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors duration-300 ${
                  location.pathname.startsWith('/dashboard')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-grey-400 hover:text-primary-700 hover:bg-grey-100'
                }`}
              >
                Tableau de bord
              </Link>
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-grey-200">
                <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-700">
                    {(profile?.first_name?.[0] || profile?.email?.[0] || '?').toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-grey-400 hidden sm:block">{profile?.first_name || profile?.email}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {signOutError && (
          <div role="alert" className="mb-6 p-4 bg-danger-light rounded-xl ring-1 ring-danger/10">
            <p className="text-sm text-danger">Impossible de se déconnecter. Veuillez réessayer.</p>
          </div>
        )}
        <div key={location.pathname} style={PAGE_TRANSITION_STYLE}>
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-grey-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <BaloiseLogo variant="light" height={16} className="opacity-40" />
          <div className="flex items-center gap-4">
            <Link to="/confidentialite" className="text-xs text-grey-300 hover:text-primary-700 transition-colors">Politique de confidentialité</Link>
            <span className="text-xs text-grey-300">Diagnostic personnalisé</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
