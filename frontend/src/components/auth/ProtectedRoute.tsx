import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Spinner from '../ui/Spinner.tsx'

interface ProtectedRouteProps {
  requiredRole?: 'client' | 'advisor'
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth()

  if (isLoading) return <Spinner className="min-h-screen" />
  if (!user || !profile) {
    const loginPath = requiredRole === 'advisor' ? '/conseiller/login' : '/login'
    return <Navigate to={loginPath} replace />
  }
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={profile.role === 'advisor' ? '/conseiller' : '/'} replace />
  }

  return <Outlet />
}
