import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.ts'
import InsuranceWheel from '../../components/wheel/InsuranceWheel.tsx'
import WheelLegend from '../../components/wheel/WheelLegend.tsx'
import UniverseCard from '../../components/diagnostic/UniverseCard.tsx'
import ActionList from '../../components/diagnostic/ActionList.tsx'
import PdfDownloadButton from '../../components/pdf/PdfDownloadButton.tsx'
import Button from '../../components/ui/Button.tsx'
import Card from '../../components/ui/Card.tsx'
import type { DiagnosticResult, UniverseScore, RecommendedAction, Universe } from '../../shared/scoring/types.ts'
import { getNeedLevel } from '../../shared/scoring/thresholds.ts'

export default function ResultsPage() {
  const { diagnosticId } = useParams<{ diagnosticId: string }>()
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(true)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!diagnosticId) return

      const { data: diag } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('id', diagnosticId)
        .single()

      const { data: actionsData } = await supabase
        .from('actions')
        .select('*')
        .eq('diagnostic_id', diagnosticId)
        .order('priority', { ascending: false })

      if (diag) {
        const scores = diag.scores as Record<Universe, UniverseScore>
        // Restore needLevel from needScore
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
  }, [diagnosticId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!diagnostic) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Diagnostic introuvable.</p>
        <Link to="/dashboard"><Button variant="outline">Retour</Button></Link>
      </div>
    )
  }

  const globalColor = diagnostic.globalScore <= 25 ? 'text-green-600' :
                       diagnostic.globalScore <= 50 ? 'text-orange-500' : 'text-red-500'

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Votre diagnostic</h1>
          <p className="text-gray-500 mt-1">Résultat de votre analyse des besoins en assurance.</p>
        </div>
        <div className="flex gap-3">
          <PdfDownloadButton diagnostic={diagnostic} type="client" wheelRef={wheelRef} />
          <Link to="/dashboard">
            <Button variant="outline">Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="text-center">
            <div className="mb-4">
              <span className={`text-4xl font-bold ${globalColor}`}>{diagnostic.globalScore}</span>
              <span className="text-gray-400 text-lg">/100</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {diagnostic.globalScore <= 25 ? 'Votre couverture est globalement adaptée.' :
               diagnostic.globalScore <= 50 ? 'Quelques points d\'attention ont été identifiés.' :
               'Des lacunes significatives ont été identifiées dans votre couverture.'}
            </p>
            <div ref={wheelRef}>
              <InsuranceWheel diagnostic={diagnostic} size={280} />
            </div>
            <WheelLegend diagnostic={diagnostic} />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Détail par univers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(diagnostic.universeScores).map(([key, score]) => (
                <UniverseCard key={key} universe={key} score={score} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions recommandées</h2>
            <ActionList actions={diagnostic.actions} />
          </div>
        </div>
      </div>
    </div>
  )
}
