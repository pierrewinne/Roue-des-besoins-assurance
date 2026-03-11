import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
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
import type { DiagnosticResult, UniverseScore, RecommendedAction, Universe } from '../../shared/scoring/types.ts'
import { getNeedLevel } from '../../shared/scoring/thresholds.ts'

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
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!clientId || !user) return

      // Verify advisor owns this client before loading any data
      const { data: relation } = await supabase
        .from('advisor_clients')
        .select('id')
        .eq('advisor_id', user.id)
        .eq('client_id', clientId)
        .single()

      if (!relation) {
        navigate('/conseiller/dashboard', { replace: true })
        return
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', clientId)
        .single()
      setClientProfile(prof)

      // Fetch questionnaire answers
      const { data: qr } = await supabase
        .from('questionnaire_responses')
        .select('responses')
        .eq('profile_id', clientId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (qr) setAnswers(qr.responses as Record<string, unknown>)

      const { data: diag } = await supabase
        .from('diagnostics')
        .select('id, questionnaire_id, profile_id, scores, global_score, weightings, created_at')
        .eq('profile_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (diag) {
        // Audit advisor access to client data (SEC-03/P12)
      await supabase.rpc('log_audit_event', {
        p_action: 'view_client_diagnostic',
        p_resource_type: 'diagnostics',
        p_resource_id: diag.id,
        p_details: { client_id: clientId },
      })

      const { data: actionsData } = await supabase
          .from('actions')
          .select('id, diagnostic_id, type, universe, priority, title, description, created_at')
          .eq('diagnostic_id', diag.id)
          .order('priority', { ascending: false })

        const scores = diag.scores as Record<Universe, UniverseScore>
        for (const key of Object.keys(scores) as Universe[]) {
          scores[key].needLevel = getNeedLevel(scores[key].needScore)
        }

        const actions: RecommendedAction[] = (actionsData || []).map(a => ({
          type: a.type as 'immediate' | 'deferred' | 'event',
          universe: a.universe as Universe,
          priority: a.priority,
          title: a.title,
          description: a.description || '',
        }))

        setDiagnostic({
          universeScores: scores,
          globalScore: Number(diag.global_score),
          weightings: diag.weightings as Record<Universe, number>,
          actions,
        })
      }
      setLoading(false)
    }
    load()
  }, [clientId, user, navigate])

  if (loading) {
    return <Spinner />
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
                {Object.entries(diagnostic.universeScores).map(([key, score]) => (
                  <UniverseCard key={key} universe={key} score={score} showDetails />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-primary-700 mb-4">Plan d'actions</h2>
              <ActionList actions={diagnostic.actions} showType />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
