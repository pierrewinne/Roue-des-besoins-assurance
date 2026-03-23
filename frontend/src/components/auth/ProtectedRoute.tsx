import { Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
  requiredRole?: 'client' | 'advisor'
}

export default function ProtectedRoute({ requiredRole: _requiredRole }: ProtectedRouteProps) {
  // DEV BYPASS: skip auth temporarily for testing
  return <Outlet />
}
