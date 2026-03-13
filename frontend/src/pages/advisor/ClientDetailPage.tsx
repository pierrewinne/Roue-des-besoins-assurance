import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { verifyAdvisorRelation, fetchClientProfile } from '../../lib/api/advisor.ts'
import { fetchLatestDiagnostic, fetchActions, hydrateDiagnostic, logAuditEvent } from '../../lib/api/diagnostics.ts'
import { fetchCompletedAnswers } from '../../lib/api/questionnaire.ts'
import InsuranceWheel from '../../components/wheel/InsuranceWheel.tsx'
import WheelLegend from '../../components/wheel/WheelLegend.tsx'
import UniverseCard from '../../components/diagnostic/UniverseCard.tsx'
import ActionList from '../../components/diagnostic/ActionList.tsx'
import PdfDownloadButton from '../../components/pdf/PdfDownloadButton.tsx'
import Card from '../../components/ui/Card.tsx'
import ScoreGauge from '../../components/ui/ScoreGauge.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import Spinner from '../../components/ui/Spinner.tsx'
import EmptyState from '../../components/ui/EmptyState.tsx'
import type { DiagnosticResult } from '../../shared/scoring/types.ts'
import type { QuestionnaireAnswers } from '../../shared/questionnaire/schema.ts'

interface ClientProfile {
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
}

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!clientId || !user) return

      const { data: relation, error: relError } = await verifyAdvisorRelation(user.id, clientId)
      if (relError || !relation) {
        navigate('/conseiller/dashboard', { replace: true })
        return
      }

      // Parallelize independent queries (P3-05)
      const [profResult, qrAnswers, diagResult] = await Promise.all([
        fetchClientProfile(clientId),
        fetchCompletedAnswers(clientId),
        fetchLatestDiagnostic(clientId),
      ])

      if (profResult.error) {
        setError('Impossible de charger le profil client.')
        setLoading(false)
        return
      }

      setClientProfile(profResult.data)
      if (qrAnswers) setAnswers(qrAnswers)

      const diag = diagResult.data
      if (diag) {
        await logAuditEvent('view_client_diagnostic', 'diagnostics', diag.id, { client_id: clientId })

        const { data: actionsData } = await fetchActions(diag.id, clientId)
        setDiagnostic(hydrateDiagnostic(diag, actionsData || []))
      }
      setLoading(false)
    }
    load()
  }, [clientId, user, navigate])

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Fiche client"
          backLink={{ to: '/conseiller/dashboard', label: 'Retour au tableau de bord' }}
        />
        <EmptyState icon="exclamation-circle" description={error} />
      </div>
    )
  }

  const subtitle = [clientProfile?.email, clientProfile?.phone].filter(Boolean).join(' · ')

  return (
    <div>
      <PageHeader
        title={`${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`}
        subtitle={subtitle}
        backLink={{ to: '/conseiller/dashboard', label: 'Retour au tableau de bord' }}
        actions={
          diagnostic ? (
            <PdfDownloadButton
              diagnostic={diagnostic}
              type="advisor"
              clientName={`${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`}
              clientEmail={clientProfile?.email || undefined}
              answers={answers}
              wheelRef={wheelRef}
            />
          ) : undefined
        }
      />

      {!diagnostic ? (
        <Card>
          <EmptyState
            icon="document"
            description="Ce client n'a pas encore réalisé de diagnostic."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-5">
            <Card className="text-center">
              <div className="mb-4">
                <ScoreGauge score={diagnostic.globalScore} size={150} />
              </div>
              <p className="text-xs text-grey-400 mb-5">Score global de besoin</p>
              <div ref={wheelRef}>
                <InsuranceWheel diagnostic={diagnostic} size={250} showLabels={false} />
              </div>
              <WheelLegend diagnostic={diagnostic} showScores />
            </Card>

            <Card>
              <h3 className="font-bold text-sm text-primary-700 mb-4">Pondérations</h3>
              <div className="space-y-2.5">
                {Object.entries(diagnostic.weightings).map(([key, weight]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-grey-400 capitalize">{key.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-grey-100 rounded-full h-1.5">
                        <div className="bg-primary-400 h-1.5 rounded-full" style={{ width: `${weight}%` }} />
                      </div>
                      <span className="font-bold text-primary-700 tabular-nums w-8 text-right">{weight}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-primary-700 mb-4">Analyse détaillée</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(diagnostic.quadrantScores).map(([key, score]) => (
                  <UniverseCard key={key} universe={key} score={score} showDetails />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-primary-700 mb-4">Plan d'actions</h2>
              <ActionList actions={diagnostic.recommendations} showType />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
