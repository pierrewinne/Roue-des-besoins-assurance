import type { Universe, UniverseScore, DiagnosticResult } from './types.ts'
import { computeNeedFromMatrix, getNeedLevel } from './thresholds.ts'
import { generateActions } from './rules.ts'

type Answers = Record<string, unknown>

function computeAutoScore(answers: Answers): UniverseScore {
  const vehicleCount = (answers.vehicleCount as number) || 0
  if (vehicleCount === 0) {
    return { universe: 'auto', exposure: 0, coverage: 0, needScore: 0, needLevel: 'low', active: false }
  }

  // Exposure
  let exposure = 1 // medium by default if has vehicle
  const vehicleAge = answers.vehicleAge as number | undefined
  if (vehicleAge !== undefined && vehicleAge < 3) exposure = 2 // high - recent vehicle
  const vehicleType = answers.vehicleType as string | undefined
  if (vehicleType === 'utility' || vehicleType === 'moto') exposure = 2
  const vehicleUsage = answers.vehicleUsage as string | undefined
  if (vehicleUsage === 'daily') exposure = Math.min(exposure + 0.5, 2) as 0 | 1 | 2

  // Coverage
  let coverage = 2 // none by default
  const autoCoverage = answers.autoCoverage as string | undefined
  if (autoCoverage === 'omnium') coverage = 0
  else if (autoCoverage === 'rc') coverage = 1

  const needScore = computeNeedFromMatrix(Math.round(exposure), Math.round(coverage))
  return { universe: 'auto', exposure: exposure / 2 * 100, coverage: (2 - coverage) / 2 * 100, needScore, needLevel: getNeedLevel(needScore), active: true }
}

function computeHabitationScore(answers: Answers): UniverseScore {
  // Exposure
  let exposure = 1 // medium
  const isOwner = answers.isOwner as boolean | undefined
  const hasMortgage = answers.hasMortgage as boolean | undefined
  if (isOwner && hasMortgage) exposure = 2 // high
  if (isOwner) exposure = Math.max(exposure, 1.5)
  const hasOtherProperties = answers.hasOtherProperties as boolean | undefined
  if (hasOtherProperties) exposure = 2
  const lifeEventHab = answers.lifeEvent as string | undefined
  if (lifeEventHab === 'property' || lifeEventHab === 'move') exposure = 2

  // Coverage
  let coverage = 2
  const habitationCoverage = answers.habitationCoverage as string | undefined
  if (habitationCoverage === 'complete') coverage = 0
  else if (habitationCoverage === 'standard') coverage = 0.5
  else if (habitationCoverage === 'basic') coverage = 1

  const needScore = computeNeedFromMatrix(Math.round(exposure), Math.round(coverage))
  return { universe: 'habitation', exposure: exposure / 2 * 100, coverage: (2 - coverage) / 2 * 100, needScore, needLevel: getNeedLevel(needScore), active: true }
}

function computePrevoyanceScore(answers: Answers): UniverseScore {
  // Exposure
  let exposure = 1
  const familyStatus = answers.familyStatus as string | undefined
  if (familyStatus === 'family') exposure = 2
  if (familyStatus === 'couple') exposure = 1.5
  const professionalStatus = answers.professionalStatus as string | undefined
  if (professionalStatus === 'independent') exposure = Math.min(exposure + 0.5, 2)
  const hasMortgage = answers.hasMortgage as boolean | undefined
  if (hasMortgage) exposure = Math.min(exposure + 0.5, 2)
  const ageRange = answers.ageRange as string | undefined
  if ((ageRange === '30-40' || ageRange === '40-50') && familyStatus === 'family') exposure = 2
  const lifeEvent = answers.lifeEvent as string | undefined
  if (lifeEvent === 'birth' || lifeEvent === 'marriage') exposure = Math.min(exposure + 0.5, 2)

  // Coverage
  let coverage = 2
  const prevoyanceCoverage = answers.prevoyanceCoverage as string | undefined
  if (prevoyanceCoverage === 'complete') coverage = 0
  else if (prevoyanceCoverage === 'standard') coverage = 0.5
  else if (prevoyanceCoverage === 'basic') coverage = 1

  const needScore = computeNeedFromMatrix(Math.round(exposure), Math.round(coverage))
  return { universe: 'prevoyance', exposure: exposure / 2 * 100, coverage: (2 - coverage) / 2 * 100, needScore, needLevel: getNeedLevel(needScore), active: true }
}

function computeObjetsValeurScore(answers: Answers): UniverseScore {
  const hasValuables = answers.hasValuables as boolean | undefined
  if (!hasValuables) {
    return { universe: 'objets_valeur', exposure: 0, coverage: 0, needScore: 0, needLevel: 'low', active: false }
  }

  // Exposure
  let exposure = 1
  const valuablesAmount = answers.valuablesAmount as string | undefined
  if (valuablesAmount === '50k+') exposure = 2
  else if (valuablesAmount === '10k-50k') exposure = 2
  else if (valuablesAmount === '5k-10k') exposure = 1
  const valuablesStorage = answers.valuablesStorage as string | undefined
  if (valuablesStorage === 'home_no_security') exposure = Math.min(exposure + 0.5, 2)

  // Coverage
  let coverage = 2
  const valuablesCoverage = answers.valuablesCoverage as string | undefined
  if (valuablesCoverage === 'complete') coverage = 0
  else if (valuablesCoverage === 'basic') coverage = 1

  const needScore = computeNeedFromMatrix(Math.round(exposure), Math.round(coverage))
  return { universe: 'objets_valeur', exposure: exposure / 2 * 100, coverage: (2 - coverage) / 2 * 100, needScore, needLevel: getNeedLevel(needScore), active: true }
}

function computeWeightings(answers: Answers, scores: Record<Universe, UniverseScore>): Record<Universe, number> {
  const weights: Record<Universe, number> = {
    auto: 25,
    habitation: 30,
    prevoyance: 35,
    objets_valeur: 10,
  }

  // Deactivate unused universes
  if (!scores.auto.active) weights.auto = 0
  if (!scores.objets_valeur.active) weights.objets_valeur = 0

  // Adjust for profile
  const isOwner = answers.isOwner as boolean | undefined
  const hasMortgage = answers.hasMortgage as boolean | undefined
  if (isOwner && hasMortgage) weights.habitation = 35

  const familyStatus = answers.familyStatus as string | undefined
  if (familyStatus === 'family') weights.prevoyance = 40

  // Normalize to 100
  const total = Object.values(weights).reduce((s, w) => s + w, 0)
  if (total > 0) {
    for (const key of Object.keys(weights) as Universe[]) {
      weights[key] = Math.round((weights[key] / total) * 100)
    }
  }

  return weights
}

export function computeUniverseScore(universe: Universe, answers: Answers): UniverseScore {
  switch (universe) {
    case 'auto': return computeAutoScore(answers)
    case 'habitation': return computeHabitationScore(answers)
    case 'prevoyance': return computePrevoyanceScore(answers)
    case 'objets_valeur': return computeObjetsValeurScore(answers)
  }
}

export function computeDiagnostic(answers: Answers): DiagnosticResult {
  const universeScores: Record<Universe, UniverseScore> = {
    auto: computeAutoScore(answers),
    habitation: computeHabitationScore(answers),
    prevoyance: computePrevoyanceScore(answers),
    objets_valeur: computeObjetsValeurScore(answers),
  }

  const weightings = computeWeightings(answers, universeScores)

  // Global score = weighted average of need scores
  let globalScore = 0
  for (const universe of Object.keys(universeScores) as Universe[]) {
    globalScore += universeScores[universe].needScore * (weightings[universe] / 100)
  }
  globalScore = Math.round(globalScore)

  const actions = generateActions(universeScores, answers)

  return { universeScores, globalScore, weightings, actions }
}
