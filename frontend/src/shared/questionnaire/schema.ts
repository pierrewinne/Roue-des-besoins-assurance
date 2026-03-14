export type QuestionType = 'select' | 'boolean' | 'number' | 'multi_select'
export type QuestionQuadrant = 'profil_express' | 'biens' | 'personnes' | 'projets' | 'futur'

/** Typed questionnaire answer value (P3-02) */
export type AnswerValue = string | number | boolean | string[]

/** Typed questionnaire answers map — replaces Record<string, unknown> */
export type QuestionnaireAnswers = Record<string, AnswerValue | undefined>

export interface QuestionOption {
  value: string
  label: string
}

export interface DependencyRule {
  questionId: string
  operator: 'eq' | 'neq' | 'in' | 'not_in' | 'gt' | 'gte' | 'contains' | 'not_contains'
  value: string | number | boolean | (string | number | boolean)[]
}

export interface Question {
  id: string
  quadrant: QuestionQuadrant
  label: string
  helpText?: string
  type: QuestionType
  options?: QuestionOption[]
  required: boolean
  dependsOn?: DependencyRule
}

export const SECTION_LABELS: Record<QuestionQuadrant, string> = {
  profil_express: 'Profil express',
  biens: 'Protection des biens',
  personnes: 'Protection des personnes',
  projets: 'Protection des projets',
  futur: 'Protection du futur',
}

export const ALL_QUADRANT_SECTIONS: QuestionQuadrant[] = ['profil_express', 'biens', 'personnes', 'projets', 'futur']

export const QUESTIONS: Question[] = [
  // ══════════════════════════════════════════
  // BLOC 0 : PROFIL EXPRESS (8 questions)
  // ══════════════════════════════════════════
  {
    id: 'residence_status',
    quadrant: 'profil_express',
    label: 'Où résidez-vous ?',
    helpText: 'Cette information est nécessaire pour vous proposer les produits adaptés à votre situation.',
    type: 'select',
    required: true,
    options: [
      { value: 'resident_gdl', label: 'Résident au Luxembourg' },
      { value: 'frontalier_fr', label: 'Frontalier (résidence en France)' },
      { value: 'frontalier_be', label: 'Frontalier (résidence en Belgique)' },
      { value: 'frontalier_de', label: 'Frontalier (résidence en Allemagne)' },
      { value: 'other', label: 'Autre' },
    ],
  },
  {
    id: 'age_range',
    quadrant: 'profil_express',
    label: 'Quelle est votre tranche d\'âge ?',
    type: 'select',
    required: true,
    options: [
      { value: '18_25', label: '18-25 ans' },
      { value: '26_35', label: '26-35 ans' },
      { value: '36_45', label: '36-45 ans' },
      { value: '46_55', label: '46-55 ans' },
      { value: '56_65', label: '56-65 ans' },
      { value: '65_plus', label: '65-80 ans' },
      { value: '80_plus', label: 'Plus de 80 ans' },
    ],
  },
  {
    id: 'family_status',
    quadrant: 'profil_express',
    label: 'Quelle est votre situation familiale ?',
    type: 'select',
    required: true,
    options: [
      { value: 'single', label: 'Célibataire' },
      { value: 'couple_no_children', label: 'En couple, sans enfant' },
      { value: 'couple_with_children', label: 'En couple, avec enfant(s)' },
      { value: 'single_parent', label: 'Parent seul avec enfant(s)' },
      { value: 'recomposed', label: 'Famille recomposée' },
    ],
  },
  {
    id: 'children_count',
    quadrant: 'profil_express',
    label: 'Combien d\'enfants avez-vous à charge ?',
    helpText: 'Enfants mineurs ou étudiant(e)s vivant sous votre toit.',
    type: 'number',
    required: true,
    dependsOn: { questionId: 'family_status', operator: 'in', value: ['couple_with_children', 'single_parent', 'recomposed'] },
  },
  {
    id: 'professional_status',
    quadrant: 'profil_express',
    label: 'Quel est votre statut professionnel ?',
    type: 'select',
    required: true,
    options: [
      { value: 'employee', label: 'Salarié(e)' },
      { value: 'civil_servant', label: 'Fonctionnaire' },
      { value: 'independent', label: 'Indépendant(e) / profession libérale' },
      { value: 'business_owner', label: 'Chef d\'entreprise' },
      { value: 'retired', label: 'Retraité(e)' },
      { value: 'student', label: 'Étudiant(e)' },
      { value: 'inactive', label: 'Sans activité professionnelle' },
    ],
  },
  {
    id: 'income_contributors',
    quadrant: 'profil_express',
    label: 'Combien de personnes contribuent aux revenus de votre foyer ?',
    helpText: 'Cette information nous aide à évaluer la vulnérabilité financière de votre foyer en cas d\'imprévu.',
    type: 'select',
    required: true,
    options: [
      { value: 'one', label: 'Une seule personne' },
      { value: 'two', label: 'Deux personnes' },
      { value: 'more', label: 'Plus de deux' },
    ],
  },
  {
    id: 'life_event',
    quadrant: 'profil_express',
    label: 'Avez-vous un changement de situation prévu dans les 12 prochains mois ?',
    helpText: 'Un changement de vie est souvent le bon moment pour revoir sa protection.',
    type: 'multi_select',
    required: true,
    options: [
      { value: 'none', label: 'Aucun changement prévu' },
      { value: 'marriage', label: 'Mariage / Partenariat' },
      { value: 'birth', label: 'Naissance attendue' },
      { value: 'property_purchase', label: 'Achat immobilier' },
      { value: 'move', label: 'Déménagement' },
      { value: 'retirement', label: 'Départ à la retraite' },
      { value: 'new_vehicle', label: 'Achat de véhicule' },
      { value: 'renovation', label: 'Travaux / rénovation' },
      { value: 'career_change', label: 'Changement professionnel' },
      { value: 'divorce', label: 'Séparation / divorce' },
    ],
  },

  // ══════════════════════════════════════════
  // QUADRANT 1 : PROTECTION DES BIENS (7 questions)
  // ══════════════════════════════════════════
  {
    id: 'housing_status',
    quadrant: 'biens',
    label: 'Êtes-vous propriétaire ou locataire de votre logement principal ?',
    type: 'select',
    required: true,
    options: [
      { value: 'owner_no_mortgage', label: 'Propriétaire sans crédit' },
      { value: 'owner_with_mortgage', label: 'Propriétaire avec crédit immobilier' },
      { value: 'tenant', label: 'Locataire' },
      { value: 'lodged_free', label: 'Logé(e) à titre gratuit' },
    ],
  },
  {
    id: 'housing_type',
    quadrant: 'biens',
    label: 'Quel est le type de votre logement ?',
    type: 'select',
    required: true,
    options: [
      { value: 'apartment', label: 'Appartement' },
      { value: 'house', label: 'Maison individuelle' },
      { value: 'townhouse', label: 'Maison mitoyenne' },
      { value: 'other', label: 'Autre (studio, loft, etc.)' },
    ],
  },
  {
    id: 'home_specifics',
    quadrant: 'biens',
    label: 'Votre logement dispose-t-il de l\'un de ces éléments ?',
    helpText: 'Sélectionnez tout ce qui correspond.',
    type: 'multi_select',
    required: true,
    dependsOn: { questionId: 'housing_type', operator: 'in', value: ['house', 'townhouse'] },
    options: [
      { value: 'none', label: 'Aucun de ces éléments' },
      { value: 'garden', label: 'Jardin aménagé' },
      { value: 'pool', label: 'Piscine' },
      { value: 'solar_panels', label: 'Panneaux solaires / pompe à chaleur' },
      { value: 'wine_cellar', label: 'Cave à vin' },
      { value: 'outbuildings', label: 'Dépendances (garage, abri, etc.)' },
    ],
  },
  {
    id: 'home_contents_value',
    quadrant: 'biens',
    label: 'Comment estimez-vous la valeur globale du contenu de votre logement ?',
    helpText: 'Mobilier, électroménager, vêtements, équipements... Une estimation approximative suffit.',
    type: 'select',
    required: true,
    options: [
      { value: 'less_20k', label: 'Moins de 20 000 €' },
      { value: '20k_50k', label: '20 000 - 50 000 €' },
      { value: '50k_100k', label: '50 000 - 100 000 €' },
      { value: '100k_plus', label: 'Plus de 100 000 €' },
    ],
  },
  {
    id: 'valuable_possessions',
    quadrant: 'biens',
    label: 'Possédez-vous des biens de valeur particulière ?',
    helpText: 'Sélectionnez les catégories qui vous concernent.',
    type: 'multi_select',
    required: true,
    options: [
      { value: 'none', label: 'Non, rien de particulier' },
      { value: 'jewelry', label: 'Bijoux / montres de valeur' },
      { value: 'art', label: 'Œuvres d\'art / antiquités' },
      { value: 'collections', label: 'Collections (timbres, pièces, vins, etc.)' },
      { value: 'multimedia', label: 'Équipement multimédia haut de gamme' },
      { value: 'sports_leisure', label: 'Équipement de loisirs coûteux (ski, golf, vélo...)' },
      { value: 'sustainable_mobility', label: 'Mobilité durable (vélo électrique, trottinette...)' },
    ],
  },
  {
    id: 'valuable_total_estimate',
    quadrant: 'biens',
    label: 'Quelle est la valeur totale estimée de ces biens particuliers ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'valuable_possessions', operator: 'not_contains', value: 'none' },
    options: [
      { value: 'less_5k', label: 'Moins de 5 000 €' },
      { value: '5k_15k', label: '5 000 - 15 000 €' },
      { value: '15k_50k', label: '15 000 - 50 000 €' },
      { value: '50k_plus', label: 'Plus de 50 000 €' },
    ],
  },
  {
    id: 'security_measures',
    quadrant: 'biens',
    label: 'Votre logement dispose-t-il de mesures de sécurité ?',
    type: 'multi_select',
    required: true,
    options: [
      { value: 'none', label: 'Aucune mesure particulière' },
      { value: 'alarm', label: 'Système d\'alarme' },
      { value: 'safe', label: 'Coffre-fort' },
      { value: 'reinforced_door', label: 'Porte blindée / serrure renforcée' },
      { value: 'camera', label: 'Caméra de surveillance' },
    ],
  },

  // ══════════════════════════════════════════
  // QUADRANT 2 : PROTECTION DES PERSONNES (7 questions)
  // ══════════════════════════════════════════
  {
    id: 'travel_frequency',
    quadrant: 'personnes',
    label: 'À quelle fréquence voyagez-vous à l\'étranger ?',
    helpText: 'Voyages privés (vacances, visites familiales, etc.).',
    type: 'select',
    required: true,
    options: [
      { value: 'never', label: 'Jamais ou très rarement' },
      { value: 'once_year', label: '1 à 2 fois par an' },
      { value: 'several_year', label: '3 fois ou plus par an' },
      { value: 'frequent', label: 'Très fréquemment (mensuel ou plus)' },
    ],
  },
  {
    id: 'travel_destinations',
    quadrant: 'personnes',
    label: 'Où voyagez-vous principalement ?',
    type: 'multi_select',
    required: true,
    dependsOn: { questionId: 'travel_frequency', operator: 'neq', value: 'never' },
    options: [
      { value: 'europe', label: 'Europe' },
      { value: 'worldwide', label: 'Hors Europe' },
      { value: 'adventure', label: 'Destinations aventure / trek / nature' },
    ],
  },
  {
    id: 'travel_budget',
    quadrant: 'personnes',
    label: 'Quel est le budget moyen de vos voyages (par voyage) ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'travel_frequency', operator: 'neq', value: 'never' },
    options: [
      { value: 'less_1k', label: 'Moins de 1 000 €' },
      { value: '1k_3k', label: '1 000 - 3 000 €' },
      { value: '3k_5k', label: '3 000 - 5 000 €' },
      { value: '5k_plus', label: 'Plus de 5 000 €' },
    ],
  },
  {
    id: 'sports_activities',
    quadrant: 'personnes',
    label: 'Pratiquez-vous des activités sportives ou de loisirs régulièrement ?',
    helpText: 'Sélectionnez les activités qui vous concernent.',
    type: 'multi_select',
    required: true,
    options: [
      { value: 'none', label: 'Pas d\'activité sportive régulière' },
      { value: 'running_cycling', label: 'Course à pied / cyclisme' },
      { value: 'team_sports', label: 'Sports d\'équipe (football, basketball...)' },
      { value: 'winter_sports', label: 'Sports d\'hiver (ski, snowboard...)' },
      { value: 'water_sports', label: 'Sports nautiques (voile, plongée, surf...)' },
      { value: 'mountain_outdoor', label: 'Montagne / randonnée / escalade' },
      { value: 'equestrian', label: 'Équitation' },
      { value: 'motor_sports', label: 'Sports moteur (karting, moto cross...)' },
      { value: 'combat_contact', label: 'Sports de combat / contact' },
    ],
  },
  // RC vie privée retirée — intégrée dans HOME
  {
    id: 'accident_coverage_existing',
    quadrant: 'personnes',
    label: 'Disposez-vous actuellement d\'une assurance accident individuelle ?',
    helpText: 'En dehors de ce que votre employeur propose éventuellement.',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'Non, aucune couverture' },
      { value: 'employer_only', label: 'Uniquement par mon employeur' },
      { value: 'individual_basic', label: 'Oui, une assurance accident basique' },
      { value: 'individual_complete', label: 'Oui, une assurance accident complète' },
    ],
  },
  {
    id: 'travel_coverage_existing',
    quadrant: 'personnes',
    label: 'Disposez-vous d\'une assurance voyage ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'travel_frequency', operator: 'neq', value: 'never' },
    options: [
      { value: 'none', label: 'Non, aucune' },
      { value: 'credit_card', label: 'Uniquement via ma carte bancaire' },
      { value: 'annual', label: 'Oui, un contrat annuel' },
      { value: 'per_trip', label: 'Oui, je souscris au cas par cas' },
    ],
  },

  // ══════════════════════════════════════════
  // QUADRANT 3 : PROTECTION DES PROJETS (6 questions)
  // ══════════════════════════════════════════
  {
    id: 'vehicle_count',
    quadrant: 'biens',
    label: 'Combien de véhicules votre foyer possède-t-il ?',
    helpText: 'Voitures, utilitaires, motos, scooters...',
    type: 'number',
    required: true,
  },
  {
    id: 'vehicle_details',
    quadrant: 'biens',
    label: 'Quel est l\'âge de votre véhicule principal ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'vehicle_count', operator: 'gt', value: 0 },
    options: [
      { value: 'car_new', label: 'Moins de 3 ans' },
      { value: 'car_recent', label: 'De 3 à 8 ans' },
      { value: 'car_old', label: 'Plus de 8 ans' },
    ],
  },
  {
    id: 'vehicle_usage',
    quadrant: 'biens',
    label: 'Quelle est l\'utilisation principale de votre véhicule ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'vehicle_count', operator: 'gt', value: 0 },
    options: [
      { value: 'daily_commute', label: 'Trajets quotidiens (domicile-travail)' },
      { value: 'professional', label: 'Usage professionnel (rendez-vous, livraisons...)' },
      { value: 'leisure', label: 'Loisirs exclusivement' },
    ],
  },
  {
    id: 'vehicle_coverage_existing',
    quadrant: 'biens',
    label: 'Quelle est votre couverture auto actuelle ?',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'vehicle_count', operator: 'gt', value: 0 },
    options: [
      { value: 'none', label: 'Pas de véhicule assuré chez Baloise' },
      { value: 'rc_only', label: 'RC (responsabilité civile) uniquement' },
      { value: 'mini_omnium', label: 'Dommages hors accidents (vol, incendie, bris de glace...)' },
      { value: 'full_omnium', label: 'Tous dommages' },
      { value: 'unknown', label: 'Je ne sais pas exactement' },
    ],
  },
  {
    id: 'vehicle_options_interest',
    quadrant: 'biens',
    label: 'Parmi ces situations, lesquelles vous concernent ?',
    helpText: 'Ces éléments nous aident à évaluer vos besoins complémentaires.',
    type: 'multi_select',
    required: true,
    dependsOn: { questionId: 'vehicle_count', operator: 'gt', value: 0 },
    options: [
      { value: 'none', label: 'Aucune de ces situations' },
      { value: 'new_vehicle_value', label: 'Mon véhicule est récent et je souhaite protéger sa valeur' },
      { value: 'replacement_needed', label: 'Je ne pourrais pas me passer de véhicule, même quelques jours' },
      { value: 'professional_equipment', label: 'Je transporte du matériel professionnel ou des bagages de valeur' },
      { value: 'vehicle_customized', label: 'Mon véhicule a des aménagements ou accessoires spécifiques' },
      { value: 'bonus_important', label: 'Mon bonus est important pour moi, je ne veux pas le perdre' },
    ],
  },
  {
    id: 'home_coverage_existing',
    quadrant: 'biens',
    label: 'Disposez-vous d\'une assurance habitation ?',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'Non, aucune' },
      { value: 'basic', label: 'Oui, couverture risques importants' },
      { value: 'with_options', label: 'Oui, couverture étendue' },
      { value: 'unknown', label: 'Je ne sais pas exactement' },
    ],
  },

  // ══════════════════════════════════════════
  // QUADRANT 4 : PROTECTION DU FUTUR (6 questions)
  // ══════════════════════════════════════════
  {
    id: 'income_range',
    quadrant: 'profil_express',
    label: 'Dans quelle tranche se situent les revenus nets mensuels de votre foyer ?',
    helpText: 'Cette information reste strictement confidentielle. Elle nous permet d\'évaluer l\'impact financier d\'un arrêt de travail ou d\'une incapacité.',
    type: 'select',
    required: true,
    options: [
      { value: 'less_3k', label: 'Moins de 3 000 €' },
      { value: '3k_5k', label: '3 000 - 5 000 €' },
      { value: '5k_8k', label: '5 000 - 8 000 €' },
      { value: '8k_12k', label: '8 000 - 12 000 €' },
      { value: '12k_plus', label: 'Plus de 12 000 €' },
      { value: 'no_answer', label: 'Je préfère ne pas répondre' },
    ],
  },
  {
    id: 'financial_dependents',
    quadrant: 'personnes',
    label: 'Des personnes dépendent-elles financièrement de vous ?',
    helpText: 'Conjoint(e), enfants, parents âgés, ou toute personne à votre charge.',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'Non, personne' },
      { value: 'partner', label: 'Mon/ma conjoint(e)' },
      { value: 'children', label: 'Mes enfants uniquement' },
      { value: 'partner_children', label: 'Mon/ma conjoint(e) et mes enfants' },
      { value: 'extended', label: 'Ma famille élargie (parents, etc.)' },
    ],
  },
  {
    id: 'work_incapacity_concern',
    quadrant: 'personnes',
    label: 'En cas d\'arrêt de travail prolongé, combien de temps pourriez-vous maintenir votre niveau de vie ?',
    helpText: 'Tenez compte de votre épargne disponible et de la couverture éventuelle de votre employeur.',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'professional_status', operator: 'not_in', value: ['retired', 'inactive', 'student'] },
    options: [
      { value: 'less_1_month', label: 'Moins d\'un mois' },
      { value: '1_3_months', label: '1 à 3 mois' },
      { value: '3_6_months', label: '3 à 6 mois' },
      { value: '6_12_months', label: '6 à 12 mois' },
      { value: 'more_12_months', label: 'Plus de 12 mois' },
    ],
  },
  {
    id: 'savings_protection',
    quadrant: 'futur',
    label: 'Avez-vous mis en place une épargne ou un dispositif pour protéger votre avenir ?',
    type: 'multi_select',
    required: true,
    options: [
      { value: 'none', label: 'Non, rien de spécifique' },
      { value: 'life_insurance', label: 'Assurance-vie' },
      { value: 'pension_plan', label: 'Plan de pension complémentaire' },
      { value: 'pension_employer', label: 'Pension complémentaire employeur (2ème pilier)' },
      { value: 'savings_regular', label: 'Épargne régulière' },
      { value: 'real_estate', label: 'Investissement immobilier' },
    ],
  },
  {
    id: 'other_properties',
    quadrant: 'futur',
    label: 'Possédez-vous d\'autres biens immobiliers (résidence secondaire, investissement locatif) ?',
    type: 'select',
    required: true,
    options: [
      { value: 'none', label: 'Non' },
      { value: 'secondary', label: 'Une résidence secondaire' },
      { value: 'rental', label: 'Un ou plusieurs biens locatifs' },
      { value: 'both', label: 'Résidence secondaire et biens locatifs' },
    ],
  },
  {
    id: 'esg_interest',
    quadrant: 'futur',
    label: 'L\'investissement durable (environnement, social, gouvernance) est-il important pour vous ?',
    helpText: 'Certaines solutions d\'épargne permettent d\'investir exclusivement dans des fonds durables certifiés.',
    type: 'select',
    required: true,
    dependsOn: { questionId: 'residence_status', operator: 'eq', value: 'resident_gdl' },
    options: [
      { value: 'yes', label: 'Oui, c\'est un critère important' },
      { value: 'neutral', label: 'Pourquoi pas, si les performances sont comparables' },
      { value: 'no', label: 'Non, ce n\'est pas un critère' },
    ],
  },
]

// === Helpers ===

export function getQuadrantQuestions(quadrant: QuestionQuadrant): Question[] {
  return QUESTIONS.filter(q => q.quadrant === quadrant)
}

/** Check if a question is visible given current answers */
export function isQuestionVisible(question: Question, answers: QuestionnaireAnswers): boolean {
  if (!question.dependsOn) return true

  const dep = question.dependsOn
  const depValue = answers[dep.questionId]

  switch (dep.operator) {
    case 'eq':
      return depValue === dep.value
    case 'neq':
      return depValue !== dep.value
    case 'in':
      return Array.isArray(dep.value) && dep.value.includes(depValue as string | number | boolean)
    case 'not_in':
      return Array.isArray(dep.value) && !dep.value.includes(depValue as string | number | boolean)
    case 'gt':
      return typeof depValue === 'number' && depValue > (dep.value as number)
    case 'gte':
      return typeof depValue === 'number' && depValue >= (dep.value as number)
    case 'contains': {
      // For multi_select: check if the array answer contains the value
      if (Array.isArray(depValue)) return depValue.includes(dep.value as string)
      return depValue === dep.value
    }
    case 'not_contains': {
      // For multi_select: check if the array answer does NOT contain the value
      if (Array.isArray(depValue)) return !depValue.includes(dep.value as string)
      return depValue !== dep.value
    }
    default:
      return true
  }
}
