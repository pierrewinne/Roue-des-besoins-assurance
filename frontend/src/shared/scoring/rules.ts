import type { Universe, RecommendedAction, UniverseScore } from './types.ts'

interface ActionRule {
  condition: (score: UniverseScore, answers: Record<string, unknown>) => boolean
  action: Omit<RecommendedAction, 'universe'>
}

const autoRules: ActionRule[] = [
  {
    condition: (score) => score.needLevel === 'critical' && score.active,
    action: { type: 'immediate', priority: 5, title: 'Souscrire une assurance auto', description: 'Votre v\u00e9hicule n\'est pas suffisamment couvert. D\u00e9couvrez la couverture Baloise Drive adapt\u00e9e \u00e0 votre profil.', productName: 'Baloise Drive' }
  },
  {
    condition: (_score, answers) => {
      const age = answers.vehicleAge as number | undefined
      return age !== undefined && age < 3 && answers.autoCoverage === 'rc'
    },
    action: { type: 'immediate', priority: 4, title: 'Prot\u00e9ger votre v\u00e9hicule r\u00e9cent', description: 'Votre v\u00e9hicule de moins de 3 ans repr\u00e9sente un investissement significatif. En cas de vol ou de d\u00e9g\u00e2t total, votre couverture RC ne vous rembourse pas. Une couverture Omnium vous garantit le remplacement de votre v\u00e9hicule.', productName: 'Baloise Drive Omnium' }
  },
  {
    condition: (_score, answers) => {
      const age = answers.vehicleAge as number | undefined
      return age !== undefined && age > 8 && answers.autoCoverage === 'omnium'
    },
    action: { type: 'deferred', priority: 2, title: 'Optimiser votre couverture auto', description: 'Votre v\u00e9hicule a plus de 8 ans avec une omnium. Vous pourriez \u00e9conomiser en passant en Mini-Omnium tout en conservant une protection adapt\u00e9e.', productName: 'Baloise Drive Mini-Omnium' }
  },
]

const habitationRules: ActionRule[] = [
  {
    condition: (_score, answers) => answers.isOwner === false && answers.habitationCoverage === 'none',
    action: { type: 'immediate', priority: 5, title: 'S\u00e9curiser votre logement', description: 'En tant que locataire, une assurance habitation est indispensable pour couvrir votre responsabilit\u00e9 et prot\u00e9ger vos biens.', productName: 'Baloise Home' }
  },
  {
    condition: (_score, answers) => answers.isOwner === true && answers.hasMortgage === true,
    action: { type: 'immediate', priority: 4, title: 'V\u00e9rifier votre assurance emprunteur', description: 'Avec un cr\u00e9dit immobilier en cours, assurez-vous que votre assurance emprunteur couvre bien d\u00e9c\u00e8s et invalidit\u00e9 pour prot\u00e9ger votre famille.', productName: 'Baloise Home Protect' }
  },
  {
    condition: (score) => score.needLevel === 'critical',
    action: { type: 'immediate', priority: 5, title: 'Revoir votre couverture habitation', description: 'Votre couverture habitation pr\u00e9sente des lacunes importantes. Un bilan complet avec votre conseiller permettra d\'adapter votre protection.', productName: 'Baloise Home' }
  },
  {
    condition: (_score, answers) => answers.lifeEvent === 'property',
    action: { type: 'event', priority: 5, title: 'S\u00e9curiser votre projet immobilier', description: 'Un achat immobilier est le moment id\u00e9al pour mettre en place une couverture habitation compl\u00e8te et une assurance emprunteur.', productName: 'Baloise Home Protect' }
  },
]

const prevoyanceRules: ActionRule[] = [
  {
    condition: (_score, answers) => answers.familyStatus === 'family' && answers.incomeSource === 'one',
    action: { type: 'immediate', priority: 5, title: 'Prot\u00e9ger votre famille', description: 'Avec un seul revenu et des enfants \u00e0 charge, une assurance d\u00e9c\u00e8s/invalidit\u00e9 est essentielle pour garantir la s\u00e9curit\u00e9 financi\u00e8re de votre famille.', productName: 'Baloise Bsafe' }
  },
  {
    condition: (_score, answers) => answers.professionalStatus === 'independent' && answers.prevoyanceCoverage === 'none',
    action: { type: 'immediate', priority: 5, title: 'Couvrir votre incapacit\u00e9 de travail', description: 'En tant qu\'ind\u00e9pendant sans couverture, une incapacit\u00e9 de travail pourrait avoir des cons\u00e9quences financi\u00e8res graves. Bsafe maintient vos revenus.', productName: 'Baloise Bsafe' }
  },
  {
    condition: (score) => score.needLevel === 'high' || score.needLevel === 'critical',
    action: { type: 'immediate', priority: 4, title: 'R\u00e9aliser un bilan pr\u00e9voyance', description: 'Votre niveau de protection en pr\u00e9voyance est insuffisant. Un conseiller Baloise peut vous aider \u00e0 identifier les solutions adapt\u00e9es.', productName: 'Baloise Bsafe' }
  },
  {
    condition: (_score, answers) => answers.lifeEvent === 'birth',
    action: { type: 'event', priority: 5, title: 'Anticiper la protection de votre famille', description: 'L\'arriv\u00e9e d\'un enfant est le moment id\u00e9al pour s\u00e9curiser l\'avenir de votre famille avec une couverture pr\u00e9voyance adapt\u00e9e.', productName: 'Baloise Bsafe' }
  },
  {
    condition: (_score, answers) => answers.lifeEvent === 'retirement',
    action: { type: 'event', priority: 4, title: 'Pr\u00e9parer votre d\u00e9part en retraite', description: 'Le passage \u00e0 la retraite modifie profond\u00e9ment votre protection. Un bilan pr\u00e9voyance vous permettra d\'anticiper sereinement.', productName: 'Baloise Bsafe' }
  },
]

const objetsValeurRules: ActionRule[] = [
  {
    condition: (_score, answers) => {
      const val = answers.valuablesAmount as string | undefined
      return (val === '10k-50k' || val === '50k+') && answers.valuablesCoverage === 'none'
    },
    action: { type: 'immediate', priority: 4, title: 'Assurer vos objets de valeur', description: 'Vos objets de valeur d\u00e9passent 10 000\u20ac sans assurance sp\u00e9cifique. Une couverture d\u00e9di\u00e9e prot\u00e8ge votre patrimoine artistique et vos collections.', productName: 'Baloise Home Art & Collections' }
  },
  {
    condition: (_score, answers) => answers.valuablesStorage === 'home_no_security',
    action: { type: 'deferred', priority: 3, title: 'S\u00e9curiser vos objets de valeur', description: 'Stock\u00e9s \u00e0 domicile sans dispositif de s\u00e9curit\u00e9, vos objets sont expos\u00e9s. Envisagez un coffre ou une alarme pour r\u00e9duire le risque.', productName: 'Baloise Home Art & Collections' }
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
