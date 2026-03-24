import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { fetchDiagnosticHistory, computeAndSaveDiagnostic } from '../../lib/api/diagnostics.ts'
import { exportMyData, deleteMyData } from '../../lib/api/gdpr.ts'
import Button from '../../components/ui/Button.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import Icon from '../../components/ui/Icon.tsx'
import NeedsWheel from '../../components/landing/NeedsWheel.tsx'
import Spinner from '../../components/ui/Spinner.tsx'
import GdprSection from '../../components/client/GdprSection.tsx'
import DiagnosticHistory from '../../components/client/DiagnosticHistory.tsx'
import ProfilCTA from '../../components/client/ProfilCTA.tsx'
import { useDiagnosticProgress } from '../../hooks/useDiagnosticProgress.ts'
import { QUADRANT_ORDER, QUADRANT_WHEEL_LABELS, QUADRANT_WHEEL_COLORS, QUADRANT_ICONS, NEED_BADGE_LABELS } from '../../lib/constants.ts'
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
  const [historyError, setHistoryError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPast() {
      if (!user) return
      const { data, error } = await fetchDiagnosticHistory(user.id)
      if (error) { setHistoryError('Impossible de charger l\'historique des diagnostics.'); return }
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
    if (progress.quadrantStates[quadrant].status !== 'available') return
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
      const { data: diagId, error } = await computeAndSaveDiagnostic(progress.responseId)

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
    const { data, error } = await exportMyData()
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
    const { error } = await deleteMyData()
    if (error) {
      setRgpdError('Impossible de supprimer votre compte. Veuillez réessayer.')
      setIsDeleting(false)
      return
    }
    try { await signOut() } catch { /* account already deleted */ }
    navigate('/login', { replace: true })
  }

  if (progress.loading) return <Spinner />

  if (progress.error) {
    return (
      <div>
        <PageHeader title="Mon espace" />
        <div className="p-4 bg-danger-light rounded-xl ring-1 ring-danger/10">
          <p className="text-sm text-danger">{progress.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Bonjour${profile?.first_name ? `, ${profile.first_name}` : ''} !`}
        subtitle="Explorez vos besoins en assurance."
      />

      {/* Wheel + right panel (profil CTA or universe cards) */}
      <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-center mb-8">
        <div className="flex justify-center">
          <NeedsWheel
            className="w-full max-w-[380px]"
            segmentStates={progress.segmentStates}
            completedCount={progress.completedCount}
            globalScore={progress.globalScore}
            globalNeedLevel={progress.globalNeedLevel}
            onSegmentClick={handleSegmentClick}
            variant="light"
          />
        </div>

        {/* Right column */}
        <div>
          {!progress.profilCompleted ? (
            <ProfilCTA onNavigate={() => navigate('/questionnaire/profil')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {ALL_QUADRANTS.map((u, idx) => {
                const state = progress.quadrantStates[u]
                const labels = QUADRANT_WHEEL_LABELS[u]
                const colors = QUADRANT_WHEEL_COLORS[u]
                const icon = QUADRANT_ICONS[u]
                const isCompleted = state.status === 'completed'
                const isLocked = state.status === 'locked'
                const hasQuestions = QUADRANT_QUESTION_IDS[u].length > 0
                const isDisabled = isCompleted || !hasQuestions || isLocked

                return (
                  <button
                    key={u}
                    onClick={() => handleQuadrantClick(u)}
                    disabled={isDisabled}
                    style={{ animation: `bal-fade-in 500ms cubic-bezier(0.25,0.8,0.5,1) both`, animationDelay: `${idx * 80}ms` }}
                    className={`p-4 rounded-xl text-left transition-all duration-300 ${
                      !hasQuestions || isLocked
                        ? 'bg-grey-50 shadow-card cursor-default opacity-60'
                        : isCompleted
                          ? 'bg-white shadow-card cursor-default'
                          : 'bg-white shadow-card hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isCompleted && state.needLevel ? `${getNeedColor(state.needLevel)}15` : `${colors.base}10` }}
                      >
                        <Icon name={icon} size={20} className={isCompleted || !hasQuestions || isLocked ? 'text-grey-400' : ''} style={!isCompleted && hasQuestions && !isLocked ? { color: colors.base } : undefined} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-bold ${hasQuestions && !isLocked ? 'text-primary-700' : 'text-grey-300'}`}>
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
                          {isLocked && hasQuestions && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-grey-100 text-grey-300">
                              Verrouillé
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-grey-300 mt-0.5">
                          {!hasQuestions ? 'Bientôt disponible' : isLocked ? 'Complétez d\'abord Biens et Personnes' : isCompleted ? `Score : ${state.score}/100` : `${labels.subtitle} — Cliquez pour commencer`}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}

              {/* Finish diagnostic CTA */}
              {progress.allCompleted && (
                <div className="text-center mt-2">
                  {finishError && (
                    <div className="mb-3 p-3 bg-danger-light rounded-xl ring-1 ring-danger/10">
                      <p className="text-sm text-danger">{finishError}</p>
                    </div>
                  )}
                  <Button onClick={handleFinishDiagnostic} size="lg" className="w-full" disabled={isFinishing}>
                    {isFinishing ? 'Calcul en cours...' : 'Voir mon diagnostic complet'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Past diagnostics */}
      <DiagnosticHistory diagnostics={diagnostics} error={historyError} />

      {/* GDPR section */}
      <GdprSection
        rgpdError={rgpdError}
        showDeleteConfirm={showDeleteConfirm}
        isDeleting={isDeleting}
        onExportData={handleExportData}
        onDeleteClick={() => setShowDeleteConfirm(true)}
        onDeleteConfirm={handleDeleteAccount}
        onDeleteCancel={() => setShowDeleteConfirm(false)}
      />
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
