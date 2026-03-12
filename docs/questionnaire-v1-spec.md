# Questionnaire V1 -- Specification complete

> Document de reference pour l'implementation du questionnaire de decouverte des besoins
> Baloise Assurances Luxembourg -- Application "Roue des Besoins"
> Version 1.0 -- Mars 2026

---

## Table des matieres

1. [Architecture du questionnaire](#1-architecture-du-questionnaire)
2. [Liste detaillee des questions](#2-liste-detaillee-des-questions)
3. [Matrice Questions / Produits / Options](#3-matrice-questions--produits--options)
4. [Logique de scoring](#4-logique-de-scoring)
5. [Regles de recommandation](#5-regles-de-recommandation)
6. [Annexes](#6-annexes)

---

## 1. Architecture du questionnaire

### 1.1 Principe directeur

Le questionnaire s'organise en **1 bloc de profilage rapide + 4 quadrants** alignes sur la roue des besoins. Le client commence toujours par le profil express (obligatoire), puis explore les quadrants dans l'ordre qu'il souhaite via la roue interactive.

### 1.2 Decoupage en blocs

```
PROFIL EXPRESS (obligatoire, 6 questions, ~1m30)
  |
  +-- QUADRANT 1 : Protection des biens    (#293485)  -- 7 questions, ~2m00
  +-- QUADRANT 2 : Protection des personnes (#0014aa)  -- 7 questions, ~2m00
  +-- QUADRANT 3 : Protection des projets   (#00b28f)  -- 6 questions, ~1m30
  +-- QUADRANT 4 : Protection du futur      (#9f52cc)  -- 6 questions, ~2m00
```

**Total** : 32 questions. Avec la conditionnalite, un client moyen voit 24-29 questions. Duree cible : 5-8 minutes.

### 1.3 Mapping blocs vers produits Baloise

| Quadrant | Produits principaux | Produits secondaires |
|----------|-------------------|---------------------|
| Profil Express | Ponderation de tous les produits | -- |
| Q1 - Biens | HOME (base + toutes options), DRIVE (Pack Dommage, Pack Amenagement) | -- |
| Q2 - Personnes | B-SAFE (toutes garanties), TRAVEL (toutes garanties) | HOME (RC Vie Privee) |
| Q3 - Projets | DRIVE (base + Pack Indemnisation, Pack Mobilite), HOME (Reequipement a neuf) | TRAVEL (Annulation, Bagages) |
| Q4 - Futur | B-SAFE (Rente Viagere, Incapacite, Hospitalisation) | HOME (Pack Energie Renouvelable) |

### 1.4 Logique de conditionnalite globale (skip logic)

Le profil express determine quels sous-ensembles de questions apparaissent dans chaque quadrant :

| Condition du profil | Questions masquees |
|----|---|
| `vehicle_count` = 0 | Q22, Q23, Q24, Q25 (tout le sous-bloc vehicule) |
| `family_status` = `single` | Q03 (`children_count`) |
| `family_status` NOT IN (`couple_with_children`, `single_parent`, `recomposed`) | Q03 |
| `housing_type` IN (`apartment`, `other`) | Q09 (`home_specifics`) |
| `valuable_possessions` contient `none` | Q12 (`valuable_total_estimate`) |
| `travel_frequency` = `never` | Q15, Q16, Q20 |
| `professional_status` IN (`retired`, `inactive`, `student`) | Q29 (`work_incapacity_concern`) |

### 1.5 Flow utilisateur

```
[Landing Page / Roue]
       |
       v
[Profil Express -- 6 questions lineaires]
       |
       v
[Roue interactive -- 4 quadrants cliquables]
       |                    |                   |                   |
       v                    v                   v                   v
  [Q1 Biens]         [Q2 Personnes]      [Q3 Projets]       [Q4 Futur]
   7 questions         7 questions         6 questions        6 questions
       |                    |                   |                   |
       v                    v                   v                   v
  [Micro-resultat]    [Micro-resultat]    [Micro-resultat]   [Micro-resultat]
       |                    |                   |                   |
       +--------------------+-------------------+-------------------+
                            |
                            v
                   [Resultat global + Recommandations]
```

Chaque quadrant peut etre complete independamment. Un quadrant complete colore son segment sur la roue. Le resultat global n'est disponible qu'une fois TOUS les quadrants completes, mais un micro-resultat qualitatif est affiche apres chaque quadrant.

### 1.6 Types de questions

```typescript
type QuestionType = 'select' | 'boolean' | 'number' | 'multi_select'
type QuestionQuadrant = 'profil_express' | 'biens' | 'personnes' | 'projets' | 'futur'
```

Le type `multi_select` est nouveau par rapport au schema V0. Il permet de selectionner plusieurs options (avec une option exclusive `none` qui deselectionne les autres).

### 1.7 Schema TypeScript cible

```typescript
export interface Question {
  id: string
  quadrant: QuestionQuadrant
  label: string
  helpText?: string
  type: QuestionType
  options?: QuestionOption[]
  required: boolean
  dependsOn?: DependencyRule
  mapping: ProductMapping[]
}

export interface DependencyRule {
  questionId: string
  operator: 'eq' | 'neq' | 'in' | 'not_in' | 'gt' | 'gte' | 'contains' | 'not_contains'
  value: string | number | boolean | (string | number | boolean)[]
}

export interface ProductMapping {
  product: 'drive' | 'home' | 'travel' | 'bsafe'
  options?: string[]      // IDs des options/packs cibles
  scoringWeight: number   // 0-1, poids dans le calcul de pertinence
}
```

---

## 2. Liste detaillee des questions

### Conventions

- **ID** : snake_case, unique, stable (ne change pas apres deploiement)
- **Libelle** : formulation client, accessible, en francais courant
- **Texte d'aide** : affiche sous la question, uniquement si necessaire
- **Type** : select | boolean | number | multi_select
- **Options** : valeur technique + libelle affiche
- **Conditionnalite** : regle de visibilite (question masquee si la condition est fausse)
- **Mapping produit** : produit(s) et option(s) Baloise alimentes par cette question

---

### BLOC 0 : PROFIL EXPRESS

> 6 questions obligatoires. Tout client les voit. Elles determinent les ponderations globales et la conditionnalite des quadrants.

---

#### Q01 -- `age_range`

| Champ | Valeur |
|-------|--------|
| **ID** | `age_range` |
| **Quadrant** | `profil_express` |
| **Libelle** | Quelle est votre tranche d'age ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `18_25` | 18-25 ans |
| `26_35` | 26-35 ans |
| `36_45` | 36-45 ans |
| `46_55` | 46-55 ans |
| `56_65` | 56-65 ans |
| `65_plus` | Plus de 65 ans |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Formule selon age, Rente viagere | 0.7 |
| DRIVE | Conducteur protege (jeune conducteur) | 0.3 |
| TRAVEL | Couverture famille | 0.2 |

**Justification commerciale :** L'age est le premier discriminant pour B-Safe (formule selon age/profession, exclusions sur certaines options). Les tranches sont recoupees par rapport a la V0 : l'ancien ecart `30-50` qui n'existait pas dans les options (bug confirme engine.ts ligne 64) est maintenant correctement segmente en `36_45` et `46_55`.

---

#### Q02 -- `family_status`

| Champ | Valeur |
|-------|--------|
| **ID** | `family_status` |
| **Quadrant** | `profil_express` |
| **Libelle** | Quelle est votre situation familiale ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `single` | Celibataire |
| `couple_no_children` | En couple, sans enfant |
| `couple_with_children` | En couple, avec enfant(s) |
| `single_parent` | Parent seul avec enfant(s) |
| `recomposed` | Famille recomposee |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Deces, Invalidite permanente | 0.8 |
| TRAVEL | Formule famille | 0.4 |
| HOME | RC Vie Privee | 0.3 |
| DRIVE | Pack Mobilite (famille = besoin de remplacement) | 0.2 |

**Justification commerciale :** Ajoute `recomposed` (famille recomposee) -- profil frequent au Luxembourg avec des enjeux de protection specifiques (beneficiaires multiples, enfants de plusieurs unions). Separe clairement couple sans/avec enfants : l'enjeu de prevoyance est radicalement different.

---

#### Q03 -- `children_count`

| Champ | Valeur |
|-------|--------|
| **ID** | `children_count` |
| **Quadrant** | `profil_express` |
| **Libelle** | Combien d'enfants avez-vous a charge ? |
| **Texte d'aide** | Enfants mineurs ou etudiant(e)s vivant sous votre toit. |
| **Type** | `number` |
| **Obligatoire** | oui |
| **Conditionnalite** | `family_status` IN (`couple_with_children`, `single_parent`, `recomposed`) |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Garde d'enfants, Rattrapage scolaire, Rooming-in | 0.7 |
| TRAVEL | Formule famille (nombre de personnes) | 0.4 |
| HOME | RC Vie Privee (risque proportionnel) | 0.3 |

**Justification commerciale :** Le nombre d'enfants change le dimensionnement de B-Safe (options garde/rattrapage proportionnelles) et le type de formule Travel (individuelle vs famille).

---

#### Q04 -- `professional_status`

| Champ | Valeur |
|-------|--------|
| **ID** | `professional_status` |
| **Quadrant** | `profil_express` |
| **Libelle** | Quel est votre statut professionnel ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `employee` | Salarie(e) |
| `civil_servant` | Fonctionnaire |
| `independent` | Independant(e) / profession liberale |
| `business_owner` | Chef d'entreprise |
| `retired` | Retraite(e) |
| `student` | Etudiant(e) |
| `inactive` | Sans activite professionnelle |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Formule selon profession, Incapacite de travail temporaire | 0.8 |
| DRIVE | Usage vehicule professionnel | 0.2 |
| HOME | RC Vie Privee professionnelle | 0.1 |

**Justification commerciale :** La distinction `civil_servant` / `employee` est cruciale au Luxembourg : le fonctionnaire a une protection sociale plus forte (moins besoin de prevoyance complementaire). L'independant est le profil a plus fort besoin B-Safe. L'etudiant est pertinent (etudiants frontaliers, logement universitaire couvert par Home).

---

#### Q05 -- `income_contributors`

| Champ | Valeur |
|-------|--------|
| **ID** | `income_contributors` |
| **Quadrant** | `profil_express` |
| **Libelle** | Combien de personnes contribuent aux revenus de votre foyer ? |
| **Texte d'aide** | Cette information nous aide a evaluer la vulnerabilite financiere de votre foyer en cas d'imprevu. |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `one` | Une seule personne |
| `two` | Deux personnes |
| `more` | Plus de deux |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Deces, Invalidite, Incapacite de travail | 0.9 |
| HOME | Dimensionnement du contenu | 0.1 |

**Justification commerciale :** Un foyer mono-revenu avec enfants est LE profil critique en prevoyance. C'est la question qui a le plus fort pouvoir de prise de conscience. Remplace l'ancien `incomeSource` qui etait reference dans rules.ts mais n'existait pas dans le schema (bug confirme).

---

#### Q06 -- `life_event`

| Champ | Valeur |
|-------|--------|
| **ID** | `life_event` |
| **Quadrant** | `profil_express` |
| **Libelle** | Avez-vous un changement de situation prevu dans les 12 prochains mois ? |
| **Texte d'aide** | Un changement de vie est souvent le bon moment pour revoir sa protection. |
| **Type** | `multi_select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Aucun changement prevu |
| `marriage` | Mariage / Partenariat |
| `birth` | Naissance attendue |
| `property_purchase` | Achat immobilier |
| `move` | Demenagement |
| `retirement` | Depart a la retraite |
| `new_vehicle` | Achat de vehicule |
| `renovation` | Travaux / renovation |
| `career_change` | Changement professionnel |
| `divorce` | Separation / divorce |

> **Regle UX** : si `none` est selectionne, les autres options sont desactivees et vice versa.

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| TOUS | Declencheur d'urgence multi-produits | 1.0 |
| HOME | base (property_purchase, move, renovation) | 0.9 |
| DRIVE | base (new_vehicle) | 0.8 |
| B-SAFE | Deces, Invalidite (marriage, birth, divorce) | 0.8 |
| HOME | Pack Energie Renouvelable (renovation) | 0.5 |
| TRAVEL | Annulation (imprevu lie a evenement) | 0.3 |

**Justification commerciale :** C'est la question commercialement la plus puissante du questionnaire. Elle passe en multi_select (vs select simple en V0) car un client peut cumuler plusieurs evenements (achat immobilier ET naissance). Ajouts vs V0 : `new_vehicle` (Drive), `renovation` (Home EnR), `career_change` (B-Safe incapacite), `divorce` (restructuration complete). Chaque evenement active des recommandations specifiques par produit.

---

### QUADRANT 1 : PROTECTION DES BIENS

> 7 questions. Alimente principalement HOME (base + toutes options) et DRIVE (Pack Dommage, Pack Amenagement).

---

#### Q07 -- `housing_status`

| Champ | Valeur |
|-------|--------|
| **ID** | `housing_status` |
| **Quadrant** | `biens` |
| **Libelle** | Etes-vous proprietaire ou locataire de votre logement principal ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `owner_no_mortgage` | Proprietaire sans credit |
| `owner_with_mortgage` | Proprietaire avec credit immobilier |
| `tenant` | Locataire |
| `lodged_free` | Loge(e) a titre gratuit |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | Base (proprietaire vs locataire change le contrat) | 0.9 |
| B-SAFE | Deces/Invalidite (credit = prevoyance emprunteur) | 0.5 |

**Justification commerciale :** Fusionne les anciennes questions `isOwner` + `hasMortgage` en une seule question plus fluide. Ajoute `lodged_free` (loge a titre gratuit) -- profil frequent au Luxembourg (jeunes adultes chez parents, expatries loges par employeur). Le credit immobilier est le deuxieme plus fort declencheur de prevoyance apres les enfants.

---

#### Q08 -- `housing_type`

| Champ | Valeur |
|-------|--------|
| **ID** | `housing_type` |
| **Quadrant** | `biens` |
| **Libelle** | Quel est le type de votre logement ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `apartment` | Appartement |
| `house` | Maison individuelle |
| `townhouse` | Maison mitoyenne |
| `other` | Autre (studio, loft, etc.) |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | Pack Jardin/Piscine (conditionne par maison) | 0.6 |
| HOME | Pack Perte de Liquide/Cuves (maison) | 0.4 |
| HOME | Base (dimensionnement risque climatique) | 0.3 |

**Justification commerciale :** Question absente de la V0. Le type de logement determine directement la pertinence du Pack Jardin/Piscine (maisons uniquement), du Pack Perte de Liquide/Cuves (maisons), et dimensionne le risque climatique (maison plus exposee aux tempetes/inondations qu'un appartement en etage).

---

#### Q09 -- `home_specifics`

| Champ | Valeur |
|-------|--------|
| **ID** | `home_specifics` |
| **Quadrant** | `biens` |
| **Libelle** | Votre logement dispose-t-il de l'un de ces elements ? |
| **Texte d'aide** | Selectionnez tout ce qui correspond. |
| **Type** | `multi_select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `housing_type` IN (`house`, `townhouse`) |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Aucun de ces elements |
| `garden` | Jardin amenage |
| `pool` | Piscine |
| `solar_panels` | Panneaux solaires / pompe a chaleur |
| `wine_cellar` | Cave a vin |
| `outbuildings` | Dependances (garage, abri, etc.) |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | Pack Jardin/Piscine (`garden`, `pool`) | 0.9 |
| HOME | Pack Energie Renouvelable (`solar_panels`) | 0.9 |
| HOME | Pack Cave a Vin/Denrees (`wine_cellar`) | 0.9 |
| HOME | Base - dependances (`outbuildings`) | 0.4 |

**Justification commerciale :** C'est LA question qui manquait pour activer les packs optionnels HOME. Chaque selection declenche une recommandation d'option precise. Au Luxembourg, les panneaux solaires sont tres repandus (incitations fiscales fortes), et les caves a vin sont un patrimoine reel dans la region mosellane.

---

#### Q10 -- `home_contents_value`

| Champ | Valeur |
|-------|--------|
| **ID** | `home_contents_value` |
| **Quadrant** | `biens` |
| **Libelle** | Comment estimez-vous la valeur globale du contenu de votre logement ? |
| **Texte d'aide** | Mobilier, electromenager, vetements, equipements... Une estimation approximative suffit. |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `less_20k` | Moins de 20 000 EUR |
| `20k_50k` | 20 000 - 50 000 EUR |
| `50k_100k` | 50 000 - 100 000 EUR |
| `100k_plus` | Plus de 100 000 EUR |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | Base (dimensionnement capitaux assures) | 0.7 |
| HOME | Reequipement a neuf | 0.8 |
| HOME | Pack Multimedia | 0.3 |

**Justification commerciale :** Question absente de la V0. Elle dimensionne le contrat HOME et justifie l'option Reequipement a neuf -- l'upsell naturel de Home. La difference entre "valeur vetuste" et "valeur a neuf" est un argument tres concret pour le client.

---

#### Q11 -- `valuable_possessions`

| Champ | Valeur |
|-------|--------|
| **ID** | `valuable_possessions` |
| **Quadrant** | `biens` |
| **Libelle** | Possedez-vous des biens de valeur particuliere ? |
| **Texte d'aide** | Selectionnez les categories qui vous concernent. |
| **Type** | `multi_select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Non, rien de particulier |
| `jewelry` | Bijoux / montres de valeur |
| `art` | Oeuvres d'art / antiquites |
| `collections` | Collections (timbres, pieces, vins, etc.) |
| `multimedia` | Equipement multimedia haut de gamme (home cinema, informatique, photo...) |
| `sports_leisure` | Equipement de loisirs couteux (ski, golf, velo haut de gamme, etc.) |
| `sustainable_mobility` | Equipement de mobilite durable (velo electrique, trottinette, etc.) |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | Pack Objets de Valeur/Art (`art`, `collections`) | 0.9 |
| HOME | Pack Objets Precieux/Bijoux (`jewelry`) | 0.9 |
| HOME | Pack Multimedia (`multimedia`) | 0.9 |
| HOME | Pack Objets de Loisirs (`sports_leisure`) | 0.9 |
| HOME | Pack Mobilite Durable (`sustainable_mobility`) | 0.9 |

**Justification commerciale :** Remplace les 4 anciennes questions V0 (`hasValuables`, `valuablesAmount`, `valuablesStorage`, `valuablesCoverage`) par une seule question multi-select beaucoup plus actionnable. Chaque option cible un pack HOME specifique. Le velo electrique est un cas typique au Luxembourg (tres repandu, valeur 3 000-8 000 EUR, souvent non couvert).

---

#### Q12 -- `valuable_total_estimate`

| Champ | Valeur |
|-------|--------|
| **ID** | `valuable_total_estimate` |
| **Quadrant** | `biens` |
| **Libelle** | Quelle est la valeur totale estimee de ces biens particuliers ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `valuable_possessions` NOT_CONTAINS `none` |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `less_5k` | Moins de 5 000 EUR |
| `5k_15k` | 5 000 - 15 000 EUR |
| `15k_50k` | 15 000 - 50 000 EUR |
| `50k_plus` | Plus de 50 000 EUR |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | Pack Objets de Valeur/Art (seuil >= 15k) | 0.8 |
| HOME | Pack Objets Precieux/Bijoux (seuil >= 15k) | 0.8 |

**Justification commerciale :** Dimensionne le besoin. En dessous de 5 000 EUR, la couverture HOME standard peut suffire. Au-dessus de 15 000 EUR, un pack dedie est recommandable. Au-dessus de 50 000 EUR, recommandation immediate priorite haute.

---

#### Q13 -- `security_measures`

| Champ | Valeur |
|-------|--------|
| **ID** | `security_measures` |
| **Quadrant** | `biens` |
| **Libelle** | Votre logement dispose-t-il de mesures de securite ? |
| **Texte d'aide** | -- |
| **Type** | `multi_select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Aucune mesure particuliere |
| `alarm` | Systeme d'alarme |
| `safe` | Coffre-fort |
| `reinforced_door` | Porte blindee / serrure renforcee |
| `camera` | Camera de surveillance |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | Vol/Vandalisme (ponderation risque) | 0.7 |
| HOME | Pack Objets de Valeur (adequation stockage) | 0.5 |
| HOME | Pack Objets Precieux (adequation stockage) | 0.5 |

**Justification commerciale :** Remplace l'ancien `valuablesStorage` trop reducteur. La presence ou absence de mesures de securite conditionne le risque vol et la recommandation de l'option Vol/Vandalisme. Un client sans securite ET avec des biens de valeur est le profil prioritaire.

---

### QUADRANT 2 : PROTECTION DES PERSONNES

> 7 questions. Alimente principalement B-SAFE (toutes garanties), TRAVEL (toutes garanties), et HOME (RC Vie Privee).

---

#### Q14 -- `travel_frequency`

| Champ | Valeur |
|-------|--------|
| **ID** | `travel_frequency` |
| **Quadrant** | `personnes` |
| **Libelle** | A quelle frequence voyagez-vous a l'etranger ? |
| **Texte d'aide** | Voyages prives (vacances, visites familiales, etc.). |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `never` | Jamais ou tres rarement |
| `once_year` | 1 a 2 fois par an |
| `several_year` | 3 fois ou plus par an |
| `frequent` | Tres frequemment (mensuel ou plus) |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| TRAVEL | Base (frequence determine formule annuelle vs temporaire) | 1.0 |
| TRAVEL | Assistance Personnes, Assistance Vehicules | 0.7 |

**Justification commerciale :** Completement absente de la V0. C'est elle qui active l'univers Travel. La frequence determine si on recommande un contrat annuel (rentable des 2 voyages/an) ou temporaire. Au Luxembourg, la population est tres mobile (frontaliers, expatries, proximite des aeroports).

---

#### Q15 -- `travel_destinations`

| Champ | Valeur |
|-------|--------|
| **ID** | `travel_destinations` |
| **Quadrant** | `personnes` |
| **Libelle** | Ou voyagez-vous principalement ? |
| **Texte d'aide** | -- |
| **Type** | `multi_select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `travel_frequency` NEQ `never` |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `europe` | Europe |
| `worldwide` | Hors Europe |
| `adventure` | Destinations aventure / trek / nature |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| TRAVEL | Couverture geographique, plafonds | 0.8 |
| TRAVEL | Tous Risques Bagages | 0.5 |
| B-SAFE | Couverture monde entier | 0.4 |

**Justification commerciale :** La destination conditionne le niveau de couverture. "Hors Europe" implique des frais medicaux potentiellement enormes (USA, Asie). "Aventure" signale un risque accru qui alimente aussi B-Safe.

---

#### Q16 -- `travel_budget`

| Champ | Valeur |
|-------|--------|
| **ID** | `travel_budget` |
| **Quadrant** | `personnes` |
| **Libelle** | Quel est le budget moyen de vos voyages (par voyage) ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `travel_frequency` NEQ `never` |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `less_1k` | Moins de 1 000 EUR |
| `1k_3k` | 1 000 - 3 000 EUR |
| `3k_5k` | 3 000 - 5 000 EUR |
| `5k_plus` | Plus de 5 000 EUR |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| TRAVEL | Annulation de Voyage | 1.0 |

**Justification commerciale :** Le budget voyage est le levier n1 de l'annulation voyage. Un voyage a 500 EUR, le client absorbe la perte. Un voyage a 5 000 EUR, l'annulation non remboursee fait tres mal. Cette question cree la prise de conscience du risque financier.

---

#### Q17 -- `sports_activities`

| Champ | Valeur |
|-------|--------|
| **ID** | `sports_activities` |
| **Quadrant** | `personnes` |
| **Libelle** | Pratiquez-vous des activites sportives ou de loisirs regulierement ? |
| **Texte d'aide** | Selectionnez les activites qui vous concernent. |
| **Type** | `multi_select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Pas d'activite sportive reguliere |
| `running_cycling` | Course a pied / cyclisme |
| `team_sports` | Sports d'equipe (football, basketball...) |
| `winter_sports` | Sports d'hiver (ski, snowboard...) |
| `water_sports` | Sports nautiques (voile, plongee, surf...) |
| `mountain_outdoor` | Montagne / randonnee / escalade |
| `equestrian` | Equitation |
| `motor_sports` | Sports moteur (karting, moto cross...) |
| `combat_contact` | Sports de combat / contact |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Exposition accident globale | 0.8 |
| B-SAFE | Chirurgie esthetique (sports de contact/combat) | 0.6 |
| TRAVEL | Assurance Accident de Voyage, exclusions sports | 0.5 |
| HOME | Pack Objets de Loisirs (equipement sportif) | 0.4 |
| HOME | RC Vie Privee (sports = risque tiers) | 0.3 |

**Justification commerciale :** Completement absente de la V0. C'est elle qui dimensionne le coeur de B-Safe. Les sports de combat, sports moteur, sports d'hiver generent des risques d'accident majeurs. L'IPID B-Safe exclut explicitement les courses/concours -- il faut identifier ces profils. Au Luxembourg, le ski est tres pratique, l'equitation repandue, le cyclisme est un sport national.

---

#### Q18 -- `has_rc_vie_privee`

| Champ | Valeur |
|-------|--------|
| **ID** | `has_rc_vie_privee` |
| **Quadrant** | `personnes` |
| **Libelle** | Disposez-vous d'une assurance responsabilite civile vie privee ? |
| **Texte d'aide** | Elle couvre les dommages que vous pourriez causer involontairement a autrui dans votre vie quotidienne (hors vehicule). |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `yes` | Oui |
| `no` | Non |
| `unsure` | Je ne sais pas |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | RC Vie Privee | 1.0 |

**Justification commerciale :** La RC Vie Privee est l'une des options HOME les plus importantes et les plus meconnues. Si le client a des enfants, des animaux, pratique des sports, la RC est quasi indispensable. Le `unsure` est traite comme `no` dans le scoring -- c'est un signal de sous-couverture.

---

#### Q19 -- `accident_coverage_existing`

| Champ | Valeur |
|-------|--------|
| **ID** | `accident_coverage_existing` |
| **Quadrant** | `personnes` |
| **Libelle** | Disposez-vous actuellement d'une assurance accident individuelle ? |
| **Texte d'aide** | En dehors de ce que votre employeur propose eventuellement. |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Non, aucune couverture |
| `employer_only` | Uniquement par mon employeur |
| `individual_basic` | Oui, une assurance accident basique |
| `individual_complete` | Oui, une assurance accident complete |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Toutes garanties (gap de couverture) | 1.0 |

**Justification commerciale :** Remplace l'ancien `prevoyanceCoverage` trop vague. Distingue clairement : rien, couverture employeur seule (souvent minimale, s'arrete a la fin du contrat), et couverture individuelle. `employer_only` est le profil a fort potentiel B-Safe car le client pense etre couvert mais ne l'est que partiellement.

---

#### Q20 -- `travel_coverage_existing`

| Champ | Valeur |
|-------|--------|
| **ID** | `travel_coverage_existing` |
| **Quadrant** | `personnes` |
| **Libelle** | Disposez-vous d'une assurance voyage ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `travel_frequency` NEQ `never` |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Non, aucune |
| `credit_card` | Uniquement via ma carte bancaire |
| `annual` | Oui, un contrat annuel |
| `per_trip` | Oui, je souscris au cas par cas |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| TRAVEL | Toutes garanties (gap de couverture) | 1.0 |

**Justification commerciale :** `credit_card` est LE faux sentiment de securite le plus repandu. Les couvertures carte bancaire sont generalement tres limitees (plafonds bas, exclusions nombreuses, conditions de declenchement restrictives). C'est un argument de vente tres puissant pour Travel.

---

### QUADRANT 3 : PROTECTION DES PROJETS

> 6 questions. Alimente principalement DRIVE (base + Pack Indemnisation + Pack Mobilite + Pack Amenagement), HOME (Reequipement a neuf), et TRAVEL (Annulation, Bagages).

---

#### Q21 -- `vehicle_count`

| Champ | Valeur |
|-------|--------|
| **ID** | `vehicle_count` |
| **Quadrant** | `projets` |
| **Libelle** | Combien de vehicules votre foyer possede-t-il ? |
| **Texte d'aide** | Voitures, utilitaires, motos, scooters... |
| **Type** | `number` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| DRIVE | Base (dimensionnement portefeuille auto) | 1.0 |
| TRAVEL | Assistance Vehicules | 0.3 |

**Justification commerciale :** Conservee de la V0. C'est le pivot de l'univers auto. 0 vehicule desactive tout le sous-bloc vehicule du quadrant.

---

#### Q22 -- `vehicle_details`

| Champ | Valeur |
|-------|--------|
| **ID** | `vehicle_details` |
| **Quadrant** | `projets` |
| **Libelle** | Quel est votre vehicule principal ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `vehicle_count` GT `0` |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `car_new` | Voiture de moins de 3 ans |
| `car_recent` | Voiture de 3 a 8 ans |
| `car_old` | Voiture de plus de 8 ans |
| `suv_crossover` | SUV / Crossover |
| `utility` | Utilitaire |
| `moto` | Moto |
| `scooter` | Scooter |
| `electric` | Vehicule electrique / hybride |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| DRIVE | Formule (Omnium <3 ans, Mini-Omnium 3-8 ans, RC >8 ans) | 1.0 |
| DRIVE | Pack Dommage | 0.8 |
| DRIVE | Pack Indemnisation -- Protection Valeur Vehicule | 0.7 |
| DRIVE | Pack Amenagement (`utility`) | 0.6 |

**Justification commerciale :** Fusionne les anciens `vehicleType` et `vehicleAge` en une seule question plus riche. `electric` est un profil specifique au Luxembourg (tres subventionne, valeur residuelle elevee, reparations couteuses). `suv_crossover` est le vehicule le plus vendu au Luxembourg, valeur a neuf elevee justifiant l'omnium. Le Pack Amenagement est pertinent pour les utilitaires.

---

#### Q23 -- `vehicle_usage`

| Champ | Valeur |
|-------|--------|
| **ID** | `vehicle_usage` |
| **Quadrant** | `projets` |
| **Libelle** | Quelle est l'utilisation principale de votre vehicule ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `vehicle_count` GT `0` |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `daily_commute` | Trajets quotidiens (domicile-travail) |
| `professional` | Usage professionnel (rendez-vous, livraisons...) |
| `occasional` | Loisirs / usage occasionnel |
| `mixed` | Usage mixte (quotidien + loisirs) |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| DRIVE | Base (ponderation risque) | 0.6 |
| DRIVE | Pack Mobilite -- vehicule de remplacement | 0.9 |
| DRIVE | Conducteur Protege | 0.5 |

**Justification commerciale :** L'usage professionnel augmente l'exposition. L'usage quotidien rend le vehicule de remplacement (Pack Mobilite) quasi indispensable. Le Luxembourg a un taux de trajet domicile-travail parmi les plus longs d'Europe (frontaliers) -- un vehicule immobilise est un probleme majeur.

---

#### Q24 -- `vehicle_coverage_existing`

| Champ | Valeur |
|-------|--------|
| **ID** | `vehicle_coverage_existing` |
| **Quadrant** | `projets` |
| **Libelle** | Quelle est votre couverture auto actuelle ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `vehicle_count` GT `0` |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Pas de vehicule assure chez Baloise |
| `rc_only` | RC (responsabilite civile) uniquement |
| `mini_omnium` | Mini-Omnium (vol, incendie, bris de glace...) |
| `full_omnium` | Omnium complete |
| `unknown` | Je ne sais pas exactement |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| DRIVE | Toutes options (gap de couverture) | 1.0 |

**Justification commerciale :** Remplace l'ancien `autoCoverage` avec des options plus precises. Ajoute `mini_omnium` (formule intermediaire importante chez Baloise) et `unknown` (traite comme couverture insuffisante). `none` identifie les prospects vs clients existants a upgrader.

---

#### Q25 -- `vehicle_options_interest`

| Champ | Valeur |
|-------|--------|
| **ID** | `vehicle_options_interest` |
| **Quadrant** | `projets` |
| **Libelle** | Parmi ces situations, lesquelles vous concernent ? |
| **Texte d'aide** | Ces elements nous aident a evaluer vos besoins complementaires. |
| **Type** | `multi_select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `vehicle_count` GT `0` |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Aucune de ces situations |
| `new_vehicle_value` | Mon vehicule est recent et je souhaite proteger sa valeur |
| `replacement_needed` | Je ne pourrais pas me passer de vehicule, meme quelques jours |
| `professional_equipment` | Je transporte du materiel professionnel ou des bagages de valeur |
| `vehicle_customized` | Mon vehicule a des amenagements ou accessoires specifiques |
| `bonus_important` | Mon bonus est important pour moi, je ne veux pas le perdre |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| DRIVE | Pack Indemnisation -- Protection Valeur (`new_vehicle_value`) | 1.0 |
| DRIVE | Pack Indemnisation -- Protection Bonus (`bonus_important`) | 1.0 |
| DRIVE | Pack Mobilite -- Vehicule de remplacement (`replacement_needed`) | 1.0 |
| DRIVE | Pack Mobilite -- Bagages/Marchandises (`professional_equipment`) | 1.0 |
| DRIVE | Pack Amenagement (`vehicle_customized`) | 1.0 |

**Justification commerciale :** C'est la question de qualification d'upsell auto. Chaque option mappe directement sur un pack Drive. Le client s'auto-qualifie sur ses preoccupations sans qu'on lui vende quoi que ce soit. La formulation est en "situation" et non en "voulez-vous acheter". Le bonus est un sujet sensible pour les conducteurs luxembourgeois (systeme bonus-malus strict).

---

#### Q26 -- `home_coverage_existing`

| Champ | Valeur |
|-------|--------|
| **ID** | `home_coverage_existing` |
| **Quadrant** | `projets` |
| **Libelle** | Disposez-vous d'une assurance habitation ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Non, aucune |
| `basic_other` | Oui, chez un autre assureur (couverture basique) |
| `basic_baloise` | Oui, chez Baloise (couverture basique) |
| `with_options` | Oui, avec des options complementaires |
| `unknown` | Je ne sais pas exactement |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | Toutes garanties et options (gap de couverture) | 1.0 |

**Justification commerciale :** Distingue client Baloise existant (upsell d'options) vs prospect (conquete). `unknown` = couverture insuffisante. `basic_other` est le meilleur profil pour un transfert vers Baloise.

---

### QUADRANT 4 : PROTECTION DU FUTUR

> 6 questions. Alimente principalement B-SAFE (options avancees : Rente Viagere, Incapacite de Travail, Hospitalisation) et touche HOME (Pack Energie Renouvelable pour la protection patrimoniale long terme).

---

#### Q27 -- `income_range`

| Champ | Valeur |
|-------|--------|
| **ID** | `income_range` |
| **Quadrant** | `futur` |
| **Libelle** | Dans quelle tranche se situent les revenus nets mensuels de votre foyer ? |
| **Texte d'aide** | Cette information reste strictement confidentielle. Elle nous permet d'evaluer l'impact financier d'un arret de travail ou d'une incapacite. |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `less_3k` | Moins de 3 000 EUR |
| `3k_5k` | 3 000 - 5 000 EUR |
| `5k_8k` | 5 000 - 8 000 EUR |
| `8k_12k` | 8 000 - 12 000 EUR |
| `12k_plus` | Plus de 12 000 EUR |
| `no_answer` | Je prefere ne pas repondre |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Rente d'invalidite (dimensionnement) | 0.8 |
| B-SAFE | Incapacite de travail (dimensionnement) | 0.8 |
| HOME | Dimensionnement du contenu | 0.2 |

**Justification commerciale :** Tranches recalibrees pour le Luxembourg (salaire median ~4 500 EUR net, l'ancien `less-2k` etait trop bas). `no_answer` est indispensable -- le scoring utilise alors un profil median. La question est contextualisee dans le quadrant "futur" ou elle est naturelle (pas dans le profil express ou elle braquerait).

---

#### Q28 -- `financial_dependents`

| Champ | Valeur |
|-------|--------|
| **ID** | `financial_dependents` |
| **Quadrant** | `futur` |
| **Libelle** | Des personnes dependent-elles financierement de vous ? |
| **Texte d'aide** | Conjoint(e), enfants, parents ages, ou toute personne a votre charge. |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Non, personne |
| `partner` | Mon/ma conjoint(e) |
| `children` | Mes enfants uniquement |
| `partner_children` | Mon/ma conjoint(e) et mes enfants |
| `extended` | Ma famille elargie (parents, etc.) |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Deces (dimensionnement capital) | 1.0 |
| B-SAFE | Invalidite Permanente | 0.8 |
| B-SAFE | Rente Viagere | 0.7 |

**Justification commerciale :** Distincte de `family_status` du profil express. Ici on identifie la dependance financiere reelle. Un celibataire peut avoir des parents a charge. Un couple avec enfants peut avoir les deux conjoints salaries (dependance moindre). C'est cette question qui dimensionne le capital deces B-Safe.

---

#### Q29 -- `work_incapacity_concern`

| Champ | Valeur |
|-------|--------|
| **ID** | `work_incapacity_concern` |
| **Quadrant** | `futur` |
| **Libelle** | En cas d'arret de travail prolonge, combien de temps pourriez-vous maintenir votre niveau de vie ? |
| **Texte d'aide** | Tenez compte de votre epargne disponible et de la couverture eventuelle de votre employeur. |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | `professional_status` NOT_IN (`retired`, `inactive`, `student`) |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `less_1_month` | Moins d'un mois |
| `1_3_months` | 1 a 3 mois |
| `3_6_months` | 3 a 6 mois |
| `6_12_months` | 6 a 12 mois |
| `more_12_months` | Plus de 12 mois |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Incapacite de Travail Temporaire | 1.0 |
| B-SAFE | Indemnites Journalieres Hospitalisation | 0.6 |

**Justification commerciale :** C'est la question de prise de conscience la plus forte du questionnaire. Elle oblige le client a materialiser concretement le risque financier de l'incapacite. `less_1_month` est un signal d'alarme maximal. Combinee avec les revenus, elle donne au conseiller un argument quantifie imbattable.

---

#### Q30 -- `health_concerns`

| Champ | Valeur |
|-------|--------|
| **ID** | `health_concerns` |
| **Quadrant** | `futur` |
| **Libelle** | Avez-vous des preoccupations particulieres liees a votre sante ou votre activite ? |
| **Texte d'aide** | -- |
| **Type** | `multi_select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Non, rien de particulier |
| `physical_job` | Mon travail est physiquement exigeant |
| `frequent_driving` | Je conduis beaucoup (trajet long, professionnel) |
| `family_history` | Antecedents familiaux de maladie grave |
| `aging_parents` | Parents ages a accompagner |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Exposition globale | 0.6 |
| B-SAFE | Aide menagere / Soins a domicile (`aging_parents`) | 0.8 |
| B-SAFE | Chirurgie esthetique (`physical_job`) | 0.5 |
| DRIVE | Conducteur Protege (`frequent_driving`) | 0.6 |

**Justification commerciale :** Ce ne sont pas des "questions de sante" (intrusives et irrelevantes a ce stade) mais des indicateurs de mode de vie qui augmentent l'exposition. Le trajet long est un risque accident majeur au Luxembourg (frontaliers, autoroutes). Les parents ages activent l'aide a domicile.

---

#### Q31 -- `savings_protection`

| Champ | Valeur |
|-------|--------|
| **ID** | `savings_protection` |
| **Quadrant** | `futur` |
| **Libelle** | Avez-vous mis en place une epargne ou un dispositif pour proteger votre avenir ? |
| **Texte d'aide** | -- |
| **Type** | `multi_select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Non, rien de specifique |
| `life_insurance` | Assurance-vie |
| `pension_plan` | Plan de pension complementaire |
| `savings_regular` | Epargne reguliere |
| `real_estate` | Investissement immobilier |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| B-SAFE | Rente Viagere (si pas de pension) | 0.8 |
| B-SAFE | Deces (si pas d'assurance-vie) | 0.7 |

**Justification commerciale :** Identifie les gaps de protection long terme. Si le client n'a ni assurance-vie, ni pension complementaire, ni epargne reguliere, le risque de precarite en cas d'invalidite ou de retraite est maximal. Au Luxembourg, la pension complementaire est un sujet majeur (systeme par repartition sous pression demographique).

---

#### Q32 -- `other_properties`

| Champ | Valeur |
|-------|--------|
| **ID** | `other_properties` |
| **Quadrant** | `futur` |
| **Libelle** | Possedez-vous d'autres biens immobiliers (residence secondaire, investissement locatif) ? |
| **Texte d'aide** | -- |
| **Type** | `select` |
| **Obligatoire** | oui |
| **Conditionnalite** | aucune |

**Options :**

| Valeur | Libelle |
|--------|---------|
| `none` | Non |
| `secondary` | Une residence secondaire |
| `rental` | Un ou plusieurs biens locatifs |
| `both` | Residence secondaire et biens locatifs |

**Mapping produit :**

| Produit | Options ciblees | Poids scoring |
|---------|----------------|---------------|
| HOME | Multi-contrats, toutes garanties | 0.7 |
| HOME | Base (risque batiment supplementaire) | 0.5 |

**Justification commerciale :** Un bien locatif ou secondaire est un besoin HOME additionnel. C'est aussi un indicateur de patrimoine qui augmente le besoin global de protection. Au Luxembourg, l'investissement locatif est tres repandu (pression immobiliere forte, fiscalite favorable).

---

### Recapitulatif des questions

| # | ID | Quadrant | Type | Conditionnelle |
|---|-----|----------|------|----------------|
| Q01 | `age_range` | profil_express | select | non |
| Q02 | `family_status` | profil_express | select | non |
| Q03 | `children_count` | profil_express | number | oui (family_status) |
| Q04 | `professional_status` | profil_express | select | non |
| Q05 | `income_contributors` | profil_express | select | non |
| Q06 | `life_event` | profil_express | multi_select | non |
| Q07 | `housing_status` | biens | select | non |
| Q08 | `housing_type` | biens | select | non |
| Q09 | `home_specifics` | biens | multi_select | oui (housing_type) |
| Q10 | `home_contents_value` | biens | select | non |
| Q11 | `valuable_possessions` | biens | multi_select | non |
| Q12 | `valuable_total_estimate` | biens | select | oui (valuable_possessions) |
| Q13 | `security_measures` | biens | multi_select | non |
| Q14 | `travel_frequency` | personnes | select | non |
| Q15 | `travel_destinations` | personnes | multi_select | oui (travel_frequency) |
| Q16 | `travel_budget` | personnes | select | oui (travel_frequency) |
| Q17 | `sports_activities` | personnes | multi_select | non |
| Q18 | `has_rc_vie_privee` | personnes | select | non |
| Q19 | `accident_coverage_existing` | personnes | select | non |
| Q20 | `travel_coverage_existing` | personnes | select | oui (travel_frequency) |
| Q21 | `vehicle_count` | projets | number | non |
| Q22 | `vehicle_details` | projets | select | oui (vehicle_count) |
| Q23 | `vehicle_usage` | projets | select | oui (vehicle_count) |
| Q24 | `vehicle_coverage_existing` | projets | select | oui (vehicle_count) |
| Q25 | `vehicle_options_interest` | projets | multi_select | oui (vehicle_count) |
| Q26 | `home_coverage_existing` | projets | select | non |
| Q27 | `income_range` | futur | select | non |
| Q28 | `financial_dependents` | futur | select | non |
| Q29 | `work_incapacity_concern` | futur | select | oui (professional_status) |
| Q30 | `health_concerns` | futur | multi_select | non |
| Q31 | `savings_protection` | futur | multi_select | non |
| Q32 | `other_properties` | futur | select | non |

**Nombre de questions par bloc :**

| Bloc | Total | Conditionnelles | Visibles (profil median) | Duree estimee |
|------|-------|-----------------|--------------------------|---------------|
| Profil Express | 6 | 1 | 5-6 | 1m30 |
| Q1 - Biens | 7 | 2 | 5-6 | 2m00 |
| Q2 - Personnes | 7 | 3 | 5-6 | 2m00 |
| Q3 - Projets | 6 | 4 | 4-5 | 1m30 |
| Q4 - Futur | 6 | 1 | 5-6 | 2m00 |
| **TOTAL** | **32** | **11** | **24-29** | **5-8 min** |

---

## 3. Matrice Questions / Produits / Options

### 3.1 Legende des options Baloise

**DRIVE :**
- `drive_base` : Contrat de base (RC, defense-recours, assistance, conducteur protege)
- `drive_pack_dommage` : Pack Dommage (vol, incendie, bris de glace, forces nature, heurt animaux)
- `drive_dommages_materiels` : Dommages materiels (Omnium)
- `drive_pack_indemnisation` : Pack Indemnisation (protection bonus + protection valeur vehicule)
- `drive_pack_mobilite` : Pack Mobilite (vehicule remplacement, taxi, bagages/marchandises)
- `drive_pack_amenagement` : Pack Amenagement (accessoires, lettrages, amenagements specifiques)

**HOME :**
- `home_base` : Garanties systematiques (incendie, climatique, degats eaux, bris glaces, dommages electriques, RC biens, assistance, defense-recours)
- `home_vol` : Vol / vandalisme
- `home_multimedia` : Pack Multimedia
- `home_ov_art` : Pack Objets de valeur / d'art
- `home_op_bijoux` : Pack Objets precieux / bijoux
- `home_reequipement` : Reequipement a neuf
- `home_loisirs` : Pack Objets de loisirs
- `home_mobilite_durable` : Pack equipements de mobilite durable
- `home_jardin` : Pack jardin / piscine
- `home_liquide_cuves` : Pack perte de liquide / dommages cuves
- `home_energie` : Pack Energie renouvelable
- `home_cave_vin` : Pack Cave a vin / denrees alimentaires
- `home_rc_vie_privee` : RC Vie Privee

**TRAVEL :**
- `travel_assistance_personnes` : Assistance personnes a l'etranger
- `travel_assistance_vehicules` : Assistance vehicules
- `travel_annulation` : Annulation de voyage
- `travel_bagages` : Tous risques bagages
- `travel_accident` : Assurance accident de voyage

**B-SAFE :**
- `bsafe_deces` : Garantie deces
- `bsafe_invalidite` : Invalidite permanente
- `bsafe_rente` : Rente viagere d'invalidite
- `bsafe_incapacite` : Incapacite de travail temporaire
- `bsafe_chirurgie` : Chirurgie esthetique
- `bsafe_hospitalisation` : Indemnites journalieres hospitalisation
- `bsafe_aide_menagere` : Aide menagere / soins a domicile
- `bsafe_frais_divers` : Frais amenagements, rooming-in, rattrapage scolaire, garde enfants, materiel medical, sauvetage

### 3.2 Matrice complete

Le tableau ci-dessous indique pour chaque question quels produits/options elle alimente. Un `X` signifie un lien direct (la reponse impacte le scoring de cette option). Un `o` signifie un lien indirect (la reponse contribue a la ponderation globale).

```
                         ┌─── DRIVE ──────────────────┐ ┌──────────────── HOME ──────────────────────────────────────────────────┐ ┌──── TRAVEL ─────────────┐ ┌──────────── B-SAFE ─────────────────────────┐
Question                 │base│domm│omni│inde│mobi│amen│ │base│vol │mult│ov  │op  │reeq│lois│mobd│jard│liqu│ener│cave│rc  │ │assp│assv│annu│baga│acci│ │dece│inva│rent│inca│chir│hosp│aide│frai│
─────────────────────────┼────┼────┼────┼────┼────┼────┼─┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼─┼────┼────┼────┼────┼────┼─┼────┼────┼────┼────┼────┼────┼────┼────┤
Q01 age_range            │ o  │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │ X  │ X  │ X  │ X  │    │    │    │    │
Q02 family_status        │    │    │    │    │ o  │    │ │    │    │    │    │    │    │    │    │    │    │    │    │ X  │ │ o  │    │    │    │    │ │ X  │ X  │    │    │    │    │    │    │
Q03 children_count       │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │ X  │ │ o  │    │    │    │    │ │ X  │    │    │    │    │ o  │    │ X  │
Q04 professional_status  │ o  │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │ X  │ X  │    │    │    │    │
Q05 income_contributors  │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │ X  │ X  │    │ X  │    │    │    │    │
Q06 life_event           │ o  │    │    │ o  │    │    │ │ X  │    │    │    │    │ o  │    │    │    │    │ X  │    │    │ │    │    │ o  │    │    │ │ X  │ X  │ X  │ X  │    │    │    │    │
Q07 housing_status       │    │    │    │    │    │    │ │ X  │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │ o  │    │    │    │    │
Q08 housing_type         │    │    │    │    │    │    │ │ X  │    │    │    │    │    │    │    │ X  │ X  │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q09 home_specifics       │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │ X  │ X  │ X  │ X  │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q10 home_contents_value  │    │    │    │    │    │    │ │ X  │    │ o  │    │    │ X  │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q11 valuable_possessions │    │    │    │    │    │    │ │    │    │ X  │ X  │ X  │    │ X  │ X  │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q12 valuable_total       │    │    │    │    │    │    │ │    │    │    │ X  │ X  │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q13 security_measures    │    │    │    │    │    │    │ │    │ X  │    │ X  │ X  │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q14 travel_frequency     │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │ X  │ X  │ X  │ X  │ X  │ │    │    │    │    │    │    │    │    │
Q15 travel_destinations  │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │ X  │    │    │ X  │ X  │ │    │    │    │    │    │    │    │    │
Q16 travel_budget        │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │ X  │    │    │ │    │    │    │    │    │    │    │    │
Q17 sports_activities    │    │    │    │    │    │    │ │    │    │    │    │    │    │ o  │    │    │    │    │    │ X  │ │    │    │    │    │ X  │ │    │ X  │    │    │ X  │    │    │    │
Q18 has_rc_vie_privee    │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │ X  │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q19 accident_cov_exist   │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │ X  │ X  │ X  │ X  │ X  │ X  │ X  │ X  │
Q20 travel_cov_exist     │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │ X  │ X  │ X  │ X  │ X  │ │    │    │    │    │    │    │    │    │
Q21 vehicle_count        │ X  │ X  │ X  │ X  │ X  │ X  │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │ o  │    │    │    │ │    │    │    │    │    │    │    │    │
Q22 vehicle_details      │ X  │ X  │ X  │ X  │    │ X  │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q23 vehicle_usage        │ X  │    │    │    │ X  │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q24 vehicle_cov_exist    │ X  │ X  │ X  │ X  │ X  │ X  │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q25 vehicle_options_int  │    │    │    │ X  │ X  │ X  │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q26 home_cov_exist       │    │    │    │    │    │    │ │ X  │ X  │ X  │ X  │ X  │ X  │ X  │ X  │ X  │ X  │ X  │ X  │ X  │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
Q27 income_range         │    │    │    │    │    │    │ │ o  │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │ X  │ X  │ X  │ X  │    │    │    │    │
Q28 financial_dependents │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │ X  │ X  │ X  │    │    │    │    │    │
Q29 work_incapacity      │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │ X  │    │ X  │    │    │
Q30 health_concerns      │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │ o  │    │ X  │ X  │    │ X  │    │
Q31 savings_protection   │    │    │    │    │    │    │ │    │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │ X  │    │ X  │    │    │    │    │    │
Q32 other_properties     │    │    │    │    │    │    │ │ X  │    │    │    │    │    │    │    │    │    │    │    │    │ │    │    │    │    │    │ │    │    │    │    │    │    │    │    │
```

**Lecture** : `X` = lien direct (scoring), `o` = lien indirect (ponderation/contexte).

### 3.3 Couverture produit -- verification

| Produit/Option | Nb questions directes | Questions cles |
|---|---|---|
| drive_base | 5 | Q21, Q22, Q23, Q24, Q06 |
| drive_pack_dommage | 3 | Q21, Q22, Q24 |
| drive_dommages_materiels | 3 | Q21, Q22, Q24 |
| drive_pack_indemnisation | 4 | Q21, Q22, Q24, Q25 |
| drive_pack_mobilite | 4 | Q21, Q23, Q24, Q25 |
| drive_pack_amenagement | 4 | Q21, Q22, Q24, Q25 |
| home_base | 6 | Q07, Q08, Q10, Q26, Q27, Q32 |
| home_vol | 2 | Q13, Q26 |
| home_multimedia | 2 | Q11, Q26 |
| home_ov_art | 4 | Q11, Q12, Q13, Q26 |
| home_op_bijoux | 4 | Q11, Q12, Q13, Q26 |
| home_reequipement | 2 | Q10, Q26 |
| home_loisirs | 2 | Q11, Q26 |
| home_mobilite_durable | 2 | Q11, Q26 |
| home_jardin | 3 | Q08, Q09, Q26 |
| home_liquide_cuves | 3 | Q08, Q09, Q26 |
| home_energie | 2 | Q09, Q26 |
| home_cave_vin | 2 | Q09, Q26 |
| home_rc_vie_privee | 4 | Q02, Q03, Q17, Q18 |
| travel_assistance_personnes | 3 | Q14, Q15, Q20 |
| travel_assistance_vehicules | 2 | Q14, Q20 |
| travel_annulation | 3 | Q14, Q16, Q20 |
| travel_bagages | 3 | Q14, Q15, Q20 |
| travel_accident | 3 | Q14, Q15, Q20 |
| bsafe_deces | 6 | Q01, Q02, Q05, Q06, Q27, Q28 |
| bsafe_invalidite | 5 | Q01, Q02, Q05, Q17, Q27 |
| bsafe_rente | 4 | Q01, Q04, Q28, Q31 |
| bsafe_incapacite | 6 | Q01, Q04, Q05, Q06, Q27, Q29 |
| bsafe_chirurgie | 2 | Q17, Q30 |
| bsafe_hospitalisation | 2 | Q19, Q29 |
| bsafe_aide_menagere | 2 | Q19, Q30 |
| bsafe_frais_divers | 2 | Q03, Q19 |

**Verdict** : tous les produits et options Baloise sont alimentes par au moins 2 questions. Aucune option orpheline.

---
