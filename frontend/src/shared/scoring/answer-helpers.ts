export function asString(val: unknown): string {
  return typeof val === 'string' ? val : ''
}

export function asNumber(val: unknown): number {
  return typeof val === 'number' ? val : 0
}

export function asStringArray(val: unknown): string[] {
  return Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : []
}

export function countNonNone(val: unknown): number {
  if (!Array.isArray(val)) return 0
  let count = 0
  for (const v of val) {
    if (typeof v === 'string' && v !== 'none') count++
  }
  return count
}

export function includesAny(arr: string[], values: string[]): boolean {
  return values.some(v => arr.includes(v))
}

export const HIGH_RISK_SPORTS: string[] = ['winter_sports', 'water_sports', 'mountain_outdoor', 'equestrian', 'motor_sports', 'combat_contact']

// ═══════════════════════════════════════════
// POG eligibility helpers
// ═══════════════════════════════════════════

export const POG_FRONTALIER = ['frontalier_fr', 'frontalier_be', 'frontalier_de']

import type { QuestionnaireAnswers as Answers } from '../questionnaire/schema.ts'

/** B-SAFE, HOME, DRIVE: résident GDL uniquement. Vide = non éligible (restrictif par défaut). */
export function isResidentGDL(a: Answers): boolean {
  const r = asString(a.residence_status)
  return r === 'resident_gdl'
}

/** TRAVEL: résidents GDL + frontaliers éligibles. Vide = non éligible (restrictif par défaut). */
export function isResidentOrFrontalier(a: Answers): boolean {
  const r = asString(a.residence_status)
  return r === 'resident_gdl' || POG_FRONTALIER.includes(r)
}

/** TRAVEL: résidence éligible + âge < 80 ans. */
export function isTravelEligible(a: Answers): boolean {
  return isResidentOrFrontalier(a) && asString(a.age_range) !== '80_plus'
}
