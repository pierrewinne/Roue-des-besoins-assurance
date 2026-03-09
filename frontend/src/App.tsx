import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import CallbackPage from './pages/auth/CallbackPage.tsx'
import ProtectedRoute from './components/auth/ProtectedRoute.tsx'
import ClientLayout from './components/layout/ClientLayout.tsx'
import AdvisorLayout from './components/layout/AdvisorLayout.tsx'
import ClientDashboard from './pages/client/ClientDashboard.tsx'
import QuestionnairePage from './pages/client/QuestionnairePage.tsx'
import ResultsPage from './pages/client/ResultsPage.tsx'
import AdvisorDashboard from './pages/advisor/AdvisorDashboard.tsx'
import ClientDetailPage from './pages/advisor/ClientDetailPage.tsx'
import NotFoundPage from './pages/shared/NotFoundPage.tsx'

function RootRedirect() {
  const { profile } = useAuth()
  if (profile?.role === 'advisor') return <Navigate to="/advisor" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<CallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RootRedirect />} />

          <Route element={<ClientLayout />}>
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/questionnaire" element={<QuestionnairePage />} />
            <Route path="/results/:diagnosticId" element={<ResultsPage />} />
          </Route>

          <Route element={<AdvisorLayout />}>
            <Route path="/advisor" element={<AdvisorDashboard />} />
            <Route path="/advisor/clients/:clientId" element={<ClientDetailPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
