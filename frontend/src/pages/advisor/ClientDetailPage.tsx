import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.ts'
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
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!clientId) return

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
        .select('*')
        .eq('profile_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (diag) {
        const { data: actionsData } = await supabase
          .from('actions')
          .select('*')
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
  }, [clientId])

  if (loading) {
    return <Spinner />
  }

  const subtitle = [clientProfile?.email, clientProfile?.phone].filter(Boolean).join(' · ')

  return (
    <div>
      <PageHeader
        title={`${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`}
        subtitle={subtitle}
        backLink={{ to: '/advisor', label: 'Retour au tableau de bord' }}
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
              <p className="text-xs text-slate-500 mb-5">Score global de besoin</p>
              <div ref={wheelRef}>
                <InsuranceWheel diagnostic={diagnostic} size={250} showLabels={false} />
              </div>
              <WheelLegend diagnostic={diagnostic} showScores />
            </Card>

            <Card>
              <h3 className="font-semibold text-sm text-slate-900 mb-4">Pondérations</h3>
              <div className="space-y-2.5">
                {Object.entries(diagnostic.weightings).map(([key, weight]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 capitalize">{key.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-primary-400 h-1.5 rounded-full" style={{ width: `${weight}%` }} />
                      </div>
                      <span className="font-medium text-slate-700 tabular-nums w-8 text-right">{weight}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Analyse détaillée</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(diagnostic.universeScores).map(([key, score]) => (
                  <UniverseCard key={key} universe={key} score={score} showDetails />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Plan d'actions</h2>
              <ActionList actions={diagnostic.actions} showType />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
