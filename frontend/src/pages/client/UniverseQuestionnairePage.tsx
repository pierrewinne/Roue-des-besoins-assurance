import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import QuestionField from '../../components/questionnaire/QuestionField.tsx'
import Button from '../../components/ui/Button.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import DiagnosticWheel from '../../components/wheel/DiagnosticWheel.tsx'
import type { UniverseState } from '../../components/wheel/DiagnosticWheel.tsx'
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
  const [responseId, setResponseId] = useState<string | null>(null)
  const [completedUniverses, setCompletedUniverses] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }, [])

  // Validate universe param
  if (!isValidUniverse(universeParam)) {
    return <Navigate to="/dashboard" replace />
  }

  const universe: Universe = universeParam
  const visibleQuestions = getVisibleUniverseQuestions(universe, answers)
  const labels = UNIVERSE_WHEEL_LABELS[universe]

  // Load existing questionnaire
  useEffect(() => {
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
        setResponseId(data.id)
        setCompletedUniverses((data.completed_universes as Record<string, boolean>) || {})
        // If profil not done, redirect
        if (!data.profil_completed) {
          navigate('/questionnaire/profil', { replace: true })
          return
        }
      } else {
        // No questionnaire started
        navigate('/questionnaire/profil', { replace: true })
      }
    }
    load()
  }, [user, navigate])

  // Auto-save
  const saveAnswers = useCallback(async (newAnswers: Record<string, unknown>, rid: string | null) => {
    if (!user || !rid) return
    await supabase
      .from('questionnaire_responses')
      .update({ responses: newAnswers, updated_at: new Date().toISOString() })
      .eq('id', rid)
      .eq('profile_id', user.id)
  }, [user])

  function handleAnswer(questionId: string, value: unknown) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveAnswers(newAnswers, responseId), 1500)
  }

  async function handleCompleteUniverse() {
    if (!user || !responseId) return
    setSaving(true)

    const newCompleted = { ...completedUniverses, [universe]: true }
    await supabase
      .from('questionnaire_responses')
      .update({
        responses: answers,
        completed_universes: newCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', responseId)
      .eq('profile_id', user.id)

    setCompletedUniverses(newCompleted)
    setSaving(false)
    navigate('/dashboard')
  }

  const isValid = isUniverseComplete(universe, answers)

  // Build wheel states for sidebar
  const universeStates = {} as Record<Universe, UniverseState>
  let completedCount = 0
  for (const u of ALL_UNIVERSES) {
    if (completedUniverses[u]) {
      const score = computeUniverseScore(u, answers)
      universeStates[u] = { status: 'completed', score: score.needScore, needLevel: score.needLevel }
      completedCount++
    } else if (u === universe) {
      const progress = getUniverseProgress(u, answers)
      universeStates[u] = { status: 'in_progress', progress: progress.total > 0 ? progress.answered / progress.total : 0 }
    } else {
      universeStates[u] = { status: 'available' }
    }
  }

  return (
    <div>
      <PageHeader
        title={`${labels.lines[0]} ${labels.lines[1]}`}
        subtitle="Repondez aux questions pour analyser ce domaine."
        backLink={{ to: '/dashboard', label: 'Retour a la roue' }}
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
                  Ce domaine ne necessite pas de questions supplementaires selon votre profil.
                </p>
              )}
            </div>

            <div className="flex justify-between mt-10 pt-6 border-t border-grey-100">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
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
            <DiagnosticWheel
              universeStates={universeStates}
              completedCount={completedCount}
              activeUniverse={universe}
              variant="light"
              compact
              className="w-full max-w-[220px] mx-auto"
              onUniverseClick={(u) => {
                if (u !== universe && !completedUniverses[u]) {
                  navigate(`/questionnaire/${u}`)
                }
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
