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

## 4. Logique de scoring

### 4.1 Architecture a deux niveaux

Le scoring V0 calculait un score unique par "univers" (auto, habitation, prevoyance, objets_valeur). Il ne permettait pas de recommander des options specifiques.

Le scoring V1 fonctionne sur **deux niveaux** :

**Niveau 1 -- Score par quadrant** (affiche sur la roue) :
Chaque quadrant recoit un score d'exposition, un score de couverture, et un need score (via la matrice existante).

**Niveau 2 -- Score par produit/option** (pour les recommandations) :
Chaque produit et chaque option Baloise recoit un score de pertinence qui determine s'il doit etre recommande et avec quelle priorite.

### 4.2 Types TypeScript

```typescript
// === Niveau 1 : Quadrants ===

type Quadrant = 'biens' | 'personnes' | 'projets' | 'futur'
type NeedLevel = 'low' | 'moderate' | 'high' | 'critical'

interface QuadrantScore {
  quadrant: Quadrant
  exposure: number       // 0-100
  coverage: number       // 0-100
  needScore: number      // 0-100 (via matrice exposition x couverture)
  needLevel: NeedLevel   // low <= 25, moderate <= 50, high <= 75, critical > 75
  active: boolean        // false si le quadrant n'a pas ete rempli
}

// === Niveau 2 : Produits et options ===

type Product = 'drive' | 'home' | 'travel' | 'bsafe'

interface ProductScore {
  product: Product
  relevance: number          // 0-100, pertinence globale du produit
  isExistingClient: boolean  // true si le client a deja ce produit chez Baloise
  options: OptionScore[]
}

interface OptionScore {
  optionId: string           // ex: 'drive_pack_mobilite', 'home_cave_vin'
  optionLabel: string        // ex: 'Pack Mobilite', 'Pack Cave a vin'
  relevance: number          // 0-100
  triggerQuestions: string[]  // IDs des questions qui ont active cette option
  triggerValues: string[]    // Valeurs specifiques qui ont declenche
}

// === Resultat global ===

interface DiagnosticResult {
  quadrantScores: Record<Quadrant, QuadrantScore>
  globalScore: number        // 0-100, moyenne ponderee des quadrants
  weightings: Record<Quadrant, number>  // somme = 100
  productScores: ProductScore[]
  recommendations: Recommendation[]
}
```

### 4.3 Matrice exposition x couverture (conservee)

La matrice V0 est conservee car elle est methodologiquement solide :

```
                   Couverture
                   Complete (0)   Partielle (1)   Aucune (2)
Exposition Faible (0)    10             35             40
           Moyenne (1)   15             60             85
           Forte (2)     35             85             95
```

La fonction `computeNeedFromMatrix(exposureLevel, coverageLevel)` reste inchangee.

Les seuils de `NeedLevel` restent inchanges :
- `low` : 0-25
- `moderate` : 26-50
- `high` : 51-75
- `critical` : 76-100

### 4.4 Calcul de l'exposition par quadrant

#### Quadrant BIENS

```typescript
function computeBiensExposure(answers: Answers): number {
  let score = 0
  let weights = 0

  // Housing status (poids 25)
  const housingRisk = {
    owner_with_mortgage: 100,
    owner_no_mortgage: 60,
    tenant: 50,
    lodged_free: 20,
  }
  score += (housingRisk[answers.housing_status] ?? 50) * 0.25
  weights += 0.25

  // Home contents value (poids 20)
  const contentsRisk = {
    less_20k: 20,
    '20k_50k': 45,
    '50k_100k': 75,
    '100k_plus': 100,
  }
  score += (contentsRisk[answers.home_contents_value] ?? 40) * 0.20
  weights += 0.20

  // Valuable possessions (poids 20)
  // Score = 0 si 'none', sinon 20 par categorie selectionnee, max 100
  const valuablesCount = countNonNone(answers.valuable_possessions)
  score += Math.min(valuablesCount * 20, 100) * 0.20
  weights += 0.20

  // Vehicle value risk (poids 20)
  const vehicleRisk = {
    car_new: 90, electric: 95, suv_crossover: 85,
    car_recent: 60, moto: 70, utility: 50,
    car_old: 25, scooter: 30,
  }
  if (answers.vehicle_count > 0) {
    score += (vehicleRisk[answers.vehicle_details] ?? 50) * 0.20
  }
  weights += answers.vehicle_count > 0 ? 0.20 : 0

  // Security deficit (poids 15)
  // Score inverse : 100 si aucune mesure, 0 si toutes les mesures
  const securityCount = countNonNone(answers.security_measures)
  const securityDeficit = Math.max(100 - securityCount * 25, 0)
  score += securityDeficit * 0.15
  weights += 0.15

  return weights > 0 ? Math.round(score / weights) : 50
}
```

#### Quadrant PERSONNES

```typescript
function computePersonnesExposure(answers: Answers): number {
  let score = 0
  let weights = 0

  // Family vulnerability (poids 25)
  let familyScore = 30 // base
  if (['couple_with_children', 'single_parent', 'recomposed'].includes(answers.family_status)) {
    familyScore = 70
  }
  if (answers.income_contributors === 'one' && familyScore >= 70) {
    familyScore = 100 // mono-revenu + enfants = max
  }
  score += familyScore * 0.25
  weights += 0.25

  // Travel exposure (poids 20)
  const travelRisk = { never: 0, once_year: 30, several_year: 65, frequent: 100 }
  let travelScore = travelRisk[answers.travel_frequency] ?? 0
  if (answers.travel_destinations?.includes('worldwide')) travelScore = Math.min(travelScore + 25, 100)
  if (answers.travel_destinations?.includes('adventure')) travelScore = Math.min(travelScore + 20, 100)
  score += travelScore * 0.20
  weights += 0.20

  // Sports risk (poids 20)
  const highRiskSports = ['winter_sports', 'water_sports', 'mountain_outdoor', 'equestrian', 'motor_sports', 'combat_contact']
  const moderateRiskSports = ['running_cycling', 'team_sports']
  let sportsScore = 0
  const activities = answers.sports_activities ?? []
  for (const a of activities) {
    if (highRiskSports.includes(a)) sportsScore += 25
    if (moderateRiskSports.includes(a)) sportsScore += 10
  }
  score += Math.min(sportsScore, 100) * 0.20
  weights += 0.20

  // Driving exposure (poids 15)
  let drivingScore = 0
  if (answers.vehicle_usage === 'daily_commute') drivingScore = 50
  if (answers.vehicle_usage === 'professional') drivingScore = 75
  if (answers.vehicle_usage === 'mixed') drivingScore = 60
  if (answers.health_concerns?.includes('frequent_driving')) drivingScore = Math.min(drivingScore + 30, 100)
  score += drivingScore * 0.15
  weights += 0.15

  // Children exposure (poids 20)
  const childrenScore = Math.min((answers.children_count ?? 0) * 25, 100)
  score += childrenScore * 0.20
  weights += 0.20

  return weights > 0 ? Math.round(score / weights) : 50
}
```

#### Quadrant PROJETS

```typescript
function computeProjetsExposure(answers: Answers): number {
  let score = 0
  let weights = 0

  // Life events count (poids 30)
  const events = answers.life_event ?? []
  const eventCount = events.includes('none') ? 0 : events.length
  score += Math.min(eventCount * 30, 100) * 0.30
  weights += 0.30

  // Vehicle dependency (poids 25)
  let vehicleScore = 0
  if (answers.vehicle_count > 0) {
    if (answers.vehicle_usage === 'daily_commute' || answers.vehicle_usage === 'professional') vehicleScore = 80
    if (answers.vehicle_usage === 'mixed') vehicleScore = 60
    if (answers.vehicle_options_interest?.includes('replacement_needed')) vehicleScore = 100
    if (answers.vehicle_count >= 2) vehicleScore = Math.min(vehicleScore + 15, 100)
  }
  score += vehicleScore * 0.25
  weights += 0.25

  // Travel budget at risk (poids 20)
  const budgetRisk = { less_1k: 15, '1k_3k': 40, '3k_5k': 70, '5k_plus': 100 }
  const travelBudgetScore = answers.travel_frequency !== 'never'
    ? (budgetRisk[answers.travel_budget] ?? 0)
    : 0
  score += travelBudgetScore * 0.20
  weights += 0.20

  // Home contents value (poids 15) -- reequipement a neuf
  const contentsRisk = { less_20k: 10, '20k_50k': 35, '50k_100k': 70, '100k_plus': 100 }
  score += (contentsRisk[answers.home_contents_value] ?? 30) * 0.15
  weights += 0.15

  // Other properties (poids 10)
  const propertiesRisk = { none: 0, secondary: 50, rental: 70, both: 100 }
  score += (propertiesRisk[answers.other_properties] ?? 0) * 0.10
  weights += 0.10

  return weights > 0 ? Math.round(score / weights) : 50
}
```

#### Quadrant FUTUR

```typescript
function computeFuturExposure(answers: Answers): number {
  let score = 0
  let weights = 0

  // Financial dependents (poids 30)
  const dependentsRisk = {
    none: 10, partner: 40, children: 60,
    partner_children: 90, extended: 80,
  }
  score += (dependentsRisk[answers.financial_dependents] ?? 30) * 0.30
  weights += 0.30

  // Work incapacity autonomy (poids 25)
  const autonomyRisk = {
    less_1_month: 100, '1_3_months': 80, '3_6_months': 55,
    '6_12_months': 30, more_12_months: 10,
  }
  // Si la question n'est pas visible (retraite, etudiant, inactif), utiliser un score neutre
  if (answers.work_incapacity_concern) {
    score += (autonomyRisk[answers.work_incapacity_concern] ?? 50) * 0.25
  } else {
    score += 30 * 0.25 // score neutre pour retraites/inactifs
  }
  weights += 0.25

  // Savings gap (poids 20)
  const savingsItems = answers.savings_protection ?? []
  const hasSavings = !savingsItems.includes('none') && savingsItems.length > 0
  const savingsGap = hasSavings ? Math.max(100 - savingsItems.length * 25, 0) : 100
  score += savingsGap * 0.20
  weights += 0.20

  // Income level -- plus de revenus = plus a perdre (poids 15)
  const incomeRisk = {
    less_3k: 30, '3k_5k': 45, '5k_8k': 65,
    '8k_12k': 80, '12k_plus': 100, no_answer: 50,
  }
  score += (incomeRisk[answers.income_range] ?? 50) * 0.15
  weights += 0.15

  // Age factor -- 36-55 = zone critique (poids 10)
  const ageRisk = {
    '18_25': 30, '26_35': 50, '36_45': 90,
    '46_55': 100, '56_65': 70, '65_plus': 40,
  }
  score += (ageRisk[answers.age_range] ?? 50) * 0.10
  weights += 0.10

  return weights > 0 ? Math.round(score / weights) : 50
}
```

### 4.5 Calcul de la couverture par quadrant

#### Quadrant BIENS

```typescript
function computeBiensCoverage(answers: Answers): number {
  let score = 0
  let weights = 0

  // Home coverage existing (poids 50)
  const homeCovScore = {
    none: 0, unknown: 10, basic_other: 30,
    basic_baloise: 40, with_options: 80,
  }
  score += (homeCovScore[answers.home_coverage_existing] ?? 10) * 0.50
  weights += 0.50

  // Vehicle coverage existing (poids 30)
  if (answers.vehicle_count > 0) {
    const vehicleCovScore = {
      none: 0, unknown: 10, rc_only: 30,
      mini_omnium: 60, full_omnium: 90,
    }
    score += (vehicleCovScore[answers.vehicle_coverage_existing] ?? 10) * 0.30
    weights += 0.30
  }

  // Valuable coverage implicit (poids 20)
  // Deduit de : home coverage level + security measures
  let valuableCov = 0
  if (answers.home_coverage_existing === 'with_options') valuableCov = 60
  else if (['basic_baloise', 'basic_other'].includes(answers.home_coverage_existing)) valuableCov = 20
  const securityCount = countNonNone(answers.security_measures)
  valuableCov += securityCount * 10 // chaque mesure ajoute 10 points
  score += Math.min(valuableCov, 100) * 0.20
  weights += 0.20

  return weights > 0 ? Math.round(score / weights) : 0
}
```

#### Quadrant PERSONNES

```typescript
function computePersonnesCoverage(answers: Answers): number {
  let score = 0
  let weights = 0

  // Accident coverage existing (poids 40)
  const accidentCovScore = {
    none: 0, employer_only: 25,
    individual_basic: 55, individual_complete: 90,
  }
  score += (accidentCovScore[answers.accident_coverage_existing] ?? 0) * 0.40
  weights += 0.40

  // Travel coverage existing (poids 30)
  if (answers.travel_frequency !== 'never') {
    const travelCovScore = {
      none: 0, credit_card: 15, per_trip: 50, annual: 85,
    }
    score += (travelCovScore[answers.travel_coverage_existing] ?? 0) * 0.30
    weights += 0.30
  }

  // RC Vie Privee (poids 30)
  const rcScore = { yes: 90, no: 0, unsure: 0 }
  score += (rcScore[answers.has_rc_vie_privee] ?? 0) * 0.30
  weights += 0.30

  return weights > 0 ? Math.round(score / weights) : 0
}
```

#### Quadrant PROJETS

```typescript
function computeProjetsCoverage(answers: Answers): number {
  let score = 0
  let weights = 0

  // Vehicle options coverage (poids 40)
  // Deduit de vehicle_coverage + options_interest
  if (answers.vehicle_count > 0) {
    let vehicleOptionsCov = 0
    if (answers.vehicle_coverage_existing === 'full_omnium') vehicleOptionsCov = 60
    else if (answers.vehicle_coverage_existing === 'mini_omnium') vehicleOptionsCov = 40
    else if (answers.vehicle_coverage_existing === 'rc_only') vehicleOptionsCov = 15
    // Si le client exprime des besoins non couverts, reduire
    const unmetNeeds = countNonNone(answers.vehicle_options_interest)
    vehicleOptionsCov = Math.max(vehicleOptionsCov - unmetNeeds * 10, 0)
    score += vehicleOptionsCov * 0.40
    weights += 0.40
  }

  // Travel annulation coverage (poids 30)
  if (answers.travel_frequency !== 'never') {
    const travelAnnulCov = {
      none: 0, credit_card: 10, per_trip: 50, annual: 80,
    }
    score += (travelAnnulCov[answers.travel_coverage_existing] ?? 0) * 0.30
    weights += 0.30
  }

  // Home reequipement coverage (poids 30)
  const homeReequipCov = answers.home_coverage_existing === 'with_options' ? 60 : 10
  score += homeReequipCov * 0.30
  weights += 0.30

  return weights > 0 ? Math.round(score / weights) : 0
}
```

#### Quadrant FUTUR

```typescript
function computeFuturCoverage(answers: Answers): number {
  let score = 0
  let weights = 0

  // Accident coverage (poids 30)
  const accidentCov = {
    none: 0, employer_only: 20,
    individual_basic: 50, individual_complete: 85,
  }
  score += (accidentCov[answers.accident_coverage_existing] ?? 0) * 0.30
  weights += 0.30

  // Savings protection (poids 40)
  const savingsItems = answers.savings_protection ?? []
  const hasSavings = !savingsItems.includes('none') && savingsItems.length > 0
  const savingsCov = hasSavings ? Math.min(savingsItems.length * 25, 100) : 0
  score += savingsCov * 0.40
  weights += 0.40

  // Income protection implicit (poids 30)
  // Fonctionnaire = meilleure protection de base
  let incomeCov = 10
  if (answers.professional_status === 'civil_servant') incomeCov = 50
  else if (answers.professional_status === 'employee') incomeCov = 30
  if (answers.accident_coverage_existing === 'individual_complete') incomeCov += 30
  else if (answers.accident_coverage_existing === 'individual_basic') incomeCov += 15
  score += Math.min(incomeCov, 100) * 0.30
  weights += 0.30

  return weights > 0 ? Math.round(score / weights) : 0
}
```

### 4.6 Ponderation dynamique des quadrants

Les poids de chaque quadrant dans le score global s'adaptent automatiquement au profil du client. Les poids de base sont egaux (25% chacun), puis ajustes selon les reponses au profil express.

```typescript
function computeWeightings(answers: Answers): Record<Quadrant, number> {
  const weights: Record<Quadrant, number> = {
    biens: 25, personnes: 25, projets: 25, futur: 25,
  }

  // Profil famille avec enfants -> futur et personnes augmentent
  if (['couple_with_children', 'single_parent', 'recomposed'].includes(answers.family_status)) {
    weights.futur += 10
    weights.personnes += 5
    weights.projets -= 10
    weights.biens -= 5
  }

  // Parent seul -> futur est critique
  if (answers.family_status === 'single_parent') {
    weights.futur += 5 // cumul avec ci-dessus
  }

  // Independant/chef d'entreprise -> futur augmente
  if (['independent', 'business_owner'].includes(answers.professional_status)) {
    weights.futur += 10
    weights.biens -= 5
    weights.projets -= 5
  }

  // Proprietaire avec credit -> biens augmente
  if (answers.housing_status === 'owner_with_mortgage') {
    weights.biens += 5
    weights.futur += 5 // prevoyance emprunteur
    weights.personnes -= 5
    weights.projets -= 5
  }

  // Retraite -> biens et personnes augmentent, futur diminue
  if (answers.professional_status === 'retired') {
    weights.biens += 5
    weights.personnes += 5
    weights.futur -= 10
  }

  // Voyageur frequent -> personnes augmente
  if (['several_year', 'frequent'].includes(answers.travel_frequency)) {
    weights.personnes += 5
    weights.biens -= 5
  }

  // Normaliser a 100
  const total = Object.values(weights).reduce((s, w) => s + w, 0)
  for (const key of Object.keys(weights) as Quadrant[]) {
    weights[key] = Math.round((weights[key] / total) * 100)
  }

  return weights
}
```

**Ponderations resultantes par profil-type :**

| Profil | Biens | Personnes | Projets | Futur |
|--------|-------|-----------|---------|-------|
| Jeune celibataire (base) | 25 | 25 | 25 | 25 |
| Couple sans enfant | 25 | 25 | 25 | 25 |
| Famille avec enfants | 20 | 30 | 15 | 35 |
| Parent seul | 20 | 30 | 15 | 35 |
| Independant sans enfant | 20 | 25 | 20 | 35 |
| Independant avec famille | 15 | 30 | 10 | 45 |
| Retraite | 30 | 30 | 25 | 15 |
| Proprietaire avec credit | 30 | 20 | 20 | 30 |
| Voyageur frequent | 20 | 30 | 25 | 25 |

### 4.7 Score de pertinence par produit/option

Chaque produit/option recoit un score de pertinence (0-100) calcule a partir des questions qui le mappent. Ce score n'est pas affiche au client -- il sert a ordonner les recommandations et a determiner lesquelles afficher.

**Principe :** pour chaque option, on aggrege les contributions des questions qui la mappent, ponderees par le `scoringWeight` defini dans le mapping.

```typescript
function computeOptionRelevance(
  optionId: string,
  answers: Answers,
  questionMappings: Map<string, ProductMapping[]>
): number {
  let totalScore = 0
  let totalWeight = 0

  for (const [questionId, mappings] of questionMappings) {
    for (const mapping of mappings) {
      if (mapping.options?.includes(optionId)) {
        const questionScore = evaluateQuestionContribution(questionId, answers)
        totalScore += questionScore * mapping.scoringWeight
        totalWeight += mapping.scoringWeight
      }
    }
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
}
```

**Seuils de recommandation :**

| Score pertinence | Action |
|-----------------|--------|
| 0-20 | Pas de recommandation |
| 21-40 | Recommandation differee (information) |
| 41-70 | Recommandation standard (a envisager) |
| 71-100 | Recommandation prioritaire (a traiter) |

---

## 5. Regles de recommandation

### 5.1 Structure d'une recommandation

```typescript
interface Recommendation {
  id: string
  product: Product
  optionId?: string               // null si recommandation sur le produit de base
  type: 'immediate' | 'deferred' | 'event' | 'optimization'
  priority: number                // 1-5, 5 = plus urgent
  title: string                   // titre court
  message: string                 // message oriente conseil (client-facing)
  advisorNote?: string            // note reservee au conseiller
  triggerConditions: string       // description lisible des conditions
}
```

Les types de recommandation :
- `immediate` : action a mener rapidement, risque avere
- `deferred` : a envisager, pas urgent mais pertinent
- `event` : liee a un evenement de vie imminent
- `optimization` : amelioration d'une couverture existante

### 5.2 Regles DRIVE

#### DRIVE-01 : Vehicule recent sans omnium

| Champ | Valeur |
|-------|--------|
| **ID** | `drive_01_recent_no_omnium` |
| **Condition** | `vehicle_details` IN (`car_new`, `electric`, `suv_crossover`) ET `vehicle_coverage_existing` IN (`rc_only`, `none`, `unknown`) |
| **Type** | `immediate` |
| **Priorite** | 5 |
| **Titre** | Proteger votre vehicule recent |
| **Message** | Votre vehicule represente un investissement important. Avec une couverture RC seule, un sinistre total, un vol ou un incendie ne serait pas rembourse. La couverture Omnium protege la valeur de votre vehicule. |
| **Note conseiller** | Vehicule < 3 ans ou electrique/SUV avec RC seule. Argumenter sur le cout de remplacement vs le cout de la prime Omnium. |

#### DRIVE-02 : Vehicule age avec omnium

| Champ | Valeur |
|-------|--------|
| **ID** | `drive_02_old_with_omnium` |
| **Condition** | `vehicle_details` = `car_old` ET `vehicle_coverage_existing` = `full_omnium` |
| **Type** | `optimization` |
| **Priorite** | 2 |
| **Titre** | Optimiser votre couverture auto |
| **Message** | Votre vehicule a plus de 8 ans. Verifiez que le cout de votre omnium reste coherent avec la valeur du vehicule. Une Mini-Omnium pourrait vous offrir une protection adaptee a moindre cout. |
| **Note conseiller** | Verifier la valeur residuelle. Si prime omnium > 10% de la valeur vehicule, migration vers mini-omnium ou RC a etudier. |

#### DRIVE-03 : Vehicule electrique sans protection valeur

| Champ | Valeur |
|-------|--------|
| **ID** | `drive_03_electric_no_protection` |
| **Condition** | `vehicle_details` = `electric` ET `vehicle_coverage_existing` != `full_omnium` |
| **Type** | `immediate` |
| **Priorite** | 4 |
| **Titre** | Proteger votre vehicule electrique |
| **Message** | Les reparations d'un vehicule electrique coutent en moyenne 30% de plus qu'un vehicule thermique, et la batterie represente une part importante de la valeur. Une couverture Omnium avec protection de la valeur est d'autant plus pertinente. |
| **Note conseiller** | Argumenter sur le cout de la batterie (30-40% de la valeur du vehicule). Le pack indemnisation est un upsell naturel. |

#### DRIVE-04 : Besoin de mobilite sans Pack Mobilite

| Champ | Valeur |
|-------|--------|
| **ID** | `drive_04_mobility_need` |
| **Condition** | (`vehicle_usage` IN (`daily_commute`, `professional`) OU `vehicle_options_interest` CONTAINS `replacement_needed`) ET `vehicle_coverage_existing` NOT IN (`full_omnium`) |
| **Type** | `immediate` |
| **Priorite** | 3 |
| **Titre** | Garantir votre mobilite |
| **Message** | Vous dependez de votre vehicule au quotidien. En cas de sinistre ou de panne, le vehicule de remplacement vous garantit de rester mobile sans delai. |
| **Note conseiller** | Le Pack Mobilite inclut vehicule de remplacement + taxi + bagages. Argumenter sur le cout d'une location vs le cout du pack. |

#### DRIVE-05 : Protection du bonus

| Champ | Valeur |
|-------|--------|
| **ID** | `drive_05_bonus_protection` |
| **Condition** | `vehicle_options_interest` CONTAINS `bonus_important` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Preserver votre bonus |
| **Message** | Votre bonus represente une economie significative sur votre prime. La protection bonus evite une majoration apres un sinistre responsable, pour une cotisation modeste. |
| **Note conseiller** | Pack Indemnisation. Chiffrer l'economie de bonus sur 3 ans vs le cout du pack. |

#### DRIVE-06 : Amenagements non couverts

| Champ | Valeur |
|-------|--------|
| **ID** | `drive_06_custom_vehicle` |
| **Condition** | `vehicle_options_interest` CONTAINS `vehicle_customized` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Couvrir vos amenagements |
| **Message** | Les amenagements specifiques et accessoires de votre vehicule ne sont pas couverts par la garantie standard. Le Pack Amenagement protege votre investissement. |
| **Note conseiller** | Pack Amenagement. Pertinent surtout pour utilitaires amenages et vehicules avec accessoires aftermarket. |

#### DRIVE-07 : Transport de materiel

| Champ | Valeur |
|-------|--------|
| **ID** | `drive_07_professional_transport` |
| **Condition** | `vehicle_options_interest` CONTAINS `professional_equipment` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Proteger votre materiel en deplacement |
| **Message** | Le materiel professionnel ou les bagages de valeur que vous transportez ne sont pas couverts par l'assurance auto de base. Le Pack Mobilite etend la couverture aux biens transportes. |
| **Note conseiller** | Composante Bagages/Marchandises du Pack Mobilite. Evaluer la valeur du materiel transporte. |

#### DRIVE-08 : Achat de vehicule prevu

| Champ | Valeur |
|-------|--------|
| **ID** | `drive_08_new_vehicle_event` |
| **Condition** | `life_event` CONTAINS `new_vehicle` |
| **Type** | `event` |
| **Priorite** | 4 |
| **Titre** | Anticiper la couverture de votre futur vehicule |
| **Message** | L'achat d'un vehicule est le moment ideal pour choisir une couverture adaptee. Votre conseiller peut preparer un devis personnalise avant meme la livraison. |
| **Note conseiller** | Opportunite Omnium + packs. Proposer un RDV avant l'achat pour optimiser la couverture. |

### 5.3 Regles HOME

#### HOME-01 : Locataire sans assurance

| Champ | Valeur |
|-------|--------|
| **ID** | `home_01_tenant_no_coverage` |
| **Condition** | `housing_status` = `tenant` ET `home_coverage_existing` = `none` |
| **Type** | `immediate` |
| **Priorite** | 5 |
| **Titre** | Securiser votre logement |
| **Message** | En tant que locataire, vous etes responsable des dommages causes au logement (degat des eaux, incendie). Une assurance habitation protege votre responsabilite et vos biens. |
| **Note conseiller** | Au Luxembourg, l'assurance habitation n'est pas legalement obligatoire pour les locataires mais quasi systematiquement exigee par les bailleurs. Verifier le bail. |

#### HOME-02 : Proprietaire avec credit sans couverture complete

| Champ | Valeur |
|-------|--------|
| **ID** | `home_02_owner_mortgage_gap` |
| **Condition** | `housing_status` = `owner_with_mortgage` ET `home_coverage_existing` IN (`none`, `unknown`) |
| **Type** | `immediate` |
| **Priorite** | 5 |
| **Titre** | Proteger votre investissement immobilier |
| **Message** | Avec un credit immobilier en cours, une couverture habitation complete protege votre bien et votre famille. En cas de sinistre grave, c'est votre patrimoine qui est en jeu. |
| **Note conseiller** | Verifier si la banque exige une assurance. Proposer Home complet + prevoyance emprunteur (B-Safe). |

#### HOME-03 : Jardin/Piscine sans pack

| Champ | Valeur |
|-------|--------|
| **ID** | `home_03_garden_pool` |
| **Condition** | `home_specifics` CONTAINS (`garden` OU `pool`) ET `home_coverage_existing` != `with_options` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Couvrir vos espaces exterieurs |
| **Message** | Votre jardin amenage et/ou votre piscine ne sont pas couverts par l'assurance habitation de base. Le Pack Jardin/Piscine protege vos amenagements exterieurs contre les intemperies, le gel et les dommages accidentels. |
| **Note conseiller** | Pack Jardin/Piscine. Chiffrer la valeur des amenagements exterieurs. |

#### HOME-04 : Panneaux solaires sans pack

| Champ | Valeur |
|-------|--------|
| **ID** | `home_04_solar_panels` |
| **Condition** | `home_specifics` CONTAINS `solar_panels` ET `home_coverage_existing` != `with_options` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Proteger vos installations d'energie renouvelable |
| **Message** | Vos panneaux solaires ou votre pompe a chaleur representent un investissement de plusieurs milliers d'euros. Le Pack Energie Renouvelable couvre les dommages specifiques a ces installations. |
| **Note conseiller** | Pack Energie Renouvelable. Au Luxembourg, investissement moyen 10-20k EUR. Argument : subventions ne couvrent que l'installation, pas le remplacement en cas de sinistre. |

#### HOME-05 : Cave a vin

| Champ | Valeur |
|-------|--------|
| **ID** | `home_05_wine_cellar` |
| **Condition** | `home_specifics` CONTAINS `wine_cellar` |
| **Type** | `deferred` |
| **Priorite** | 2 |
| **Titre** | Assurer votre cave a vin |
| **Message** | Votre cave a vin est un patrimoine sensible aux variations de temperature, au bris accidentel et au vol. Le Pack Cave a Vin couvre sa valeur reelle. |
| **Note conseiller** | Pack Cave a Vin/Denrees. Question sur la valeur estimee de la cave pour dimensionner. |

#### HOME-06 : Equipement multimedia

| Champ | Valeur |
|-------|--------|
| **ID** | `home_06_multimedia` |
| **Condition** | `valuable_possessions` CONTAINS `multimedia` ET `home_coverage_existing` != `with_options` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Couvrir vos equipements multimedia |
| **Message** | Vos equipements multimedia haut de gamme (ordinateurs, home cinema, materiel photo...) depassent souvent les plafonds de la couverture standard. Le Pack Multimedia protege leur valeur reelle. |
| **Note conseiller** | Pack Multimedia. Lister les equipements concernes et chiffrer. |

#### HOME-07 : Mobilite durable

| Champ | Valeur |
|-------|--------|
| **ID** | `home_07_sustainable_mobility` |
| **Condition** | `valuable_possessions` CONTAINS `sustainable_mobility` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Proteger votre equipement de mobilite durable |
| **Message** | Votre velo electrique ou trottinette represente un investissement de plusieurs milliers d'euros, souvent insuffisamment couvert. Le Pack Mobilite Durable protege contre le vol, la casse et les dommages. |
| **Note conseiller** | Pack Mobilite Durable. Velo electrique moyen 3-8k EUR au Luxembourg. Vol en forte hausse. |

#### HOME-08 : Objets de valeur significatifs sans pack

| Champ | Valeur |
|-------|--------|
| **ID** | `home_08_high_value_items` |
| **Condition** | `valuable_possessions` CONTAINS (`jewelry` OU `art` OU `collections`) ET `valuable_total_estimate` IN (`15k_50k`, `50k_plus`) ET `home_coverage_existing` != `with_options` |
| **Type** | `immediate` |
| **Priorite** | 4 |
| **Titre** | Assurer vos objets de valeur |
| **Message** | Vos objets de valeur depassent les plafonds de la couverture habitation standard. Sans assurance specifique, vous ne seriez rembourse qu'a hauteur d'un plafond forfaitaire, tres inferieur a leur valeur reelle. |
| **Note conseiller** | Pack OV/Art ou Pack OP/Bijoux selon le type. Proposer une expertise pour les valeurs > 50k. |

#### HOME-09 : Equipement de loisirs

| Champ | Valeur |
|-------|--------|
| **ID** | `home_09_sports_equipment` |
| **Condition** | `valuable_possessions` CONTAINS `sports_leisure` |
| **Type** | `deferred` |
| **Priorite** | 2 |
| **Titre** | Couvrir votre equipement sportif |
| **Message** | Votre equipement de loisirs couteux (ski, golf, velo...) n'est generalement pas couvert par l'assurance habitation standard, ni en dehors du domicile. Le Pack Objets de Loisirs etend la protection. |
| **Note conseiller** | Pack Objets de Loisirs. Couvre aussi hors domicile (important pour equipement sportif). |

#### HOME-10 : Pas de RC Vie Privee avec profil a risque

| Champ | Valeur |
|-------|--------|
| **ID** | `home_10_rc_vie_privee` |
| **Condition** | `has_rc_vie_privee` IN (`no`, `unsure`) ET (`children_count` > 0 OU `sports_activities` NOT_CONTAINS `none`) |
| **Type** | `immediate` |
| **Priorite** | 4 |
| **Titre** | Vous proteger en responsabilite civile |
| **Message** | Avec des enfants ou une activite sportive, les risques de causer involontairement des dommages a des tiers sont reels. La RC Vie Privee vous protege contre les consequences financieres, partout dans le monde. |
| **Note conseiller** | RC Vie Privee HOME. Couverture monde entier. Exemples concrets : enfant qui casse une vitre, collision a velo, chute en ski blessant un tiers. |

#### HOME-11 : Absence de securite avec biens de valeur

| Champ | Valeur |
|-------|--------|
| **ID** | `home_11_no_security_valuables` |
| **Condition** | `security_measures` CONTAINS `none` ET `valuable_possessions` NOT_CONTAINS `none` |
| **Type** | `immediate` |
| **Priorite** | 4 |
| **Titre** | Securiser et assurer vos biens de valeur |
| **Message** | Vos biens de valeur sont conserves sans dispositif de securite particulier. L'option Vol/Vandalisme est d'autant plus recommandee. Votre conseiller peut aussi vous orienter vers des solutions de securisation adaptees. |
| **Note conseiller** | Home Vol/Vandalisme en priorite. Conseil securite : proposer coffre-fort ou alarme pour reduire la prime. |

#### HOME-12 : Contenu eleve sans reequipement a neuf

| Champ | Valeur |
|-------|--------|
| **ID** | `home_12_reequipement` |
| **Condition** | `home_contents_value` IN (`50k_100k`, `100k_plus`) ET `home_coverage_existing` != `with_options` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Proteger la valeur de remplacement de vos biens |
| **Message** | En cas de sinistre, la valeur de remplacement de votre contenu peut etre tres differente de la valeur d'usage. Le Reequipement a neuf vous garantit le remplacement sans decote. |
| **Note conseiller** | Reequipement a neuf. Argument cle : la difference vetuste/neuf peut representer 30-50% de la valeur. |

#### HOME-13 : Achat immobilier prevu

| Champ | Valeur |
|-------|--------|
| **ID** | `home_13_property_purchase` |
| **Condition** | `life_event` CONTAINS `property_purchase` |
| **Type** | `event` |
| **Priorite** | 5 |
| **Titre** | Securiser votre projet immobilier |
| **Message** | L'achat immobilier est le moment ideal pour mettre en place une couverture habitation complete. Votre conseiller peut preparer votre contrat en amont pour que vous soyez couvert des l'acte de vente. |
| **Note conseiller** | Home complet + B-Safe prevoyance emprunteur. Proposer un RDV avant la signature. Cross-sell majeur. |

#### HOME-14 : Travaux/Renovation prevus

| Champ | Valeur |
|-------|--------|
| **ID** | `home_14_renovation` |
| **Condition** | `life_event` CONTAINS `renovation` |
| **Type** | `event` |
| **Priorite** | 3 |
| **Titre** | Adapter votre couverture a vos travaux |
| **Message** | Des travaux de renovation modifient la valeur de votre bien et potentiellement vos installations (energie renouvelable, cuisine, salle de bain). Pensez a mettre a jour votre contrat habitation. |
| **Note conseiller** | Revaluation des capitaux + Pack Energie Renouvelable si installation solaire/PAC. |

#### HOME-15 : Biens locatifs/secondaires

| Champ | Valeur |
|-------|--------|
| **ID** | `home_15_other_properties` |
| **Condition** | `other_properties` != `none` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Assurer vos autres biens immobiliers |
| **Message** | Votre residence secondaire ou vos biens locatifs necessitent chacun une couverture adaptee. En tant que proprietaire bailleur, votre responsabilite est engagee. |
| **Note conseiller** | Multi-contrat Home. Le bien locatif doit etre couvert meme si le locataire a sa propre assurance (responsabilite du proprietaire). |

### 5.4 Regles TRAVEL

#### TRAVEL-01 : Voyageur frequent sans contrat annuel

| Champ | Valeur |
|-------|--------|
| **ID** | `travel_01_frequent_no_annual` |
| **Condition** | `travel_frequency` IN (`several_year`, `frequent`) ET `travel_coverage_existing` != `annual` |
| **Type** | `immediate` |
| **Priorite** | 4 |
| **Titre** | Opter pour une couverture voyage annuelle |
| **Message** | Avec plusieurs voyages par an, un contrat annuel est plus economique et vous couvre en permanence, sans avoir a y penser a chaque depart. |
| **Note conseiller** | Travel annuel. Chiffrer : cout de 2-3 contrats temporaires vs annuel. Argument de tranquillite. |

#### TRAVEL-02 : Destinations hors Europe avec couverture carte bancaire

| Champ | Valeur |
|-------|--------|
| **ID** | `travel_02_worldwide_credit_card` |
| **Condition** | `travel_destinations` CONTAINS `worldwide` ET `travel_coverage_existing` = `credit_card` |
| **Type** | `immediate` |
| **Priorite** | 5 |
| **Titre** | Renforcer votre couverture voyage hors Europe |
| **Message** | Les couvertures des cartes bancaires ont des plafonds limites et des exclusions nombreuses. Hors Europe, une hospitalisation peut couter des dizaines de milliers d'euros. Une assurance voyage dediee vous couvre sans surprise. |
| **Note conseiller** | Travel complet. Exemples concrets : hospitalisation aux USA 5-20k EUR/jour. Rapatriement medical 15-50k EUR. La carte bancaire plafonne generalement a 10-15k EUR. |

#### TRAVEL-03 : Budget voyage eleve sans annulation

| Champ | Valeur |
|-------|--------|
| **ID** | `travel_03_high_budget_no_cancel` |
| **Condition** | `travel_budget` IN (`3k_5k`, `5k_plus`) ET `travel_coverage_existing` IN (`none`, `credit_card`) |
| **Type** | `immediate` |
| **Priorite** | 4 |
| **Titre** | Proteger votre investissement voyage |
| **Message** | Un voyage a plus de 3 000 EUR represente un investissement important. En cas d'annulation pour maladie, accident ou imprevu familial, l'assurance annulation vous rembourse les frais engages. |
| **Note conseiller** | Travel Annulation. Les causes d'annulation couvertes sont larges : maladie, accident, deces d'un proche, licenciement, convocation tribunal. |

#### TRAVEL-04 : Destinations aventure sans accident voyage

| Champ | Valeur |
|-------|--------|
| **ID** | `travel_04_adventure_no_accident` |
| **Condition** | `travel_destinations` CONTAINS `adventure` ET `travel_coverage_existing` IN (`none`, `credit_card`) |
| **Type** | `immediate` |
| **Priorite** | 3 |
| **Titre** | Vous couvrir pour vos voyages aventure |
| **Message** | Les destinations nature et aventure presentent des risques specifiques (eloignement des structures medicales, activites de plein air). L'assurance accident de voyage complete votre protection sur place. |
| **Note conseiller** | Travel Accident + Assistance Personnes. Verifier la compatibilite des activites prevues avec les exclusions (sports exclus dans l'IPID). |

#### TRAVEL-05 : Famille voyageuse sans formule famille

| Champ | Valeur |
|-------|--------|
| **ID** | `travel_05_family_travel` |
| **Condition** | `children_count` > 0 ET `travel_frequency` != `never` ET `travel_coverage_existing` IN (`none`, `credit_card`) |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Couvrir toute la famille en voyage |
| **Message** | Avec des enfants, les imprevus de voyage sont plus frequents et plus complexes a gerer. La formule famille couvre tout le foyer sous un seul contrat, y compris l'annulation et l'assistance. |
| **Note conseiller** | Travel formule famille. Argument : un enfant malade a l'etranger = rapatriement de toute la famille. |

### 5.5 Regles B-SAFE

#### BSAFE-01 : Famille mono-revenu sans couverture

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_01_family_single_income` |
| **Condition** | `family_status` IN (`couple_with_children`, `single_parent`, `recomposed`) ET `income_contributors` = `one` ET `accident_coverage_existing` IN (`none`, `employer_only`) |
| **Type** | `immediate` |
| **Priorite** | 5 |
| **Titre** | Proteger votre famille |
| **Message** | Avec un seul revenu et des personnes a charge, un accident grave ou un deces aurait des consequences financieres immediates pour votre famille. C'est la priorite numero un de votre protection. |
| **Note conseiller** | B-Safe complet : Deces + Invalidite + Incapacite. Capital deces a dimensionner sur 3-5 ans de revenus. C'est LA recommandation prioritaire du diagnostic. Ne pas diluer avec d'autres sujets. |

#### BSAFE-02 : Independant sans couverture

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_02_independent_no_coverage` |
| **Condition** | `professional_status` IN (`independent`, `business_owner`) ET `accident_coverage_existing` IN (`none`, `employer_only`) |
| **Type** | `immediate` |
| **Priorite** | 5 |
| **Titre** | Securiser votre activite |
| **Message** | En tant qu'independant, vous ne beneficiez pas des filets de securite d'un salarie. Un arret de travail prolonge impacte directement vos revenus et votre activite. La couverture incapacite de travail est essentielle. |
| **Note conseiller** | B-Safe Incapacite de Travail en priorite. Puis Deces/Invalidite si personnes a charge. L'independant est le profil a plus forte valeur B-Safe. |

#### BSAFE-03 : Autonomie financiere faible

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_03_low_autonomy` |
| **Condition** | `work_incapacity_concern` IN (`less_1_month`, `1_3_months`) ET `income_range` NOT IN (`less_3k`, `no_answer`) |
| **Type** | `immediate` |
| **Priorite** | 5 |
| **Titre** | Securiser vos revenus en cas d'arret |
| **Message** | Avec moins de 3 mois d'autonomie financiere, un arret de travail prolonge mettrait votre foyer en difficulte rapidement. L'assurance incapacite de travail maintient vos revenus pendant votre convalescence. |
| **Note conseiller** | B-Safe Incapacite + Hospitalisation. Chiffrer : X EUR de revenus mensuels x 6 mois = Y EUR de manque a gagner. Confronter avec le cout de la prime. Argument imbattable. |

#### BSAFE-04 : Sportif a risque sans couverture

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_04_sports_risk` |
| **Condition** | `sports_activities` CONTAINS (`winter_sports` OU `water_sports` OU `mountain_outdoor` OU `equestrian` OU `motor_sports` OU `combat_contact`) ET `accident_coverage_existing` IN (`none`, `employer_only`) |
| **Type** | `immediate` |
| **Priorite** | 4 |
| **Titre** | Vous couvrir pour vos activites sportives |
| **Message** | Vos activites sportives vous exposent a un risque d'accident plus eleve. Une couverture accident dediee vous protege, y compris pour les suites medicales et la reeducation. |
| **Note conseiller** | B-Safe avec options sport. Verifier que les activites du client ne tombent pas dans les exclusions IPID (courses, concours). Si oui, informer le client de la limite. |

#### BSAFE-05 : Enfants sans couverture specifique

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_05_children_coverage` |
| **Condition** | `children_count` > 0 ET `accident_coverage_existing` IN (`none`, `employer_only`) |
| **Type** | `deferred` |
| **Priorite** | 4 |
| **Titre** | Proteger vos enfants en cas d'accident |
| **Message** | En cas d'hospitalisation, qui s'occupe de vos enfants ? Les options garde d'enfants, rattrapage scolaire et rooming-in securisent votre famille au quotidien pendant votre retablissement. |
| **Note conseiller** | B-Safe Frais divers (garde enfants, rattrapage scolaire, rooming-in). Argument emotionnel fort. Ne pas abuser mais poser la question concretement. |

#### BSAFE-06 : Parents ages a accompagner

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_06_aging_parents` |
| **Condition** | `health_concerns` CONTAINS `aging_parents` |
| **Type** | `deferred` |
| **Priorite** | 3 |
| **Titre** | Vous proteger pour continuer a accompagner vos proches |
| **Message** | Si vous accompagnez des parents ages, une immobilisation suite a un accident rendrait cette aide impossible. L'option aide menagere et soins a domicile vous soutient pendant votre retablissement. |
| **Note conseiller** | B-Safe Aide menagere/Soins a domicile. Argument : qui prend le relais si vous ne pouvez plus vous deplacer ? |

#### BSAFE-07 : Credit immobilier sans prevoyance deces

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_07_mortgage_no_death_cover` |
| **Condition** | `housing_status` = `owner_with_mortgage` ET `accident_coverage_existing` IN (`none`, `employer_only`) ET `savings_protection` NOT_CONTAINS `life_insurance` |
| **Type** | `immediate` |
| **Priorite** | 5 |
| **Titre** | Proteger votre famille et votre logement |
| **Message** | En cas de deces, votre famille devrait assumer le remboursement du credit immobilier. Un capital deces adapte au solde de votre emprunt garantit le maintien dans le logement. |
| **Note conseiller** | B-Safe Deces. Capital = solde restant du credit. Cross-sell naturel avec Home. C'est souvent l'argument qui declenche la souscription B-Safe. |

#### BSAFE-08 : Pas de pension complementaire apres 45 ans

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_08_no_pension_over_45` |
| **Condition** | `age_range` IN (`46_55`, `56_65`) ET `savings_protection` NOT_CONTAINS `pension_plan` ET `savings_protection` NOT_CONTAINS `life_insurance` |
| **Type** | `deferred` |
| **Priorite** | 4 |
| **Titre** | Anticiper votre protection long terme |
| **Message** | Sans pension complementaire ni assurance-vie, une invalidite permanente pourrait reduire drastiquement vos revenus futurs. La rente viagere d'invalidite securise votre avenir. |
| **Note conseiller** | B-Safe Rente Viagere. Au Luxembourg, le taux de remplacement retraite diminue. Argumenter sur l'ecart pension legale vs niveau de vie actuel. |

#### BSAFE-09 : Travail physique et conduite frequente

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_09_physical_exposure` |
| **Condition** | `health_concerns` CONTAINS (`physical_job` OU `frequent_driving`) ET `accident_coverage_existing` IN (`none`, `employer_only`) |
| **Type** | `immediate` |
| **Priorite** | 3 |
| **Titre** | Adapter votre protection a votre quotidien |
| **Message** | Votre activite et vos deplacements vous exposent davantage aux risques d'accident. Une couverture etendue incluant l'hospitalisation et les frais medicaux est recommandee. |
| **Note conseiller** | B-Safe etendu (Hospitalisation + Frais divers). Pour les frontaliers : argumenter sur le temps de trajet (risque proportionnel au km/jour). |

#### BSAFE-10 : Naissance prevue

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_10_birth_event` |
| **Condition** | `life_event` CONTAINS `birth` |
| **Type** | `event` |
| **Priorite** | 5 |
| **Titre** | Preparer la protection de votre famille |
| **Message** | L'arrivee d'un enfant change tout. C'est le moment ideal pour securiser l'avenir de votre famille avec une couverture deces et invalidite adaptee a votre nouvelle situation. |
| **Note conseiller** | B-Safe Deces + Invalidite. Moment emotionnel fort, timing ideal. Inclure les options garde/rooming-in/rattrapage scolaire. |

#### BSAFE-11 : Depart en retraite

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_11_retirement_event` |
| **Condition** | `life_event` CONTAINS `retirement` |
| **Type** | `event` |
| **Priorite** | 4 |
| **Titre** | Adapter votre protection a la retraite |
| **Message** | Le passage a la retraite modifie profondement votre protection. La couverture employeur disparait, les risques de sante augmentent. Un bilan complet vous permettra d'anticiper sereinement. |
| **Note conseiller** | Revoir l'integralite de la couverture. La prevoyance employeur s'arrete. B-Safe personnel devient indispensable. Moment de vie cle pour un rendez-vous global. |

#### BSAFE-12 : Divorce/Separation

| Champ | Valeur |
|-------|--------|
| **ID** | `bsafe_12_divorce_event` |
| **Condition** | `life_event` CONTAINS `divorce` |
| **Type** | `event` |
| **Priorite** | 4 |
| **Titre** | Revoir votre protection apres une separation |
| **Message** | Une separation modifie votre situation financiere et vos beneficiaires. C'est le moment de mettre a jour votre couverture pour qu'elle corresponde a votre nouvelle realite. |
| **Note conseiller** | Revoir tous les contrats : beneficiaires B-Safe, couverture Home (nouveau logement), Drive (changement de conducteur). Approche globale, pas produit par produit. |

---

## 6. Annexes

### 6.1 Comparaison V0 / V1

| Dimension | V0 | V1 |
|-----------|----|----|
| Nombre de questions | 26 | 32 |
| Questions visibles (median) | ~22 | 24-29 |
| Blocs | 5 (lineaires) | 1 profil + 4 quadrants (roue) |
| Produits couverts | 3 (Drive, Home, B-Safe) | 4 (+ Travel) |
| Options qualifiables | 0 | 25+ |
| Types de questions | select, boolean, number | + multi_select |
| Couverture existante | 2 questions vagues | 4 questions precises |
| Questions mode de vie | 0 | 4 (voyage, sport, sante, epargne) |
| Regles de recommandation | 12 | 40+ |
| Scoring | par univers uniquement | par quadrant + par produit/option |
| Bugs connus | 2 (age_range, incomeSource) | 0 |

### 6.2 Bugs V0 corriges par conception

**Bug 1 -- engine.ts ligne 64 :** `ageRange === '30-50'` ne matchait jamais (les options etaient '30-40' et '40-50'). Corrige : les tranches V1 sont `36_45` et `46_55`, sans trou.

**Bug 2 -- rules.ts ligne 46 :** reference `incomeSource` qui n'existe pas dans le schema. Corrige : remplace par `income_contributors` (Q05) correctement defini dans le schema et reference dans les regles.

### 6.3 Profils-types pour les tests

**Profil 1 -- Jeune celibataire urbain :**
- 26-35 ans, celibataire, salarie, 2 contributeurs, pas d'evenement
- Locataire, appartement, pas de biens specifiques, contenu <20k
- 1 voiture recente, usage quotidien, RC seule
- Voyage 1-2x/an en Europe, budget 1-3k, pas d'assurance voyage
- Course a pied, pas de RC vie privee, pas de couverture accident
- Revenus 3-5k, pas de dependants, 6-12 mois autonomie
- Epargne reguliere
- **Resultat attendu** : Drive Omnium (prio 5), Home base (prio 4), Travel annuel (prio 3), B-Safe basique (prio 2)

**Profil 2 -- Famille proprietaire avec credit :**
- 36-45 ans, couple avec 2 enfants, salarie, 2 contributeurs, naissance prevue
- Proprietaire avec credit, maison, jardin + panneaux solaires, contenu 50-100k
- Bijoux 5-15k, alarme
- 2 vehicules dont SUV < 3 ans, usage mixte, mini-omnium
- Voyage 3+/an Europe + hors Europe, budget 3-5k, couverture carte bancaire
- Ski + cyclisme, pas de RC vie privee, couverture employeur seule
- Revenus 8-12k, conjoint + enfants a charge, 3-6 mois autonomie
- Assurance-vie + epargne reguliere, 1 bien locatif
- **Resultat attendu** : B-Safe complet (prio 5), Home avec packs (prio 5), Travel complet (prio 5), Drive upgrade + packs (prio 4)

**Profil 3 -- Independant sans couverture :**
- 46-55 ans, couple sans enfant, independant, 1 contributeur, changement pro
- Proprietaire sans credit, maison mitoyenne, cave a vin + dependances, contenu 100k+
- Art + collections 50k+, coffre-fort
- 1 voiture ancienne, usage pro, omnium complete
- Voyage frequent monde entier, budget 5k+, au cas par cas
- Equitation + montagne, RC vie privee oui, aucune couverture accident
- Revenus 12k+, conjoint a charge, <1 mois autonomie
- Investissement immobilier, pas de pension, pas d'assurance-vie
- **Resultat attendu** : B-Safe complet (prio 5 critique), Travel annuel (prio 4), Home packs OV + cave (prio 3), Drive optimisation (prio 2)

**Profil 4 -- Retraite :**
- 65+, couple sans enfant, retraite, 2 contributeurs, depart retraite
- Proprietaire sans credit, maison, jardin + piscine + panneaux solaires, contenu 50-100k
- Bijoux + multimedia 15-50k, alarme + camera
- 1 voiture 3-8 ans, usage occasionnel, omnium
- Voyage 1-2x/an Europe, budget 3-5k, contrat annuel
- Pas de sport regulier, RC vie privee oui, couverture accident complete
- Revenus 5-8k, conjoint a charge, 12+ mois autonomie
- Plan pension + assurance-vie + immobilier, residence secondaire
- **Resultat attendu** : Home packs jardin/piscine/EnR (prio 3), Drive optimisation omnium->mini (prio 2), B-Safe maintien (prio 1)

### 6.4 Glossaire produits Baloise

| ID technique | Nom commercial | Produit parent |
|---|---|---|
| `drive_base` | Baloise Drive | DRIVE |
| `drive_pack_dommage` | Pack Dommage | DRIVE |
| `drive_dommages_materiels` | Omnium | DRIVE |
| `drive_pack_indemnisation` | Pack Indemnisation | DRIVE |
| `drive_pack_mobilite` | Pack Mobilite | DRIVE |
| `drive_pack_amenagement` | Pack Amenagement | DRIVE |
| `home_base` | Baloise Home | HOME |
| `home_vol` | Vol / Vandalisme | HOME |
| `home_multimedia` | Pack Multimedia | HOME |
| `home_ov_art` | Pack Objets de valeur / d'art | HOME |
| `home_op_bijoux` | Pack Objets precieux / bijoux | HOME |
| `home_reequipement` | Reequipement a neuf | HOME |
| `home_loisirs` | Pack Objets de loisirs | HOME |
| `home_mobilite_durable` | Pack Mobilite durable | HOME |
| `home_jardin` | Pack Jardin / Piscine | HOME |
| `home_liquide_cuves` | Pack Perte liquide / Cuves | HOME |
| `home_energie` | Pack Energie renouvelable | HOME |
| `home_cave_vin` | Pack Cave a vin / Denrees | HOME |
| `home_rc_vie_privee` | RC Vie Privee | HOME |
| `travel_assistance_personnes` | Assistance personnes | TRAVEL |
| `travel_assistance_vehicules` | Assistance vehicules | TRAVEL |
| `travel_annulation` | Annulation de voyage | TRAVEL |
| `travel_bagages` | Tous risques bagages | TRAVEL |
| `travel_accident` | Accident de voyage | TRAVEL |
| `bsafe_deces` | Garantie Deces | B-SAFE |
| `bsafe_invalidite` | Invalidite permanente | B-SAFE |
| `bsafe_rente` | Rente viagere d'invalidite | B-SAFE |
| `bsafe_incapacite` | Incapacite de travail | B-SAFE |
| `bsafe_chirurgie` | Chirurgie esthetique | B-SAFE |
| `bsafe_hospitalisation` | Indemnites hospitalisation | B-SAFE |
| `bsafe_aide_menagere` | Aide menagere / Soins domicile | B-SAFE |
| `bsafe_frais_divers` | Frais divers (garde, rattrapage, rooming-in, sauvetage) | B-SAFE |

### 6.5 Notes d'implementation

1. **Le type `multi_select` doit gerer l'exclusivite de `none`** : si l'utilisateur selectionne `none`, toutes les autres options sont deselectionnees. Inversement, si l'utilisateur selectionne une option non-`none`, `none` est deselectionnee.

2. **Les questions de couverture existante distinguent Baloise vs autre assureur** quand c'est pertinent (Q24, Q26). Cela permet d'identifier les profils prospects vs clients existants a upgrader.

3. **Le `unknown` / `unsure` dans les questions de couverture** est traite comme une couverture insuffisante dans le scoring. C'est un signal fort : un client qui ne sait pas ce qu'il a est probablement mal couvert.

4. **La question revenus (Q27) est dans le quadrant Futur**, pas dans le profil express. C'est un choix delibere : la question est contextualisee dans le bloc prevoyance ou elle est naturelle et justifiee. Dans le profil express, elle braquerait.

5. **Les regles de recommandation ont une `advisorNote`** en plus du `message` client. Le message client est oriente conseil (jamais vendeur). La note conseiller contient les arguments commerciaux, les chiffres, et les techniques de rebond.

6. **Le scoring par option permet des recommandations granulaires** : au lieu de recommander "Baloise Home", on recommande "Baloise Home + Pack Jardin + Pack Energie + Vol/Vandalisme". C'est beaucoup plus actionnable pour le conseiller.

7. **Les 4 profils-types de test** (section 6.3) couvrent les cas extremes du scoring. Ils doivent etre implementes comme tests automatises pour valider que le moteur produit les recommandations attendues.

---

*Document genere le 12 mars 2026. Version 1.0.*
*Prochain jalon : implementation du schema TypeScript (`schema.ts`) et du moteur de scoring (`engine.ts`).*
