import type { Quadrant, QuadrantScore, ProductScore, DiagnosticResult, OptionScore } from './types.ts'
import { computeNeedFromMatrix, getNeedLevel } from './thresholds.ts'
import { generateRecommendations } from './rules.ts'
import { asString, asNumber, asStringArray, countNonNone, includesAny, HIGH_RISK_SPORTS } from './answer-helpers.ts'

type Answers = Record<string, unknown>

// === Biens (DRIVE) — Exposure ===

function computeBiensExposure(a: Answers): number {
  let score = 0
  let weights = 0

  // Vehicle count (weight 20)
  const vehicleCount = asNumber(a.vehicle_count)
  if (vehicleCount === 0) return 0 // No vehicle = no DRIVE exposure
  const countScore = Math.min(vehicleCount * 40, 100)
  score += countScore * 0.20
  weights += 0.20

  // Vehicle type / value at risk (weight 30)
  const vehicleRisk: Record<string, number> = {
    car_new: 90, electric: 95, suv_crossover: 85,
    car_recent: 60, moto: 70, utility: 50,
    car_old: 25, scooter: 30,
  }
  score += (vehicleRisk[asString(a.vehicle_details)] ?? 50) * 0.30
  weights += 0.30

  // Vehicle usage intensity (weight 25)
  const usageRisk: Record<string, number> = {
    daily_commute: 70, professional: 90, mixed: 75, occasional: 30,
  }
  score += (usageRisk[asString(a.vehicle_usage)] ?? 50) * 0.25
  weights += 0.25

  // Unmet options needs (weight 15)
  const unmetNeeds = countNonNone(a.vehicle_options_interest)
  score += Math.min(unmetNeeds * 20, 100) * 0.15
  weights += 0.15

  // Life event: new vehicle (weight 10)
  if (asStringArray(a.life_event).includes('new_vehicle')) {
    score += 100 * 0.10
  }
  weights += 0.10

  return weights > 0 ? Math.round(score / weights) : 50
}

// === Biens (DRIVE) — Coverage ===

function computeBiensCoverage(a: Answers): number {
  if (asNumber(a.vehicle_count) === 0) return 100 // No vehicle = fully covered

  let score = 0
  let weights = 0

  // Vehicle insurance level (weight 60)
  const vehicleCovScore: Record<string, number> = {
    none: 0, unknown: 10, rc_only: 25, mini_omnium: 55, full_omnium: 90,
  }
  const cov = asString(a.vehicle_coverage_existing)
  score += (vehicleCovScore[cov] ?? 10) * 0.60
  weights += 0.60

  // Options coverage gap (weight 40)
  let optionsCov = 0
  if (cov === 'full_omnium') optionsCov = 70
  else if (cov === 'mini_omnium') optionsCov = 40
  else if (cov === 'rc_only') optionsCov = 15
  const unmetNeeds = countNonNone(a.vehicle_options_interest)
  optionsCov = Math.max(optionsCov - unmetNeeds * 12, 0)
  score += optionsCov * 0.40
  weights += 0.40

  return weights > 0 ? Math.round(score / weights) : 0
}

// === Personnes (B-SAFE) — Exposure ===

function computePersonnesExposure(a: Answers): number {
  let score = 0
  let weights = 0

  // Family vulnerability (weight 25)
  let familyScore = 20
  const familyStatus = asString(a.family_status)
  if (['couple_with_children', 'single_parent', 'recomposed'].includes(familyStatus)) {
    familyScore = 70
  }
  if (asString(a.income_contributors) === 'one' && familyScore >= 70) {
    familyScore = 100
  }
  score += familyScore * 0.25
  weights += 0.25

  // Financial dependents (weight 20)
  const dependentsRisk: Record<string, number> = {
    none: 10, partner: 40, children: 60, partner_children: 90, extended: 80,
  }
  score += (dependentsRisk[asString(a.financial_dependents)] ?? 30) * 0.20
  weights += 0.20

  // Work incapacity vulnerability (weight 15)
  const autonomyRisk: Record<string, number> = {
    less_1_month: 100, '1_3_months': 80, '3_6_months': 55,
    '6_12_months': 30, more_12_months: 10,
  }
  const wic = asString(a.work_incapacity_concern)
  score += (wic ? (autonomyRisk[wic] ?? 50) : 30) * 0.15
  weights += 0.15

  // Income level at risk (weight 10)
  const incomeRisk: Record<string, number> = {
    less_3k: 30, '3k_5k': 45, '5k_8k': 65,
    '8k_12k': 80, '12k_plus': 100, no_answer: 50,
  }
  score += (incomeRisk[asString(a.income_range)] ?? 50) * 0.10
  weights += 0.10

  // Sports risk (weight 15)
  const activities = asStringArray(a.sports_activities)
  let sportsScore = 0
  for (const act of activities) {
    if (HIGH_RISK_SPORTS.includes(act)) sportsScore += 25
    if (['running_cycling', 'team_sports'].includes(act)) sportsScore += 10
  }
  score += Math.min(sportsScore, 100) * 0.15
  weights += 0.15

  // Health concerns (weight 10)
  const healthCount = countNonNone(a.health_concerns)
  score += Math.min(healthCount * 30, 100) * 0.10
  weights += 0.10

  // Age factor (weight 5)
  const ageRisk: Record<string, number> = {
    '18_25': 30, '26_35': 50, '36_45': 90,
    '46_55': 100, '56_65': 70, '65_plus': 40,
  }
  score += (ageRisk[asString(a.age_range)] ?? 50) * 0.05
  weights += 0.05

  return weights > 0 ? Math.round(score / weights) : 50
}

// === Personnes (B-SAFE) — Coverage ===

function computePersonnesCoverage(a: Answers): number {
  let score = 0
  let weights = 0

  // Accident coverage (weight 35)
  const accidentCovScore: Record<string, number> = {
    none: 0, employer_only: 25, individual_basic: 55, individual_complete: 90,
  }
  score += (accidentCovScore[asString(a.accident_coverage_existing)] ?? 0) * 0.35
  weights += 0.35

  // RC Vie Privée (weight 20)
  const rcScore: Record<string, number> = { yes: 90, no: 0, unsure: 0 }
  score += (rcScore[asString(a.has_rc_vie_privee)] ?? 0) * 0.20
  weights += 0.20

  // Savings / financial protection (weight 30)
  const savingsItems = asStringArray(a.savings_protection)
  const hasSavings = !savingsItems.includes('none') && savingsItems.length > 0
  const savingsCov = hasSavings ? Math.min(savingsItems.length * 25, 100) : 0
  score += savingsCov * 0.30
  weights += 0.30

  // Income protection implicit (weight 15)
  let incomeCov = 10
  const proStatus = asString(a.professional_status)
  if (proStatus === 'civil_servant') incomeCov = 50
  else if (proStatus === 'employee') incomeCov = 30
  const accCov = asString(a.accident_coverage_existing)
  if (accCov === 'individual_complete') incomeCov += 30
  else if (accCov === 'individual_basic') incomeCov += 15
  score += Math.min(incomeCov, 100) * 0.15
  weights += 0.15

  return weights > 0 ? Math.round(score / weights) : 0
}

// === Projets & Futur — Inactive (empty quadrants) ===

function computeInactiveExposure(): number { return 0 }
function computeInactiveCoverage(): number { return 100 }

// === Quadrant score computation ===

function toMatrixLevel(score0to100: number): number {
  if (score0to100 <= 33) return 0
  if (score0to100 <= 66) return 1
  return 2
}

export function computeQuadrantScore(quadrant: Quadrant, answers: Answers): QuadrantScore {
  let exposure: number
  let coverage: number

  switch (quadrant) {
    case 'biens':
      exposure = computeBiensExposure(answers)
      coverage = computeBiensCoverage(answers)
      break
    case 'personnes':
      exposure = computePersonnesExposure(answers)
      coverage = computePersonnesCoverage(answers)
      break
    case 'projets':
    case 'futur':
      exposure = computeInactiveExposure()
      coverage = computeInactiveCoverage()
      break
  }

  const coverageLevel = 2 - toMatrixLevel(coverage)
  const needScore = computeNeedFromMatrix(toMatrixLevel(exposure), coverageLevel)

  return {
    quadrant,
    exposure,
    coverage,
    needScore,
    needLevel: getNeedLevel(needScore),
    active: quadrant === 'biens' || quadrant === 'personnes',
  }
}

// === Weightings ===

function computeWeightings(answers: Answers): Record<Quadrant, number> {
  // Only biens and personnes are active — projets/futur get 0
  let biensWeight = 50
  let personnesWeight = 50

  const familyStatus = asString(answers.family_status)
  const proStatus = asString(answers.professional_status)

  // Family with children → personnes (B-SAFE) increases
  if (['couple_with_children', 'single_parent', 'recomposed'].includes(familyStatus)) {
    personnesWeight += 10
    biensWeight -= 10
  }

  // Single parent → personnes is critical
  if (familyStatus === 'single_parent') {
    personnesWeight += 5
    biensWeight -= 5
  }

  // Independent/business owner → personnes (B-SAFE) increases
  if (['independent', 'business_owner'].includes(proStatus)) {
    personnesWeight += 10
    biensWeight -= 10
  }

  // Multiple vehicles → biens (DRIVE) increases
  if (asNumber(answers.vehicle_count) >= 2) {
    biensWeight += 5
    personnesWeight -= 5
  }

  // Retired → personnes increases (no employer protection)
  if (proStatus === 'retired') {
    personnesWeight += 5
    biensWeight -= 5
  }

  // Normalize to 100
  const total = biensWeight + personnesWeight
  biensWeight = Math.round((biensWeight / total) * 100)
  personnesWeight = 100 - biensWeight

  return {
    biens: biensWeight,
    personnes: personnesWeight,
    projets: 0,
    futur: 0,
  }
}

// === Product scoring ===

function computeProductScores(answers: Answers): ProductScore[] {
  const scores: ProductScore[] = []
  const vehicleCov = asString(answers.vehicle_coverage_existing)
  const accidentCov = asString(answers.accident_coverage_existing)

  // DRIVE
  if (asNumber(answers.vehicle_count) > 0) {
    const driveRelevance = vehicleCov === 'full_omnium' ? 20 : vehicleCov === 'mini_omnium' ? 40 : 80
    scores.push({
      product: 'drive',
      relevance: driveRelevance,
      isExistingClient: !['none', 'unknown'].includes(vehicleCov),
      options: computeDriveOptions(answers),
    })
  }

  // B-SAFE
  const bsafeRelevance = accidentCov === 'individual_complete' ? 15 : accidentCov === 'none' ? 90 : 60
  scores.push({
    product: 'bsafe',
    relevance: bsafeRelevance,
    isExistingClient: ['individual_basic', 'individual_complete'].includes(accidentCov),
    options: computeBsafeOptions(answers),
  })

  return scores.sort((a, b) => b.relevance - a.relevance)
}

function computeDriveOptions(a: Answers): OptionScore[] {
  const options: OptionScore[] = []
  const interests = asStringArray(a.vehicle_options_interest)
  const details = asString(a.vehicle_details)
  const cov = asString(a.vehicle_coverage_existing)

  if (['car_new', 'electric', 'suv_crossover'].includes(details) && cov !== 'full_omnium') {
    options.push({ optionId: 'drive_dommages_materiels', optionLabel: 'Omnium', relevance: 90, triggerQuestions: ['vehicle_details', 'vehicle_coverage_existing'] })
  }
  if (interests.includes('new_vehicle_value')) {
    options.push({ optionId: 'drive_pack_indemnisation', optionLabel: 'Pack Indemnisation', relevance: 85, triggerQuestions: ['vehicle_options_interest'] })
  }
  if (interests.includes('replacement_needed')) {
    options.push({ optionId: 'drive_pack_mobilite', optionLabel: 'Pack Mobilité', relevance: 80, triggerQuestions: ['vehicle_options_interest'] })
  }
  if (interests.includes('vehicle_customized')) {
    options.push({ optionId: 'drive_pack_amenagement', optionLabel: 'Pack Aménagement', relevance: 70, triggerQuestions: ['vehicle_options_interest'] })
  }
  if (interests.includes('bonus_important')) {
    options.push({ optionId: 'drive_pack_indemnisation', optionLabel: 'Protection Bonus', relevance: 65, triggerQuestions: ['vehicle_options_interest'] })
  }

  return options
}

function computeBsafeOptions(a: Answers): OptionScore[] {
  const options: OptionScore[] = []
  const healthConcerns = asStringArray(a.health_concerns)
  const sports = asStringArray(a.sports_activities)

  if (asString(a.financial_dependents) !== 'none') {
    options.push({ optionId: 'bsafe_deces', optionLabel: 'Garantie Décès', relevance: 90, triggerQuestions: ['financial_dependents'] })
  }
  if (includesAny(sports, HIGH_RISK_SPORTS)) {
    options.push({ optionId: 'bsafe_invalidite', optionLabel: 'Invalidité permanente', relevance: 80, triggerQuestions: ['sports_activities'] })
  }
  const wic = asString(a.work_incapacity_concern)
  if (['less_1_month', '1_3_months'].includes(wic)) {
    options.push({ optionId: 'bsafe_incapacite', optionLabel: 'Incapacité de travail', relevance: 95, triggerQuestions: ['work_incapacity_concern'] })
  }
  if (healthConcerns.includes('aging_parents')) {
    options.push({ optionId: 'bsafe_aide_menagere', optionLabel: 'Aide ménagère / Soins domicile', relevance: 70, triggerQuestions: ['health_concerns'] })
  }
  if (asNumber(a.children_count) > 0) {
    options.push({ optionId: 'bsafe_frais_divers', optionLabel: 'Garde enfants / Rattrapage scolaire', relevance: 75, triggerQuestions: ['children_count'] })
  }

  return options
}

// === Main entry point ===

export function computeDiagnostic(answers: Answers): DiagnosticResult {
  const quadrantScores: Record<Quadrant, QuadrantScore> = {
    biens: computeQuadrantScore('biens', answers),
    personnes: computeQuadrantScore('personnes', answers),
    projets: computeQuadrantScore('projets', answers),
    futur: computeQuadrantScore('futur', answers),
  }

  const weightings = computeWeightings(answers)

  let globalScore = 0
  for (const q of Object.keys(quadrantScores) as Quadrant[]) {
    globalScore += quadrantScores[q].needScore * (weightings[q] / 100)
  }
  globalScore = Math.round(globalScore)

  const productScores = computeProductScores(answers)
  const recommendations = generateRecommendations(quadrantScores, answers)

  return { quadrantScores, globalScore, weightings, productScores, recommendations }
}
