import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import Button from '../../components/ui/Button.tsx'
import Card from '../../components/ui/Card.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import Icon from '../../components/ui/Icon.tsx'
import NeedsWheel from '../../components/landing/NeedsWheel.tsx'
import Spinner from '../../components/ui/Spinner.tsx'
import { useDiagnosticProgress } from '../../hooks/useDiagnosticProgress.ts'
import { QUADRANT_ORDER, getScoreColorClass, QUADRANT_WHEEL_LABELS, QUADRANT_WHEEL_COLORS, QUADRANT_ICONS, NEED_BADGE_LABELS } from '../../lib/constants.ts'
import { ALL_QUADRANTS, QUADRANT_QUESTION_IDS } from '../../shared/questionnaire/quadrant-mapping.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'
import type { Quadrant, NeedLevel } from '../../shared/scoring/types.ts'

interface PastDiagnostic {
  id: string
  global_score: number
  created_at: string
}

export default function ClientDashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const progress = useDiagnosticProgress()
  const [diagnostics, setDiagnostics] = useState<PastDiagnostic[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPast() {
      if (!user) return
      const { data } = await supabase
        .from('diagnostics')
        .select('id, global_score, created_at')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (data) setDiagnostics(data)
    }
    loadPast()
  }, [user])

  function handleQuadrantClick(quadrant: Quadrant) {
    if (QUADRANT_QUESTION_IDS[quadrant].length === 0) return
    if (!progress.profilCompleted) {
      navigate('/questionnaire/profil')
      return
    }
    if (progress.completedUniverses[quadrant]) {
      return
    }
    navigate(`/questionnaire/${quadrant}`)
  }

  function handleSegmentClick(index: number) {
    const quadrant = QUADRANT_ORDER[index]
    handleQuadrantClick(quadrant)
  }

  async function handleFinishDiagnostic() {
    if (!user || !progress.responseId) return
    setIsFinishing(true)
    setFinishError(null)

    try {
      // Server-side scoring (SEC-01): the DB computes scores, generates actions,
      // and marks the questionnaire as completed in a single transaction.
      const { data: diagId, error } = await supabase.rpc('compute_and_save_diagnostic', {
        p_questionnaire_id: progress.responseId,
      })

      if (error || !diagId) {
        throw new Error(error?.message || 'Échec de la création du diagnostic')
      }

      navigate(`/results/${diagId}`)
    } catch {
      setFinishError('Une erreur est survenue lors de la création de votre diagnostic. Veuillez réessayer.')
    } finally {
      setIsFinishing(false)
    }
  }

  const [rgpdError, setRgpdError] = useState<string | null>(null)

  async function handleExportData() {
    setRgpdError(null)
    // Audit log is now handled server-side in export_my_data() (SEC-12)
    const { data, error } = await supabase.rpc('export_my_data')
    if (error) {
      setRgpdError('Impossible d\'exporter vos données. Veuillez réessayer.')
      return
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mes-donnees-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)
    setRgpdError(null)
    const { error } = await supabase.rpc('delete_my_data')
    if (error) {
      setRgpdError('Impossible de supprimer votre compte. Veuillez réessayer.')
      setIsDeleting(false)
      return
    }
    try { await signOut() } catch { /* account already deleted */ }
    navigate('/login', { replace: true })
  }

  if (progress.loading) return <Spinner />

  return (
    <div>
      <PageHeader
        title={`Bonjour${profile?.first_name ? `, ${profile.first_name}` : ''} !`}
        subtitle="Explorez vos besoins en assurance."
      />

      {/* Wheel hero */}
      <div className="flex justify-center mb-8">
        <NeedsWheel
          className="w-full max-w-[480px]"
          segmentStates={progress.segmentStates}
          completedCount={progress.completedCount}
          globalScore={progress.globalScore}
          globalNeedLevel={progress.globalNeedLevel}
          onSegmentClick={handleSegmentClick}
          variant="light"
        />
      </div>

      {/* Profil CTA */}
      {!progress.profilCompleted && (
        <div className="max-w-md mx-auto mb-8">
          <Card className="text-center">
            <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 ring-1 ring-primary-700/10">
              <Icon name="badge-check" size={28} className="text-primary-700" />
            </div>
            <h2 className="text-lg font-bold text-primary-700 mb-2">Commencez par votre profil</h2>
            <p className="text-sm text-grey-400 mb-6 leading-relaxed max-w-xs mx-auto">
              Quelques questions rapides pour personnaliser votre diagnostic et débloquer la roue.
            </p>
            <Button onClick={() => navigate('/questionnaire/profil')} size="lg">
              Compléter mon profil
            </Button>
          </Card>
        </div>
      )}

      {/* Universe cards */}
      {progress.profilCompleted && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {ALL_QUADRANTS.map(u => {
              const state = progress.quadrantStates[u]
              const labels = QUADRANT_WHEEL_LABELS[u]
              const colors = QUADRANT_WHEEL_COLORS[u]
              const icon = QUADRANT_ICONS[u]
              const isCompleted = state.status === 'completed'
              const hasQuestions = QUADRANT_QUESTION_IDS[u].length > 0
              const isDisabled = isCompleted || !hasQuestions

              return (
                <button
                  key={u}
                  onClick={() => handleQuadrantClick(u)}
                  disabled={isDisabled}
                  className={`p-5 rounded-xl text-left transition-all duration-300 ring-1 ${
                    !hasQuestions
                      ? 'bg-grey-50 ring-grey-100 cursor-default opacity-60'
                      : isCompleted
                        ? 'bg-white ring-grey-100 cursor-default'
                        : 'bg-white ring-grey-100 hover:ring-primary-200 hover:shadow-card cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isCompleted && state.needLevel ? `${getNeedColor(state.needLevel)}15` : `${colors.base}10` }}
                    >
                      <Icon name={icon} size={22} className={isCompleted || !hasQuestions ? 'text-grey-400' : ''} style={!isCompleted && hasQuestions ? { color: colors.base } : undefined} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-bold ${hasQuestions ? 'text-primary-700' : 'text-grey-300'}`}>
                          {labels.lines[0]} {labels.lines[1]}
                        </h3>
                        {isCompleted && state.needLevel && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getBadgeClass(state.needLevel)}`}>
                            {NEED_BADGE_LABELS[state.needLevel]}
                          </span>
                        )}
                        {!hasQuestions && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-grey-100 text-grey-300">
                            Bientôt
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-grey-300 mt-0.5">
                        {!hasQuestions ? 'Ce domaine sera bientôt disponible' : isCompleted ? `Score : ${state.score}/100` : `${labels.subtitle} - Cliquez pour commencer`}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Finish diagnostic CTA */}
          {progress.allCompleted && (
            <div className="text-center mb-8">
              {finishError && (
                <div className="mb-4 p-4 bg-danger-light rounded-xl ring-1 ring-danger/10">
                  <p className="text-sm text-danger">{finishError}</p>
                </div>
              )}
              <Button onClick={handleFinishDiagnostic} size="lg" disabled={isFinishing}>
                {isFinishing ? 'Calcul en cours...' : 'Voir mon diagnostic complet'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Past diagnostics */}
      {diagnostics.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-primary-700 mb-5">Mes diagnostics précédents</h2>
          <div className="space-y-2">
            {diagnostics.map(d => (
              <Link
                key={d.id}
                to={`/results/${d.id}`}
                className="flex items-center justify-between p-3.5 rounded-lg border border-grey-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300 group"
              >
                <span className="text-sm text-grey-400 group-hover:text-primary-700 transition-colors">
                  {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${getScoreColorClass(d.global_score)}`}>
                    {d.global_score}/100
                  </span>
                  <Icon name="chevron-right" size={16} strokeWidth={2} className="text-grey-300 group-hover:text-primary-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* GDPR section */}
      <div className="mt-10 pt-6 border-t border-grey-100">
        {rgpdError && (
          <div className="mb-4 p-3 bg-danger-light text-danger text-sm rounded-lg ring-1 ring-danger/10">
            {rgpdError}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-grey-400">Vos données personnelles</h3>
            <p className="text-xs text-grey-300 mt-0.5">Export ou suppression de vos données (RGPD).</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportData}>
              Exporter mes données
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-danger border-danger/20 hover:bg-danger-light"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Supprimer mon compte
            </Button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-danger-light rounded-xl ring-1 ring-danger/10">
            <p className="text-sm text-danger font-bold mb-2">Cette action est irréversible</p>
            <p className="text-xs text-grey-400 mb-4">
              Toutes vos données seront définitivement supprimées : profil, questionnaires, diagnostics et actions recommandées.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-danger hover:bg-red-400" disabled={isDeleting} onClick={handleDeleteAccount}>
                {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function getBadgeClass(level: NeedLevel): string {
  switch (level) {
    case 'low': return 'bg-success-light text-success'
    case 'moderate': return 'bg-warning-light text-warning'
    case 'high':
    case 'critical': return 'bg-danger-light text-danger'
  }
}
