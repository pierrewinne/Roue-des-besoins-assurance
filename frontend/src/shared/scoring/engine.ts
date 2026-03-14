import type { Quadrant, QuadrantScore, ProductScore, DiagnosticResult, OptionScore } from './types.ts'
import { computeNeedFromMatrix, getNeedLevel } from './thresholds.ts'
import { generateRecommendations } from './rules.ts'
import { asString, asNumber, asStringArray, countNonNone, includesAny, HIGH_RISK_SPORTS, isResidentGDL, isFuturEligible } from './answer-helpers.ts'

import type { QuestionnaireAnswers as Answers } from '../questionnaire/schema.ts'

// === Shared lookup tables (reused across quadrants) ===

const DEPENDENTS_RISK: Record<string, number> = {
  none: 10, partner: 40, children: 60, partner_children: 90, extended: 80,
}

const AUTONOMY_RISK: Record<string, number> = {
  less_1_month: 100, '1_3_months': 80, '3_6_months': 55,
  '6_12_months': 30, more_12_months: 10,
}

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

  // Vehicle age / value at risk (weight 30)
  const vehicleRisk: Record<string, number> = {
    car_new: 90, car_recent: 60, car_old: 25,
  }
  score += (vehicleRisk[asString(a.vehicle_details)] ?? 50) * 0.30
  weights += 0.30

  // Vehicle usage intensity (weight 25)
  const usageRisk: Record<string, number> = {
    daily_commute: 70, professional: 90, leisure: 30,
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

  // Family vulnerability (weight 30)
  let familyScore = 20
  const familyStatus = asString(a.family_status)
  if (['couple_with_children', 'single_parent', 'recomposed'].includes(familyStatus)) {
    familyScore = 70
  }
  if (asString(a.income_contributors) === 'one' && familyScore >= 70) {
    familyScore = 100
  }
  score += familyScore * 0.30
  weights += 0.30

  // Financial dependents (weight 20)
  score += (DEPENDENTS_RISK[asString(a.financial_dependents)] ?? 30) * 0.20
  weights += 0.20

  // Work incapacity vulnerability (weight 15)
  const wic = asString(a.work_incapacity_concern)
  score += (wic ? (AUTONOMY_RISK[wic] ?? 50) : 30) * 0.15
  weights += 0.15

  // Income level at risk (weight 10)
  const incomeRisk: Record<string, number> = {
    less_3k: 30, '3k_5k': 45, '5k_8k': 65,
    '8k_12k': 80, '12k_plus': 100, no_answer: 50,
  }
  score += (incomeRisk[asString(a.income_range)] ?? 50) * 0.10
  weights += 0.10

  // Sports risk (weight 20)
  const activities = asStringArray(a.sports_activities)
  let sportsScore = 0
  for (const act of activities) {
    if (HIGH_RISK_SPORTS.includes(act)) sportsScore += 25
    if (['running_cycling', 'team_sports'].includes(act)) sportsScore += 10
  }
  score += Math.min(sportsScore, 100) * 0.20
  weights += 0.20

  // Age factor (weight 5)
  const ageRisk: Record<string, number> = {
    '18_25': 30, '26_35': 50, '36_45': 90,
    '46_55': 100, '56_65': 70, '65_plus': 40, '80_plus': 20,
  }
  score += (ageRisk[asString(a.age_range)] ?? 50) * 0.05
  weights += 0.05

  return weights > 0 ? Math.round(score / weights) : 50
}

// === Personnes (B-SAFE) — Coverage ===

function computePersonnesCoverage(a: Answers): number {
  let score = 0
  let weights = 0

  // Accident coverage (weight 42) — RC vie privée intégrée dans HOME
  const accidentCovScore: Record<string, number> = {
    none: 0, employer_only: 25, individual_basic: 55, individual_complete: 90,
  }
  score += (accidentCovScore[asString(a.accident_coverage_existing)] ?? 0) * 0.42
  weights += 0.42

  // Savings / financial protection (weight 38)
  const savingsItems = asStringArray(a.savings_protection)
  const hasSavings = !savingsItems.includes('none') && savingsItems.length > 0
  const savingsCov = hasSavings ? Math.min(savingsItems.length * 25, 100) : 0
  score += savingsCov * 0.38
  weights += 0.38

  // Income protection implicit (weight 20)
  let incomeCov = 10
  const proStatus = asString(a.professional_status)
  if (proStatus === 'civil_servant') incomeCov = 50
  else if (proStatus === 'employee') incomeCov = 30
  const accCov = asString(a.accident_coverage_existing)
  if (accCov === 'individual_complete') incomeCov += 30
  else if (accCov === 'individual_basic') incomeCov += 15
  score += Math.min(incomeCov, 100) * 0.20
  weights += 0.20

  return weights > 0 ? Math.round(score / weights) : 0
}

// === Projets — Inactive (empty quadrant) ===

function computeInactiveExposure(): number { return 0 }
function computeInactiveCoverage(): number { return 100 }

// === Futur (PP/LP/SP) — Exposure ===

function computeFuturExposure(a: Answers): number {
  if (!isFuturEligible(a)) return 0

  let score = 0

  // Financial dependents (weight 25%)
  score += (DEPENDENTS_RISK[asString(a.financial_dependents)] ?? 30) * 0.25

  // Savings gap (weight 25%) — less existing coverage = more exposure
  const savingsItems = asStringArray(a.savings_protection)
  const hasSavings = !savingsItems.includes('none') && savingsItems.length > 0
  const savingsScore = hasSavings ? Math.max(100 - savingsItems.length * 25, 10) : 100
  score += savingsScore * 0.25

  // Financial autonomy (weight 20%)
  const wic = asString(a.work_incapacity_concern)
  score += (wic ? (AUTONOMY_RISK[wic] ?? 50) : 50) * 0.20

  // Income level (weight 15%) — higher income = more to protect
  const incomeRisk: Record<string, number> = {
    less_3k: 20, '3k_5k': 40, '5k_8k': 60,
    '8k_12k': 80, '12k_plus': 100, no_answer: 50,
  }
  score += (incomeRisk[asString(a.income_range)] ?? 50) * 0.15

  // Age factor (weight 15%) — mid-career = highest need
  const ageRisk: Record<string, number> = {
    '18_25': 30, '26_35': 60, '36_45': 90,
    '46_55': 100, '56_65': 70,
  }
  score += (ageRisk[asString(a.age_range)] ?? 50) * 0.15

  return Math.round(score)
}

// === Futur (PP/LP/SP) — Coverage ===

function computeFuturCoverage(a: Answers): number {
  if (!isFuturEligible(a)) return 100

  let score = 0

  // Existing savings/protection devices (weight 50%)
  const savingsItems = asStringArray(a.savings_protection)
  let devicesCov = 0
  if (savingsItems.includes('pension_plan')) devicesCov += 35
  if (savingsItems.includes('pension_employer')) devicesCov += 25
  if (savingsItems.includes('life_insurance')) devicesCov += 25
  if (savingsItems.includes('savings_regular')) devicesCov += 10
  if (savingsItems.includes('real_estate')) devicesCov += 15
  score += Math.min(devicesCov, 100) * 0.50

  // Professional status protection (weight 25%)
  const statusCov: Record<string, number> = {
    civil_servant: 70, employee: 50, independent: 15, business_owner: 20, retired: 30,
  }
  score += (statusCov[asString(a.professional_status)] ?? 20) * 0.25

  // Income contributors (weight 15%) — more contributors = more resilience
  const contributorsCov: Record<string, number> = {
    one: 20, two: 60, more: 80,
  }
  score += (contributorsCov[asString(a.income_contributors)] ?? 30) * 0.15

  // Real estate patrimony (weight 10%)
  const patrimoineCov: Record<string, number> = {
    none: 0, secondary: 30, rental: 50, both: 70,
  }
  score += (patrimoineCov[asString(a.other_properties)] ?? 0) * 0.10

  return Math.round(score)
}

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
      exposure = computeInactiveExposure()
      coverage = computeInactiveCoverage()
      break
    case 'futur':
      exposure = computeFuturExposure(answers)
      coverage = computeFuturCoverage(answers)
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
    active: quadrant !== 'projets',
  }
}

// === Weightings ===

function computeWeightings(answers: Answers): Record<Quadrant, number> {
  const eligible = isFuturEligible(answers)

  // 3 active quadrants: biens, personnes, futur — projets gets 0
  let biensWeight = 35
  let personnesWeight = 35
  let futurWeight = eligible ? 30 : 0

  const familyStatus = asString(answers.family_status)
  const proStatus = asString(answers.professional_status)

  // Family with children → personnes + futur increase
  if (['couple_with_children', 'single_parent', 'recomposed'].includes(familyStatus)) {
    personnesWeight += 5
    futurWeight += eligible ? 5 : 0
    biensWeight -= eligible ? 10 : 5
  }

  // Single parent → personnes is critical
  if (familyStatus === 'single_parent') {
    personnesWeight += 5
    biensWeight -= 5
  }

  // Independent/business owner → personnes + futur increase
  if (['independent', 'business_owner'].includes(proStatus)) {
    personnesWeight += 5
    futurWeight += eligible ? 5 : 0
    biensWeight -= eligible ? 10 : 5
  }

  // Multiple vehicles → biens increases
  if (asNumber(answers.vehicle_count) >= 2) {
    biensWeight += 5
    personnesWeight -= 5
  }

  // Retired → personnes increases
  if (proStatus === 'retired') {
    personnesWeight += 5
    biensWeight -= 5
  }

  // Mid-career (36-55) → futur increases
  if (eligible && ['36_45', '46_55'].includes(asString(answers.age_range))) {
    futurWeight += 5
    biensWeight -= 5
  }

  // Normalize to 100
  const total = biensWeight + personnesWeight + futurWeight
  biensWeight = Math.round((biensWeight / total) * 100)
  personnesWeight = Math.round((personnesWeight / total) * 100)
  futurWeight = 100 - biensWeight - personnesWeight

  return {
    biens: biensWeight,
    personnes: personnesWeight,
    projets: 0,
    futur: futurWeight,
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

  // B-SAFE — résident GDL uniquement (POG)
  if (isResidentGDL(answers)) {
    const bsafeRelevance = accidentCov === 'individual_complete' ? 15 : accidentCov === 'none' ? 90 : 60
    scores.push({
      product: 'bsafe',
      relevance: bsafeRelevance,
      isExistingClient: ['individual_basic', 'individual_complete'].includes(accidentCov),
      options: computeBsafeOptions(answers),
    })
  }

  // FUTUR products — résident GDL, < 65, actif (POG)
  if (isFuturEligible(answers)) {
    const savingsItems = asStringArray(answers.savings_protection)
    const hasPension = savingsItems.includes('pension_plan')
    const hasLifeInsurance = savingsItems.includes('life_insurance')
    const esg = asString(answers.esg_interest)

    // Pension Plan (art. 111bis)
    const ppRelevance = hasPension ? 25 : 90
    scores.push({
      product: 'pension_plan',
      relevance: ppRelevance,
      isExistingClient: hasPension,
      options: [],
    })

    // Life Plan (art. 111) — protection-oriented
    const lpRelevance = hasLifeInsurance ? 20 :
      asString(answers.financial_dependents) !== 'none' ? 75 : 45
    scores.push({
      product: 'life_plan',
      relevance: lpRelevance,
      isExistingClient: hasLifeInsurance,
      options: [],
    })

    // Switch Plan (art. 111 ESG) — conviction-oriented
    const spRelevance = esg === 'yes' ? 85 : esg === 'neutral' ? 50 : 15
    scores.push({
      product: 'switch_plan',
      relevance: spRelevance,
      isExistingClient: false,
      options: [],
    })
  }

  return scores.sort((a, b) => b.relevance - a.relevance)
}

function computeDriveOptions(a: Answers): OptionScore[] {
  const options: OptionScore[] = []
  const interests = asStringArray(a.vehicle_options_interest)
  const details = asString(a.vehicle_details)
  const cov = asString(a.vehicle_coverage_existing)

  if (details === 'car_new' && cov !== 'full_omnium') {
    options.push({ optionId: 'drive_dommages_materiels', optionLabel: 'Tous dommages', relevance: 90, triggerQuestions: ['vehicle_details', 'vehicle_coverage_existing'] })
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
