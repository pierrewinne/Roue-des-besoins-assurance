import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../ui/Button.tsx'

export default function ClientLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-grey-50">
      <header className="sticky top-0 z-50 bg-white border-b border-grey-200 shadow-header">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-700 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="font-bold text-primary-700 hidden sm:block tracking-tight">Roue des Besoins</span>
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
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Déconnexion
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-grey-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary-700 rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">RB</span>
            </div>
            <span className="text-xs text-grey-300">Roue des Besoins Assurance</span>
          </div>
          <span className="text-xs text-grey-300">Diagnostic personnalisé</span>
        </div>
      </footer>
    </div>
  )
}
