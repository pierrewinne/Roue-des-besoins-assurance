import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext.tsx'
import { supabase } from '../lib/supabase.ts'
import { computeUniverseScore, computeDiagnostic } from '../shared/scoring/engine.ts'
import { getNeedLevel } from '../shared/scoring/thresholds.ts'
import { ALL_UNIVERSES } from '../shared/questionnaire/universe-mapping.ts'
import type { Universe, NeedLevel } from '../shared/scoring/types.ts'
import type { QuadrantState } from '../components/landing/NeedsWheel.tsx'
import { UNIVERSE_TO_QUADRANT } from '../lib/constants.ts'

interface DiagnosticProgress {
  loading: boolean
  responseId: string | null
  answers: Record<string, unknown>
  profilCompleted: boolean
  completedUniverses: Record<string, boolean>
  universeStates: Record<Universe, QuadrantState>
  segmentStates: QuadrantState[]
  completedCount: number
  allCompleted: boolean
  globalScore?: number
  globalNeedLevel?: NeedLevel
}

export function useDiagnosticProgress(): DiagnosticProgress {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [profilCompleted, setProfilCompleted] = useState(false)
  const [completedUniverses, setCompletedUniverses] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('questionnaire_responses')
        .select('id, responses, profil_completed, completed_universes')
        .eq('profile_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setResponseId(data.id)
        setAnswers((data.responses as Record<string, unknown>) || {})
        setProfilCompleted(data.profil_completed ?? false)
        setCompletedUniverses((data.completed_universes as Record<string, boolean>) || {})
      }
      setLoading(false)
    }
    load()
  }, [user])

  // Compute universe states (memoized to avoid recomputing scores on unrelated re-renders)
  const { universeStates, segmentStates, completedCount, allCompleted, globalScore, globalNeedLevel } = useMemo(() => {
    const states = {} as Record<Universe, QuadrantState>
    const segments: QuadrantState[] = new Array(4)
    let count = 0

    for (const u of ALL_UNIVERSES) {
      let s: QuadrantState
      if (completedUniverses[u]) {
        const score = computeUniverseScore(u, answers)
        s = { status: 'completed', score: score.needScore, needLevel: score.needLevel }
        count++
      } else if (profilCompleted) {
        s = { status: 'available' }
      } else {
        s = { status: 'locked' }
      }
      states[u] = s
      segments[UNIVERSE_TO_QUADRANT[u]] = s
    }

    const all = count === 4
    let gScore: number | undefined
    let gNeedLevel: NeedLevel | undefined

    if (all) {
      const diagnostic = computeDiagnostic(answers)
      gScore = diagnostic.globalScore
      gNeedLevel = getNeedLevel(diagnostic.globalScore)
    }

    return { universeStates: states, segmentStates: segments, completedCount: count, allCompleted: all, globalScore: gScore, globalNeedLevel: gNeedLevel }
  }, [answers, completedUniverses, profilCompleted])

  return {
    loading, responseId, answers, profilCompleted, completedUniverses,
    universeStates, segmentStates, completedCount, allCompleted, globalScore, globalNeedLevel,
  }
}
