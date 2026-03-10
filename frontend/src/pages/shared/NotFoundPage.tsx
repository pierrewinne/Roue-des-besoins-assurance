import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.tsx'
import Icon from '../../components/ui/Icon.tsx'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
          <Icon name="exclamation-circle" size={32} className="text-slate-400" />
        </div>
        <p className="text-7xl font-bold text-slate-200 tracking-tight mb-2">404</p>
        <h1 className="text-lg font-semibold text-slate-900 mb-2">Page introuvable</h1>
        <p className="text-sm text-slate-500 mb-8">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link to="/">
          <Button>Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  )
}
