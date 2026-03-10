import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../ui/Button.tsx'

export default function ClientLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-header">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-700 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="font-semibold text-slate-900 hidden sm:block tracking-tight">Roue des Besoins</span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                Tableau de bord
              </Link>
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-700">
                    {(profile?.first_name?.[0] || profile?.email?.[0] || '?').toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-slate-500 hidden sm:block">{profile?.first_name || profile?.email}</span>
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

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary-700 rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">RB</span>
            </div>
            <span className="text-xs text-slate-400">Roue des Besoins Assurance</span>
          </div>
          <span className="text-xs text-slate-400">Diagnostic personnalisé</span>
        </div>
      </footer>
    </div>
  )
}
