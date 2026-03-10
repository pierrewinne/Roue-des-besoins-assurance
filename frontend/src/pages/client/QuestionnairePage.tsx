import { useEffect, useReducer, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import QuestionnaireShell from '../../components/questionnaire/QuestionnaireShell.tsx'
import InsuranceWheel from '../../components/wheel/InsuranceWheel.tsx'
import WheelLegend from '../../components/wheel/WheelLegend.tsx'
import Card from '../../components/ui/Card.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import EmptyState from '../../components/ui/EmptyState.tsx'
import { computeDiagnostic } from '../../shared/scoring/engine.ts'

type State = {
  answers: Record<string, unknown>
  responseId: string | null
  saving: boolean
}

type Action =
  | { type: 'SET_ANSWER'; questionId: string; value: unknown }
  | { type: 'LOAD'; answers: Record<string, unknown>; responseId: string }
  | { type: 'SET_RESPONSE_ID'; id: string }
  | { type: 'SET_SAVING'; saving: boolean }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, [action.questionId]: action.value } }
    case 'LOAD':
      return { ...state, answers: action.answers, responseId: action.responseId }
    case 'SET_RESPONSE_ID':
      return { ...state, responseId: action.id }
    case 'SET_SAVING':
      return { ...state, saving: action.saving }
    default:
      return state
  }
}

export default function QuestionnairePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(reducer, { answers: {}, responseId: null, saving: false })
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Load existing incomplete questionnaire
  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('questionnaire_responses')
        .select('id, responses')
        .eq('profile_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        dispatch({ type: 'LOAD', answers: data.responses as Record<string, unknown>, responseId: data.id })
      }
    }
    load()
  }, [user])

  // Auto-save debounced
  const saveAnswers = useCallback(async (answers: Record<string, unknown>, responseId: string | null) => {
    if (!user) return

    if (responseId) {
      await supabase
        .from('questionnaire_responses')
        .update({ responses: answers, updated_at: new Date().toISOString() })
        .eq('id', responseId)
    } else {
      const { data } = await supabase
        .from('questionnaire_responses')
        .insert({ profile_id: user.id, responses: answers })
        .select('id')
        .single()
      if (data) dispatch({ type: 'SET_RESPONSE_ID', id: data.id })
    }
  }, [user])

  function handleAnswer(questionId: string, value: unknown) {
    dispatch({ type: 'SET_ANSWER', questionId, value })

    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      const newAnswers = { ...state.answers, [questionId]: value }
      saveAnswers(newAnswers, state.responseId)
    }, 1500)
  }

  async function handleComplete() {
    if (!user) return
    dispatch({ type: 'SET_SAVING', saving: true })

    // Save final answers
    let responseId = state.responseId
    if (responseId) {
      await supabase
        .from('questionnaire_responses')
        .update({ responses: state.answers, completed: true })
        .eq('id', responseId)
    } else {
      const { data } = await supabase
        .from('questionnaire_responses')
        .insert({ profile_id: user.id, responses: state.answers, completed: true })
        .select('id')
        .single()
      responseId = data?.id ?? null
    }

    if (!responseId) return

    // Compute and save diagnostic
    const diagnostic = computeDiagnostic(state.answers)
    const { data: diagData } = await supabase
      .from('diagnostics')
      .insert({
        questionnaire_id: responseId,
        profile_id: user.id,
        scores: diagnostic.universeScores,
        global_score: diagnostic.globalScore,
        weightings: diagnostic.weightings,
      })
      .select('id')
      .single()

    if (diagData) {
      // Save actions
      const actionsToInsert = diagnostic.actions.map(a => ({
        diagnostic_id: diagData.id,
        profile_id: user.id,
        type: a.type,
        universe: a.universe,
        priority: a.priority,
        title: a.title,
        description: a.description,
      }))
      if (actionsToInsert.length > 0) {
        await supabase.from('actions').insert(actionsToInsert)
      }

      navigate(`/results/${diagData.id}`)
    }
  }

  // Real-time preview
  const hasEnoughData = Object.keys(state.answers).length >= 3
  const previewDiagnostic = hasEnoughData ? computeDiagnostic(state.answers) : null

  return (
    <div>
      <PageHeader
        title="Mon diagnostic assurance"
        subtitle="Répondez aux questions pour découvrir vos besoins."
      />

      <QuestionnaireShell
        answers={state.answers}
        onAnswer={handleAnswer}
        onComplete={handleComplete}
        sideContent={
          previewDiagnostic ? (
            <Card>
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Aperçu en temps réel</h3>
              <InsuranceWheel diagnostic={previewDiagnostic} size={220} showLabels={false} />
              <WheelLegend diagnostic={previewDiagnostic} />
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon="chart-pie"
                description="L'aperçu de votre roue des besoins apparaîtra ici au fur et à mesure de vos réponses."
              />
            </Card>
          )
        }
      />
    </div>
  )
}
