import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.tsx'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Page introuvable</p>
        <Link to="/">
          <Button>Retour \u00e0 l'accueil</Button>
        </Link>
      </div>
    </div>
  )
}
