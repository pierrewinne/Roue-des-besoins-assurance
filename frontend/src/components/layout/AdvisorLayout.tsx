import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../ui/Button.tsx'
import BaloiseLogo from '../ui/BaloiseLogo.tsx'
import { PAGE_TRANSITION_STYLE } from '../../lib/constants.ts'

export default function AdvisorLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  async function handleSignOut() {
    setSignOutError(false)
    try {
      await signOut()
      navigate('/conseiller/login')
    } catch {
      setSignOutError(true)
    }
  }

  const navItems = [
    { path: '/conseiller/dashboard', label: 'Tableau de bord' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-grey-50">
      <header className="sticky top-0 z-50 bg-white border-b border-grey-200 shadow-header">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/conseiller" className="flex items-center gap-3">
              <BaloiseLogo variant="light" height={24} />
              <span className="text-xs bg-primary-50 text-primary-700 ring-1 ring-primary-700/10 px-2 py-0.5 rounded-full font-bold">Conseiller</span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors duration-300 ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-grey-400 hover:text-primary-700 hover:bg-grey-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-grey-200">
                <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-700">
                    {(profile?.first_name?.[0] || '?').toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-grey-400">{profile?.first_name} {profile?.last_name}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {signOutError && (
          <div className="mb-6 p-4 bg-danger-light rounded-xl ring-1 ring-danger/10">
            <p className="text-sm text-danger">Impossible de se déconnecter. Veuillez réessayer.</p>
          </div>
        )}
        <div key={location.pathname} style={PAGE_TRANSITION_STYLE}>
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-grey-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <BaloiseLogo variant="light" height={16} className="opacity-40" />
          <span className="text-xs text-grey-300">Espace conseiller</span>
        </div>
      </footer>
    </div>
  )
}
