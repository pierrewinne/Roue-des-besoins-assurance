# Note de cadrage produit -- Verification d'adequation contrats uploades

> Roue des Besoins Assurance -- Baloise Luxembourg
> Version 1.0 -- Mars 2026
> Statut : NOTE DE CADRAGE -- A SOUMETTRE POUR DECISION GO/NO-GO
> Auteur : Lead Product Manager

---

## Table des matieres

1. [Objet](#1-objet)
2. [Reformulation produit / business](#2-reformulation-produit--business)
3. [Vision produit et proposition de valeur](#3-vision-produit-et-proposition-de-valeur)
4. [Personas et use cases](#4-personas-et-use-cases)
5. [User stories principales](#5-user-stories-principales)
6. [Architecture fonctionnelle](#6-architecture-fonctionnelle)
7. [Segmentation des contrats et mapping quadrants](#7-segmentation-des-contrats-et-mapping-quadrants)
8. [MVP vs Full -- Decoupage en phases](#8-mvp-vs-full----decoupage-en-phases)
9. [Risques produit](#9-risques-produit)
10. [KPIs de succes](#10-kpis-de-succes)
11. [Dependances](#11-dependances)
12. [Impacts transverses](#12-impacts-transverses)
13. [Recommandation GO/NO-GO](#13-recommandation-gono-go)
14. [Annexes](#14-annexes)

---

## 1. Objet

Evaluer l'opportunite, definir le cadre fonctionnel et recommander un plan d'implementation pour une **fonctionnalite d'upload et d'analyse de contrats d'assurance existants** au sein de l'application Roue des Besoins.

Le principe : apres avoir realise le diagnostic des besoins (scoring 5x5 exposure/coverage, recommandations produits), l'utilisateur uploade ses contrats d'assurance actuels. Le systeme analyse les documents, extrait les informations de couverture, et produit un **rapport d'adequation** entre besoins detectes et couverture reelle.

---

## 2. Reformulation produit / business

### Le probleme reel

Aujourd'hui, le diagnostic existant fonctionne sur **des declarations** : le client declare son niveau de couverture (ex: `vehicle_coverage_existing = 'full_omnium'`, `home_coverage_existing = 'basic'`, `accident_coverage_existing = 'none'`). Le scoring de couverture est donc **auto-declare, subjectif, et imprecis**.

Consequences :
- Un client qui declare "couverture avec options" pour son habitation peut avoir un contrat basique avec une seule option RC vie privee -- son score de couverture est surestime
- Un client ne sait pas toujours s'il est en omnium ou mini-omnium -- son score est aleatoire
- Aucune granularite sur les franchises, plafonds, exclusions -- le scoring traite de la meme maniere un contrat a 250 EUR de franchise et un contrat a 2.500 EUR
- Le conseiller ne peut pas objectiver la discussion sans voir les contrats reels

### Le vrai enjeu

Passer d'un **diagnostic declaratif approximatif** a un **diagnostic factuel ancre dans les contrats reels**. Cela transforme la nature meme de l'outil :

| Dimension | Aujourd'hui (declaratif) | Demain (factuel) |
|-----------|--------------------------|-------------------|
| Source de verite | Perception du client | Documents contractuels |
| Granularite | 4 niveaux (none/basic/options/unknown) | Garantie par garantie, plafond, franchise |
| Fiabilite | Faible a moyenne | Haute (si extraction correcte) |
| Valeur pour le conseiller | Point de depart | Base d'argumentation |
| Valeur pour le client | Orientation generale | Cartographie precise des lacunes |
| Conversion | Prise de conscience | Preuve concrete du gap |

### L'opportunite strategique

Pour Baloise Luxembourg, cette fonctionnalite :
1. **Augmente la conversion** : un gap documente entre besoin et couverture est infiniment plus convaincant qu'un score abstrait
2. **Renforce le role du conseiller** : le conseiller arrive en RDV avec un dossier deja instrui
3. **Capture de la donnee concurrentielle** : Baloise obtient une vue sur le portefeuille concurrent de ses prospects (assureurs, niveaux de garantie, tarifs)
4. **Differenciation marche** : aucun acteur luxembourgeois ne propose ce niveau d'analyse en self-service
5. **Verrouille le parcours** : le client qui a uploade ses contrats a investi du temps -- il est engage

---

## 3. Vision produit et proposition de valeur

### Positionnement

**"Votre bilan de protection complet"** -- Une analyse factuelle de l'adequation entre votre situation reelle et votre couverture existante.

### Proposition de valeur par cible

| Cible | Promesse | Mecanisme de valeur |
|-------|----------|---------------------|
| Client self-service | "Decouvrez si vous etes bien protege -- preuve a l'appui" | Upload simple, resultat visuel, identification des gaps |
| Client avec conseiller | "Preparez votre RDV avec un dossier deja structure" | Le conseiller recoit l'analyse avant le RDV |
| Conseiller Baloise | "Objectivez votre argumentation commerciale" | Base factuelle pour le conseil en adequation |
| Prospect concurrent | "Comparez objectivement votre contrat actuel" | Mise en evidence des limites du contrat concurrent |

### Differenciation

| Critere | Comparateurs en ligne | Conseillers classiques | Roue des Besoins + Adequation |
|---------|----------------------|------------------------|-------------------------------|
| Analyse de l'existant | Non (comparaison tarif uniquement) | Oui, mais manuelle et chronophage | Automatisee, structuree |
| Ancrage dans les besoins | Non | Variable selon le conseiller | Systematique (scoring 5x5) |
| Objectivite | Marketing-driven | Depend du conseiller | Algorithmique + validation humaine |
| Experience client | Formulaires longs | RDV necessaire | Self-service digital + conseil |

---

## 4. Personas et use cases

### Persona 1 : Marie, 38 ans, couple avec 2 enfants, residente Luxembourg-Ville

**Contexte** : Marie a realise le diagnostic sur la Roue des Besoins. Son score global est de 62/100 ("Des lacunes significatives"). Le quadrant Personnes est en rouge (critical). Elle se demande si c'est parce qu'elle a mal repondu ou si elle est reellement mal couverte.

**Use case** : Marie uploade son contrat B-Safe (accidents) et son contrat habitation HOME. L'analyse revele :
- Son contrat accidents ne couvre que le deces et l'invalidite permanente -- pas d'incapacite de travail
- Son contrat habitation est en formule de base sans cave a vin ni reeequipement a neuf
- Franchise dommages materiels a 1.500 EUR alors qu'elle a des objets de valeur declares

**Resultat attendu** : Marie voit concretement les 3 lacunes et peut en discuter avec son conseiller Baloise.

### Persona 2 : Thomas, 45 ans, independent, frontalier francais

**Contexte** : Thomas a des contrats chez AXA France (auto, habitation, prevoyance). Il vient de s'installer au Luxembourg comme frontalier. Le diagnostic montre des besoins eleves mais Thomas pense etre "bien couvert en France".

**Use case** : Thomas uploade ses 3 contrats AXA. L'analyse revele :
- Son auto est en omnium mais sans protection bonus ni pack mobilite
- Sa prevoyance francaise ne couvre pas l'incapacite selon le droit luxembourgeois
- Son habitation ne repond pas aux specificites luxembourgeoises (degats des eaux en copropriete)

**Resultat attendu** : Thomas comprend que ses contrats francais ont des trous dans le contexte luxembourgeois. Il prend RDV avec un conseiller Baloise.

### Persona 3 : Jean-Pierre, conseiller Baloise, portefeuille de 400 clients

**Contexte** : Jean-Pierre prepare ses campagnes de cross-sell. Il veut identifier les clients sous-assures pour proposer des upsell pertinents.

**Use case** : Jean-Pierre invite 50 clients a realiser le diagnostic + upload. Il recoit un tableau de bord avec les gaps identifies par client. Il priorise ses appels sur les clients avec les gaps les plus importants.

**Resultat attendu** : Jean-Pierre passe de la prospection aveugle a la prospection ciblee basee sur des lacunes factuelles.

### Persona 4 : Sophie, 28 ans, premier emploi au Luxembourg, celibataire

**Contexte** : Sophie n'a qu'un contrat auto RC obligatoire. Le diagnostic montre un score de 78/100 (quasi-critique). Sophie hesite a uploader son unique contrat car elle pense que "ca ne sert a rien, je n'ai quasi rien".

**Use case** : Meme avec un seul contrat, l'analyse met en evidence l'etendue de la non-couverture :
- Pas d'assurance habitation (locataire) -- risque RC et dommages
- Pas de prevoyance -- aucune protection en cas d'accident
- Pas d'epargne retraite -- aucun benefice de la deduction 111bis

**Resultat attendu** : Sophie voit que son unique contrat RC auto ne couvre qu'une fraction de ses besoins reels. L'analyse "a blanc" (sans contrat sur certains quadrants) reste pertinente.

---

## 5. User stories principales

### US-01 : Upload de documents

```
GIVEN   un client authentifie ayant complete au moins un quadrant du diagnostic
WHEN    il accede a la section "Verifier ma couverture" depuis la page de resultats
THEN    il voit une interface d'upload lui permettant de deposer un ou plusieurs
        documents (PDF, JPG, PNG) organises par type de contrat
AND     chaque fichier est valide (taille max 10 Mo, format accepte, non corrompu)
AND     les fichiers sont stockes de maniere securisee et chiffree
```

### US-02 : Extraction des informations contractuelles

```
GIVEN   un ou plusieurs documents ont ete uploades avec succes
WHEN    le systeme traite les documents
THEN    il extrait automatiquement :
        - Le type de contrat (auto, habitation, prevoyance, voyage, vie/epargne)
        - L'assureur emetteur
        - Les garanties incluses et leurs plafonds
        - Les franchises applicables
        - Les exclusions majeures identifiables
        - La date de prise d'effet et d'echeance
        - La prime annuelle (si visible)
AND     le client peut visualiser et corriger les informations extraites
AND     le systeme affiche un score de confiance pour chaque extraction
```

### US-03 : Matching besoins / couverture

```
GIVEN   le diagnostic des besoins est complete (quadrantScores disponibles)
AND     au moins un contrat a ete analyse avec succes
WHEN    le systeme execute le matching
THEN    il produit pour chaque quadrant un rapport d'adequation :
        - Garanties couvertes (match positif)
        - Garanties manquantes (gap identifie)
        - Garanties sous-dimensionnees (plafond insuffisant ou franchise trop elevee)
        - Garanties sur-dimensionnees (potentielle optimisation)
        - Garanties redondantes entre contrats
AND     chaque gap est lie a une recommandation produit Baloise specifique
```

### US-04 : Restitution du rapport d'adequation

```
GIVEN   le matching a ete execute
WHEN    le client consulte ses resultats
THEN    il voit une vue synthetique :
        - Score d'adequation global (0-100, 100 = parfaitement couvert)
        - Vue par quadrant avec code couleur (vert/orange/rouge)
        - Liste des gaps prioritaires avec niveau de criticite
        - Liste des optimisations possibles
AND     chaque gap renvoie vers une recommandation actionnable
AND     le client peut telecharger un PDF du rapport complet
```

### US-05 : Correction manuelle / enrichissement

```
GIVEN   l'extraction automatique a produit des resultats
WHEN    le client constate une erreur ou une information manquante
THEN    il peut modifier manuellement les garanties, plafonds et franchises
AND     le matching est recalcule en temps reel
AND     les corrections manuelles sont tracees (audit trail)
```

### US-06 : Vue conseiller de l'adequation client

```
GIVEN   un conseiller a un client assigne qui a uploade des contrats
WHEN    le conseiller consulte la fiche client dans son dashboard
THEN    il voit le rapport d'adequation complet incluant :
        - Les contrats uploades (sans les documents eux-memes pour la V1)
        - L'extraction des garanties (avec indicateur de confiance)
        - Le rapport de matching besoins/couverture
        - Les recommandations produit Baloise associees
        - Une note de conseil auto-generee pour la preparation du RDV
AND     l'acces est audite dans audit_logs
```

### US-07 : Upload "a blanc" (sans contrat sur un quadrant)

```
GIVEN   un client n'a aucun contrat pour un quadrant donne (ex: pas de prevoyance)
WHEN    il indique explicitement "Je n'ai pas de contrat pour ce domaine"
THEN    le systeme enregistre une couverture nulle pour ce quadrant
AND     le rapport d'adequation affiche l'integralite du quadrant comme gap
AND     les recommandations produit sont maximalement pertinentes
```

### US-08 : Re-analyse apres nouveau contrat

```
GIVEN   un client a deja un rapport d'adequation
WHEN    il uploade un nouveau contrat ou met a jour un contrat existant
THEN    le systeme relance le matching
AND     affiche l'evolution (avant/apres) de son score d'adequation
AND     met a jour les recommandations en consequence
```

---

## 6. Architecture fonctionnelle

### 6.1 Parcours utilisateur detaille

```
[Diagnostic complet -- ResultsPage]
         |
         v
[CTA "Verifier votre couverture actuelle"]
         |
         v
[Ecran de selection du type de contrat]
  |-- Auto / vehicule
  |-- Habitation
  |-- Prevoyance / Accidents
  |-- Voyage
  |-- Vie / Epargne retraite
  |-- Autre
         |
         v
[Upload du document]
  - Drag & drop ou selection fichier
  - Preview du document uploade
  - Validation format + taille
         |
         v
[Traitement / Extraction]
  - Ecran d'attente avec progression
  - OCR / parsing PDF structure
  - Extraction des champs cles
  - Classification du contrat
         |
         v
[Verification par le client]
  - Affichage des informations extraites
  - Score de confiance par champ
  - Possibilite de corriger / completer
  - Validation par le client
         |
         v
[Matching besoins <-> couverture]
  - Croisement DiagnosticResult x informations contractuelles
  - Calcul du score d'adequation par quadrant
  - Identification des gaps, redondances, optimisations
         |
         v
[Rapport d'adequation]
  - Vue synthetique (roue + scores)
  - Detail par quadrant
  - Liste des gaps prioritaires
  - Recommandations produit Baloise
  - PDF telechareable
         |
         v
[CTA conversion]
  - "Prendre RDV avec un conseiller"
  - "Demander un devis personnalise"
```

### 6.2 Types de documents acceptes

| Format | Accepte | Commentaire |
|--------|---------|-------------|
| PDF natif (texte) | Oui (priorite 1) | Cas ideal : extraction directe, haute fiabilite |
| PDF scan / image dans PDF | Oui (priorite 2) | Necessite OCR, fiabilite moyenne |
| JPG / PNG (photo de contrat) | Oui (priorite 2) | Necessite OCR, qualite depend de la photo |
| HEIC (iPhone) | Oui (converti) | Conversion HEIC -> JPG avant traitement |
| Word / Excel | Non (V1) | Trop rare pour des contrats d'assurance |
| Email / HTML | Non (V1) | Format trop variable |

**Contraintes techniques** :
- Taille max par fichier : 10 Mo
- Nombre max de fichiers par upload : 10
- Nombre max de pages par document : 50
- Langues supportees : francais, allemand (V1), anglais (V2)
- Stockage : Supabase Storage, bucket prive, chiffrement au repos

### 6.3 Informations a extraire des contrats

#### Niveau 1 -- Identification (extraction haute confiance)

| Champ | Description | Confiance cible |
|-------|-------------|-----------------|
| type_contrat | Auto, habitation, prevoyance, voyage, vie | > 95% |
| assureur | Nom de la compagnie | > 95% |
| numero_police | Numero de police / contrat | > 90% |
| date_effet | Date de prise d'effet | > 90% |
| date_echeance | Date d'echeance annuelle | > 85% |
| prime_annuelle | Montant de la prime TTC | > 80% |
| preneur | Nom du titulaire | > 90% |

#### Niveau 2 -- Garanties (extraction moyenne confiance)

| Champ | Description | Confiance cible |
|-------|-------------|-----------------|
| garanties_incluses[] | Liste des garanties actives | > 75% |
| plafond_par_garantie | Montant max d'indemnisation par garantie | > 70% |
| franchise_par_garantie | Montant de franchise par garantie | > 70% |
| formule_souscrite | Nom de la formule (ex: "Omnium integrale") | > 80% |

#### Niveau 3 -- Analyse fine (extraction basse confiance, V2+)

| Champ | Description | Confiance cible |
|-------|-------------|-----------------|
| exclusions_majeures[] | Exclusions explicites identifiees | > 50% |
| conditions_particulieres | Elements CP notables | > 40% |
| options_souscrites[] | Options / avenants | > 60% |
| valeur_assuree | Capital assure (habitation) / valeur vehicule | > 65% |

### 6.4 Logique de matching besoins / couverture

Le matching se fait en **3 etapes** :

#### Etape 1 : Mapping contrat -> quadrant(s)

Chaque contrat uploade est mappe aux quadrants pertinents (cf. section 7).

#### Etape 2 : Construction de la matrice de couverture factuelle

Pour chaque quadrant, le systeme construit une **couverture factuelle** a partir des contrats :

```typescript
interface CouvertureFactuelle {
  quadrant: Quadrant
  contrats: ContratAnalyse[]
  garantiesCouvertes: GarantieCouverture[]
  garantiesManquantes: GarantieManquante[]
  scoreAdequation: number  // 0-100
}

interface GarantieCouverture {
  id: string                      // ex: 'auto_rc', 'auto_omnium', 'hab_incendie'
  label: string
  statut: 'couverte' | 'partielle' | 'absente' | 'inconnue'
  plafondActuel?: number
  plafondRecommande?: number
  franchiseActuelle?: number
  franchiseRecommandee?: number
  scoreConfiance: number          // 0-100
  sourceContrat: string           // reference au contrat
}

interface GarantieManquante {
  id: string
  label: string
  criticite: 'critique' | 'importante' | 'moderee' | 'mineure'
  produitBaloise: Product
  optionBaloise?: string
  argumentaire: string            // message client
  argumentaireConseiller: string  // message advisor
}
```

#### Etape 3 : Calcul du score d'adequation

Le score d'adequation remplace / enrichit le score de couverture declaratif existant :

```
Score d'adequation par quadrant = f(garanties couvertes, plafonds, franchises)

Formule :
  adequation = SUM(poids_garantie_i * score_garantie_i) / SUM(poids_garantie_i)

  ou score_garantie_i =
    100  si couverte avec plafond et franchise adequats
     70  si couverte mais plafond bas ou franchise haute
     30  si partiellement couverte (exclusions limitantes)
      0  si absente
```

Le score d'adequation factuel est ensuite utilise pour **recalculer** le needScore de la matrice 5x5 en remplacement du score de couverture declaratif. Cela permet de comparer :
- Score initial (declaratif) vs Score revise (factuel)
- Evolution de la recommandation

### 6.5 Restitution des resultats

#### Vue synthetique

```
+--------------------------------------------------+
|  BILAN D'ADEQUATION                              |
|  Score global : 54/100 (Adequation partielle)    |
|                                                  |
|  [Roue avec overlay adequation]                  |
|                                                  |
|  Biens:      72/100  ████████░░  Correct         |
|  Personnes:  31/100  ███░░░░░░░  Insuffisant     |
|  Projets:    --/--   (inactif)                   |
|  Futur:      45/100  ████░░░░░░  A ameliorer     |
+--------------------------------------------------+
```

#### Vue detaillee par quadrant

```
PROTECTION DES PERSONNES -- Score d'adequation : 31/100

Contrats analyses :
  [1] Contrat B-Safe Baloise n. 12345 (confiance: 87%)
  [2] Contrat RC Vie Privee HOME n. 67890 (confiance: 92%)

GAPS IDENTIFIES :
  [CRITIQUE] Incapacite de travail -- AUCUNE couverture
    > Votre contrat B-Safe couvre le deces et l'invalidite mais pas
      l'incapacite de travail. Avec moins de 3 mois d'autonomie financiere,
      c'est un risque majeur.
    > Recommandation : B-Safe option Incapacite de travail

  [IMPORTANT] Hospitalisation -- AUCUNE couverture complementaire
    > La CNS couvre les frais de base mais pas le confort hospitalier
      ni les depassements. Avec 2 enfants a charge, une hospitalisation
      prolongee peut generer des frais significatifs.
    > Recommandation : B-Safe option Hospitalisation

  [MODERE] Deces -- Plafond potentiellement insuffisant
    > Capital deces : 50.000 EUR. Avec 2 personnes a charge et un
      revenu > 5.000 EUR/mois, le capital recommande est d'au moins
      150.000 EUR (24-36 mois de revenus).
    > Recommandation : Reviser le capital deces B-Safe

COUVERTURE ADEQUATE :
  [OK] Invalidite permanente -- couverte a 100.000 EUR
  [OK] RC Vie Privee -- couverte via contrat HOME
```

---

## 7. Segmentation des contrats et mapping quadrants

### 7.1 Table de mapping contrat -> quadrant(s) -> produit(s) Baloise

| Type de contrat uploade | Quadrant(s) impacte(s) | Produit(s) Baloise equivalent(s) | Garanties cibles |
|-------------------------|----------------------|-------------------------------|------------------|
| Auto (RC + dommages) | Biens, Projets | DRIVE | RC, dommages materiels, omnium, pack mobilite, pack indemnisation, pack amenagement |
| Habitation (MRH) | Biens | HOME | Incendie, degats des eaux, vol, bris de glace, RC vie privee, objets de valeur, cave a vin, panneau solaire |
| Prevoyance / Accidents | Personnes | B-SAFE | Deces, invalidite, incapacite, hospitalisation, garde enfants, frais divers |
| Voyage | Personnes | TRAVEL | Annulation, bagages, rapatriement, frais medicaux a l'etranger |
| Vie / Epargne | Futur | Pension Plan, Life Plan, Switch Plan | Epargne pension art. 111bis, prevoyance art. 111, ESG |
| Solde restant du | Futur | Solde Restant Du | Capital deces lie a un credit |
| RC professionnelle | (hors perimetre V1) | -- | -- |
| Protection juridique | (hors perimetre V1) | -- | -- |

### 7.2 Referentiel de garanties par type de contrat

#### Auto (DRIVE)

| ID garantie | Label | Poids dans l'adequation | Seuils de qualite |
|-------------|-------|-------------------------|-------------------|
| auto_rc | Responsabilite Civile | 25% (obligatoire) | Toujours couverte si contrat existe |
| auto_dommages_materiels | Dommages materiels | 20% | Absente si RC only |
| auto_vol_incendie | Vol / Incendie | 15% | Inclus en mini-omnium+ |
| auto_bris_glace | Bris de glace | 10% | Option courante |
| auto_protection_conducteur | Protection conducteur | 15% | Souvent absente des contrats basiques |
| auto_assistance | Assistance / Depannage | 10% | Franchise km a verifier |
| auto_protection_bonus | Protection bonus | 5% | Option rare mais pertinente |

#### Habitation (HOME)

| ID garantie | Label | Poids dans l'adequation | Seuils de qualite |
|-------------|-------|-------------------------|-------------------|
| hab_incendie | Incendie / Explosion | 20% | Quasi-universel |
| hab_degats_eaux | Degats des eaux | 15% | Standard mais exclusions variables |
| hab_vol | Vol / Vandalisme | 15% | Franchise et plafond variables |
| hab_bris_glace | Bris de glace | 5% | Option |
| hab_rc_vie_privee | RC Vie Privee | 15% | Souvent integree |
| hab_catastrophes_nat | Catastrophes naturelles | 10% | Inclusion variable au Luxembourg |
| hab_objets_valeur | Objets de valeur | 10% | Plafond souvent insuffisant |
| hab_reeequipement_neuf | Reeequipement a neuf | 5% | Option premium |
| hab_energie_renouvelable | Panneaux solaires / Pompe a chaleur | 5% | Option emergente |

#### Prevoyance / Accidents (B-SAFE)

| ID garantie | Label | Poids dans l'adequation | Seuils de qualite |
|-------------|-------|-------------------------|-------------------|
| prev_deces | Capital Deces | 25% | Capital vs revenus et personnes a charge |
| prev_invalidite | Invalidite permanente | 25% | Bareme + capital |
| prev_incapacite | Incapacite de travail | 25% | Duree de carence + montant rente |
| prev_hospitalisation | Indemnite hospitalisation | 15% | Par jour + duree max |
| prev_frais_divers | Garde enfants / Rattrapage scolaire | 10% | Si enfants a charge |

#### Voyage (TRAVEL)

| ID garantie | Label | Poids dans l'adequation | Seuils de qualite |
|-------------|-------|-------------------------|-------------------|
| voy_frais_medicaux | Frais medicaux a l'etranger | 30% | Plafond + zone geographique |
| voy_rapatriement | Rapatriement / Assistance | 25% | Couverture mondiale ? |
| voy_annulation | Annulation de voyage | 25% | Plafond vs budget voyage |
| voy_bagages | Perte / Vol bagages | 15% | Plafond et franchise |
| voy_rc_etranger | RC a l'etranger | 5% | Souvent incluse |

#### Vie / Epargne (Futur)

| ID garantie | Label | Poids dans l'adequation | Seuils de qualite |
|-------------|-------|-------------------------|-------------------|
| vie_epargne_pension | Epargne pension art. 111bis | 35% | Versement vs plafond deductible |
| vie_prevoyance_111 | Prevoyance art. 111 | 25% | Capital + protection famille |
| vie_solde_restant | Solde restant du | 20% | Capital residuel vs credit |
| vie_epargne_libre | Epargne libre (unite de compte) | 15% | Diversification / ESG |
| vie_rente_viagere | Rente viagere | 5% | Si existante |

### 7.3 Logique de scoring d'adequation

Pour chaque garantie, le score d'adequation est calcule selon :

```
score_garantie = f(statut, plafond_ratio, franchise_ratio)

ou :
  statut = {absente: 0, partielle: 0.3, couverte: 1.0}
  plafond_ratio = min(plafond_actuel / plafond_recommande, 1.0)
  franchise_ratio = max(1 - (franchise_actuelle / franchise_max_acceptable), 0)

  score_garantie = statut * (0.5 * plafond_ratio + 0.3 * franchise_ratio + 0.2)
```

Les plafonds et franchises recommandes sont derives du profil client :
- `plafond_recommande_deces` = revenu_annuel * 3 (si personnes a charge) ou revenu_annuel * 1.5 (sinon)
- `franchise_max_acceptable_auto` = 250 EUR (vehicule neuf) / 500 EUR (recent) / 1000 EUR (ancien)
- etc.

---

## 8. MVP vs Full -- Decoupage en phases

### Phase 1 -- MVP (T3 2026, ~12 semaines)

**Objectif** : Valider le concept, mesurer l'appetence, obtenir du feedback terrain.

#### Perimetre MVP

| Element | Inclus | Exclus |
|---------|--------|--------|
| Upload de documents | PDF natif uniquement | Scans, photos, OCR |
| Types de contrats | Auto + Habitation seulement | Prevoyance, Voyage, Vie |
| Extraction | Semi-automatique (LLM + validation manuelle obligatoire) | Full-auto sans validation |
| Matching | Garanties principales uniquement (5-6 par type) | Analyse fine des exclusions |
| Restitution | Liste des gaps avec criticite | Score d'adequation calcule, rapport PDF |
| Parcours | Client self-service uniquement | Parcours conseiller |
| Langues | Francais uniquement | Allemand, Anglais |
| Intelligence | LLM via API (GPT-4o / Claude) avec prompt specialise | Modele fine-tune |

#### Architecture technique MVP

```
[Client React]
     |
     v
[Supabase Storage -- bucket 'contracts' (prive, chiffre)]
     |
     v
[Edge Function -- extract_contract]
     |-- PDF parsing (pdf-parse)
     |-- Envoi texte au LLM (API externe)
     |-- Extraction structuree JSON
     |-- Stockage dans table contract_analyses
     |
     v
[Edge Function -- compute_adequation]
     |-- Lecture DiagnosticResult
     |-- Lecture contract_analyses
     |-- Matching garanties
     |-- Calcul score d'adequation
     |-- Stockage dans table adequation_reports
     |
     v
[ResultsPage enrichie -- section adequation]
```

#### Nouvelles tables Supabase (MVP)

```sql
-- Contrats uploades
CREATE TABLE uploaded_contracts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  diagnostic_id uuid REFERENCES diagnostics(id) ON DELETE SET NULL,
  file_path text NOT NULL,              -- chemin dans Supabase Storage
  file_name text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  contract_type text NOT NULL CHECK (contract_type IN
    ('auto', 'habitation', 'prevoyance', 'voyage', 'vie', 'autre')),
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN
    ('uploaded', 'processing', 'extracted', 'validated', 'error')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Analyses extraites des contrats
CREATE TABLE contract_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES uploaded_contracts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  extraction_version text NOT NULL DEFAULT 'v1',
  assureur text,
  numero_police text,
  date_effet date,
  date_echeance date,
  prime_annuelle numeric(10,2),
  formule text,
  garanties jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- garanties: [{id, label, statut, plafond, franchise, confiance}]
  extraction_confiance integer NOT NULL CHECK (extraction_confiance >= 0
    AND extraction_confiance <= 100),
  raw_extraction jsonb,             -- sortie brute du LLM (debug)
  validated_by_user boolean NOT NULL DEFAULT false,
  user_corrections jsonb,           -- champs corriges manuellement
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Rapports d'adequation
CREATE TABLE adequation_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  diagnostic_id uuid NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scoring_version text NOT NULL DEFAULT 'v1',
  score_global integer NOT NULL CHECK (score_global >= 0 AND score_global <= 100),
  scores_par_quadrant jsonb NOT NULL,
  -- {biens: {score, gaps[], couvertures[]}, personnes: {...}, ...}
  gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- [{id, quadrant, garantie_id, criticite, message, produit_baloise, option_baloise}]
  optimisations jsonb NOT NULL DEFAULT '[]'::jsonb,
  contract_ids uuid[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

#### Estimation de cout MVP

| Poste | Estimation |
|-------|-----------|
| Dev frontend (upload + resultats) | 15-20 jours |
| Dev backend (Edge Functions, extraction, matching) | 20-25 jours |
| Prompt engineering + tests extraction | 10-15 jours |
| Referentiel garanties (contenu expert) | 8-10 jours |
| Tests / QA / securite | 8-10 jours |
| Product / design | 10 jours |
| **Total** | **~70-80 jours-homme** |

| Poste variable | Estimation mensuelle |
|---------------|---------------------|
| API LLM (extraction) | 50-200 EUR/mois (volume faible au lancement) |
| Supabase Storage | Inclus dans plan actuel (< 1 Go) |

### Phase 2 -- Extension (T4 2026, ~8 semaines)

| Element | Ajout |
|---------|-------|
| OCR | Integration OCR pour scans et photos (Tesseract ou service cloud) |
| Types de contrats | + Prevoyance (B-SAFE) + Voyage (TRAVEL) |
| Score d'adequation | Calcul automatique remplacant le coverage declaratif dans le scoring 5x5 |
| Parcours conseiller | Vue enrichie dans AdvisorDashboard + notes auto-generees |
| PDF rapport | Export PDF complet du rapport d'adequation |
| Langues | + Allemand (contrats luxembourgeois souvent bilingues) |

### Phase 3 -- Pleine puissance (S1 2027, ~10 semaines)

| Element | Ajout |
|---------|-------|
| Vie / Epargne | Analyse des contrats vie, epargne pension, art. 111/111bis |
| Modele fine-tune | Modele specialise assurance luxembourgeoise (entrainement sur corpus CG Baloise) |
| Extraction enrichie | Exclusions, conditions particulieres, clauses specifiques |
| Scoring reecrit | Le scoring engine integre nativement les donnees factuelles comme source primaire |
| Historisation | Evolution de l'adequation dans le temps (suivi annuel) |
| API conseiller | API pour injection dans les outils CRM / gestion de portefeuille |
| Intelligence competitive | Tableaux de bord anonymises sur les contrats concurrents analyses |

---

## 9. Risques produit

### R-01 : Fiabilite de l'extraction (CRITIQUE)

**Risque** : L'extraction LLM produit des erreurs sur les garanties, plafonds ou franchises. Le client recoit un rapport d'adequation faux. Cela peut conduire a un sentiment de fausse securite (garantie jugee adequate alors qu'elle ne l'est pas) ou a une alarme injustifiee.

**Probabilite** : Haute (les contrats d'assurance sont des documents complexes, heterogenes, avec un jargon specifique a chaque assureur).

**Impact** : Critique -- atteinte a la credibilite de l'outil, risque reputationnel, risque juridique si le client prend des decisions sur la base d'une extraction erronee.

**Mitigation** :
- Validation obligatoire par le client en V1 (pas de full-auto)
- Score de confiance affiche pour chaque extraction
- Disclaimer clair et visible (pas un conseil, outil d'aide a la reflexion)
- Focus MVP sur PDF natifs (texte extractible, pas d'OCR) pour maximiser la fiabilite
- Corpus de test sur les CG Baloise reelles (DRIVE, HOME, B-SAFE, TRAVEL) pour calibrer les prompts
- Boucle de feedback (le client signale les erreurs, elles alimentent l'amelioration)

### R-02 : Complexite percue par l'utilisateur (ELEVE)

**Risque** : Le client ne retrouve pas ses contrats, ne comprend pas quel document uploader, est decourage par le nombre de fichiers demandes, ou ne comprend pas les resultats de l'analyse.

**Probabilite** : Moyenne-haute.

**Impact** : Taux d'abandon eleve, feature non utilisee, investissement perdu.

**Mitigation** :
- UX progressive : commencer par UN seul contrat, voir la valeur, puis ajouter les autres
- Guidage pas a pas : "Vous avez une assurance auto ? Uploadez votre contrat auto."
- Accepter le parcours "a blanc" : le client peut dire "je n'ai pas de contrat" et quand meme obtenir de la valeur
- Resultat immediat meme avec un seul contrat (pas besoin de tout uploader)
- Onboarding visuel clair avec exemples de ce qu'est un "contrat d'assurance"

### R-03 : Cannibalisation du parcours existant (MODERE)

**Risque** : Les clients percoivent l'upload de contrat comme un "effort supplementaire" et abandonnent le diagnostic avant d'y arriver. Ou inversement : les clients veulent uploader directement sans faire le questionnaire ("analysez juste mes contrats").

**Probabilite** : Moyenne.

**Impact** : Desalignement avec le parcours existant, perte de l'ancrage "besoins d'abord".

**Mitigation** :
- L'upload est APRES le diagnostic, pas en remplacement : le diagnostic est le prerequis
- Positionner l'upload comme un "bonus" : "Vous avez votre diagnostic. Voulez-vous aller plus loin en verifiant vos contrats ?"
- Ne pas permettre d'uploader sans diagnostic (pas de mode standalone en V1)
- A terme (V3+), evaluer si un mode "analyse de contrat seule" a un interet commercial

### R-04 : Attentes utilisateur disproportionnees (ELEVE)

**Risque** : Le client s'attend a un "audit complet de son assurance" alors que l'outil ne fournit qu'une analyse structuree des principales garanties. Deception et perte de credibilite.

**Probabilite** : Haute.

**Impact** : NPS negatif, bouche-a-oreille defavorable.

**Mitigation** :
- Communication precise : "verification de l'adequation", pas "audit", pas "analyse complete"
- Afficher clairement ce qui est analyse et ce qui ne l'est pas
- Score de confiance visible = le client sait que ce n'est pas une verite absolue
- Toujours renvoyer vers le conseiller pour la validation finale

### R-05 : Sensibilite des donnees (CRITIQUE)

**Risque** : Les contrats d'assurance contiennent des donnees personnelles sensibles (nom, adresse, numero de compte, situation familiale, patrimoine). Le stockage et le traitement de ces documents sont soumis au RGPD et aux exigences du CAA (Commissariat aux Assurances).

**Probabilite** : Certaine (c'est un fait, pas un risque probabiliste).

**Impact** : Critique -- non-conformite RGPD, sanction CNPD, atteinte reputationnelle.

**Mitigation** :
- Stockage chiffre au repos et en transit (Supabase Storage + TLS)
- Bucket prive avec RLS strict (un client ne voit que ses propres documents)
- Politique de retention : suppression automatique apres 12 mois (ou sur demande RGPD)
- Pas de transmission des documents au conseiller en V1 (seulement l'analyse extraite)
- DPIA (Data Protection Impact Assessment) obligatoire avant lancement
- Consentement explicite au traitement avant tout upload
- Integration dans le mecanisme RGPD existant (export_my_data, delete_my_data)

### R-06 : Envoi des documents a un LLM externe (ELEVE)

**Risque** : Les contrats (contenant des donnees personnelles) sont envoyes a une API LLM externe (OpenAI, Anthropic). Cela souleve des questions de confidentialite, de transfert de donnees hors UE, et de re-utilisation des donnees pour l'entrainement.

**Probabilite** : Certaine si le design technique utilise un LLM externe.

**Impact** : Eleve -- risque RGPD (transfert hors UE), risque de fuite de donnees, risque reputationnel.

**Mitigation** :
- Utiliser des API avec engagement de non-retention (OpenAI API zero data retention, Anthropic API)
- Verifier que le traitement reste dans l'EEE (endpoints EU disponibles chez certains providers)
- Anonymiser les donnees avant envoi au LLM : remplacer noms, adresses, numeros par des placeholders, envoyer uniquement le texte des garanties
- Alternative V2+ : modele self-hosted (Mistral, LLaMA) pour garder tout en interne
- Documenter dans la DPIA le flux exact des donnees

### R-07 : Heterogeneite des documents assurance (ELEVE)

**Risque** : Les contrats d'assurance n'ont aucun format standard. Chaque assureur utilise sa propre structure, terminologie, et mise en page. Un contrat Foyer Luxembourg ne ressemble pas a un contrat AXA France ni a un contrat Bâloise Belgique.

**Probabilite** : Certaine.

**Impact** : Eleve -- le modele d'extraction doit gerer une variabilite extreme, ce qui degrade la fiabilite.

**Mitigation** :
- Focus MVP sur les assureurs les plus courants au Luxembourg (Foyer, La Luxembourgeoise, AXA, Bâloise, Lalux)
- Construire un corpus de test avec des contrats reels de chaque assureur
- Le LLM est meilleur que le parsing regle pour gerer la variabilite -- c'est un avantage
- Validation obligatoire par le client = filet de securite

### R-08 : Investissement disproportionne vs usage reel (MODERE)

**Risque** : La feature coute cher a developper (~70-80 jours MVP) et l'adoption est faible car les clients n'ont pas leurs contrats sous la main, n'ont pas la motivation de les chercher, ou trouvent le processus trop long.

**Probabilite** : Moyenne.

**Impact** : Modere -- cout d'opportunite (ces jours auraient pu etre investis ailleurs).

**Mitigation** :
- MVP extremement lean : PDF uniquement, 2 types de contrats, extraction LLM semi-auto
- Mesurer l'appetence AVANT de coder : A/B test avec un simple bouton "Verifier ma couverture" (tracking du clic, pas de backend derriere)
- Si < 15% de clic sur le CTA au bout de 4 semaines, reconsiderer l'investissement
- Gateway de decision GO/NO-GO apres le faux CTA avant d'investir dans le backend

---

## 10. KPIs de succes

### KPIs de validation du concept (Phase 1)

| KPI | Cible MVP | Methode de mesure |
|-----|-----------|-------------------|
| Taux de clic sur CTA "Verifier ma couverture" | > 25% des utilisateurs ayant termine le diagnostic | Event tracking |
| Taux de completion upload (fichier uploade / CTA clique) | > 50% | Funnel analytics |
| Taux de validation (extraction validee / fichier uploade) | > 70% | Table contract_analyses |
| Taux de correction manuelle | < 30% des champs | Table contract_analyses (user_corrections) |
| Confiance extraction moyenne | > 75/100 | Champ extraction_confiance |
| Nombre de gaps identifies par analyse | 2-5 en moyenne | Table adequation_reports |

### KPIs business (Phase 2+)

| KPI | Cible | Methode de mesure |
|-----|-------|-------------------|
| Taux de prise de RDV post-adequation | > 15% des analyses completees | CTA tracking + CRM |
| Taux de conversion RDV -> souscription | > 30% (vs 20% sans adequation) | CRM / suivi commercial |
| Panier moyen | +15% vs diagnostic seul | Suivi production |
| NPS de la feature | > 40 | Enquete post-utilisation |
| Taux d'utilisation par les conseillers | > 60% des conseillers actifs l'utilisent | Dashboard usage |
| Donnees concurrentielles capturees | 500+ contrats analyses en 6 mois | Table uploaded_contracts |

### KPIs techniques

| KPI | Cible | Methode |
|-----|-------|---------|
| Temps de traitement moyen | < 30 secondes par document | Monitoring Edge Function |
| Taux d'erreur extraction | < 5% d'echecs complets | Logs + status = 'error' |
| Disponibilite du service | > 99.5% | Monitoring |
| Cout par extraction | < 0.50 EUR / document | Suivi facturation API LLM |

---

## 11. Dependances

### 11.1 Dependances techniques

| Dependance | Description | Criticite | Statut |
|-----------|-------------|-----------|--------|
| Supabase Storage | Bucket prive pour stocker les documents uploades | Critique | Disponible (plan actuel suffisant) |
| Supabase Edge Functions | Backend serverless pour l'extraction et le matching | Critique | Disponible |
| API LLM (extraction) | Service d'extraction de texte structure (GPT-4o, Claude, ou equivalent) | Critique | A evaluer et selectionner |
| PDF parsing | Librairie d'extraction de texte PDF (pdf-parse, pdfjs) | Haute | Disponible (npm) |
| OCR (Phase 2) | Service de reconnaissance de caracteres pour scans/photos | Haute (P2) | A evaluer (Tesseract, Google Vision, etc.) |
| Referentiel de garanties | Base de donnees structuree des garanties par type de contrat | Critique | **A CREER** |
| Scoring d'adequation | Module de calcul de l'adequation (extension de l'engine existant) | Critique | **A DEVELOPPER** |

### 11.2 Dependances business / contenu

| Dependance | Description | Criticite | Responsable |
|-----------|-------------|-----------|-------------|
| Referentiel de garanties | Definition des garanties, poids, seuils par type de contrat | Critique | Product + Actuariat |
| Corpus de test | Contrats reels des principaux assureurs luxembourgeois | Critique | Distribution / Marketing |
| Argumentaires gaps | Messages client et conseiller pour chaque type de gap | Haute | Product + Distribution |
| Seuils de plafonds/franchises | Valeurs recommandees par profil client | Haute | Actuariat |
| Prompts d'extraction | Prompts specialises par type de contrat | Critique | Product + Tech |

### 11.3 Dependances juridiques / conformite

| Dependance | Description | Criticite | Responsable |
|-----------|-------------|-----------|-------------|
| DPIA | Evaluation d'impact sur la protection des donnees | Critique (prealable au lancement) | DPO / Compliance |
| Consentement RGPD | Formulaire de consentement specifique a l'upload de documents | Critique | Legal / DPO |
| Disclaimers | Textes juridiques (pas un conseil, outil d'aide, limites) | Critique | Legal |
| Politique de retention | Duree de conservation des documents uploades | Haute | DPO |
| Evaluation IDD | Verification que la feature ne constitue pas un "conseil" au sens de la directive | Haute | Compliance / Legal |
| Flux de donnees LLM | Validation du transfert de donnees vers le provider LLM | Critique | DPO / Legal |
| CAA (Commissariat aux Assurances) | Verification qu'aucune autorisation supplementaire n'est requise | Haute | Compliance |

### 11.4 Dependances organisationnelles

| Dependance | Description | Criticite |
|-----------|-------------|-----------|
| Formation conseillers | Les conseillers doivent comprendre le rapport d'adequation et l'utiliser en RDV | Haute (P2) |
| Support client | Equipe support briefee sur la feature (FAQ, troubleshooting upload) | Moyenne |
| Communication | Plan de communication client pour le lancement | Moyenne |

---

## 12. Impacts transverses

### 12.1 Impact sur le scoring engine existant

Le scoring engine actuel (`frontend/src/shared/scoring/engine.ts`) utilise des scores de couverture declaratifs :
- `vehicle_coverage_existing` : none / unknown / rc_only / mini_omnium / full_omnium
- `home_coverage_existing` : none / unknown / basic / with_options
- `accident_coverage_existing` : none / employer_only / individual_basic / individual_complete
- `travel_coverage_existing` : none / credit_card / per_trip / annual

L'adequation factuelle doit pouvoir **remplacer ces valeurs declaratives** par des scores de couverture calcules a partir des contrats reels. Cela implique :

1. **Phase 1 (MVP)** : L'adequation est affichee SEPAREMENT du diagnostic existant. Pas de modification du scoring engine.
2. **Phase 2** : Le scoring engine accepte un parametre optionnel `factualCoverage?: FactualCoverageOverride` qui remplace les scores declaratifs quand disponible.
3. **Phase 3** : Le scoring engine utilise prioritairement les donnees factuelles et se rabat sur le declaratif uniquement si aucun contrat n'a ete uploade.

### 12.2 Impact sur le parcours client

- `ResultsPage` : Ajout d'un CTA + section optionnelle d'adequation
- `ClientDashboard` : Ajout d'une section "Mes contrats" avec statut des analyses
- Nouveau composant `UploadContractFlow` : wizard d'upload multi-etapes
- Nouveau composant `AdequationReport` : affichage du rapport
- Modification du PDF export : ajout de la section adequation

### 12.3 Impact sur le parcours conseiller

- `ClientDetailPage` : Ajout d'un onglet "Adequation" avec le rapport
- Notes de conseil auto-generees pour la preparation de RDV
- Pas d'acces aux documents bruts en V1 (seulement les analyses)

### 12.4 Impact RGPD

Extension des fonctions existantes :
- `export_my_data()` : doit inclure les contrats uploades et analyses
- `delete_my_data()` : doit supprimer les fichiers Storage + analyses + rapports
- Audit trail : tous les acces aux contrats/analyses sont journalises

### 12.5 Impact sur le schema de base de donnees

3 nouvelles tables (cf. section 8) + RLS policies + triggers de validation + extension de la RGPD.

---

## 13. Recommandation GO/NO-GO

### Analyse des 3 niveaux

#### Niveau 1 -- Vision marketing

"Offrir aux clients un bilan de protection complet et factuel, en un clic." C'est seduisant, differenciateur, et s'inscrit dans la tendance de la personnalisation digitale en assurance.

**Verdict : GO enthousiaste.**

#### Niveau 2 -- Vision consommateur informe

La feature a une valeur reelle pour un client qui cherche a comprendre ses lacunes. MAIS : la fiabilite de l'extraction est le point dur. Un client qui recoit une analyse fausse perdra confiance dans tout l'outil (y compris le diagnostic qui fonctionnait bien). Le ratio effort (chercher ses contrats, les uploader, valider l'extraction) / valeur percue doit etre soigneusement calibre.

**Verdict : GO conditionnel -- la validation manuelle est un garde-fou indispensable.**

#### Niveau 3 -- Vision 100% objective

Les faits :
1. L'extraction de donnees structurees a partir de documents d'assurance heterogenes est un probleme **techniquement resolu a 70-80%** par les LLM actuels, mais pas a 95%+. Les 20-30% d'erreurs restants concernent exactement les donnees les plus critiques : plafonds, franchises, exclusions.
2. Le marche luxembourgeois est petit : ~650.000 habitants, ~15 assureurs principaux. Le corpus de documents est geographiquement concentre et relativement homogene (Foyer, Lalux, La Luxembourgeoise couvrent > 60% du marche). C'est un **avantage** : le nombre de formats a gerer est limite.
3. Le cout de development du MVP (~70-80 jours) est significatif mais pas disproportionne pour un produit qui transforme la nature meme de l'outil (declaratif -> factuel).
4. Le risque RGPD et IDD est reel mais gerable avec une DPIA rigoureuse et des disclaimers calibres.
5. La valeur commerciale potentielle (augmentation de la conversion, capture de donnees concurrentielles) est substantielle si l'adoption depasse 20%.

**Verdict : GO avec conditions strictes.**

### Recommandation finale

**GO CONDITIONNEL -- Approche en 2 temps**

#### Temps 1 : Validation d'appetence (4 semaines, ~5 jours-homme)

Avant d'investir dans le backend, deployer un **faux CTA** ("Verifier votre couverture -- Bientot disponible") sur la page ResultsPage pour mesurer l'appetence reelle :
- Si > 25% de clic : **GO** sur le MVP
- Si 15-25% de clic : **GO** avec perimetre reduit (1 seul type de contrat)
- Si < 15% de clic : **NO-GO** -- pivoter vers d'autres priorites

#### Temps 2 : MVP (12 semaines si GO confirme)

Conditions prealables non negociables :
1. DPIA completee et validee par le DPO
2. Evaluation IDD completee par Legal/Compliance
3. Provider LLM selectionne avec engagement contractuel de non-retention des donnees
4. Corpus de test constitue avec au moins 5 contrats reels par type (auto + habitation) et par assureur principal (Foyer, Lalux, La Luxembourgeoise, Baloise, AXA)
5. Referentiel de garanties valide par Product + Actuariat

Conditions de succes post-MVP (gate pour Phase 2) :
1. > 20% des utilisateurs du diagnostic utilisent la feature
2. Confiance extraction > 75/100 en moyenne
3. < 30% de corrections manuelles
4. > 0 prise de RDV attribuable a l'adequation

### Ce que je ne recommande PAS

1. **Un mode standalone** (upload sans diagnostic) en V1 : la valeur de l'outil est dans le croisement besoins x couverture. Sans le diagnostic, c'est juste un parser de contrats sans intelligence.
2. **L'OCR en V1** : la complexite technique de l'OCR + LLM sur des photos de contrats est disproportionnee par rapport au gain. Les clients qui n'ont pas leurs contrats en PDF peuvent scanner via les apps Notes/Scanner de leur telephone (qui produisent du PDF).
3. **L'analyse des contrats vie/epargne en V1** : ces contrats sont les plus complexes (conditions particulieres, rachats, valeurs de rente, projections) et les moins standardises. Le risque d'extraction erronee est trop eleve.
4. **Le full-auto sans validation** : meme si la confiance est a 90%, obliger le client a valider est un garde-fou juridique et experienciel indispensable.

---

## 14. Annexes

### Annexe A : Mapping entre scoring declaratif actuel et adequation factuelle

| Score declaratif actuel | Source dans engine.ts | Remplacement factuel |
|------------------------|----------------------|---------------------|
| `VEHICLE_COV_SCORE[vehicle_coverage_existing]` | `computeDriveCoverage()` l.204 | Score d'adequation auto calcule a partir des garanties extraites |
| `HOME_COV_SCORE[home_coverage_existing]` | `computeHomeCoverage()` l.225 | Score d'adequation habitation calcule a partir des garanties extraites |
| `ACCIDENT_COV_SCORE[accident_coverage_existing]` | `computeBsafeCoverage()` l.356 | Score d'adequation prevoyance (Phase 2) |
| `TRAVEL_COV_SCORE[travel_coverage_existing]` | `computeTravelCoverage()` l.390 | Score d'adequation voyage (Phase 2) |
| `savingsItems` dans `computeFuturCoverage()` | `computeFuturCoverage()` l.442 | Score d'adequation vie/epargne (Phase 3) |

### Annexe B : Exemples de prompts d'extraction (MVP)

#### Prompt extraction Auto

```
Tu es un expert en assurance automobile luxembourgeoise. Analyse le texte suivant
extrait d'un contrat d'assurance auto et retourne les informations structurees
au format JSON.

Champs a extraire :
- assureur: string (nom de la compagnie)
- numero_police: string
- date_effet: string (format YYYY-MM-DD)
- date_echeance: string (format YYYY-MM-DD)
- prime_annuelle: number (en EUR, TTC)
- formule: string (ex: "RC", "Mini Omnium", "Omnium Integrale")
- garanties: array of objects:
  - id: string (parmi: auto_rc, auto_dommages_materiels, auto_vol_incendie,
    auto_bris_glace, auto_protection_conducteur, auto_assistance,
    auto_protection_bonus)
  - statut: "couverte" | "absente"
  - plafond: number | null (en EUR)
  - franchise: number | null (en EUR)
  - confiance: number (0-100, ton niveau de confiance dans l'extraction)

Si une information n'est pas trouvee, utilise null.
Si tu n'es pas sur, indique une confiance basse.

Texte du contrat :
---
{CONTRACT_TEXT}
---
```

### Annexe C : Matrice de priorisation des assureurs pour le corpus de test

| Assureur | Part de marche non-vie Lux (estimee) | Priorite corpus |
|----------|--------------------------------------|-----------------|
| Foyer Assurances | ~25% | P1 |
| La Luxembourgeoise | ~20% | P1 |
| Lalux (ex-Le Foyer Vie) | ~15% | P1 |
| Baloise (ourselves) | ~8% | P1 (reference) |
| AXA Luxembourg | ~10% | P1 |
| Bâloise Belgique | ~5% (frontaliers) | P2 |
| AXA France | Frontaliers FR | P2 |
| Ethias / AG Insurance | Frontaliers BE | P2 |
| Allianz | ~3% | P3 |
| Autres | ~14% | P3 |

### Annexe D : Checklist pre-lancement MVP

- [ ] DPIA completee et validee
- [ ] Evaluation IDD completee
- [ ] Consentement RGPD redige et valide par Legal
- [ ] Disclaimers rediges et valides par Legal
- [ ] Provider LLM selectionne et contractualise
- [ ] Bucket Supabase Storage configure (prive, chiffre, RLS)
- [ ] Referentiel de garanties auto complete et valide
- [ ] Referentiel de garanties habitation complete et valide
- [ ] Prompts d'extraction testes sur corpus de 25+ contrats
- [ ] Edge Functions deployees et testees
- [ ] RLS policies en place pour les 3 nouvelles tables
- [ ] RGPD : export_my_data et delete_my_data mis a jour
- [ ] Audit trail etendu aux operations sur contrats
- [ ] Tests de charge (upload concurrent, taille fichiers)
- [ ] Tests de securite (injection, acces non autorise)
- [ ] Formation equipe support
- [ ] Plan de communication client

### Annexe E : Estimation impact sur le scoring existant (calcul illustratif)

Scenario : Marie, score declaratif vs score factuel

```
DECLARATIF (aujourd'hui) :
  home_coverage_existing = 'with_options'
  -> HOME_COV_SCORE = 90
  -> computeHomeCoverage() = ~80/100

FACTUEL (demain, apres analyse contrat) :
  Contrat HOME Baloise n. 12345
  - Incendie: couverte (plafond adequat)        -> 100
  - Degats eaux: couverte (plafond adequat)     -> 100
  - Vol: couverte mais franchise 1500 EUR       ->  60
  - RC Vie Privee: couverte                     -> 100
  - Bris glace: absente                         ->   0
  - Objets valeur: plafond 5000 EUR (insuffisant pour bijoux declares) -> 40
  - Catastrophes nat: couverte                  -> 100
  - Reeequipement neuf: absente                 ->   0
  - Panneaux solaires: absente (pas applicable) -> N/A

  Score adequation habitation =
    (20%*100 + 15%*100 + 15%*60 + 15%*100 + 5%*0 + 10%*40 + 10%*100 + 5%*0) / 95%
    = (20 + 15 + 9 + 15 + 0 + 4 + 10 + 0) / 0.95
    = 73/0.95 = ~77/100

COMPARAISON :
  - Declaratif : 80/100 (le client se croyait bien couvert)
  - Factuel : 77/100 (correction mineure ICI, mais la franchise vol et le plafond
    objets de valeur sont des signaux importants invisibles dans le declaratif)
```

Ce qui change : le score global bouge peu, mais **le DETAIL des gaps** (franchise vol, plafond objets de valeur, absence bris de glace et reeequipement neuf) est invisible dans le scoring declaratif et devient visible avec l'adequation factuelle. C'est la ou se situe la vraie valeur de la feature : pas dans le score, mais dans la **granularite des gaps**.

---

*Document genere le 28 mars 2026. A soumettre pour decision au Comite Produit.*
