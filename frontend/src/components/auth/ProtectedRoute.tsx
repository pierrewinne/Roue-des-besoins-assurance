import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Spinner from '../ui/Spinner.tsx'

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <Spinner className="min-h-screen" />
  }

  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
