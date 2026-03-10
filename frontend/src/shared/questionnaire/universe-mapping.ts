import type { Universe } from '../scoring/types.ts'
import { QUESTIONS, isQuestionVisible, type Question } from './schema.ts'

// Profil questions (asked first, feed all universes)
export const PROFIL_QUESTION_IDS = [
  'ageRange', 'familyStatus', 'childrenCount', 'professionalStatus',
  'incomeSource', 'lifeEvent', 'incomeRange'
]

// Universe-specific question IDs
export const UNIVERSE_QUESTION_IDS: Record<Universe, string[]> = {
  auto: ['vehicleCount', 'vehicleType', 'vehicleAge', 'vehicleUsage', 'autoCoverage'],
  habitation: ['isOwner', 'hasMortgage', 'hasOtherProperties', 'habitationCoverage'],
  prevoyance: ['prevoyanceCoverage'],
  objets_valeur: ['hasValuables', 'valuablesAmount', 'valuablesStorage', 'valuablesCoverage'],
}

export function getProfilQuestions(): Question[] {
  return PROFIL_QUESTION_IDS.map(id => QUESTIONS.find(q => q.id === id)!).filter(Boolean)
}

export function getUniverseQuestions(universe: Universe): Question[] {
  return UNIVERSE_QUESTION_IDS[universe].map(id => QUESTIONS.find(q => q.id === id)!).filter(Boolean)
}

export function getVisibleUniverseQuestions(universe: Universe, answers: Record<string, unknown>): Question[] {
  return getUniverseQuestions(universe).filter(q => isQuestionVisible(q, answers))
}

export function isProfilComplete(answers: Record<string, unknown>): boolean {
  const profilQuestions = getProfilQuestions()
  return profilQuestions
    .filter(q => isQuestionVisible(q, answers))
    .filter(q => q.required)
    .every(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '')
}

export function isUniverseComplete(universe: Universe, answers: Record<string, unknown>): boolean {
  const questions = getVisibleUniverseQuestions(universe, answers)
  return questions
    .filter(q => q.required)
    .every(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '')
}

export function getUniverseProgress(universe: Universe, answers: Record<string, unknown>): { answered: number; total: number } {
  const questions = getVisibleUniverseQuestions(universe, answers)
  const required = questions.filter(q => q.required)
  const answered = required.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length
  return { answered, total: required.length }
}

export const ALL_UNIVERSES: Universe[] = ['auto', 'habitation', 'prevoyance', 'objets_valeur']
