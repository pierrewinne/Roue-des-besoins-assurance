import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext.tsx'
import { fetchActiveQuestionnaire } from '../lib/api/questionnaire.ts'
import { computeQuadrantScore, computeDiagnostic } from '../shared/scoring/engine.ts'
import { getNeedLevel } from '../shared/scoring/thresholds.ts'
import { ALL_QUADRANTS, QUADRANT_QUESTION_IDS, arePrerequisitesMet } from '../shared/questionnaire/quadrant-mapping.ts'
import type { QuestionnaireAnswers } from '../shared/questionnaire/schema.ts'
import type { Quadrant, NeedLevel } from '../shared/scoring/types.ts'
import type { QuadrantState } from '../components/landing/NeedsWheel.tsx'
import { QUADRANT_ORDER } from '../lib/constants.ts'

interface DiagnosticProgress {
  loading: boolean
  error: string | null
  responseId: string | null
  answers: QuestionnaireAnswers
  profilCompleted: boolean
  completedUniverses: Record<string, boolean>
  quadrantStates: Record<Quadrant, QuadrantState>
  segmentStates: QuadrantState[]
  completedCount: number
  allCompleted: boolean
  globalScore?: number
  globalNeedLevel?: NeedLevel
}

export function useDiagnosticProgress(): DiagnosticProgress {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})
  const [profilCompleted, setProfilCompleted] = useState(false)
  const [completedUniverses, setCompletedUniverses] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return }

      const q = await fetchActiveQuestionnaire(user.id)
      if (q === null) {
        // Could be "no active questionnaire" or a fetch error
        // fetchActiveQuestionnaire returns null in both cases — acceptable degradation
        setLoading(false)
        return
      }
      setResponseId(q.id)
      setAnswers(q.responses)
      setProfilCompleted(q.profil_completed)
      setCompletedUniverses(q.completed_universes)
      setLoading(false)
    }
    load().catch(() => {
      setError('Impossible de charger votre questionnaire.')
      setLoading(false)
    })
  }, [user])

  // Compute quadrant states (memoized to avoid recomputing scores on unrelated re-renders)
  const { quadrantStates, segmentStates, completedCount, allCompleted, globalScore, globalNeedLevel } = useMemo(() => {
    const states = {} as Record<Quadrant, QuadrantState>
    const segments: QuadrantState[] = new Array(4)
    let count = 0

    const activeQuadrants = ALL_QUADRANTS.filter(q => QUADRANT_QUESTION_IDS[q].length > 0)

    for (const q of ALL_QUADRANTS) {
      const hasQuestions = QUADRANT_QUESTION_IDS[q].length > 0
      let s: QuadrantState
      if (!hasQuestions) {
        // Quadrants without questions are locked (ANO-06)
        s = { status: 'locked' }
      } else if (completedUniverses[q]) {
        const score = computeQuadrantScore(q, answers)
        s = { status: 'completed', score: score.needScore, needLevel: score.needLevel }
        count++
      } else if (!profilCompleted || !arePrerequisitesMet(q, completedUniverses)) {
        s = { status: 'locked' }
      } else {
        s = { status: 'available' }
      }
      states[q] = s
      segments[QUADRANT_ORDER.indexOf(q)] = s
    }

    const all = count === activeQuadrants.length
    let gScore: number | undefined
    let gNeedLevel: NeedLevel | undefined

    if (all) {
      const diagnostic = computeDiagnostic(answers)
      gScore = diagnostic.globalScore
      gNeedLevel = getNeedLevel(diagnostic.globalScore)
    }

    return { quadrantStates: states, segmentStates: segments, completedCount: count, allCompleted: all, globalScore: gScore, globalNeedLevel: gNeedLevel }
  }, [answers, completedUniverses, profilCompleted])

  return {
    loading, error, responseId, answers, profilCompleted, completedUniverses,
    quadrantStates, segmentStates, completedCount, allCompleted, globalScore, globalNeedLevel,
  }
}
