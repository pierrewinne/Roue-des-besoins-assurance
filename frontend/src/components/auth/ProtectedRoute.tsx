import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import Spinner from '../ui/Spinner.tsx'

interface ProtectedRouteProps {
  requiredRole?: 'client' | 'advisor'
}

export default function ProtectedRoute({ requiredRole: _requiredRole }: ProtectedRouteProps) {
  // DEV BYPASS: skip auth temporarily for testing
  return <Outlet />
}
