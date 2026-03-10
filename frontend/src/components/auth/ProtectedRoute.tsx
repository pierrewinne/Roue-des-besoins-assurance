import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Spinner from '../ui/Spinner.tsx'

interface ProtectedRouteProps {
  requiredRole?: 'client' | 'advisor'
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, profile, isLoading, profileError } = useAuth()

  if (isLoading) {
    return <Spinner className="min-h-screen" />
  }

  if (!user) {
    const loginPath = requiredRole === 'advisor' ? '/conseiller/login' : '/login'
    return <Navigate to={loginPath} replace />
  }

  // Wait for profile to load before checking role
  if (requiredRole && !profile && !profileError) {
    return <Spinner className="min-h-screen" />
  }

  // If profile failed to load, redirect to login
  if (requiredRole && profileError) {
    const loginPath = requiredRole === 'advisor' ? '/conseiller/login' : '/login'
    return <Navigate to={loginPath} replace />
  }

  // Redirect to correct journey if role doesn't match
  if (requiredRole && profile && profile.role !== requiredRole) {
    const correctPath = profile.role === 'advisor' ? '/conseiller/dashboard' : '/dashboard'
    return <Navigate to={correctPath} replace />
  }

  return <Outlet />
}
