import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import InsuranceWheel from '../../components/wheel/InsuranceWheel.tsx'
import WheelLegend from '../../components/wheel/WheelLegend.tsx'
import UniverseCard from '../../components/diagnostic/UniverseCard.tsx'
import ActionList from '../../components/diagnostic/ActionList.tsx'
import PdfDownloadButton from '../../components/pdf/PdfDownloadButton.tsx'
import Button from '../../components/ui/Button.tsx'
import Card from '../../components/ui/Card.tsx'
import ScoreGauge from '../../components/ui/ScoreGauge.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import Spinner from '../../components/ui/Spinner.tsx'
import EmptyState from '../../components/ui/EmptyState.tsx'
import { getScoreColorClass } from '../../lib/constants.ts'
import type { DiagnosticResult, QuadrantScore, Recommendation, Quadrant } from '../../shared/scoring/types.ts'
import { getNeedLevel } from '../../shared/scoring/thresholds.ts'

export default function ResultsPage() {
  const { diagnosticId } = useParams<{ diagnosticId: string }>()
  const { user } = useAuth()
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(true)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      if (!diagnosticId || !user) return

      // Only fetch diagnostic belonging to current user
      const { data: diag } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('id', diagnosticId)
        .eq('profile_id', user.id)
        .single()

      // Only fetch actions if diagnostic belongs to current user
      if (!diag) {
        setLoading(false)
        return
      }

      const { data: actionsData } = await supabase
        .from('actions')
        .select('*')
        .eq('diagnostic_id', diagnosticId)
        .eq('profile_id', user.id)
        .order('priority', { ascending: false })

      if (diag) {
        const scores = diag.scores as Record<Quadrant, QuadrantScore>
        // Restore needLevel from needScore
        for (const key of Object.keys(scores) as Quadrant[]) {
          scores[key].needLevel = getNeedLevel(scores[key].needScore)
        }

        const recommendations: Recommendation[] = (actionsData || []).map(a => ({
          id: a.id as string,
          product: (a.universe ?? 'drive') as Recommendation['product'],
          type: a.type as 'immediate' | 'deferred' | 'event' | 'optimization',
          priority: a.priority,
          title: a.title,
          message: a.description || '',
        }))

        setDiagnostic({
          quadrantScores: scores,
          globalScore: Number(diag.global_score),
          weightings: diag.weightings as Record<Quadrant, number>,
          productScores: [],
          recommendations,
        })
      }
      setLoading(false)
    }
    load()
  }, [diagnosticId, user])

  if (loading) {
    return <Spinner />
  }

  if (!diagnostic) {
    return (
      <EmptyState
        icon="exclamation-circle"
        description="Diagnostic introuvable."
        action={<Link to="/dashboard"><Button variant="outline">Retour</Button></Link>}
      />
    )
  }

  const scoreColor = getScoreColorClass(diagnostic.globalScore)

  const scoreLabel = diagnostic.globalScore <= 25 ? 'Votre protection est bien adaptée à votre situation' :
                     diagnostic.globalScore <= 50 ? 'Quelques points méritent votre attention' :
                     diagnostic.globalScore <= 75 ? 'Des lacunes significatives ont été identifiées' :
                     'Votre situation nécessite une action rapide'

  const scoreBg = diagnostic.globalScore <= 25 ? 'bg-success-light ring-success/10' :
                  diagnostic.globalScore <= 50 ? 'bg-warning-light ring-warning/10' :
                  'bg-danger-light ring-danger/10'

  return (
    <div>
      <PageHeader
        title="Votre diagnostic"
        subtitle="Résultat de votre analyse des besoins en assurance."
        actions={
          <div className="flex gap-3">
            <PdfDownloadButton diagnostic={diagnostic} type="client" wheelRef={wheelRef} />
            <Link to="/dashboard">
              <Button variant="outline">Retour</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center">
            <div className={`px-4 py-2.5 rounded-xl ring-1 mb-6 ${scoreBg}`}>
              <p className={`text-sm font-bold ${scoreColor}`}>{scoreLabel}</p>
            </div>
            <div className="mb-4">
              <ScoreGauge score={diagnostic.globalScore} size={160} />
            </div>
            <p className="text-xs text-grey-300 mb-6">Score de besoin : {diagnostic.globalScore}/100</p>
            <div ref={wheelRef}>
              <InsuranceWheel diagnostic={diagnostic} size={280} />
            </div>
            <WheelLegend diagnostic={diagnostic} />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-4">Détail par univers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(diagnostic.quadrantScores).map(([key, score]) => (
                <UniverseCard key={key} universe={key} score={score} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary-700 mb-4">Actions recommandées</h2>
            <ActionList actions={diagnostic.recommendations} />
          </section>
        </div>
      </div>

      {/* IDD Disclaimer (CRIT-3) */}
      <div className="mt-10 p-5 bg-grey-50 rounded-xl ring-1 ring-grey-100 text-xs text-grey-400 leading-relaxed">
        <p className="font-bold text-grey-500 mb-2">Information importante</p>
        <p>
          Ce diagnostic est un outil d'aide à la réflexion et ne constitue en aucun cas un conseil en assurance au sens de la Directive sur la Distribution d'Assurance (IDD — Directive (UE) 2016/97).
          Les résultats présentés sont basés uniquement sur les informations que vous avez fournies et ne remplacent pas l'analyse personnalisée d'un conseiller en assurance qualifié.
          Aucune garantie n'est apportée quant à l'exactitude ou l'exhaustivité de cette analyse.
          Veuillez consulter votre conseiller Baloise pour obtenir des recommandations adaptées à votre situation personnelle.
        </p>
      </div>
    </div>
  )
}
