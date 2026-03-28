import type { Quadrant, QuadrantScore, ProductScore, DiagnosticResult, OptionScore } from './types.ts'
import { computeNeedFromMatrix, toMatrixLevel, getNeedLevel } from './thresholds.ts'
import { generateRecommendations } from './rules.ts'
import { asString, asNumber, asStringArray, countNonNone, includesAny, HIGH_RISK_SPORTS, isResidentGDL, isTravelEligible, isFuturEligible } from './answer-helpers.ts'

import type { QuestionnaireAnswers as Answers } from '../questionnaire/schema.ts'

// === Shared lookup tables (reused across quadrants) ===

const DEPENDENTS_RISK: Record<string, number> = {
  none: 10, partner: 40, children: 60, partner_children: 90, extended: 80,
}

const AUTONOMY_RISK: Record<string, number> = {
  less_1_month: 100, '1_3_months': 80, '3_6_months': 55,
  '6_12_months': 30, more_12_months: 10,
}

const VEHICLE_RISK: Record<string, number> = {
  car_new: 90, car_recent: 60, car_old: 25,
}

const USAGE_RISK: Record<string, number> = {
  daily_commute: 70, professional: 90, leisure: 30,
}

const HOUSING_RISK: Record<string, number> = {
  owner_with_mortgage: 90, owner_no_mortgage: 60, tenant: 50, lodged_free: 15,
}

const HOUSING_TYPE_RISK: Record<string, number> = {
  house: 75, townhouse: 65, apartment: 40, other: 35,
}

const CONTENTS_RISK: Record<string, number> = {
  less_20k: 20, '20k_50k': 45, '50k_100k': 75, '100k_plus': 95,
}

const PROPERTY_RISK: Record<string, number> = {
  none: 0, secondary: 40, rental: 60, both: 85,
}

const VEHICLE_COV_SCORE: Record<string, number> = {
  none: 0, unknown: 10, rc_only: 25, mini_omnium: 55, full_omnium: 90,
}

const HOME_COV_SCORE: Record<string, number> = {
  none: 0, unknown: 10, basic: 55, with_options: 90,
}

const BSAFE_INCOME_RISK: Record<string, number> = {
  less_3k: 30, '3k_5k': 45, '5k_8k': 65,
  '8k_12k': 80, '12k_plus': 100, no_answer: 50,
}

const FUTUR_INCOME_RISK: Record<string, number> = {
  less_3k: 20, '3k_5k': 40, '5k_8k': 60,
  '8k_12k': 80, '12k_plus': 100, no_answer: 50,
}

const AGE_RISK_BSAFE: Record<string, number> = {
  '18_25': 50, '26_35': 40, '36_45': 55,
  '46_55': 70, '56_65': 85, '65_plus': 95, '80_plus': 100,
}

const TRAVEL_FREQ_RISK: Record<string, number> = {
  never: 0, once_year: 35, several_year: 70, frequent: 95,
}

const TRAVEL_BUDGET_RISK: Record<string, number> = {
  less_1k: 20, '1k_3k': 45, '3k_5k': 75, '5k_plus': 95,
}

const ACCIDENT_COV_SCORE: Record<string, number> = {
  none: 0, employer_only: 25, individual_basic: 55, individual_complete: 90,
}

const STATUS_COV: Record<string, number> = {
  civil_servant: 80, employee: 65, independent: 20, business_owner: 25, retired: 40,
}

const PATRIMOINE_COV: Record<string, number> = {
  none: 0, secondary: 30, rental: 50, both: 70,
}

const AGE_RISK_FUTUR: Record<string, number> = {
  '18_25': 30, '26_35': 60, '36_45': 90,
  '46_55': 100, '56_65': 70,
}

const CONTRIBUTORS_RISK: Record<string, number> = {
  one: 85, two: 40, more: 25,
}

const TRAVEL_COV_SCORE: Record<string, number> = {
  none: 0, credit_card: 30, per_trip: 60, annual: 90,
}

// Quadrant combination weights
const HOME_WEIGHT = 0.55
const DRIVE_WEIGHT = 0.45
const BSAFE_WEIGHT = 0.65
const TRAVEL_WEIGHT = 0.35

/** Returns true if user travels (frequency is set and not 'never') */
function hasTravel(a: Answers): boolean {
  const freq = asString(a.travel_frequency)
  return freq !== '' && freq !== 'never'
}

// === Biens (DRIVE + HOME) — Exposure ===

function computeDriveExposure(a: Answers): number {
  const vehicleCount = asNumber(a.vehicle_count)
  if (vehicleCount === 0) return 0

  let score = 0
  let weights = 0

  // Vehicle count (weight 20)
  score += Math.min(vehicleCount * 40, 100) * 0.20
  weights += 0.20

  // Vehicle age / value at risk (weight 30)
  score += (VEHICLE_RISK[asString(a.vehicle_details)] ?? 50) * 0.30
  weights += 0.30

  // Vehicle usage intensity (weight 25)
  score += (USAGE_RISK[asString(a.vehicle_usage)] ?? 50) * 0.25
  weights += 0.25

  // Unmet options needs (weight 15)
  score += Math.min(countNonNone(a.vehicle_options_interest) * 20, 100) * 0.15
  weights += 0.15

  // Life event: new vehicle (weight 10)
  if (asStringArray(a.life_event).includes('new_vehicle')) {
    score += 100 * 0.10
  }
  weights += 0.10

  return weights > 0 ? Math.round(score / weights) : 50
}

function computeHomeExposure(a: Answers): number {
  let score = 0
  let weights = 0

  // Housing status — owner with mortgage = highest exposure (weight 25)
  score += (HOUSING_RISK[asString(a.housing_status)] ?? 40) * 0.25
  weights += 0.25

  // Housing type — house = more exposure than apartment (weight 15)
  score += (HOUSING_TYPE_RISK[asString(a.housing_type)] ?? 45) * 0.15
  weights += 0.15

  // Contents value (weight 20)
  score += (CONTENTS_RISK[asString(a.home_contents_value)] ?? 40) * 0.20
  weights += 0.20

  // Valuable possessions (weight 15)
  const valuables = countNonNone(a.valuable_possessions)
  score += Math.min(valuables * 20, 100) * 0.15
  weights += 0.15

  // Home specifics — garden, pool, solar (weight 10)
  const specifics = countNonNone(a.home_specifics)
  score += Math.min(specifics * 25, 100) * 0.10
  weights += 0.10

  // Other properties (weight 10)
  score += (PROPERTY_RISK[asString(a.other_properties)] ?? 0) * 0.10
  weights += 0.10

  // Life event: property purchase or renovation (weight 5)
  const events = asStringArray(a.life_event)
  if (events.includes('property_purchase') || events.includes('renovation')) {
    score += 100 * 0.05
  }
  weights += 0.05

  return weights > 0 ? Math.round(score / weights) : 50
}

function computeBiensExposure(a: Answers): number {
  const driveExp = computeDriveExposure(a)
  const homeExp = computeHomeExposure(a)

  // Weighted average: HOME 55%, DRIVE 45% (housing is universal, vehicle is optional)
  const hasDrive = asNumber(a.vehicle_count) > 0
  if (!hasDrive) return homeExp
  return Math.round(homeExp * HOME_WEIGHT + driveExp * DRIVE_WEIGHT)
}

// === Biens (DRIVE + HOME) — Coverage ===

function computeDriveCoverage(a: Answers): number {
  if (asNumber(a.vehicle_count) === 0) return 100

  let score = 0
  let weights = 0

  // Vehicle insurance level (weight 60)
  const cov = asString(a.vehicle_coverage_existing)
  score += (VEHICLE_COV_SCORE[cov] ?? 10) * 0.60
  weights += 0.60

  // Options coverage gap (weight 40)
  let optionsCov = 0
  if (cov === 'full_omnium') optionsCov = 70
  else if (cov === 'mini_omnium') optionsCov = 40
  else if (cov === 'rc_only') optionsCov = 15
  optionsCov = Math.max(optionsCov - countNonNone(a.vehicle_options_interest) * 12, 0)
  score += optionsCov * 0.40
  weights += 0.40

  return weights > 0 ? Math.round(score / weights) : 0
}

function computeHomeCoverage(a: Answers): number {
  let score = 0
  let weights = 0

  // Home insurance level (weight 50)
  score += (HOME_COV_SCORE[asString(a.home_coverage_existing)] ?? 10) * 0.50
  weights += 0.50

  // Security measures (weight 25)
  const securityCount = countNonNone(a.security_measures)
  score += Math.min(securityCount * 25, 100) * 0.25
  weights += 0.25

  // Valuable items coverage gap (weight 25) — more valuables with basic coverage = lower coverage
  const valuables = countNonNone(a.valuable_possessions)
  const homeCov = asString(a.home_coverage_existing)
  let valuablesCov = 50
  if (homeCov === 'with_options') valuablesCov = 85
  else if (homeCov === 'basic') valuablesCov = 40
  else if (homeCov === 'none') valuablesCov = 0
  valuablesCov = Math.max(valuablesCov - valuables * 10, 0)
  score += valuablesCov * 0.25
  weights += 0.25

  return weights > 0 ? Math.round(score / weights) : 0
}

function computeBiensCoverage(a: Answers): number {
  const driveCov = computeDriveCoverage(a)
  const homeCov = computeHomeCoverage(a)

  // Weighted average: HOME 55%, DRIVE 45%
  const hasDrive = asNumber(a.vehicle_count) > 0
  if (!hasDrive) return homeCov
  return Math.round(homeCov * HOME_WEIGHT + driveCov * DRIVE_WEIGHT)
}

// === Personnes (B-SAFE + TRAVEL) — Exposure ===

function computeBsafeExposure(a: Answers): number {
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

  // Income level at risk (weight 15) — key factor for gap between benefits and lifestyle
  score += (BSAFE_INCOME_RISK[asString(a.income_range)] ?? 50) * 0.15
  weights += 0.15

  // Sports risk (weight 15)
  const activities = asStringArray(a.sports_activities)
  let sportsScore = 0
  for (const act of activities) {
    if (HIGH_RISK_SPORTS.includes(act)) sportsScore += 25
    if (['running_cycling', 'team_sports'].includes(act)) sportsScore += 10
  }
  score += Math.min(sportsScore, 100) * 0.15
  weights += 0.15

  // Age factor (weight 5)
  score += (AGE_RISK_BSAFE[asString(a.age_range)] ?? 50) * 0.05
  weights += 0.05

  return weights > 0 ? Math.round(score / weights) : 50
}

function computeTravelExposure(a: Answers): number {
  if (!isTravelEligible(a)) return 0

  let score = 0
  let weights = 0

  // Travel frequency (weight 35)
  score += (TRAVEL_FREQ_RISK[asString(a.travel_frequency)] ?? 0) * 0.35
  weights += 0.35

  // Destinations risk (weight 25)
  const dests = asStringArray(a.travel_destinations)
  let destScore = 0
  if (dests.includes('worldwide')) destScore += 50
  if (dests.includes('adventure')) destScore += 40
  if (dests.includes('europe')) destScore += 15
  score += Math.min(destScore, 100) * 0.25
  weights += 0.25

  // Travel budget (weight 25)
  score += (TRAVEL_BUDGET_RISK[asString(a.travel_budget)] ?? 30) * 0.25
  weights += 0.25

  // Family travel (weight 15) — children = more at stake
  if (asNumber(a.children_count) > 0) {
    score += 80 * 0.15
  } else {
    score += 30 * 0.15
  }
  weights += 0.15

  return weights > 0 ? Math.round(score / weights) : 0
}

function computePersonnesExposure(a: Answers): number {
  const bsafeExp = computeBsafeExposure(a)
  const travelExp = computeTravelExposure(a)

  // If no travel activity, B-SAFE only
  if (!hasTravel(a)) return bsafeExp
  // Weighted: B-SAFE 65%, TRAVEL 35%
  return Math.round(bsafeExp * BSAFE_WEIGHT + travelExp * TRAVEL_WEIGHT)
}

// === Personnes (B-SAFE + TRAVEL) — Coverage ===

function computeBsafeCoverage(a: Answers): number {
  let score = 0
  let weights = 0

  // Accident coverage (weight 45)
  score += (ACCIDENT_COV_SCORE[asString(a.accident_coverage_existing)] ?? 0) * 0.45
  weights += 0.45

  // Savings / financial protection (weight 35) — weighted by device quality
  const savingsItems = asStringArray(a.savings_protection)
  let savingsCov = 0
  if (!savingsItems.includes('none') && savingsItems.length > 0) {
    if (savingsItems.includes('life_insurance')) savingsCov += 30
    if (savingsItems.includes('pension_plan')) savingsCov += 25
    if (savingsItems.includes('pension_employer')) savingsCov += 20
    if (savingsItems.includes('real_estate')) savingsCov += 15
    if (savingsItems.includes('savings_regular')) savingsCov += 10
  }
  score += Math.min(savingsCov, 100) * 0.35
  weights += 0.35

  // Income protection implicit (weight 20)
  let incomeCov = 10
  const proStatus = asString(a.professional_status)
  if (proStatus === 'civil_servant') incomeCov = 40
  else if (proStatus === 'employee') incomeCov = 30
  const accCov = asString(a.accident_coverage_existing)
  if (accCov === 'individual_complete') incomeCov += 30
  else if (accCov === 'individual_basic') incomeCov += 15
  score += Math.min(incomeCov, 100) * 0.20
  weights += 0.20

  return weights > 0 ? Math.round(score / weights) : 0
}

function computeTravelCoverage(a: Answers): number {
  if (!isTravelEligible(a) || !hasTravel(a)) return 100

  // Travel coverage level (weight 100% — single question drives it)
  return TRAVEL_COV_SCORE[asString(a.travel_coverage_existing)] ?? 0
}

function computePersonnesCoverage(a: Answers): number {
  const bsafeCov = computeBsafeCoverage(a)
  const travelCov = computeTravelCoverage(a)

  if (!hasTravel(a)) return bsafeCov
  // Weighted: B-SAFE 65%, TRAVEL 35%
  return Math.round(bsafeCov * BSAFE_WEIGHT + travelCov * TRAVEL_WEIGHT)
}

// === Projets — Inactive (empty quadrant) ===

function computeInactiveExposure(): number { return 0 }
function computeInactiveCoverage(): number { return 100 }

// === Futur (PP/LP/SP) — Exposure ===
// Note: savings_protection is NOT used here (only in coverage) to avoid double-counting

function computeFuturExposure(a: Answers): number {
  if (!isFuturEligible(a)) return 0

  let score = 0

  // Financial dependents (weight 30%) — more dependents = more future to protect
  score += (DEPENDENTS_RISK[asString(a.financial_dependents)] ?? 30) * 0.30

  // Financial autonomy (weight 25%) — low autonomy = urgent future planning need
  const wic = asString(a.work_incapacity_concern)
  score += (wic ? (AUTONOMY_RISK[wic] ?? 50) : 50) * 0.25

  // Income level (weight 20%) — higher income = more to protect
  score += (FUTUR_INCOME_RISK[asString(a.income_range)] ?? 50) * 0.20

  // Age factor (weight 15%) — mid-career = highest need
  score += (AGE_RISK_FUTUR[asString(a.age_range)] ?? 50) * 0.15

  // Income contributors (weight 10%) — single income = more vulnerable
  score += (CONTRIBUTORS_RISK[asString(a.income_contributors)] ?? 50) * 0.10

  return Math.round(score)
}

// === Futur (PP/LP/SP) — Coverage ===

function computeFuturCoverage(a: Answers): number {
  if (!isFuturEligible(a)) return 100

  let score = 0

  // Existing savings/protection devices (weight 55%)
  const savingsItems = asStringArray(a.savings_protection)
  let devicesCov = 0
  if (savingsItems.includes('pension_plan')) devicesCov += 45
  if (savingsItems.includes('pension_employer')) devicesCov += 35
  if (savingsItems.includes('life_insurance')) devicesCov += 25
  if (savingsItems.includes('savings_regular')) devicesCov += 10
  if (savingsItems.includes('real_estate')) devicesCov += 15
  score += Math.min(devicesCov, 100) * 0.55

  // Professional status protection (weight 30%) — reflects Luxembourg social security
  score += (STATUS_COV[asString(a.professional_status)] ?? 20) * 0.30

  // Real estate patrimony (weight 15%)
  score += (PATRIMOINE_COV[asString(a.other_properties)] ?? 0) * 0.15

  return Math.round(score)
}

// === Quadrant score computation ===

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

  // 5×5 matrix: exposure maps to row 0-4, coverage inverts to column 0-4
  const exposureLevel = toMatrixLevel(exposure)
  const coverageLevel = 4 - toMatrixLevel(coverage) // invert: high coverage → low need column
  const needScore = computeNeedFromMatrix(exposureLevel, coverageLevel)

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

const WEIGHT_FLOOR = 15 // Minimum weight for any active quadrant (prevents invisibility)

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

  // Enforce floor on active quadrants and protect against negative weights
  biensWeight = Math.max(biensWeight, WEIGHT_FLOOR)
  personnesWeight = Math.max(personnesWeight, WEIGHT_FLOOR)
  if (eligible) futurWeight = Math.max(futurWeight, WEIGHT_FLOOR)

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

  // DRIVE — résident GDL uniquement (POG)
  if (isResidentGDL(answers) && asNumber(answers.vehicle_count) > 0) {
    const driveRelevance = vehicleCov === 'full_omnium' ? 20 : vehicleCov === 'mini_omnium' ? 40 : 80
    scores.push({
      product: 'drive',
      relevance: driveRelevance,
      isExistingClient: !['none', 'unknown'].includes(vehicleCov),
      options: computeDriveOptions(answers),
    })
  }

  // HOME — résident GDL uniquement (POG)
  if (isResidentGDL(answers)) {
    const homeCov = asString(answers.home_coverage_existing)
    const homeRelevance = homeCov === 'with_options' ? 20 : homeCov === 'basic' ? 50 : 85
    scores.push({
      product: 'home',
      relevance: homeRelevance,
      isExistingClient: !['none', 'unknown', ''].includes(homeCov),
      options: [],
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

  // TRAVEL — résident ou frontalier éligible (POG)
  if (isTravelEligible(answers) && hasTravel(answers)) {
    const travelCov = asString(answers.travel_coverage_existing)
    const travelRelevance = travelCov === 'annual' ? 15 : travelCov === 'per_trip' ? 40 : travelCov === 'credit_card' ? 65 : 85
    scores.push({
      product: 'travel',
      relevance: travelRelevance,
      isExistingClient: !['none', ''].includes(travelCov),
      options: [],
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
