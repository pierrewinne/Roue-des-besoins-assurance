import type { Quadrant, QuadrantScore, Recommendation } from './types.ts'
import { asString as s, asNumber as n, asStringArray as arr, includesAny, HIGH_RISK_SPORTS } from './answer-helpers.ts'

type Answers = Record<string, unknown>

interface RuleDefinition {
  id: string
  condition: (scores: Record<Quadrant, QuadrantScore>, a: Answers) => boolean
  recommendation: Omit<Recommendation, 'id'>
}

// ═══════════════════════════════════════════
// DRIVE rules (8)
// ═══════════════════════════════════════════

const driveRules: RuleDefinition[] = [
  {
    id: 'drive_01_recent_no_omnium',
    condition: (_, a) =>
      ['car_new', 'electric', 'suv_crossover'].includes(s(a.vehicle_details)) &&
      ['rc_only', 'none', 'unknown'].includes(s(a.vehicle_coverage_existing)),
    recommendation: {
      product: 'drive', optionId: 'drive_dommages_materiels',
      type: 'immediate', priority: 5,
      title: 'Protéger votre véhicule récent',
      message: 'Votre véhicule représente un investissement important. Avec une couverture RC seule, un sinistre total, un vol ou un incendie ne serait pas remboursé. La couverture Omnium protège la valeur de votre véhicule.',
      advisorNote: 'Véhicule < 3 ans ou électrique/SUV avec RC seule. Argumenter sur le coût de remplacement vs le coût de la prime Omnium.',
    },
  },
  {
    id: 'drive_02_old_with_omnium',
    condition: (_, a) =>
      s(a.vehicle_details) === 'car_old' && s(a.vehicle_coverage_existing) === 'full_omnium',
    recommendation: {
      product: 'drive',
      type: 'optimization', priority: 2,
      title: 'Optimiser votre couverture auto',
      message: 'Votre véhicule a plus de 8 ans. Vérifiez que le coût de votre omnium reste cohérent avec la valeur du véhicule. Une Mini-Omnium pourrait vous offrir une protection adaptée à moindre coût.',
      advisorNote: 'Vérifier la valeur résiduelle. Si prime omnium > 10% de la valeur véhicule, migration vers mini-omnium ou RC à étudier.',
    },
  },
  {
    id: 'drive_03_electric_no_protection',
    condition: (_, a) =>
      s(a.vehicle_details) === 'electric' && s(a.vehicle_coverage_existing) !== 'full_omnium',
    recommendation: {
      product: 'drive', optionId: 'drive_pack_indemnisation',
      type: 'immediate', priority: 4,
      title: 'Protéger votre véhicule électrique',
      message: 'Les réparations d\'un véhicule électrique coûtent en moyenne 30% de plus qu\'un véhicule thermique, et la batterie représente une part importante de la valeur. Une couverture Omnium avec protection de la valeur est d\'autant plus pertinente.',
      advisorNote: 'Argumenter sur le coût de la batterie (30-40% de la valeur du véhicule). Le pack indemnisation est un upsell naturel.',
    },
  },
  {
    id: 'drive_04_mobility_need',
    condition: (_, a) =>
      n(a.vehicle_count) > 0 &&
      (['daily_commute', 'professional'].includes(s(a.vehicle_usage)) || arr(a.vehicle_options_interest).includes('replacement_needed')) &&
      s(a.vehicle_coverage_existing) !== 'full_omnium',
    recommendation: {
      product: 'drive', optionId: 'drive_pack_mobilite',
      type: 'immediate', priority: 3,
      title: 'Garantir votre mobilité',
      message: 'Vous dépendez de votre véhicule au quotidien. En cas de sinistre ou de panne, le véhicule de remplacement vous garantit de rester mobile sans délai.',
      advisorNote: 'Le Pack Mobilité inclut véhicule de remplacement + taxi + bagages. Argumenter sur le coût d\'une location vs le coût du pack.',
    },
  },
  {
    id: 'drive_05_bonus_protection',
    condition: (_, a) => arr(a.vehicle_options_interest).includes('bonus_important'),
    recommendation: {
      product: 'drive', optionId: 'drive_pack_indemnisation',
      type: 'deferred', priority: 3,
      title: 'Préserver votre bonus',
      message: 'Votre bonus représente une économie significative sur votre prime. La protection bonus évite une majoration après un sinistre responsable, pour une cotisation modeste.',
      advisorNote: 'Pack Indemnisation. Chiffrer l\'économie de bonus sur 3 ans vs le coût du pack.',
    },
  },
  {
    id: 'drive_06_custom_vehicle',
    condition: (_, a) => arr(a.vehicle_options_interest).includes('vehicle_customized'),
    recommendation: {
      product: 'drive', optionId: 'drive_pack_amenagement',
      type: 'deferred', priority: 3,
      title: 'Couvrir vos aménagements',
      message: 'Les aménagements spécifiques et accessoires de votre véhicule ne sont pas couverts par la garantie standard. Le Pack Aménagement protège votre investissement.',
      advisorNote: 'Pack Aménagement. Pertinent surtout pour utilitaires aménagés et véhicules avec accessoires aftermarket.',
    },
  },
  {
    id: 'drive_07_professional_transport',
    condition: (_, a) => arr(a.vehicle_options_interest).includes('professional_equipment'),
    recommendation: {
      product: 'drive', optionId: 'drive_pack_mobilite',
      type: 'deferred', priority: 3,
      title: 'Protéger votre matériel en déplacement',
      message: 'Le matériel professionnel ou les bagages de valeur que vous transportez ne sont pas couverts par l\'assurance auto de base. Le Pack Mobilité étend la couverture aux biens transportés.',
      advisorNote: 'Composante Bagages/Marchandises du Pack Mobilité. Évaluer la valeur du matériel transporté.',
    },
  },
  {
    id: 'drive_08_new_vehicle_event',
    condition: (_, a) => arr(a.life_event).includes('new_vehicle'),
    recommendation: {
      product: 'drive',
      type: 'event', priority: 4,
      title: 'Anticiper la couverture de votre futur véhicule',
      message: 'L\'achat d\'un véhicule est le moment idéal pour choisir une couverture adaptée. Votre conseiller peut préparer un devis personnalisé avant même la livraison.',
      advisorNote: 'Opportunité Omnium + packs. Proposer un RDV avant l\'achat pour optimiser la couverture.',
    },
  },
]

// ═══════════════════════════════════════════
// B-SAFE rules (12)
// ═══════════════════════════════════════════

const bsafeRules: RuleDefinition[] = [
  {
    id: 'bsafe_01_family_single_income',
    condition: (_, a) =>
      ['couple_with_children', 'single_parent', 'recomposed'].includes(s(a.family_status)) &&
      s(a.income_contributors) === 'one' &&
      ['none', 'employer_only'].includes(s(a.accident_coverage_existing)),
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_deces',
      type: 'immediate', priority: 5,
      title: 'Protéger votre famille',
      message: 'Avec un seul revenu et des personnes à charge, un accident grave ou un décès aurait des conséquences financières immédiates pour votre famille. C\'est la priorité numéro un de votre protection.',
      advisorNote: 'B-Safe complet : Décès + Invalidité + Incapacité. Capital décès à dimensionner sur 3-5 ans de revenus. C\'est LA recommandation prioritaire.',
    },
  },
  {
    id: 'bsafe_02_independent_no_coverage',
    condition: (_, a) =>
      ['independent', 'business_owner'].includes(s(a.professional_status)) &&
      ['none', 'employer_only'].includes(s(a.accident_coverage_existing)),
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_incapacite',
      type: 'immediate', priority: 5,
      title: 'Sécuriser votre activité',
      message: 'En tant qu\'indépendant, vous ne bénéficiez pas des filets de sécurité d\'un salarié. Un arrêt de travail prolongé impacte directement vos revenus et votre activité. La couverture incapacité de travail est essentielle.',
      advisorNote: 'B-Safe Incapacité de Travail en priorité. Puis Décès/Invalidité si personnes à charge. L\'indépendant est le profil à plus forte valeur B-Safe.',
    },
  },
  {
    id: 'bsafe_03_low_autonomy',
    condition: (_, a) =>
      ['less_1_month', '1_3_months'].includes(s(a.work_incapacity_concern)) &&
      !['less_3k', 'no_answer'].includes(s(a.income_range)),
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_incapacite',
      type: 'immediate', priority: 5,
      title: 'Sécuriser vos revenus en cas d\'arrêt',
      message: 'Avec moins de 3 mois d\'autonomie financière, un arrêt de travail prolongé mettrait votre foyer en difficulté rapidement. L\'assurance incapacité de travail maintient vos revenus pendant votre convalescence.',
      advisorNote: 'B-Safe Incapacité + Hospitalisation. Chiffrer : X EUR de revenus mensuels x 6 mois = Y EUR de manque à gagner. Argument imbattable.',
    },
  },
  {
    id: 'bsafe_04_sports_risk',
    condition: (_, a) => {
      const sports = arr(a.sports_activities)
      return includesAny(sports, HIGH_RISK_SPORTS) && ['none', 'employer_only'].includes(s(a.accident_coverage_existing))
    },
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_invalidite',
      type: 'immediate', priority: 4,
      title: 'Vous couvrir pour vos activités sportives',
      message: 'Vos activités sportives vous exposent à un risque d\'accident plus élevé. Une couverture accident dédiée vous protège, y compris pour les suites médicales et la rééducation.',
      advisorNote: 'B-Safe avec options sport. Vérifier que les activités ne tombent pas dans les exclusions IPID (courses, concours).',
    },
  },
  {
    id: 'bsafe_05_children_coverage',
    condition: (_, a) =>
      n(a.children_count) > 0 && ['none', 'employer_only'].includes(s(a.accident_coverage_existing)),
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_frais_divers',
      type: 'deferred', priority: 4,
      title: 'Protéger vos enfants en cas d\'accident',
      message: 'En cas d\'hospitalisation, qui s\'occupe de vos enfants ? Les options garde d\'enfants, rattrapage scolaire et rooming-in sécurisent votre famille au quotidien pendant votre rétablissement.',
      advisorNote: 'B-Safe Frais divers (garde enfants, rattrapage scolaire, rooming-in). Argument émotionnel fort.',
    },
  },
  {
    id: 'bsafe_06_aging_parents',
    condition: (_, a) => arr(a.health_concerns).includes('aging_parents'),
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_aide_menagere',
      type: 'deferred', priority: 3,
      title: 'Vous protéger pour continuer à accompagner vos proches',
      message: 'Si vous accompagnez des parents âgés, une immobilisation suite à un accident rendrait cette aide impossible. L\'option aide ménagère et soins à domicile vous soutient pendant votre rétablissement.',
      advisorNote: 'B-Safe Aide ménagère/Soins à domicile. Argument : qui prend le relais si vous ne pouvez plus vous déplacer ?',
    },
  },
  {
    id: 'bsafe_07_mortgage_no_death_cover',
    condition: (_, a) =>
      s(a.housing_status) === 'owner_with_mortgage' &&
      ['none', 'employer_only'].includes(s(a.accident_coverage_existing)) &&
      !arr(a.savings_protection).includes('life_insurance'),
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_deces',
      type: 'immediate', priority: 5,
      title: 'Protéger votre famille et votre logement',
      message: 'En cas de décès, votre famille devrait assumer le remboursement du crédit immobilier. Un capital décès adapté au solde de votre emprunt garantit le maintien dans le logement.',
      advisorNote: 'B-Safe Décès. Capital = solde restant du crédit. Cross-sell naturel avec Home.',
    },
  },
  {
    id: 'bsafe_08_no_pension_over_45',
    condition: (_, a) =>
      ['46_55', '56_65'].includes(s(a.age_range)) &&
      !arr(a.savings_protection).includes('pension_plan') &&
      !arr(a.savings_protection).includes('life_insurance'),
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_rente',
      type: 'deferred', priority: 4,
      title: 'Anticiper votre protection long terme',
      message: 'Sans pension complémentaire ni assurance-vie, une invalidité permanente pourrait réduire drastiquement vos revenus futurs. La rente viagère d\'invalidité sécurise votre avenir.',
      advisorNote: 'B-Safe Rente Viagère. Au Luxembourg, le taux de remplacement retraite diminue. Argumenter sur l\'écart pension légale vs niveau de vie actuel.',
    },
  },
  {
    id: 'bsafe_09_physical_exposure',
    condition: (_, a) => {
      const concerns = arr(a.health_concerns)
      return (concerns.includes('physical_job') || concerns.includes('frequent_driving')) &&
        ['none', 'employer_only'].includes(s(a.accident_coverage_existing))
    },
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_hospitalisation',
      type: 'immediate', priority: 3,
      title: 'Adapter votre protection à votre quotidien',
      message: 'Votre activité et vos déplacements vous exposent davantage aux risques d\'accident. Une couverture étendue incluant l\'hospitalisation et les frais médicaux est recommandée.',
      advisorNote: 'B-Safe étendu (Hospitalisation + Frais divers). Pour les frontaliers : argumenter sur le temps de trajet.',
    },
  },
  {
    id: 'bsafe_10_birth_event',
    condition: (_, a) => arr(a.life_event).includes('birth'),
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_deces',
      type: 'event', priority: 5,
      title: 'Préparer la protection de votre famille',
      message: 'L\'arrivée d\'un enfant change tout. C\'est le moment idéal pour sécuriser l\'avenir de votre famille avec une couverture décès et invalidité adaptée à votre nouvelle situation.',
      advisorNote: 'B-Safe Décès + Invalidité. Moment émotionnel fort. Inclure les options garde/rooming-in/rattrapage scolaire.',
    },
  },
  {
    id: 'bsafe_11_retirement_event',
    condition: (_, a) => arr(a.life_event).includes('retirement'),
    recommendation: {
      product: 'bsafe',
      type: 'event', priority: 4,
      title: 'Adapter votre protection à la retraite',
      message: 'Le passage à la retraite modifie profondément votre protection. La couverture employeur disparaît, les risques de santé augmentent. Un bilan complet vous permettra d\'anticiper sereinement.',
      advisorNote: 'Revoir l\'intégralité de la couverture. La prévoyance employeur s\'arrête. B-Safe personnel devient indispensable.',
    },
  },
  {
    id: 'bsafe_12_divorce_event',
    condition: (_, a) => arr(a.life_event).includes('divorce'),
    recommendation: {
      product: 'bsafe',
      type: 'event', priority: 4,
      title: 'Revoir votre protection après une séparation',
      message: 'Une séparation modifie votre situation financière et vos bénéficiaires. C\'est le moment de mettre à jour votre couverture pour qu\'elle corresponde à votre nouvelle réalité.',
      advisorNote: 'Revoir tous les contrats : bénéficiaires B-Safe, couverture Home, Drive. Approche globale.',
    },
  },
]

// ═══════════════════════════════════════════
// HOME rules (15)
// ═══════════════════════════════════════════

const homeRules: RuleDefinition[] = [
  {
    id: 'home_01_tenant_no_coverage',
    condition: (_, a) =>
      s(a.housing_status) === 'tenant' && s(a.home_coverage_existing) === 'none',
    recommendation: {
      product: 'home',
      type: 'immediate', priority: 5,
      title: 'Sécuriser votre logement',
      message: 'En tant que locataire, vous êtes responsable des dommages causés au logement (dégât des eaux, incendie). Une assurance habitation protège votre responsabilité et vos biens.',
      advisorNote: 'Au Luxembourg, l\'assurance habitation n\'est pas légalement obligatoire pour les locataires mais quasi systématiquement exigée par les bailleurs. Vérifier le bail.',
    },
  },
  {
    id: 'home_02_owner_mortgage_gap',
    condition: (_, a) =>
      s(a.housing_status) === 'owner_with_mortgage' &&
      ['none', 'unknown'].includes(s(a.home_coverage_existing)),
    recommendation: {
      product: 'home',
      type: 'immediate', priority: 5,
      title: 'Protéger votre investissement immobilier',
      message: 'Avec un crédit immobilier en cours, une couverture habitation complète protège votre bien et votre famille. En cas de sinistre grave, c\'est votre patrimoine qui est en jeu.',
      advisorNote: 'Vérifier si la banque exige une assurance. Proposer Home complet + prévoyance emprunteur (B-Safe).',
    },
  },
  {
    id: 'home_03_garden_pool',
    condition: (_, a) => {
      const specifics = arr(a.home_specifics)
      return (specifics.includes('garden') || specifics.includes('pool')) &&
        s(a.home_coverage_existing) !== 'with_options'
    },
    recommendation: {
      product: 'home', optionId: 'home_pack_jardin_piscine',
      type: 'deferred', priority: 3,
      title: 'Couvrir vos espaces extérieurs',
      message: 'Votre jardin aménagé et/ou votre piscine ne sont pas couverts par l\'assurance habitation de base. Le Pack Jardin/Piscine protège vos aménagements extérieurs contre les intempéries, le gel et les dommages accidentels.',
      advisorNote: 'Pack Jardin/Piscine. Chiffrer la valeur des aménagements extérieurs.',
    },
  },
  {
    id: 'home_04_solar_panels',
    condition: (_, a) =>
      arr(a.home_specifics).includes('solar_panels') &&
      s(a.home_coverage_existing) !== 'with_options',
    recommendation: {
      product: 'home', optionId: 'home_pack_energie_renouvelable',
      type: 'deferred', priority: 3,
      title: 'Protéger vos installations d\'énergie renouvelable',
      message: 'Vos panneaux solaires ou votre pompe à chaleur représentent un investissement de plusieurs milliers d\'euros. Le Pack Énergie Renouvelable couvre les dommages spécifiques à ces installations.',
      advisorNote: 'Pack Énergie Renouvelable. Au Luxembourg, investissement moyen 10-20k EUR. Argument : subventions ne couvrent que l\'installation, pas le remplacement en cas de sinistre.',
    },
  },
  {
    id: 'home_05_wine_cellar',
    condition: (_, a) => arr(a.home_specifics).includes('wine_cellar'),
    recommendation: {
      product: 'home', optionId: 'home_pack_cave_vin',
      type: 'deferred', priority: 2,
      title: 'Assurer votre cave à vin',
      message: 'Votre cave à vin est un patrimoine sensible aux variations de température, au bris accidentel et au vol. Le Pack Cave à Vin couvre sa valeur réelle.',
      advisorNote: 'Pack Cave à Vin/Denrées. Question sur la valeur estimée de la cave pour dimensionner.',
    },
  },
  {
    id: 'home_06_multimedia',
    condition: (_, a) =>
      arr(a.valuable_possessions).includes('multimedia') &&
      s(a.home_coverage_existing) !== 'with_options',
    recommendation: {
      product: 'home', optionId: 'home_pack_multimedia',
      type: 'deferred', priority: 3,
      title: 'Couvrir vos équipements multimédia',
      message: 'Vos équipements multimédia haut de gamme (ordinateurs, home cinéma, matériel photo...) dépassent souvent les plafonds de la couverture standard. Le Pack Multimédia protège leur valeur réelle.',
      advisorNote: 'Pack Multimédia. Lister les équipements concernés et chiffrer.',
    },
  },
  {
    id: 'home_07_sustainable_mobility',
    condition: (_, a) => arr(a.valuable_possessions).includes('sustainable_mobility'),
    recommendation: {
      product: 'home', optionId: 'home_pack_mobilite_durable',
      type: 'deferred', priority: 3,
      title: 'Protéger votre équipement de mobilité durable',
      message: 'Votre vélo électrique ou trottinette représente un investissement de plusieurs milliers d\'euros, souvent insuffisamment couvert. Le Pack Mobilité Durable protège contre le vol, la casse et les dommages.',
      advisorNote: 'Pack Mobilité Durable. Vélo électrique moyen 3-8k EUR au Luxembourg. Vol en forte hausse.',
    },
  },
  {
    id: 'home_08_high_value_items',
    condition: (_, a) => {
      const possessions = arr(a.valuable_possessions)
      return includesAny(possessions, ['jewelry', 'art', 'collections']) &&
        ['15k_50k', '50k_plus'].includes(s(a.valuable_total_estimate)) &&
        s(a.home_coverage_existing) !== 'with_options'
    },
    recommendation: {
      product: 'home', optionId: 'home_pack_objets_valeur',
      type: 'immediate', priority: 4,
      title: 'Assurer vos objets de valeur',
      message: 'Vos objets de valeur dépassent les plafonds de la couverture habitation standard. Sans assurance spécifique, vous ne seriez remboursé qu\'à hauteur d\'un plafond forfaitaire, très inférieur à leur valeur réelle.',
      advisorNote: 'Pack OV/Art ou Pack OP/Bijoux selon le type. Proposer une expertise pour les valeurs > 50k.',
    },
  },
  {
    id: 'home_09_sports_equipment',
    condition: (_, a) => arr(a.valuable_possessions).includes('sports_leisure'),
    recommendation: {
      product: 'home', optionId: 'home_pack_objets_loisirs',
      type: 'deferred', priority: 2,
      title: 'Couvrir votre équipement sportif',
      message: 'Votre équipement de loisirs coûteux (ski, golf, vélo...) n\'est généralement pas couvert par l\'assurance habitation standard, ni en dehors du domicile. Le Pack Objets de Loisirs étend la protection.',
      advisorNote: 'Pack Objets de Loisirs. Couvre aussi hors domicile (important pour équipement sportif).',
    },
  },
  {
    id: 'home_10_rc_vie_privee',
    condition: (_, a) =>
      ['no', 'unsure'].includes(s(a.has_rc_vie_privee)) &&
      (n(a.children_count) > 0 || (arr(a.sports_activities).length > 0 && !arr(a.sports_activities).includes('none'))),
    recommendation: {
      product: 'home', optionId: 'home_rc_vie_privee',
      type: 'immediate', priority: 4,
      title: 'Vous protéger en responsabilité civile',
      message: 'Avec des enfants ou une activité sportive, les risques de causer involontairement des dommages à des tiers sont réels. La RC Vie Privée vous protège contre les conséquences financières, partout dans le monde.',
      advisorNote: 'RC Vie Privée HOME. Couverture monde entier. Exemples concrets : enfant qui casse une vitre, collision à vélo, chute en ski blessant un tiers.',
    },
  },
  {
    id: 'home_11_no_security_valuables',
    condition: (_, a) =>
      arr(a.security_measures).includes('none') &&
      !arr(a.valuable_possessions).includes('none'),
    recommendation: {
      product: 'home', optionId: 'home_vol_vandalisme',
      type: 'immediate', priority: 4,
      title: 'Sécuriser et assurer vos biens de valeur',
      message: 'Vos biens de valeur sont conservés sans dispositif de sécurité particulier. L\'option Vol/Vandalisme est d\'autant plus recommandée. Votre conseiller peut aussi vous orienter vers des solutions de sécurisation adaptées.',
      advisorNote: 'Home Vol/Vandalisme en priorité. Conseil sécurité : proposer coffre-fort ou alarme pour réduire la prime.',
    },
  },
  {
    id: 'home_12_reequipement',
    condition: (_, a) =>
      ['50k_100k', '100k_plus'].includes(s(a.home_contents_value)) &&
      s(a.home_coverage_existing) !== 'with_options',
    recommendation: {
      product: 'home', optionId: 'home_reequipement_neuf',
      type: 'deferred', priority: 3,
      title: 'Protéger la valeur de remplacement de vos biens',
      message: 'En cas de sinistre, la valeur de remplacement de votre contenu peut être très différente de la valeur d\'usage. Le Rééquipement à neuf vous garantit le remplacement sans décote.',
      advisorNote: 'Rééquipement à neuf. Argument clé : la différence vétusté/neuf peut représenter 30-50% de la valeur.',
    },
  },
  {
    id: 'home_13_property_purchase',
    condition: (_, a) => arr(a.life_event).includes('property_purchase'),
    recommendation: {
      product: 'home',
      type: 'event', priority: 5,
      title: 'Sécuriser votre projet immobilier',
      message: 'L\'achat immobilier est le moment idéal pour mettre en place une couverture habitation complète. Votre conseiller peut préparer votre contrat en amont pour que vous soyez couvert dès l\'acte de vente.',
      advisorNote: 'Home complet + B-Safe prévoyance emprunteur. Proposer un RDV avant la signature. Cross-sell majeur.',
    },
  },
  {
    id: 'home_14_renovation',
    condition: (_, a) => arr(a.life_event).includes('renovation'),
    recommendation: {
      product: 'home',
      type: 'event', priority: 3,
      title: 'Adapter votre couverture à vos travaux',
      message: 'Des travaux de rénovation modifient la valeur de votre bien et potentiellement vos installations (énergie renouvelable, cuisine, salle de bain). Pensez à mettre à jour votre contrat habitation.',
      advisorNote: 'Réévaluation des capitaux + Pack Énergie Renouvelable si installation solaire/PAC.',
    },
  },
  {
    id: 'home_15_other_properties',
    condition: (_, a) => s(a.other_properties) !== 'none' && s(a.other_properties) !== '',
    recommendation: {
      product: 'home',
      type: 'deferred', priority: 3,
      title: 'Assurer vos autres biens immobiliers',
      message: 'Votre résidence secondaire ou vos biens locatifs nécessitent chacun une couverture adaptée. En tant que propriétaire bailleur, votre responsabilité est engagée.',
      advisorNote: 'Multi-contrat Home. Le bien locatif doit être couvert même si le locataire a sa propre assurance (responsabilité du propriétaire).',
    },
  },
]

// ═══════════════════════════════════════════
// TRAVEL rules (5)
// ═══════════════════════════════════════════

const travelRules: RuleDefinition[] = [
  {
    id: 'travel_01_frequent_no_annual',
    condition: (_, a) =>
      ['several_year', 'frequent'].includes(s(a.travel_frequency)) &&
      s(a.travel_coverage_existing) !== 'annual',
    recommendation: {
      product: 'travel',
      type: 'immediate', priority: 4,
      title: 'Opter pour une couverture voyage annuelle',
      message: 'Avec plusieurs voyages par an, un contrat annuel est plus économique et vous couvre en permanence, sans avoir à y penser à chaque départ.',
      advisorNote: 'Travel annuel. Chiffrer : coût de 2-3 contrats temporaires vs annuel. Argument de tranquillité.',
    },
  },
  {
    id: 'travel_02_worldwide_credit_card',
    condition: (_, a) =>
      arr(a.travel_destinations).includes('worldwide') &&
      s(a.travel_coverage_existing) === 'credit_card',
    recommendation: {
      product: 'travel',
      type: 'immediate', priority: 5,
      title: 'Renforcer votre couverture voyage hors Europe',
      message: 'Les couvertures des cartes bancaires ont des plafonds limités et des exclusions nombreuses. Hors Europe, une hospitalisation peut coûter des dizaines de milliers d\'euros. Une assurance voyage dédiée vous couvre sans surprise.',
      advisorNote: 'Travel complet. Exemples concrets : hospitalisation aux USA 5-20k EUR/jour. Rapatriement médical 15-50k EUR. La carte bancaire plafonne généralement à 10-15k EUR.',
    },
  },
  {
    id: 'travel_03_high_budget_no_cancel',
    condition: (_, a) =>
      ['3k_5k', '5k_plus'].includes(s(a.travel_budget)) &&
      ['none', 'credit_card'].includes(s(a.travel_coverage_existing)),
    recommendation: {
      product: 'travel',
      type: 'immediate', priority: 4,
      title: 'Protéger votre investissement voyage',
      message: 'Un voyage à plus de 3 000 EUR représente un investissement important. En cas d\'annulation pour maladie, accident ou imprévu familial, l\'assurance annulation vous rembourse les frais engagés.',
      advisorNote: 'Travel Annulation. Les causes d\'annulation couvertes sont larges : maladie, accident, décès d\'un proche, licenciement, convocation tribunal.',
    },
  },
  {
    id: 'travel_04_adventure_no_accident',
    condition: (_, a) =>
      arr(a.travel_destinations).includes('adventure') &&
      ['none', 'credit_card'].includes(s(a.travel_coverage_existing)),
    recommendation: {
      product: 'travel',
      type: 'immediate', priority: 3,
      title: 'Vous couvrir pour vos voyages aventure',
      message: 'Les destinations nature et aventure présentent des risques spécifiques (éloignement des structures médicales, activités de plein air). L\'assurance accident de voyage complète votre protection sur place.',
      advisorNote: 'Travel Accident + Assistance Personnes. Vérifier la compatibilité des activités prévues avec les exclusions (sports exclus dans l\'IPID).',
    },
  },
  {
    id: 'travel_05_family_travel',
    condition: (_, a) =>
      n(a.children_count) > 0 &&
      s(a.travel_frequency) !== 'never' &&
      ['none', 'credit_card'].includes(s(a.travel_coverage_existing)),
    recommendation: {
      product: 'travel',
      type: 'deferred', priority: 3,
      title: 'Couvrir toute la famille en voyage',
      message: 'Avec des enfants, les imprévus de voyage sont plus fréquents et plus complexes à gérer. La formule famille couvre tout le foyer sous un seul contrat, y compris l\'annulation et l\'assistance.',
      advisorNote: 'Travel formule famille. Argument : un enfant malade à l\'étranger = rapatriement de toute la famille.',
    },
  },
]

// ═══════════════════════════════════════════
// Engine
// ═══════════════════════════════════════════

const ALL_RULES: RuleDefinition[] = [...driveRules, ...bsafeRules, ...homeRules, ...travelRules]

export function generateRecommendations(
  scores: Record<Quadrant, QuadrantScore>,
  answers: Answers,
): Recommendation[] {
  const recommendations: Recommendation[] = []

  for (const rule of ALL_RULES) {
    if (rule.condition(scores, answers)) {
      recommendations.push({ id: rule.id, ...rule.recommendation })
    }
  }

  // Sort by priority descending
  recommendations.sort((a, b) => b.priority - a.priority)
  return recommendations
}

