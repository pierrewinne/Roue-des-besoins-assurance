import { supabase } from '../supabase.ts'
import type { DiagnosticResult, QuadrantScore, Recommendation, Quadrant } from '../../shared/scoring/types.ts'
import { getNeedLevel } from '../../shared/scoring/thresholds.ts'

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

/** Compute and save a diagnostic (server-side scoring) */
export async function computeDiagnosticRPC(questionnaireId: string) {
  return supabase.rpc('compute_and_save_diagnostic', { p_questionnaire_id: questionnaireId })
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
