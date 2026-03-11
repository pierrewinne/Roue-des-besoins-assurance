import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import QuestionField from '../../components/questionnaire/QuestionField.tsx'
import Button from '../../components/ui/Button.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import NeedsWheel from '../../components/landing/NeedsWheel.tsx'
import type { QuadrantState } from '../../components/landing/NeedsWheel.tsx'
import { QUADRANT_TO_UNIVERSE, UNIVERSE_TO_QUADRANT } from '../../lib/constants.ts'
import Card from '../../components/ui/Card.tsx'
import { getVisibleUniverseQuestions, isUniverseComplete, getUniverseProgress, ALL_UNIVERSES } from '../../shared/questionnaire/universe-mapping.ts'
import { computeUniverseScore } from '../../shared/scoring/engine.ts'
import { UNIVERSE_WHEEL_LABELS } from '../../lib/constants.ts'
import type { Universe } from '../../shared/scoring/types.ts'

function isValidUniverse(s: string | undefined): s is Universe {
  return s !== undefined && ALL_UNIVERSES.includes(s as Universe)
}

export default function UniverseQuestionnairePage() {
  const { universe: universeParam } = useParams<{ universe: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const responseIdRef = useRef<string | null>(null)
  const [completedUniverses, setCompletedUniverses] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  const validUniverse = isValidUniverse(universeParam)
  const universe: Universe = validUniverse ? universeParam : 'auto'

  // Cleanup timeout on unmount
  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }, [])

  // Load existing questionnaire
  useEffect(() => {
    if (!validUniverse) return
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('questionnaire_responses')
        .select('id, responses, completed_universes, profil_completed')
        .eq('profile_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setAnswers((data.responses as Record<string, unknown>) || {})
        responseIdRef.current = data.id
        setCompletedUniverses((data.completed_universes as Record<string, boolean>) || {})
        if (!data.profil_completed) {
          navigate('/questionnaire/profil', { replace: true })
          return
        }
      } else {
        navigate('/questionnaire/profil', { replace: true })
      }
    }
    load()
  }, [user, navigate, validUniverse])

  // Auto-save with error handling (ANO-06)
  const saveAnswers = useCallback(async (newAnswers: Record<string, unknown>) => {
    if (!user || !validUniverse) return
    const rid = responseIdRef.current
    if (!rid) return
    const { error } = await supabase
      .from('questionnaire_responses')
      .update({ responses: newAnswers })
      .eq('id', rid)
      .eq('profile_id', user.id)
    if (error) console.error('Auto-save failed:', error)
  }, [user, validUniverse])

  function handleAnswer(questionId: string, value: unknown) {
    const newAnswers = { ...answers, [questionId]: value }
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

    const newCompleted = { ...completedUniverses, [universe]: true }
    const { error } = await supabase
      .from('questionnaire_responses')
      .update({
        responses: answers,
        completed_universes: newCompleted,
      })
      .eq('id', responseIdRef.current)
      .eq('profile_id', user.id)

    if (error) {
      console.error('Save failed:', error)
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

  const visibleQuestions = getVisibleUniverseQuestions(universe, answers)
  const labels = UNIVERSE_WHEEL_LABELS[universe]
  const isValid = isUniverseComplete(universe, answers)

  // Build wheel states for sidebar (memoized to avoid recomputing scores on every render)
  const { segmentStates, completedCount } = useMemo(() => {
    const states: QuadrantState[] = new Array(4)
    let count = 0
    for (const u of ALL_UNIVERSES) {
      const qi = UNIVERSE_TO_QUADRANT[u]
      if (completedUniverses[u]) {
        const score = computeUniverseScore(u, answers)
        states[qi] = { status: 'completed', score: score.needScore, needLevel: score.needLevel }
        count++
      } else if (u === universe) {
        const prog = getUniverseProgress(u, answers)
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
                const u = QUADRANT_TO_UNIVERSE[i]
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
