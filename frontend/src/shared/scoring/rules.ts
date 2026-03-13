import type { Quadrant, QuadrantScore, Recommendation } from './types.ts'
import { asString as s, asNumber as n, asStringArray as arr, includesAny, HIGH_RISK_SPORTS, isResidentGDL, isTravelEligible } from './answer-helpers.ts'

type Answers = Record<string, unknown>

interface RuleDefinition {
  id: string
  condition: (scores: Record<Quadrant, QuadrantScore>, a: Answers) => boolean
  recommendation: Omit<Recommendation, 'id'>
}

// ═══════════════════════════════════════════
// POG guard wrapper — ensures new rules cannot accidentally skip eligibility
// ═══════════════════════════════════════════

function withGuard(
  guard: (a: Answers) => boolean,
  rules: RuleDefinition[],
): RuleDefinition[] {
  return rules.map(r => ({
    ...r,
    condition: (scores, a) => guard(a) && r.condition(scores, a),
  }))
}

// ═══════════════════════════════════════════
// DRIVE rules (10)
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
      message: 'Votre véhicule représente un investissement important. Avec une couverture RC seule, un sinistre total, un vol ou un incendie ne serait pas remboursé. La couverture Omnium protège la valeur de votre véhicule au-delà de la seule responsabilité civile.',
      advisorNote: 'Véhicule < 3 ans ou électrique/SUV avec RC seule. Argumenter sur le coût de remplacement vs le coût de la prime Omnium. Franchises : à adapter selon le profil financier du client.',
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
      message: 'Les réparations d\'un véhicule électrique coûtent en moyenne 30 % de plus, et la batterie représente une part majeure de la valeur. La couverture Omnium avec le Pack Indemnisation protège votre investissement à sa juste valeur.',
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
    condition: (_, a) =>
      arr(a.vehicle_options_interest).includes('bonus_important'),
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
    condition: (_, a) =>
      arr(a.vehicle_options_interest).includes('vehicle_customized'),
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
    condition: (_, a) =>
      arr(a.vehicle_options_interest).includes('professional_equipment'),
    recommendation: {
      product: 'drive', optionId: 'drive_pack_mobilite',
      type: 'deferred', priority: 3,
      title: 'Protéger votre matériel en déplacement',
      message: 'Le matériel professionnel et les bagages que vous transportez ne sont pas couverts par la responsabilité civile automobile. Le Pack Mobilité étend votre couverture aux biens transportés.',
      advisorNote: 'Composante Bagages/Marchandises du Pack Mobilité. Évaluer la valeur du matériel transporté.',
    },
  },
  {
    id: 'drive_08_new_vehicle_event',
    condition: (_, a) =>
      arr(a.life_event).includes('new_vehicle'),
    recommendation: {
      product: 'drive',
      type: 'event', priority: 4,
      title: 'Anticiper la couverture de votre futur véhicule',
      message: 'L\'achat d\'un véhicule est le moment idéal pour choisir une couverture adaptée. Votre conseiller peut préparer un devis personnalisé avant même la livraison.',
      advisorNote: 'Opportunité Omnium + packs. Proposer un RDV avant l\'achat pour optimiser la couverture.',
    },
  },
  {
    id: 'drive_09_conducteur_protege',
    condition: (_, a) =>
      n(a.vehicle_count) > 0 &&
      ['none', 'employer_only', 'individual_basic'].includes(s(a.accident_coverage_existing)),
    recommendation: {
      product: 'drive', optionId: 'drive_conducteur_protege',
      type: 'immediate', priority: 5,
      title: 'Protéger le conducteur',
      message: 'La responsabilité civile automobile couvre les dommages causés aux tiers, mais pas vos propres blessures en cas d\'accident responsable. La garantie Conducteur protégé couvre les conséquences financières d\'une invalidité ou d\'un décès suite à un accident de la route.',
      advisorNote: 'Conducteur protégé : garantie la plus critique après la RC. Le conducteur responsable est le seul NON couvert par la RC obligatoire. Si B-Safe complet existant, priorité réduite (couverture partielle). Vérifier les plafonds.',
    },
  },
  {
    id: 'drive_10_multi_vehicle_2plus',
    condition: (_, a) =>
      n(a.vehicle_count) >= 2,
    recommendation: {
      product: 'drive',
      type: 'deferred', priority: 3,
      title: 'Offre multi-véhicules disponible',
      message: 'Avec plusieurs véhicules, une offre groupée DRIVE 2+ peut vous faire bénéficier de conditions préférentielles. Cette offre est disponible exclusivement auprès de votre conseiller.',
      advisorNote: 'DRIVE 2+ (autos particulières) non disponible en souscription Web — orienter vers agence ou courtier. Si le 2e véhicule est moto, remorque ou autre : DRIVE 2 (autres véhicules). Vérifier la nature des véhicules.',
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
      message: 'Avec un seul revenu et des personnes à charge, un accident grave ou un décès aurait des conséquences financières immédiates pour votre famille. En complément des prestations de la sécurité sociale, B-Safe protège l\'assuré ainsi que sa famille.',
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
      message: 'En tant qu\'indépendant, les prestations de la sécurité sociale ne couvrent qu\'une partie de vos revenus en cas d\'arrêt. En complément, B-Safe vous protège contre les conséquences financières d\'une invalidité ou d\'une incapacité de travail suite à un accident.',
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
      message: 'Avec moins de 3 mois d\'autonomie financière, un arrêt prolongé suite à un accident mettrait votre foyer en difficulté. En complément des indemnités de la sécurité sociale, B-Safe maintient vos revenus pendant votre convalescence.',
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
      message: 'Vos activités sportives vous exposent à un risque accru d\'accident. En complément de la sécurité sociale, B-Safe vous protège contre les conséquences financières d\'une invalidité — y compris les suites médicales et la rééducation.',
      advisorNote: 'B-Safe avec options sport. Vérifier que les activités ne tombent pas dans les exclusions IPID. Mentionner la couverture chirurgie esthétique réparatrice en cas de blessure.',
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
      message: 'En cas d\'hospitalisation suite à un accident, qui s\'occupe de vos enfants ? En complément de la sécurité sociale, les options garde d\'enfants, rattrapage scolaire et rooming-in sécurisent votre famille pendant votre rétablissement.',
      advisorNote: 'B-Safe Frais divers (garde enfants, rattrapage scolaire, rooming-in). Argument émotionnel fort.',
    },
  },
  {
    id: 'bsafe_06_aging_parents',
    condition: (_, a) =>
      arr(a.health_concerns).includes('aging_parents'),
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
      message: 'En cas de décès suite à un accident, votre famille devrait assumer le remboursement du crédit immobilier. En complément de la sécurité sociale, un capital décès B-Safe garantit le maintien de votre famille dans le logement.',
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
      message: 'Sans pension complémentaire ni assurance-vie, une invalidité permanente suite à un accident réduirait vos revenus futurs bien au-delà de ce que la sécurité sociale compense. La rente viagère B-Safe sécurise votre avenir en complément.',
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
      message: 'Votre activité et vos déplacements vous exposent davantage aux risques d\'accident. En complément de la sécurité sociale, B-Safe vous protège contre les conséquences financières d\'une hospitalisation et des frais médicaux liés.',
      advisorNote: 'B-Safe étendu (Hospitalisation + Frais divers). Mentionner chirurgie esthétique réparatrice si pertinent.',
    },
  },
  {
    id: 'bsafe_10_birth_event',
    condition: (_, a) =>
      arr(a.life_event).includes('birth'),
    recommendation: {
      product: 'bsafe', optionId: 'bsafe_deces',
      type: 'event', priority: 5,
      title: 'Préparer la protection de votre famille',
      message: 'L\'arrivée d\'un enfant change tout. En complément de la sécurité sociale, B-Safe protège l\'assuré ainsi que sa famille avec une couverture décès et invalidité adaptée à votre nouvelle situation.',
      advisorNote: 'B-Safe Décès + Invalidité. Moment émotionnel fort. Inclure les options garde/rooming-in/rattrapage scolaire.',
    },
  },
  {
    id: 'bsafe_11_retirement_event',
    condition: (_, a) =>
      arr(a.life_event).includes('retirement'),
    recommendation: {
      product: 'bsafe',
      type: 'event', priority: 4,
      title: 'Adapter votre protection à la retraite',
      message: 'À la retraite, la couverture prévoyance de votre employeur prend fin. Les prestations de la sécurité sociale seules peuvent ne pas suffire. B-Safe protège l\'assuré et sa famille contre les conséquences financières d\'un accident, en complément.',
      advisorNote: 'Revoir l\'intégralité de la couverture. La prévoyance employeur s\'arrête. B-Safe personnel devient indispensable.',
    },
  },
  {
    id: 'bsafe_12_divorce_event',
    condition: (_, a) =>
      arr(a.life_event).includes('divorce'),
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
// HOME rules (19)
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
      message: 'En tant que locataire, vous êtes responsable des dommages causés au logement. L\'assurance habitation protège vos biens mobiliers, couvre votre responsabilité civile et garantit vos droits.',
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
      message: 'Avec un crédit immobilier en cours, il est essentiel de protéger vos biens mobiliers et immobiliers. En cas de sinistre grave, c\'est votre patrimoine et celui de votre famille qui sont en jeu.',
      advisorNote: 'Vérifier si la banque exige une assurance. Proposer Home complet + prévoyance emprunteur (B-Safe). Franchises : à adapter selon le profil financier du client.',
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
      message: 'Vos panneaux solaires ou votre pompe à chaleur représentent un investissement de plusieurs milliers d\'euros. Le Pack Énergie renouvelable couvre les dommages spécifiques à ces installations.',
      advisorNote: 'Pack Énergie renouvelable. Au Luxembourg, investissement moyen 10-20k EUR. Argument : subventions ne couvrent que l\'installation, pas le remplacement en cas de sinistre.',
    },
  },
  {
    id: 'home_05_wine_cellar',
    condition: (_, a) =>
      arr(a.home_specifics).includes('wine_cellar'),
    recommendation: {
      product: 'home', optionId: 'home_pack_cave_vin',
      type: 'deferred', priority: 2,
      title: 'Assurer votre cave à vin',
      message: 'Votre cave à vin est un patrimoine sensible aux variations de température, au bris accidentel et au vol. Le Pack Cave à vin, alcool et denrées alimentaires couvre la valeur réelle de vos réserves.',
      advisorNote: 'Pack Cave à vin, alcool et denrées alimentaires. Question sur la valeur estimée de la cave pour dimensionner.',
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
    condition: (_, a) =>
      arr(a.valuable_possessions).includes('sustainable_mobility'),
    recommendation: {
      product: 'home', optionId: 'home_pack_mobilite_durable',
      type: 'deferred', priority: 3,
      title: 'Protéger vos équipements de mobilité durable',
      message: 'Votre vélo électrique ou trottinette représente un investissement significatif, souvent insuffisamment couvert. Le Pack Équipements de mobilité durable protège contre le vol, la casse et les dommages.',
      advisorNote: 'Pack Équipements de mobilité durable. Vélo électrique moyen 3-8k EUR au Luxembourg. Vol en forte hausse.',
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
      advisorNote: 'Pack Objets de valeur/d\'art ou Pack Objets précieux/Bijoux selon la nature des biens. Proposer une expertise pour les valeurs > 50 000 EUR.',
    },
  },
  {
    id: 'home_09_sports_equipment',
    condition: (_, a) =>
      arr(a.valuable_possessions).includes('sports_leisure'),
    recommendation: {
      product: 'home', optionId: 'home_pack_objets_loisirs',
      type: 'deferred', priority: 2,
      title: 'Couvrir votre équipement sportif',
      message: 'Votre équipement de loisirs coûteux (ski, golf, vélo...) n\'est généralement pas couvert par l\'assurance habitation standard, ni en dehors du domicile. Le Pack Objets de loisirs étend la protection.',
      advisorNote: 'Pack Objets de loisirs. Couvre aussi hors domicile (important pour équipement sportif).',
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
      title: 'Vous protéger en responsabilité civile vie privée',
      message: 'La responsabilité civile vie privée vous protège contre les conséquences financières des dommages involontairement causés à des tiers, partout dans le monde. Avec des enfants ou une activité sportive, les risques sont réels.',
      advisorNote: 'Responsabilité civile vie privée HOME. Couverture monde entier. Exemples concrets : enfant qui casse une vitre, collision à vélo, chute en ski blessant un tiers.',
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
    condition: (_, a) =>
      arr(a.life_event).includes('property_purchase'),
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
    condition: (_, a) =>
      arr(a.life_event).includes('renovation'),
    recommendation: {
      product: 'home',
      type: 'event', priority: 3,
      title: 'Adapter votre couverture à vos travaux',
      message: 'Des travaux de rénovation modifient la valeur de votre bien et potentiellement vos installations (énergie renouvelable, cuisine, salle de bain). Pensez à mettre à jour votre contrat habitation.',
      advisorNote: 'Réévaluation des capitaux + Pack Énergie renouvelable si installation solaire/PAC.',
    },
  },
  {
    id: 'home_15_other_properties',
    condition: (_, a) =>
      s(a.other_properties) !== 'none' && s(a.other_properties) !== '',
    recommendation: {
      product: 'home',
      type: 'deferred', priority: 3,
      title: 'Assurer vos autres biens immobiliers',
      message: 'Votre résidence secondaire ou vos biens locatifs nécessitent chacun une couverture adaptée. En tant que propriétaire bailleur, pensez aux garanties Loyers impayés, Détériorations immobilières et Vacance locative pour sécuriser vos revenus locatifs.',
      advisorNote: 'Multi-contrat Home. Le bien locatif doit être couvert même si le locataire a sa propre assurance (responsabilité du propriétaire). Distinguer Home Habitation (bailleur individuel) vs contrat adapté selon le type de bien.',
    },
  },
  {
    id: 'home_16_loyers_impayes',
    condition: (_, a) =>
      ['rental', 'both'].includes(s(a.other_properties)),
    recommendation: {
      product: 'home', optionId: 'home_loyers_impayes',
      type: 'immediate', priority: 4,
      title: 'Protéger vos revenus locatifs',
      message: 'En tant que propriétaire bailleur, un impayé de loyer peut représenter plusieurs mois de manque à gagner. La garantie Loyers impayés sécurise vos revenus locatifs en cas de défaillance du locataire.',
      advisorNote: 'Garantie Loyers impayés. Procédures d\'expulsion longues au Luxembourg (6-18 mois). Chiffrer : loyer mensuel x durée moyenne de procédure. Vérifier les délais de carence et plafonds.',
    },
  },
  {
    id: 'home_17_deteriorations_immobilieres',
    condition: (_, a) =>
      ['rental', 'both'].includes(s(a.other_properties)),
    recommendation: {
      product: 'home', optionId: 'home_deteriorations_immobilieres',
      type: 'deferred', priority: 3,
      title: 'Couvrir les dégradations locatives',
      message: 'En fin de bail, les dégradations causées par un locataire peuvent entraîner des frais de remise en état importants. La garantie Détériorations immobilières couvre ces frais.',
      advisorNote: 'Garantie Détériorations immobilières. Souvent déclenchée en sortie de bail conflictuelle. Le point clé est l\'état des lieux d\'entrée/sortie. Se couple avec Loyers impayés.',
    },
  },
  {
    id: 'home_18_vacance_locative',
    condition: (_, a) =>
      ['rental', 'both'].includes(s(a.other_properties)),
    recommendation: {
      product: 'home', optionId: 'home_vacance_locative',
      type: 'deferred', priority: 3,
      title: 'Compenser la vacance locative après sinistre',
      message: 'En cas de sinistre rendant votre bien locatif inhabitable, la garantie Vacance locative compense la perte de loyers pendant la durée des travaux de remise en état.',
      advisorNote: 'Garantie Vacance locative. Au Luxembourg, pénurie BTP = durée de travaux longue. Se couple avec Loyers impayés et Détériorations.',
    },
  },
  {
    id: 'home_19_perte_liquide_cuves',
    condition: (_, a) =>
      ['house', 'townhouse'].includes(s(a.housing_type)) &&
      ['owner_no_mortgage', 'owner_with_mortgage'].includes(s(a.housing_status)),
    recommendation: {
      product: 'home', optionId: 'home_pack_perte_liquide_cuves',
      type: 'deferred', priority: 3,
      title: 'Protéger contre les fuites de cuves',
      message: 'Les maisons individuelles avec citerne à mazout ou cuves sont exposées aux risques de fuite et de pollution des sols. Le Pack Perte de liquide/Dommages aux cuves couvre ces sinistres dont les coûts de dépollution peuvent être très élevés.',
      advisorNote: 'Pack Perte de liquide/Dommages aux cuves. Vérifier si le client a une citerne mazout/fioul. Sinistre rare mais coût très élevé (15-100k+ EUR dépollution). Réglementation GDL stricte.',
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
      message: 'Avec plusieurs voyages par an, l\'assurance vacances à la carte en formule annuelle est plus économique et vous couvre en permanence, sans avoir à y penser à chaque départ.',
      advisorNote: 'Travel annuel. Chiffrer : coût de 2-3 contrats temporaires vs annuel. Clarifier périmètre assistance véhicule TRAVEL vs assistance DRIVE si le client a les deux.',
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
      message: 'Les couvertures des cartes bancaires ont des plafonds limités et de nombreuses exclusions. Hors Europe, les conséquences financières d\'une hospitalisation peuvent être considérables. L\'assurance vacances à la carte vous protège, vous et votre famille, sans surprise.',
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
      message: 'Un voyage à plus de 3 000 EUR représente un investissement important. En cas d\'annulation pour maladie, accident ou imprévu familial, l\'assurance vacances à la carte vous protège contre les conséquences financières et vous rembourse les frais engagés.',
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
      message: 'Les destinations aventure présentent des risques spécifiques. L\'assurance vacances à la carte vous protège contre les conséquences financières d\'un aléa en voyage — y compris l\'assistance et le rapatriement.',
      advisorNote: 'Travel Accident + Assistance Personnes. Vérifier compatibilité activités prévues avec exclusions IPID. Clarifier coordination avec assistance DRIVE si véhicule loué à l\'étranger.',
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
      message: 'Avec des enfants, les imprévus de voyage sont plus fréquents. L\'assurance vacances à la carte en formule famille protège l\'assuré ainsi que sa famille sous un seul contrat, y compris l\'annulation et l\'assistance.',
      advisorNote: 'Travel formule famille. Argument : un enfant malade à l\'étranger = rapatriement de toute la famille.',
    },
  },
]

// ═══════════════════════════════════════════
// Engine
// ═══════════════════════════════════════════

const ALL_RULES: RuleDefinition[] = [
  ...withGuard(isResidentGDL, driveRules),
  ...withGuard(isResidentGDL, bsafeRules),
  ...withGuard(isResidentGDL, homeRules),
  ...withGuard(isTravelEligible, travelRules),
]

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
