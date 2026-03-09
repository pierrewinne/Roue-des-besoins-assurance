export type QuestionType = 'select' | 'boolean' | 'number'
export type QuestionBlock = 'personal' | 'patrimony' | 'mobility' | 'valuables' | 'coverage'

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: string
  block: QuestionBlock
  label: string
  helpText?: string
  type: QuestionType
  options?: QuestionOption[]
  required: boolean
  dependsOn?: { questionId: string; values: (string | boolean | number)[] }
}

export const BLOCK_LABELS: Record<QuestionBlock, string> = {
  personal: 'Situation personnelle',
  patrimony: 'Situation patrimoniale',
  mobility: 'Mobilité',
  valuables: 'Objets de valeur',
  coverage: 'Couvertures existantes',
}

export const BLOCKS: QuestionBlock[] = ['personal', 'patrimony', 'mobility', 'valuables', 'coverage']

export const QUESTIONS: Question[] = [
  // === Block A: Situation personnelle ===
  {
    id: 'ageRange',
    block: 'personal',
    label: 'Quelle est votre tranche d\'\u00e2ge ?',
    type: 'select',
    required: true,
    options: [
      { value: '18-25', label: '18-25 ans' },
      { value: '25-30', label: '25-30 ans' },
      { value: '30-40', label: '30-40 ans' },
      { value: '40-50', label: '40-50 ans' },
      { value: '50-60', label: '50-60 ans' },
      { value: '60+', label: '60 ans et plus' },
    ],
  },
  {
    id: 'familyStatus',
    block: 'personal',
    label: 'Quelle est votre situation familiale ?',
    type: 'select',
    required: true,
    options: [
      { value: 'single', label: 'C\u00e9libataire' },
      { value: 'couple', label: 'En couple' },
      { value: 'family', label: 'En couple avec enfants' },
      { value: 'single_parent', label: 'Parent seul avec enfants' },
    ],
  },
  {
    id: 'childrenCount',
    block: 'personal',
    label: 'Combien d\'enfants avez-vous \u00e0 charge ?',
    type: 'number',
    required: true,
    dependsOn: { questionId: 'familyStatus', values: ['family', 'single_parent'] },
  },
  {
    id: 'professionalStatus',
    block: 'personal',
    label: 'Quel est votre statut professionnel ?',
    type: 'select',
    required: true,
    options: [
      { value: 'employee', label: 'Salari\u00e9(e)' },
      { value: 'independent', label: 'Ind\u00e9pendant(e)' },
      { value: 'retired', label: 'Retrait\u00e9(e)' },
      { value: 'inactive', label: 'Sans activit\u00e9' },
    ],
  },

  // === Block B: Situation patrimoniale ===
  {
    id: 'incomeRange',
    block: 'patrimony',
    label: 'Quels sont les revenus nets mensuels de votre foyer ?',
    type: 'select',
    required: true,
    options: [
      { value: 'less-2k', label: 'Moins de 2 000 \u20ac' },
      { value: '2k-4k', label: '2 000 - 4 000 \u20ac' },
      { value: '4k-6k', label: '4 000 - 6 000 \u20ac' },
      { value: '6k-10k', label: '6 000 - 10 000 \u20ac' },
      { value: '10k+', label: 'Plus de 10 000 \u20ac' },
    ],
  },
  {
    id: 'isOwner',
    block: 'patrimony',
    label: '\u00cates-vous propri\u00e9taire de votre r\u00e9sidence principale ?',
    type: 'boolean',
    required: true,
  },
  {
    id: 'hasMortgage',
    block: 'patrimony',
    label: 'Avez-vous un cr\u00e9dit immobilier en cours ?',
    type: 'boolean',
    required: true,
    dependsOn: { questionId: 'isOwner', values: [true] },
  },
  {
    id: 'hasOtherProperties',
    block: 'patrimony',
    label: 'Poss\u00e9dez-vous d\'autres biens immobiliers ?',
    type: 'boolean',
    required: true,
  },

  // === Block C: Mobilit\u00e9 ===
  {
    id: 'vehicleCount',
    block: 'mobility',
    label: 'Combien de v\u00e9hicules poss\u00e9dez-vous dans votre foyer ?',
    type: 'number',
    required: true,
  },
  {
    id: 'vehicleType',
    block: 'mobility',
    label: 'Quel est le type principal de v\u00e9hicule ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'vehicleCount', values: [1, 2, 3, 4, 5] },
    options: [
      { value: 'car', label: 'Voiture particuli\u00e8re' },
      { value: 'utility', label: 'Utilitaire' },
      { value: 'moto', label: 'Moto / Scooter' },
    ],
  },
  {
    id: 'vehicleAge',
    block: 'mobility',
    label: 'Quel est l\'\u00e2ge de votre v\u00e9hicule principal (en ann\u00e9es) ?',
    type: 'number',
    required: true,
    dependsOn: { questionId: 'vehicleCount', values: [1, 2, 3, 4, 5] },
  },
  {
    id: 'vehicleUsage',
    block: 'mobility',
    label: 'Quelle est l\'utilisation de votre v\u00e9hicule ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'vehicleCount', values: [1, 2, 3, 4, 5] },
    options: [
      { value: 'daily', label: 'Quotidien' },
      { value: 'occasional', label: 'Occasionnel' },
    ],
  },
  {
    id: 'autoCoverage',
    block: 'mobility',
    label: 'Quel est votre niveau de couverture auto actuel ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'vehicleCount', values: [1, 2, 3, 4, 5] },
    options: [
      { value: 'none', label: 'Aucune assurance' },
      { value: 'rc', label: 'RC uniquement (au tiers)' },
      { value: 'omnium', label: 'Omnium (tous risques)' },
    ],
  },

  // === Block D: Objets de valeur ===
  {
    id: 'hasValuables',
    block: 'valuables',
    label: 'Poss\u00e9dez-vous des objets d\'art, bijoux ou collections de valeur ?',
    type: 'boolean',
    required: true,
  },
  {
    id: 'valuablesAmount',
    block: 'valuables',
    label: 'Quelle est la valeur estim\u00e9e globale de vos objets ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'hasValuables', values: [true] },
    options: [
      { value: 'less-5k', label: 'Moins de 5 000 \u20ac' },
      { value: '5k-10k', label: '5 000 - 10 000 \u20ac' },
      { value: '10k-50k', label: '10 000 - 50 000 \u20ac' },
      { value: '50k+', label: 'Plus de 50 000 \u20ac' },
    ],
  },
  {
    id: 'valuablesStorage',
    block: 'valuables',
    label: 'O\u00f9 conservez-vous principalement ces objets ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'hasValuables', values: [true] },
    options: [
      { value: 'home_secured', label: 'Domicile avec coffre/alarme' },
      { value: 'home_no_security', label: 'Domicile sans s\u00e9curit\u00e9 particuli\u00e8re' },
      { value: 'bank_vault', label: 'Coffre bancaire' },
      { value: 'other', label: 'Autre' },
    ],
  },
  {
    id: 'valuablesCoverage',
    block: 'valuables',
    label: 'Avez-vous une assurance sp\u00e9cifique pour ces objets ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'hasValuables', values: [true] },
    options: [
      { value: 'none', label: 'Non, aucune couverture' },
      { value: 'basic', label: 'Couverture basique (incluse dans l\'habitation)' },
      { value: 'complete', label: 'Assurance sp\u00e9cifique d\u00e9di\u00e9e' },
    ],
  },

  // === Block E: Couvertures existantes ===
  {
    id: 'habitationCoverage',
    block: 'coverage',
    label: 'Quel est votre niveau de couverture habitation ?',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'Aucune assurance habitation' },
      { value: 'basic', label: 'Couverture basique' },
      { value: 'standard', label: 'Couverture standard' },
      { value: 'complete', label: 'Couverture compl\u00e8te' },
    ],
  },
  {
    id: 'prevoyanceCoverage',
    block: 'coverage',
    label: 'Quel est votre niveau de couverture pr\u00e9voyance (d\u00e9c\u00e8s, incapacit\u00e9, invalidit\u00e9) ?',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'Aucune couverture' },
      { value: 'basic', label: 'Couverture basique (employeur)' },
      { value: 'standard', label: 'Couverture standard' },
      { value: 'complete', label: 'Couverture compl\u00e8te' },
    ],
  },
]

export function getBlockQuestions(block: QuestionBlock): Question[] {
  return QUESTIONS.filter(q => q.block === block)
}

export function isQuestionVisible(question: Question, answers: Record<string, unknown>): boolean {
  if (!question.dependsOn) return true
  const depValue = answers[question.dependsOn.questionId]
  return question.dependsOn.values.includes(depValue as string | boolean | number)
}
