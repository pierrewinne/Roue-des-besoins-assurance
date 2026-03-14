import { supabase } from '../supabase.ts'
import type { DiagnosticResult, QuadrantScore, Recommendation, Quadrant } from '../../shared/scoring/types.ts'
import type { QuestionnaireAnswers } from '../../shared/questionnaire/schema.ts'
import { getNeedLevel } from '../../shared/scoring/thresholds.ts'
import { computeDiagnostic } from '../../shared/scoring/engine.ts'

/** Recalculate a diagnostic from questionnaire answers (for stale DB scores) */
export function recalculateDiagnostic(
  diagMeta: { id: string; created_at: string; scoring_version?: string },
  answers: QuestionnaireAnswers,
): DiagnosticResult {
  const result = computeDiagnostic(answers)
  return {
    ...result,
    id: diagMeta.id,
    createdAt: diagMeta.created_at,
    scoringVersion: diagMeta.scoring_version ?? 'v1',
  }
}

/** Hydrate raw DB diagnostic + actions into a DiagnosticResult */
export function hydrateDiagnostic(
  diag: { id: string; scores: unknown; global_score: number; weightings: unknown; created_at: string; scoring_version?: string },
  actionsData: { id: string; type: string; universe: string | null; priority: number; title: string; description: string | null }[] = [],
): DiagnosticResult {
  const scores = diag.scores as Record<Quadrant, QuadrantScore>
  for (const key of Object.keys(scores) as Quadrant[]) {
    scores[key].needLevel = getNeedLevel(scores[key].needScore)
  }

  const recommendations: Recommendation[] = actionsData.map(a => ({
    id: a.id,
    product: (a.universe ?? 'drive') as Recommendation['product'],
    type: a.type as Recommendation['type'],
    priority: a.priority,
    title: a.title,
    message: a.description || '',
  }))

  return {
    id: diag.id,
    createdAt: diag.created_at,
    scoringVersion: diag.scoring_version ?? 'v1',
    quadrantScores: scores,
    globalScore: Number(diag.global_score),
    weightings: diag.weightings as Record<Quadrant, number>,
    productScores: [],
    recommendations,
  }
}

/** Fetch a diagnostic by ID for a specific profile */
export async function fetchDiagnosticById(diagnosticId: string, profileId: string) {
  return supabase
    .from('diagnostics')
    .select('id, questionnaire_id, profile_id, scores, global_score, weightings, scoring_version, created_at')
    .eq('id', diagnosticId)
    .eq('profile_id', profileId)
    .single()
}

/** Fetch the latest diagnostic for a profile */
export async function fetchLatestDiagnostic(profileId: string) {
  return supabase
    .from('diagnostics')
    .select('id, questionnaire_id, profile_id, scores, global_score, weightings, scoring_version, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
}

/** Fetch diagnostic history (list of past diagnostics) */
export async function fetchDiagnosticHistory(profileId: string, limit = 5) {
  return supabase
    .from('diagnostics')
    .select('id, global_score, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit)
}

/** Fetch actions for a diagnostic */
export async function fetchActions(diagnosticId: string, profileId: string) {
  return supabase
    .from('actions')
    .select('id, diagnostic_id, type, universe, priority, title, description, created_at')
    .eq('diagnostic_id', diagnosticId)
    .eq('profile_id', profileId)
    .order('priority', { ascending: false })
}

/** Load a diagnostic result — recalculates from answers if available, else hydrates from DB */
export async function loadDiagnosticResult(
  diag: { id: string; created_at: string; scoring_version?: string },
  answers: QuestionnaireAnswers | null,
  profileId: string,
): Promise<DiagnosticResult> {
  if (answers && Object.keys(answers).length > 0) {
    return recalculateDiagnostic(diag, answers)
  }
  const { data: actionsData } = await fetchActions(diag.id, profileId)
  return hydrateDiagnostic(diag as Parameters<typeof hydrateDiagnostic>[0], actionsData || [])
}

// DB constraint limits universe to drive/home/travel/bsafe — map futur products accordingly
const VALID_UNIVERSES = new Set(['drive', 'home', 'travel', 'bsafe'])

/** Compute diagnostic client-side and save to DB */
export async function computeAndSaveDiagnostic(questionnaireId: string, profileId: string, answers: QuestionnaireAnswers) {
  const result = computeDiagnostic(answers)

  // Insert diagnostic
  const { data: diag, error: diagError } = await supabase
    .from('diagnostics')
    .insert({
      questionnaire_id: questionnaireId,
      profile_id: profileId,
      scores: result.quadrantScores,
      global_score: result.globalScore,
      weightings: result.weightings,
      scoring_version: 'v1',
    })
    .select('id')
    .single()

  if (diagError || !diag) return { data: null, error: diagError }

  // Insert actions + mark questionnaire completed (independent writes, parallel)
  const writes: Promise<unknown>[] = [
    supabase
      .from('questionnaire_responses')
      .update({ completed: true })
      .eq('id', questionnaireId)
      .eq('profile_id', profileId),
  ]

  if (result.recommendations.length > 0) {
    const actions = result.recommendations.map(r => ({
      diagnostic_id: diag.id,
      profile_id: profileId,
      type: r.type,
      universe: VALID_UNIVERSES.has(r.product) ? r.product : null,
      priority: r.priority,
      title: r.title,
      description: r.message,
    }))
    writes.push(supabase.from('actions').insert(actions))
  }

  await Promise.all(writes)

  return { data: diag.id as string, error: null }
}

/** Log an audit event */
export async function logAuditEvent(action: string, resourceType: string, resourceId: string, details: Record<string, unknown> = {}) {
  return supabase.rpc('log_audit_event', {
    p_action: action,
    p_resource_type: resourceType,
    p_resource_id: resourceId,
    p_details: details,
  })
}
