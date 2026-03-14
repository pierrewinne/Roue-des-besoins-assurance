import type { Quadrant } from '../scoring/types.ts'
import { QUESTIONS, isQuestionVisible, type Question, type QuestionnaireAnswers } from './schema.ts'

// O(1) question lookup by ID
const QUESTION_BY_ID = new Map(QUESTIONS.map(q => [q.id, q]))

// Profil express question IDs (asked first, feed all quadrants)
export const PROFIL_QUESTION_IDS = [
  'residence_status', 'age_range', 'family_status', 'children_count',
  'professional_status', 'income_contributors', 'life_event', 'income_range',
]

// Quadrant-specific question IDs
export const QUADRANT_QUESTION_IDS: Record<Quadrant, string[]> = {
  biens: [
    'housing_status', 'housing_type', 'home_specifics', 'home_contents_value',
    'valuable_possessions', 'valuable_total_estimate', 'security_measures',
    'vehicle_count', 'vehicle_details', 'vehicle_usage',
    'vehicle_coverage_existing', 'vehicle_options_interest',
    'home_coverage_existing',
  ],
  personnes: [
    'travel_frequency', 'travel_destinations', 'travel_budget', 'travel_coverage_existing',
    'sports_activities', 'accident_coverage_existing',
    'financial_dependents', 'work_incapacity_concern',
  ],
  projets: [],
  futur: [
    'income_range', 'financial_dependents', 'work_incapacity_concern',
    'savings_protection', 'other_properties', 'esg_interest',
  ],
}

export const ALL_QUADRANTS: Quadrant[] = ['biens', 'personnes', 'projets', 'futur']

// Quadrants that must be completed before others can be started (present before future)
export const QUADRANT_PREREQUISITES: Partial<Record<Quadrant, Quadrant[]>> = {
  projets: ['biens', 'personnes'],
  futur: ['biens', 'personnes'],
}

export function arePrerequisitesMet(quadrant: Quadrant, completedUniverses: Record<string, boolean>): boolean {
  const prereqs = QUADRANT_PREREQUISITES[quadrant]
  return !prereqs || prereqs.every(q => completedUniverses[q])
}

function isAnswered(val: unknown): boolean {
  if (val === undefined || val === null || val === '') return false
  if (Array.isArray(val) && val.length === 0) return false
  return true
}

export function getProfilQuestions(): Question[] {
  return PROFIL_QUESTION_IDS
    .map(id => QUESTION_BY_ID.get(id)!)
    .filter(Boolean)
}

export function getQuadrantQuestions(quadrant: Quadrant): Question[] {
  return QUADRANT_QUESTION_IDS[quadrant]
    .map(id => QUESTION_BY_ID.get(id)!)
    .filter(Boolean)
}

export function getVisibleQuadrantQuestions(quadrant: Quadrant, answers: QuestionnaireAnswers): Question[] {
  return getQuadrantQuestions(quadrant).filter(q => isQuestionVisible(q, answers))
}

export function isProfilComplete(answers: QuestionnaireAnswers): boolean {
  return getProfilQuestions()
    .filter(q => isQuestionVisible(q, answers))
    .filter(q => q.required)
    .every(q => isAnswered(answers[q.id]))
}

export function isQuadrantComplete(quadrant: Quadrant, answers: QuestionnaireAnswers): boolean {
  return getVisibleQuadrantQuestions(quadrant, answers)
    .filter(q => q.required)
    .every(q => isAnswered(answers[q.id]))
}

export function getQuadrantProgress(quadrant: Quadrant, answers: QuestionnaireAnswers): { answered: number; total: number } {
  const questions = getVisibleQuadrantQuestions(quadrant, answers)
  const required = questions.filter(q => q.required)
  const answered = required.filter(q => isAnswered(answers[q.id])).length
  return { answered, total: required.length }
}
