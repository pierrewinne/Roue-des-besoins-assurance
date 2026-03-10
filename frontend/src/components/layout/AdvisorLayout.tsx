import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Button from '../ui/Button.tsx'

export default function AdvisorLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/advisor', label: 'Tableau de bord' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-header">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/advisor" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-700 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="font-semibold text-slate-900 tracking-tight">Roue des Besoins</span>
              <span className="text-xs bg-primary-50 text-primary-700 ring-1 ring-primary-700/10 px-2 py-0.5 rounded-full font-medium">Conseiller</span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary-700">
                    {(profile?.first_name?.[0] || '?').toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-slate-500">{profile?.first_name} {profile?.last_name}</span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Déconnexion
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary-700 rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">RB</span>
            </div>
            <span className="text-xs text-slate-400">Roue des Besoins Assurance</span>
          </div>
          <span className="text-xs text-slate-400">Espace conseiller</span>
        </div>
      </footer>
    </div>
  )
}
