import type { Universe, RecommendedAction, UniverseScore } from './types.ts'

interface ActionRule {
  condition: (score: UniverseScore, answers: Record<string, unknown>) => boolean
  action: Omit<RecommendedAction, 'universe'>
}

const autoRules: ActionRule[] = [
  {
    condition: (score) => score.needLevel === 'critical' && score.active,
    action: { type: 'immediate', priority: 5, title: 'Souscrire une assurance auto', description: 'Votre véhicule n\'est pas suffisamment couvert. Demandez un devis pour une couverture adaptée.' }
  },
  {
    condition: (_score, answers) => {
      const age = answers.vehicleAge as number | undefined
      return age !== undefined && age < 3 && answers.autoCoverage === 'rc'
    },
    action: { type: 'immediate', priority: 4, title: 'Envisager une omnium', description: 'Votre véhicule récent (moins de 3 ans) n\'est couvert qu\'en RC. Une omnium protégerait votre investissement.' }
  },
  {
    condition: (_score, answers) => {
      const age = answers.vehicleAge as number | undefined
      return age !== undefined && age > 8 && answers.autoCoverage === 'omnium'
    },
    action: { type: 'deferred', priority: 2, title: 'Optimiser votre couverture auto', description: 'Votre véhicule a plus de 8 ans avec une omnium. Vous pourriez économiser en passant en RC+ ou mini-omnium.' }
  },
]

const habitationRules: ActionRule[] = [
  {
    condition: (_score, answers) => answers.isOwner === false && answers.habitationCoverage === 'none',
    action: { type: 'immediate', priority: 5, title: 'Souscrire une assurance habitation', description: 'En tant que locataire, une assurance habitation (MRH) est indispensable pour couvrir votre responsabilité.' }
  },
  {
    condition: (_score, answers) => answers.isOwner === true && answers.hasMortgage === true,
    action: { type: 'immediate', priority: 4, title: 'Vérifier votre assurance emprunteur', description: 'Avec un crédit immobilier en cours, assurez-vous que votre assurance emprunteur couvre bien décès et invalidité.' }
  },
  {
    condition: (score) => score.needLevel === 'critical',
    action: { type: 'immediate', priority: 5, title: 'Revoir votre couverture habitation', description: 'Votre couverture habitation présente des lacunes importantes. Un bilan complet est recommandé.' }
  },
]

const prevoyanceRules: ActionRule[] = [
  {
    condition: (_score, answers) => answers.familyStatus === 'family' && answers.incomeSource === 'single',
    action: { type: 'immediate', priority: 5, title: 'Protéger votre famille', description: 'Avec un seul revenu et des enfants à charge, une assurance décès/invalidité est essentielle.' }
  },
  {
    condition: (_score, answers) => answers.professionalStatus === 'independent' && answers.prevoyanceCoverage === 'none',
    action: { type: 'immediate', priority: 5, title: 'Couvrir votre incapacité de travail', description: 'En tant qu\'indépendant sans couverture, une incapacité de travail pourrait avoir des conséquences financières graves.' }
  },
  {
    condition: (score) => score.needLevel === 'high' || score.needLevel === 'critical',
    action: { type: 'immediate', priority: 4, title: 'Réaliser un bilan prévoyance', description: 'Votre niveau de protection en prévoyance est insuffisant. Un conseiller peut vous aider à identifier les solutions adaptées.' }
  },
]

const objetsValeurRules: ActionRule[] = [
  {
    condition: (_score, answers) => {
      const val = answers.valuablesAmount as string | undefined
      return (val === '10k-50k' || val === '50k+') && answers.valuablesCoverage === 'none'
    },
    action: { type: 'immediate', priority: 4, title: 'Assurer vos objets de valeur', description: 'Vos objets de valeur dépassent 10 000€ sans assurance spécifique. Une couverture dédiée est recommandée.' }
  },
  {
    condition: (_score, answers) => answers.valuablesStorage === 'home_no_security',
    action: { type: 'deferred', priority: 3, title: 'Sécuriser vos objets de valeur', description: 'Stockés à domicile sans dispositif de sécurité, vos objets sont exposés. Envisagez un coffre ou une alarme.' }
  },
]

const RULES: Record<Universe, ActionRule[]> = {
  auto: autoRules,
  habitation: habitationRules,
  prevoyance: prevoyanceRules,
  objets_valeur: objetsValeurRules,
}

export function generateActions(
  scores: Record<Universe, UniverseScore>,
  answers: Record<string, unknown>
): RecommendedAction[] {
  const actions: RecommendedAction[] = []

  for (const [universe, rules] of Object.entries(RULES)) {
    const score = scores[universe as Universe]
    if (!score.active) continue

    for (const rule of rules) {
      if (rule.condition(score, answers)) {
        actions.push({ ...rule.action, universe: universe as Universe })
      }
    }
  }

  // Sort by priority descending
  actions.sort((a, b) => b.priority - a.priority)
  return actions
}
