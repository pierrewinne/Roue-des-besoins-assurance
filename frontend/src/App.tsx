import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx'
import Spinner from './components/ui/Spinner.tsx'
import ProtectedRoute from './components/auth/ProtectedRoute.tsx'

// Eagerly loaded: main landing page (first paint)
import HomePage from './pages/shared/HomePage.tsx'

// Lazy loaded: everything behind auth or secondary routes
const AdvisorHomePage = lazy(() => import('./pages/advisor/AdvisorHomePage.tsx'))
const ClientLoginPage = lazy(() => import('./pages/auth/ClientLoginPage.tsx'))
const AdvisorLoginPage = lazy(() => import('./pages/auth/AdvisorLoginPage.tsx'))
const CallbackPage = lazy(() => import('./pages/auth/CallbackPage.tsx'))
const ClientLayout = lazy(() => import('./components/layout/ClientLayout.tsx'))
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard.tsx'))
const QuestionnairePage = lazy(() => import('./pages/client/QuestionnairePage.tsx'))
const ResultsPage = lazy(() => import('./pages/client/ResultsPage.tsx'))
const AdvisorLayout = lazy(() => import('./components/layout/AdvisorLayout.tsx'))
const AdvisorDashboard = lazy(() => import('./pages/advisor/AdvisorDashboard.tsx'))
const ClientDetailPage = lazy(() => import('./pages/advisor/ClientDetailPage.tsx'))
const ProfilPage = lazy(() => import('./pages/client/ProfilPage.tsx'))
const UniverseQuestionnairePage = lazy(() => import('./pages/client/UniverseQuestionnairePage.tsx'))
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage.tsx'))

function AuthRedirect() {
  const { profile } = useAuth()
  if (profile?.role === 'advisor') return <Navigate to="/conseiller/dashboard" replace />
  return <Navigate to="/dashboard" replace />
}

function LegacyClientRedirect() {
  const { clientId } = useParams<{ clientId: string }>()
  return <Navigate to={`/conseiller/clients/${clientId}`} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Spinner className="min-h-screen" />}>
        <Routes>
          {/* ── Parcours 1: Client ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<ClientLoginPage />} />
          <Route path="/auth/callback" element={<CallbackPage />} />

          <Route element={<ProtectedRoute requiredRole="client" />}>
            <Route element={<ClientLayout />}>
              <Route path="/dashboard" element={<ClientDashboard />} />
              <Route path="/questionnaire" element={<QuestionnairePage />} />
              <Route path="/questionnaire/profil" element={<ProfilPage />} />
              <Route path="/questionnaire/:universe" element={<UniverseQuestionnairePage />} />
              <Route path="/results/:diagnosticId" element={<ResultsPage />} />
            </Route>
          </Route>

          {/* ── Parcours 2: Conseiller ── */}
          <Route path="/conseiller" element={<AdvisorHomePage />} />
          <Route path="/conseiller/login" element={<AdvisorLoginPage />} />

          <Route element={<ProtectedRoute requiredRole="advisor" />}>
            <Route element={<AdvisorLayout />}>
              <Route path="/conseiller/dashboard" element={<AdvisorDashboard />} />
              <Route path="/conseiller/clients/:clientId" element={<ClientDetailPage />} />
            </Route>
          </Route>

          {/* Legacy redirects */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AuthRedirect />} />
          </Route>
          <Route path="/advisor" element={<Navigate to="/conseiller" replace />} />
          <Route path="/advisor/clients/:clientId" element={<LegacyClientRedirect />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
