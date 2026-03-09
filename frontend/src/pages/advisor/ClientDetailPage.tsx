import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.ts'
import InsuranceWheel from '../../components/wheel/InsuranceWheel.tsx'
import WheelLegend from '../../components/wheel/WheelLegend.tsx'
import UniverseCard from '../../components/diagnostic/UniverseCard.tsx'
import ActionList from '../../components/diagnostic/ActionList.tsx'
import PdfDownloadButton from '../../components/pdf/PdfDownloadButton.tsx'
import Card from '../../components/ui/Card.tsx'
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
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/advisor" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {clientProfile?.first_name} {clientProfile?.last_name}
          </h1>
          <p className="text-gray-500">{clientProfile?.email} {clientProfile?.phone ? `· ${clientProfile.phone}` : ''}</p>
        </div>
        {diagnostic && (
          <PdfDownloadButton
            diagnostic={diagnostic}
            type="advisor"
            clientName={`${clientProfile?.first_name || ''} ${clientProfile?.last_name || ''}`}
            clientEmail={clientProfile?.email || undefined}
            answers={answers}
            wheelRef={wheelRef}
          />
        )}
      </div>

      {!diagnostic ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">Ce client n'a pas encore réalisé de diagnostic.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="mb-2">
                <span className={`text-4xl font-bold ${
                  diagnostic.globalScore <= 25 ? 'text-green-600' :
                  diagnostic.globalScore <= 50 ? 'text-orange-500' : 'text-red-500'
                }`}>{diagnostic.globalScore}</span>
                <span className="text-gray-400 text-lg">/100</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Score global de besoin</p>
              <div ref={wheelRef}>
                <InsuranceWheel diagnostic={diagnostic} size={250} showLabels={false} />
              </div>
              <WheelLegend diagnostic={diagnostic} showScores />
            </Card>

            <Card className="mt-4">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Pondérations</h3>
              {Object.entries(diagnostic.weightings).map(([key, weight]) => (
                <div key={key} className="flex justify-between text-sm py-1">
                  <span className="text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                  <span className="font-medium">{weight}%</span>
                </div>
              ))}
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Analyse détaillée</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(diagnostic.universeScores).map(([key, score]) => (
                  <UniverseCard key={key} universe={key} score={score} showDetails />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan d'actions</h2>
              <ActionList actions={diagnostic.actions} showType />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
