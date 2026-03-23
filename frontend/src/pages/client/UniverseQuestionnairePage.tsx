import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { fetchActiveQuestionnaire, saveAnswers as apiSaveAnswers, markQuadrantCompleted } from '../../lib/api/questionnaire.ts'
import QuestionField from '../../components/questionnaire/QuestionField.tsx'
import Button from '../../components/ui/Button.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import NeedsWheel from '../../components/landing/NeedsWheel.tsx'
import type { QuadrantState } from '../../components/landing/NeedsWheel.tsx'
import { QUADRANT_ORDER, QUADRANT_WHEEL_LABELS } from '../../lib/constants.ts'
import Card from '../../components/ui/Card.tsx'
import { getVisibleQuadrantQuestions, isQuadrantComplete, getQuadrantProgress, ALL_QUADRANTS } from '../../shared/questionnaire/quadrant-mapping.ts'
import { computeQuadrantScore } from '../../shared/scoring/engine.ts'
import type { Quadrant } from '../../shared/scoring/types.ts'
import type { QuestionnaireAnswers, AnswerValue } from '../../shared/questionnaire/schema.ts'

function isValidQuadrant(s: string | undefined): s is Quadrant {
  return s !== undefined && ALL_QUADRANTS.includes(s as Quadrant)
}

function isAnsweredValue(val: AnswerValue | undefined): boolean {
  if (val === undefined || val === null || val === '') return false
  if (Array.isArray(val) && val.length === 0) return false
  return true
}

export default function UniverseQuestionnairePage() {
  const { universe: universeParam } = useParams<{ universe: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})
  const responseIdRef = useRef<string | null>(null)
  const [completedUniverses, setCompletedUniverses] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const validUniverse = isValidQuadrant(universeParam)
  const universe: Quadrant = validUniverse ? universeParam : 'biens'

  // Cleanup timeout on unmount
  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }, [])

  // Load existing questionnaire
  useEffect(() => {
    if (!validUniverse) return
    async function load() {
      if (!user) return
      const q = await fetchActiveQuestionnaire(user.id)
      if (q) {
        setAnswers(q.responses)
        responseIdRef.current = q.id
        setCompletedUniverses(q.completed_universes)
        if (!q.profil_completed) {
          navigate('/questionnaire/profil', { replace: true })
          return
        }
      } else {
        navigate('/questionnaire/profil', { replace: true })
      }
    }
    load()
  }, [user, navigate, validUniverse])

  // Auto-save with visible error feedback (P2-02)
  const saveAnswers = useCallback(async (newAnswers: QuestionnaireAnswers) => {
    if (!user || !validUniverse) return
    const rid = responseIdRef.current
    if (!rid) return
    const { error } = await apiSaveAnswers(rid, user.id, newAnswers)
    if (error) {
      setSaveError('La sauvegarde automatique a échoué. Vos réponses seront sauvegardées au prochain changement.')
    } else {
      setSaveError(null)
    }
  }, [user, validUniverse])

  // Flush pending save on tab close / hide (P2-07)
  // visibilitychange is more reliable than beforeunload for async saves
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden' && saveTimeout.current) {
        clearTimeout(saveTimeout.current)
        saveTimeout.current = undefined
        saveAnswers(answersRef.current)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [saveAnswers])

  function handleAnswer(questionId: string, value: AnswerValue | undefined) {
    const newAnswers: QuestionnaireAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveAnswers(newAnswers), 1500)
  }

  async function flushAndNavigate(path: string) {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
      saveTimeout.current = undefined
    }
    await saveAnswers(answers)
    navigate(path)
  }

  async function handleCompleteUniverse() {
    if (!user || !responseIdRef.current) return
    setSaving(true)
    setSaveError(null)

    const newCompleted = { ...completedUniverses, [universe]: true }
    const { error } = await markQuadrantCompleted(responseIdRef.current, user.id, answers, newCompleted)

    if (error) {
      setSaveError('Impossible de valider ce domaine. Veuillez réessayer.')
      setSaving(false)
      return
    }

    setCompletedUniverses(newCompleted)
    setSaving(false)
    navigate('/dashboard')
  }

  // Conditional render AFTER all hooks (ANO-03)
  if (!validUniverse) {
    return <Navigate to="/dashboard" replace />
  }

  // Cross-quadrant questions already answered (e.g. personnes → futur) are skipped
  const visibleQuestions = getVisibleQuadrantQuestions(universe, answers)
    .filter(q => q.quadrant === universe || q.quadrant === 'profil_express' || !isAnsweredValue(answers[q.id]))
  const labels = QUADRANT_WHEEL_LABELS[universe]
  const isValid = isQuadrantComplete(universe, answers)
  const questionProgress = getQuadrantProgress(universe, answers)
  const progressPct = questionProgress.total > 0 ? (questionProgress.answered / questionProgress.total) * 100 : 0

  // Build wheel states for sidebar (memoized to avoid recomputing scores on every render)
  const { segmentStates, completedCount } = useMemo(() => {
    const states: QuadrantState[] = new Array(4)
    let count = 0
    for (const u of ALL_QUADRANTS) {
      const qi = QUADRANT_ORDER.indexOf(u)
      if (completedUniverses[u]) {
        const score = computeQuadrantScore(u, answers)
        states[qi] = { status: 'completed', score: score.needScore, needLevel: score.needLevel }
        count++
      } else if (u === universe) {
        const prog = getQuadrantProgress(u, answers)
        states[qi] = { status: 'in_progress', progress: prog.total > 0 ? prog.answered / prog.total : 0 }
      } else {
        states[qi] = { status: 'available' }
      }
    }
    return { segmentStates: states, completedCount: count }
  }, [completedUniverses, answers, universe])

  return (
    <div>
      <PageHeader
        title={`${labels.lines[0]} ${labels.lines[1]}`}
        subtitle="Répondez aux questions pour analyser ce domaine."
        backLink={{ to: '/dashboard', label: 'Retour à la roue' }}
      />

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-card p-8">
            {/* Progress bar (QW-07) */}
            <div className="mb-6 pb-6 border-b border-grey-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-grey-400">{questionProgress.answered}/{questionProgress.total} questions</span>
                <span className="text-xs font-bold text-primary-700">{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 bg-grey-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-700 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <div className="space-y-7">
              {visibleQuestions.map(q => (
                <QuestionField
                  key={q.id}
                  question={q}
                  value={answers[q.id]}
                  onChange={(val) => handleAnswer(q.id, val)}
                />
              ))}

              {visibleQuestions.length === 0 && (
                <p className="text-sm text-grey-400 text-center py-8">
                  Ce domaine ne nécessite pas de questions supplémentaires selon votre profil.
                </p>
              )}
            </div>

            {saveError && (
              <div className="mt-6 p-4 bg-danger-light rounded-xl ring-1 ring-danger/10">
                <p className="text-sm text-danger">{saveError}</p>
              </div>
            )}

            <div className="flex justify-between mt-10 pt-6 border-t border-grey-100">
              <Button variant="outline" onClick={() => flushAndNavigate('/dashboard')}>
                Retour
              </Button>
              <Button onClick={handleCompleteUniverse} disabled={!isValid || saving} size="lg">
                {saving ? 'Enregistrement...' : 'Valider ce domaine'}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar wheel */}
        <div className="hidden lg:block">
          <Card>
            <h3 className="text-sm font-bold text-primary-700 mb-4">Ma progression</h3>
            <NeedsWheel
              segmentStates={segmentStates}
              completedCount={completedCount}
              variant="light"
              compact
              className="w-full max-w-[220px] mx-auto"
              onSegmentClick={(i) => {
                const u = QUADRANT_ORDER[i]
                if (u !== universe && !completedUniverses[u]) {
                  flushAndNavigate(`/questionnaire/${u}`)
                }
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
