import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { fetchDiagnosticHistory, computeDiagnosticRPC } from '../../lib/api/diagnostics.ts'
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

  useEffect(() => {
    async function loadPast() {
      if (!user) return
      const { data } = await fetchDiagnosticHistory(user.id)
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
      const { data: diagId, error } = await computeDiagnosticRPC(progress.responseId)

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
        <ProfilCTA onNavigate={() => navigate('/questionnaire/profil')} />
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
      <DiagnosticHistory diagnostics={diagnostics} />

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
