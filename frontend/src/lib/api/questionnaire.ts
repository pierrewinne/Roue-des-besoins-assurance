import { supabase } from '../supabase.ts'
import type { QuestionnaireAnswers } from '../../shared/questionnaire/schema.ts'

export interface ActiveQuestionnaire {
  id: string
  responses: QuestionnaireAnswers
  profil_completed: boolean
  completed_universes: Record<string, boolean>
}

/** Fetch the latest incomplete questionnaire for a user */
export async function fetchActiveQuestionnaire(profileId: string): Promise<ActiveQuestionnaire | null> {
  const { data } = await supabase
    .from('questionnaire_responses')
    .select('id, responses, profil_completed, completed_universes')
    .eq('profile_id', profileId)
    .eq('completed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (!data) return null
  return {
    id: data.id,
    responses: (data.responses as QuestionnaireAnswers) || {},
    profil_completed: data.profil_completed ?? false,
    completed_universes: (data.completed_universes as Record<string, boolean>) || {},
  }
}

/** Fetch the latest completed questionnaire answers for a profile */
export async function fetchCompletedAnswers(profileId: string): Promise<QuestionnaireAnswers | null> {
  const { data } = await supabase
    .from('questionnaire_responses')
    .select('responses')
    .eq('profile_id', profileId)
    .eq('completed', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data ? (data.responses as QuestionnaireAnswers) : null
}

/** Save answers to an existing questionnaire */
export async function saveAnswers(id: string, profileId: string, answers: QuestionnaireAnswers) {
  return supabase
    .from('questionnaire_responses')
    .update({ responses: answers })
    .eq('id', id)
    .eq('profile_id', profileId)
}

/** Create a new questionnaire with initial answers */
export async function createQuestionnaire(profileId: string, answers: QuestionnaireAnswers, profilCompleted = false) {
  return supabase
    .from('questionnaire_responses')
    .insert({ profile_id: profileId, responses: answers, profil_completed: profilCompleted })
    .select('id')
    .single()
}

/** Mark profil section as completed */
export async function markProfilCompleted(id: string, profileId: string, answers: QuestionnaireAnswers) {
  return supabase
    .from('questionnaire_responses')
    .update({ responses: answers, profil_completed: true })
    .eq('id', id)
    .eq('profile_id', profileId)
}

/** Mark a quadrant as completed */
export async function markQuadrantCompleted(id: string, profileId: string, answers: QuestionnaireAnswers, completedUniverses: Record<string, boolean>) {
  return supabase
    .from('questionnaire_responses')
    .update({ responses: answers, completed_universes: completedUniverses })
    .eq('id', id)
    .eq('profile_id', profileId)
}
