# Protocole de benchmark QA -- Solutions d'extraction documentaire

> Roue des Besoins Assurance -- Baloise Luxembourg
> Version 1.0 -- 28 mars 2026
> Statut : PROTOCOLE DE TEST -- Phase 2 Adequation Contrats
> Auteur : QA Expert / IT Acceptance Testing Manager
> Prerequis : Note de cadrage v1.0 + Synthese collegiale GO CONDITIONNEL

---

## Table des matieres

1. [Diagnostic qualite initial](#1-diagnostic-qualite-initial)
2. [Strategie de benchmark](#2-strategie-de-benchmark)
3. [Protocole de benchmark](#3-protocole-de-benchmark)
4. [Matrice de testabilite par solution](#4-matrice-de-testabilite-par-solution)
5. [Strategie de test par solution](#5-strategie-de-test-par-solution)
6. [Risques qualite specifiques](#6-risques-qualite-specifiques)
7. [Cahier de test du benchmark](#7-cahier-de-test-du-benchmark)
8. [Recommandation QA](#8-recommandation-qa)
9. [PV de benchmark -- Template](#9-pv-de-benchmark----template)
10. [Annexes](#10-annexes)

---

## 1. Diagnostic qualite initial

### 1.1 Ce qui est solide

- **Le cadrage fonctionnel est excellent** : la note de cadrage identifie 3 niveaux d'extraction (identification, garanties, analyse fine) avec des seuils de confiance cibles explicites. C'est une base testable.
- **La synthese collegiale converge** sur Phase 1 = saisie manuelle, Phase 2 = OCR/LLM. Le benchmark ne concerne que la Phase 2 -- on a donc le temps de le preparer pendant le developpement Phase 1.
- **Le referentiel de garanties est structure** : 5 familles, 30+ garanties identifiees avec poids. Ce referentiel constitue le schema de verite terrain (ground truth) du benchmark.
- **Le marche luxembourgeois est etroit** : ~15 assureurs principaux, 2 langues (FR/DE). Le corpus de test est donc fini et bornable.
- **L'architecture Edge Function est modulaire** : `extract_contract` et `compute_adequation` sont separes. On peut benchmarker l'extraction independamment du matching.

### 1.2 Ce qui est fragile

- **Aucun corpus de test n'existe encore.** On parle de documents reels (contrats d'assurance) contenant des donnees personnelles sensibles. La constitution du corpus est un prerequis critique qui necessite anonymisation OU accord RGPD OU corpus synthetique.
- **Le non-determinisme des LLM est un risque fondamental.** Trois des huit solutions (Mistral, GPT-4V, Claude Vision) sont non-deterministes par nature. Un meme document peut produire des resultats differents a chaque appel. Cela invalide les strategies classiques de snapshot testing.
- **L'heterogeneite documentaire est le vrai point dur.** Les contrats luxembourgeois n'ont pas de format normalise. Un contrat Foyer en PDF natif structuree ne ressemble en rien a un scan d'avenant La Luxembourgeoise en allemand.
- **Le cout des tests n'est pas neutre.** Un run complet du benchmark sur 8 solutions avec 25 documents = 200 appels API. A ~0.10-0.50 EUR par appel LLM avec vision, cela represente 20-100 EUR par run. Ce n'est pas negligeable pour des tests CI/CD quotidiens.
- **La mesure de qualite sur les champs structure est non-triviale.** Comparer `"Foyer Luxembourg S.A."` et `"Foyer"` : est-ce un match ou un echec ? Il faut definir des regles de normalisation AVANT le benchmark.

### 1.3 Ce qui doit etre securise par le benchmark

| Zone critique | Pourquoi | Impact si non teste |
|--------------|----------|---------------------|
| Precision sur les montants (primes, plafonds, franchises) | Un plafond mal extrait fausse tout le rapport d'adequation | Faux sentiment de securite pour le client |
| Reconnaissance multi-langues (FR/DE) | 45% des contrats luxembourgeois ont des sections en allemand | Exclusion de fait d'une partie du corpus |
| Robustesse aux scans degrades | Les clients photographient leurs contrats au smartphone | Echec silencieux ou extraction partielle sans alerte |
| Identification des garanties | Le matching garantie-contrat est le coeur du moteur d'adequation | Gaps non detectes ou faux gaps |
| Temps de traitement | SLA < 30 secondes par document (KPI note de cadrage) | UX degradee, abandon utilisateur |
| Cout par extraction | Cible < 0.50 EUR/document | Non-viabilite economique a l'echelle |

---

## 2. Strategie de benchmark

### 2.1 Objectifs

| # | Objectif | Mesurable par |
|---|----------|---------------|
| O1 | Identifier la solution offrant la meilleure precision d'extraction sur les contrats d'assurance luxembourgeois | F1-score par champ, F1-score global |
| O2 | Evaluer la stabilite (determinisme) de chaque solution | Ecart-type sur 5 runs du meme document |
| O3 | Evaluer la testabilite en contexte CI/CD | Score composite (mockabilite + cout + determinisme + maintenabilite) |
| O4 | Mesurer le ratio qualite/cout de chaque solution | F1-score / cout par document |
| O5 | Identifier les risques qualite specifiques (hallucinations, propagation d'erreurs) | Taux de faux positifs, taux d'hallucination |
| O6 | Valider la conformite RGPD du flux de donnees | Localisation du traitement, politique de retention, transferts hors UE |

### 2.2 Perimetre

**IN scope :**
- 8 solutions d'extraction (cf. liste)
- Extraction des champs Niveau 1 (identification) et Niveau 2 (garanties)
- Documents PDF natifs + scans + photos
- Langues : francais et allemand
- Contrats : auto, habitation, prevoyance, voyage (4 familles du MVP etendu)
- Metriques : precision, recall, F1, temps, cout, stabilite

**OUT scope :**
- Extraction Niveau 3 (analyse fine : exclusions, conditions particulieres) -- reportee a un benchmark ulterieur
- Contrats Vie/Epargne (Phase 3)
- Fine-tuning de modeles (Phase 3)
- Performance a l'echelle (load testing) -- sera benchmarke separement
- Integration frontend (hors perimetre benchmark extraction)

### 2.3 Hypotheses

- H1 : Chaque solution est testee dans sa configuration par defaut (pas de prompt engineering avance ni fine-tuning)
- H2 : Pour les solutions LLM, un prompt d'extraction standardise est utilise (le meme pour toutes les solutions LLM)
- H3 : Le prompt est en francais avec instructions bilingues FR/DE
- H4 : Temperature = 0 (ou equivalent le plus deterministe) pour toutes les solutions LLM
- H5 : Le corpus de test est identique pour toutes les solutions
- H6 : Chaque solution est executee 5 fois sur chaque document pour mesurer la stabilite

### 2.4 Criteres d'entree du benchmark

- [ ] Corpus de 25 documents anonymises constitue et annote
- [ ] Ground truth validee par un expert metier (underwriting ou actuariat)
- [ ] Prompt d'extraction standardise redige et valide
- [ ] Comptes API actifs pour les 7 solutions cloud
- [ ] Tesseract.js installe et configure en local
- [ ] Pipeline d'evaluation automatisee operationnel
- [ ] Budget approuve (~500-1000 EUR pour les runs API)

### 2.5 Criteres de sortie du benchmark

- [ ] Chaque solution a ete executee 5 fois sur les 25 documents (125 runs par solution, 1000 runs total)
- [ ] Les metriques sont calculees pour chaque champ et chaque solution
- [ ] La matrice de testabilite est remplie
- [ ] Le PV de benchmark est redige avec recommandation claire
- [ ] Les risques qualite specifiques sont documentes par solution
- [ ] La recommandation QA est formulee et argumentee

---

## 3. Protocole de benchmark

### 3.1 Corpus de test

#### 3.1.1 Criteres de selection des documents

Le corpus doit couvrir les axes de variabilite suivants :

| Axe | Valeurs | Justification |
|-----|---------|---------------|
| **Type de contrat** | Auto (DRIVE), Habitation (HOME), Prevoyance (B-SAFE), Voyage (TRAVEL) | Couverture des 4 familles Phase 2 |
| **Assureur** | Foyer, La Luxembourgeoise (Lalux), Baloise, AXA Luxembourg, Le Foyer Vie, DKV | Top 6 du marche LU |
| **Format source** | PDF natif (texte), PDF scan (300 dpi), PDF scan (150 dpi), Photo smartphone (JPG), HEIC | Couverture des formats US-01 |
| **Langue** | Francais, Allemand, Bilingue FR/DE | Realite du marche LU |
| **Complexite** | Simple (1 page, CG resumees), Standard (3-5 pages, CP completes), Complexe (10+ pages, avenants, annexes) | Representativite |
| **Qualite du document** | Excellent (PDF natif), Bon (scan 300dpi), Moyen (scan 150dpi), Degrade (photo smartphone, pli, tache) | Robustesse |

#### 3.1.2 Composition du corpus (25 documents)

| DOC-ID | Type | Assureur | Format | Langue | Complexite | Qualite | Pages |
|--------|------|----------|--------|--------|------------|---------|-------|
| DOC-01 | Auto RC+Omnium | Baloise | PDF natif | FR | Standard | Excellent | 4 |
| DOC-02 | Auto RC seule | Foyer | PDF natif | FR | Simple | Excellent | 2 |
| DOC-03 | Auto Pack complet | La Luxembourgeoise | PDF natif | DE | Standard | Excellent | 5 |
| DOC-04 | Auto mini-omnium | AXA | Scan 300dpi | FR | Standard | Bon | 4 |
| DOC-05 | Auto RC+options | DKV | Scan 150dpi | DE | Standard | Moyen | 3 |
| DOC-06 | Habitation MRH base | Foyer | PDF natif | FR | Simple | Excellent | 3 |
| DOC-07 | Habitation MRH premium | Baloise | PDF natif | FR | Standard | Excellent | 6 |
| DOC-08 | Habitation locataire | La Luxembourgeoise | PDF natif | DE | Simple | Excellent | 2 |
| DOC-09 | Habitation proprietaire + options | AXA | Scan 300dpi | FR | Complexe | Bon | 8 |
| DOC-10 | Habitation MRH avec avenant | Foyer | Scan 150dpi | FR/DE | Complexe | Moyen | 12 |
| DOC-11 | Prevoyance B-Safe complet | Baloise | PDF natif | FR | Standard | Excellent | 5 |
| DOC-12 | Prevoyance accidents seul | Foyer | PDF natif | FR | Simple | Excellent | 3 |
| DOC-13 | Prevoyance deces+invalidite | La Luxembourgeoise | Scan 300dpi | DE | Standard | Bon | 4 |
| DOC-14 | Prevoyance hospitalisation | DKV | PDF natif | DE | Standard | Excellent | 6 |
| DOC-15 | Prevoyance multirisque | AXA | Scan 150dpi | FR | Complexe | Moyen | 10 |
| DOC-16 | Voyage annuel monde | Baloise | PDF natif | FR | Simple | Excellent | 2 |
| DOC-17 | Voyage annuel Europe | Foyer | PDF natif | FR | Simple | Excellent | 2 |
| DOC-18 | Voyage au voyage | AXA | Scan 300dpi | FR | Simple | Bon | 3 |
| DOC-19 | Auto (photo smartphone) | Foyer | Photo JPG | FR | Standard | Degrade | 1 (photo) |
| DOC-20 | Habitation (photo smartphone) | Baloise | Photo JPG | FR | Simple | Degrade | 1 (photo) |
| DOC-21 | Prevoyance (photo HEIC) | La Luxembourgeoise | HEIC | DE | Simple | Degrade | 1 (photo) |
| DOC-22 | Auto (document plie/tache) | Foyer | Scan 150dpi | FR | Standard | Degrade | 4 |
| DOC-23 | IPID standardise (format IDD) | Baloise | PDF natif | FR | Simple | Excellent | 2 |
| DOC-24 | Contrat bilingue complet | La Luxembourgeoise | PDF natif | FR/DE | Complexe | Excellent | 15 |
| DOC-25 | Avenant modificatif seul | AXA | Scan 300dpi | FR | Simple | Bon | 1 |

**Couverture atteinte :**
- Types : Auto (7), Habitation (5), Prevoyance (5), Voyage (3), IPID (1), Bilingue (1), Avenant (1) -- pas d'angle mort sauf Vie/Epargne (Phase 3)
- Assureurs : Baloise (5), Foyer (6), La Luxembourgeoise (5), AXA (5), DKV (2), Le Foyer Vie (0 -- a completer si possible)
- Formats : PDF natif (13), Scan 300dpi (5), Scan 150dpi (3), Photo JPG (2), HEIC (1), Photo degradee (1)
- Langues : FR (15), DE (5), Bilingue (5, dont implicitement dans les docs LU)
- Qualite : Excellent (13), Bon (5), Moyen (3), Degrade (4)

#### 3.1.3 Constitution du corpus -- Options

| Option | Description | Cout | Delai | RGPD |
|--------|-------------|------|-------|------|
| **A -- Contrats reels anonymises** | Obtenir des contrats reels via les equipes Baloise, anonymiser manuellement (noms, adresses, IBAN) | Faible | 2-4 semaines | Consentement ou anonymisation complete |
| **B -- Contrats synthetiques** | Generer des PDF simulant des contrats de chaque assureur a partir des modeles CG publics | Moyen | 1-2 semaines | Aucun enjeu |
| **C -- Hybride** | Contrats Baloise reels anonymises + contrats concurrents synthetiques | Moyen | 2-3 semaines | Mixte |

**Recommandation QA : Option C (hybride).** Les contrats Baloise sont accessibles en interne et representent le cas d'usage primaire. Les contrats concurrents synthetiques evitent les problemes RGPD tout en testant la variabilite. L'important est que la ground truth soit rigoureuse -- un document synthetique mal fait est pire qu'un document reel bien anonymise.

**ALERTE : Les documents synthetiques doivent etre valides par l'expert underwriting pour garantir le realisme metier. Un contrat synthetique qui ne ressemble pas a un vrai contrat faussera tout le benchmark.**

### 3.2 Ground truth (annotations de reference)

#### 3.2.1 Schema d'annotation

Chaque document du corpus est annote selon le schema suivant :

```json
{
  "document_id": "DOC-01",
  "metadata": {
    "source_file": "baloise-auto-omnium-standard.pdf",
    "format": "pdf_natif",
    "language": "fr",
    "quality": "excellent",
    "pages": 4,
    "annotated_by": "expert_underwriting",
    "annotation_date": "2026-04-15",
    "reviewed_by": "qa_expert",
    "review_date": "2026-04-18"
  },
  "level_1": {
    "type_contrat": "auto",
    "assureur": "Baloise Assurances Luxembourg S.A.",
    "assureur_normalise": "baloise",
    "numero_police": "LU-AUTO-2024-123456",
    "date_effet": "2024-01-15",
    "date_echeance": "2025-01-15",
    "prime_annuelle": 1245.50,
    "preneur": "[ANONYMISE]",
    "formule": "Omnium integrale"
  },
  "level_2": {
    "garanties": [
      {
        "id": "auto_rc",
        "label": "Responsabilite Civile",
        "statut": "couverte",
        "plafond": null,
        "franchise": 0,
        "confiance_attendue": 95,
        "notes": "RC auto illimitee corporel (norme LU)"
      },
      {
        "id": "auto_dommages_materiels",
        "label": "Dommages materiels / Omnium",
        "statut": "couverte",
        "plafond": null,
        "franchise": 350,
        "confiance_attendue": 85,
        "notes": "Franchise 350 EUR, valeur a neuf 24 mois"
      },
      {
        "id": "auto_vol_incendie",
        "label": "Vol et Incendie",
        "statut": "couverte",
        "plafond": null,
        "franchise": 0,
        "confiance_attendue": 90,
        "notes": "Inclus dans omnium"
      },
      {
        "id": "auto_bris_glace",
        "label": "Bris de glace",
        "statut": "couverte",
        "plafond": null,
        "franchise": 150,
        "confiance_attendue": 85,
        "notes": ""
      },
      {
        "id": "auto_protection_conducteur",
        "label": "Protection conducteur",
        "statut": "couverte",
        "plafond": 100000,
        "franchise": 0,
        "confiance_attendue": 80,
        "notes": "Capital 100k EUR"
      },
      {
        "id": "auto_assistance",
        "label": "Assistance / Depannage",
        "statut": "couverte",
        "plafond": null,
        "franchise": 0,
        "confiance_attendue": 85,
        "notes": "0 km, 24h/24"
      },
      {
        "id": "auto_protection_bonus",
        "label": "Protection bonus",
        "statut": "absente",
        "plafond": null,
        "franchise": null,
        "confiance_attendue": 90,
        "notes": "Non souscrite"
      }
    ]
  }
}
```

#### 3.2.2 Regles de normalisation

Pour eviter les faux negatifs dans l'evaluation, les regles suivantes s'appliquent :

| Champ | Regle de normalisation | Exemple |
|-------|----------------------|---------|
| `assureur` | Matching fuzzy avec referentiel normalise de 15 noms | "Foyer Luxembourg S.A." = "Foyer" = "Le Foyer" -> `foyer` |
| `type_contrat` | Enum strict : `auto`, `habitation`, `prevoyance`, `voyage`, `vie` | "MRH" = "Multirisque Habitation" -> `habitation` |
| `date_effet` / `date_echeance` | Format ISO 8601 (YYYY-MM-DD). Tolerance : mois/annee suffisant si jour non specifie | "15/01/2024" = "2024-01-15" |
| `prime_annuelle` | Numerique, 2 decimales, EUR implicite. Tolerance : +/- 1% | "1.245,50 EUR" = 1245.50 |
| `plafond` / `franchise` | Numerique, EUR implicite. `null` si non applicable. Tolerance +/- 5% OU +/- 50 EUR (le plus permissif) | "350 EUR" = 350 |
| `garantie.statut` | Enum : `couverte`, `partielle`, `absente`, `inconnue` | "Inclus dans la formule" -> `couverte` |
| `garantie.id` | Matching strict contre le referentiel des 30+ garanties | `auto_rc`, `hab_incendie`, `prev_deces`... |

**POINT CRITIQUE : La normalisation est la zone grise du benchmark.** Un desaccord sur la normalisation fausse toutes les metriques. Les regles ci-dessus doivent etre validees par l'expert underwriting ET le QA AVANT le lancement des tests. Tout cas ambigu decouvert pendant le benchmark est ajoute au referentiel de normalisation (approche iterative).

#### 3.2.3 Processus de creation de la ground truth

```
Etape 1 : Annotation initiale par l'expert underwriting
         (lecture manuelle du document, remplissage du JSON)
              |
              v
Etape 2 : Revue croisee par un second annotateur
         (verification independante, signalement des desaccords)
              |
              v
Etape 3 : Resolution des desaccords par concertation
         (reunion QA + underwriting + actuariat)
              |
              v
Etape 4 : Validation finale par le QA Expert
         (verification format JSON, coherence referentiel, completude)
              |
              v
Etape 5 : Archivage versionne dans le repo
         (dossier tests/benchmark/ground-truth/)
```

**Inter-annotator agreement cible : > 90% sur les champs Niveau 1, > 80% sur les champs Niveau 2.** Si l'accord inter-annotateurs est inferieur, le referentiel de normalisation est insuffisant.

### 3.3 Metriques d'evaluation

#### 3.3.1 Metriques de precision

Pour chaque champ et chaque solution, on calcule :

| Metrique | Formule | Interpretation |
|----------|---------|----------------|
| **Precision** | TP / (TP + FP) | Proportion d'extractions correctes parmi les extractions produites |
| **Recall** | TP / (TP + FN) | Proportion de champs de la ground truth effectivement extraits |
| **F1-score** | 2 * (P * R) / (P + R) | Moyenne harmonique, equilibre precision et recall |
| **Accuracy** | (TP + TN) / (TP + TN + FP + FN) | Pour les champs binaires (garantie presente/absente) |

**Definitions TP/FP/FN par type de champ :**

| Type de champ | TP | FP | FN |
|---------------|----|----|-----|
| Texte (assureur, formule) | Extraction matchant la ground truth apres normalisation | Extraction ne matchant pas la ground truth | Champ present dans la ground truth mais non extrait |
| Numerique (prime, plafond) | Extraction dans la tolerance definie (+/- 1% ou +/- 50 EUR) | Extraction hors tolerance | Champ present dans la ground truth mais non extrait |
| Date | Extraction au format correct et valeur correcte (tolerance mois/annee) | Mauvaise date | Non extraite |
| Enum (type_contrat, statut) | Match exact apres normalisation | Mauvais enum | Non extrait |
| Liste (garanties[]) | Chaque garantie est evaluee independamment | Garantie extraite mais absente de la ground truth | Garantie presente dans la ground truth mais non extraite |

#### 3.3.2 Metriques de stabilite

Pour mesurer le determinisme, chaque document est traite 5 fois par chaque solution :

| Metrique | Calcul | Seuil acceptable |
|----------|--------|-----------------|
| **Taux de concordance** | % de champs identiques sur les 5 runs | > 95% pour OCR, > 85% pour LLM |
| **Ecart-type numerique** | Ecart-type des valeurs numeriques extraites sur 5 runs | < 2% de la valeur moyenne |
| **Variante textuelle** | Nombre de variantes distinctes sur 5 runs pour chaque champ texte | <= 2 variantes sur 5 runs |
| **Score de Fleiss' kappa** | Accord inter-runs pour les champs categoriques | > 0.80 |

#### 3.3.3 Metriques operationnelles

| Metrique | Calcul | Seuil acceptable |
|----------|--------|-----------------|
| **Temps de traitement** | Duree moyenne par document (moy + P95) | Moyenne < 30s, P95 < 60s |
| **Cout par document** | Cout API moyen par document | < 0.50 EUR |
| **Taux d'echec** | % de documents produisant une erreur (timeout, refus, parsing impossible) | < 5% |
| **Taux de champs vides** | % de champs attendus retournes vides/null | < 15% Niveau 1, < 25% Niveau 2 |

#### 3.3.4 Metrique composite -- Score de testabilite

Le score de testabilite CI/CD est un composite pondere :

```
Score_testabilite =
    0.25 * Determinisme (0-100)
  + 0.20 * Mockabilite (0-100)
  + 0.20 * Cout_test_normalise (0-100)
  + 0.15 * Facilite_integration (0-100)
  + 0.10 * Observabilite (0-100)
  + 0.10 * Maintenabilite (0-100)
```

Voir section 4 pour l'evaluation detaillee par solution.

### 3.4 Prompt d'extraction standardise (pour les solutions LLM)

Le prompt ci-dessous est utilise de maniere identique pour Mistral, GPT-4V, Claude Vision. Les solutions OCR pures (Document AI, Textract, Azure DI) utilisent leurs API natives.

```
Tu es un expert en analyse de contrats d'assurance luxembourgeois.
A partir du document fourni, extrais les informations suivantes au format JSON strict.

REGLES :
- Si une information n'est pas presente ou pas lisible, retourne null (ne jamais inventer).
- Les montants sont en EUR. Retourne le nombre sans symbole ni separateur de milliers.
- Les dates sont au format YYYY-MM-DD.
- Le document peut etre en francais ou en allemand. Extrais les informations independamment de la langue.
- Pour chaque garantie, indique le statut : "couverte", "partielle" ou "absente".
- Ne retourne QUE le JSON, sans commentaire avant ou apres.

SCHEMA DE SORTIE :
{
  "type_contrat": "auto|habitation|prevoyance|voyage|vie|autre",
  "assureur": "<nom complet de l'assureur>",
  "numero_police": "<numero de police ou contrat>",
  "date_effet": "<YYYY-MM-DD>",
  "date_echeance": "<YYYY-MM-DD>",
  "prime_annuelle": <nombre>,
  "formule": "<nom de la formule souscrite>",
  "garanties": [
    {
      "id": "<identifiant normalise>",
      "label": "<nom de la garantie>",
      "statut": "couverte|partielle|absente",
      "plafond": <nombre ou null>,
      "franchise": <nombre ou null>,
      "confiance": <0-100>
    }
  ]
}

REFERENTIEL DES IDENTIFIANTS DE GARANTIES :
- Auto : auto_rc, auto_dommages_materiels, auto_vol_incendie, auto_bris_glace, auto_protection_conducteur, auto_assistance, auto_protection_bonus
- Habitation : hab_incendie, hab_degats_eaux, hab_vol, hab_bris_glace, hab_rc_vie_privee, hab_catastrophes_nat, hab_objets_valeur, hab_reequipement_neuf, hab_energie_renouvelable
- Prevoyance : prev_deces, prev_invalidite, prev_incapacite, prev_hospitalisation, prev_frais_divers
- Voyage : voy_frais_medicaux, voy_rapatriement, voy_annulation, voy_bagages, voy_rc_etranger
```

### 3.5 Conditions d'execution

| Parametre | Valeur | Justification |
|-----------|--------|---------------|
| Temperature LLM | 0 (ou min disponible) | Maximiser le determinisme |
| Max tokens | 4096 | Suffisant pour le schema JSON |
| Timeout | 120 secondes | 2x le SLA cible (60s P95) |
| Region API | EU (eu-west-1/eu-central-1) | Conformite RGPD + mesure latence realiste |
| Nombre de runs par document | 5 | Mesure de stabilite statistiquement significative |
| Intervalle entre runs | 10 secondes | Eviter les caches intermediaires |
| Ordre des documents | Aleatoire (shuffle different par run) | Eviter les biais d'ordre |

---

## 4. Matrice de testabilite par solution

### 4.1 Evaluation detaillee

| Critere (poids) | 1. Mistral AI | 2. Google Document AI | 3. AWS Textract | 4. Azure AI Doc Intel | 5. GPT-4 Vision | 6. Claude Vision | 7. Tesseract.js | 8. Hybride Tesseract+LLM |
|---|---|---|---|---|---|---|---|---|
| **Determinisme (25%)** | 40/100 -- LLM generatif, temperature 0 aide mais ne garantit pas | 90/100 -- OCR deterministe, modeles structures stables | 90/100 -- OCR deterministe | 90/100 -- OCR + modeles pre-entraines, deterministe | 35/100 -- LLM generatif, non-determinisme frequent meme a temp=0 | 40/100 -- LLM generatif, mieux qu'OpenAI sur la consistence JSON | 95/100 -- Entierement local, 100% deterministe | 70/100 -- OCR deterministe mais LLM variable |
| **Mockabilite (20%)** | 70/100 -- API REST standard, reponse JSON mockable | 80/100 -- API REST, reponse structuree previsible | 80/100 -- API REST, blocs structures | 80/100 -- API REST, modeles pre-entraines | 60/100 -- Reponse variable, mock fragile | 65/100 -- Reponse plus structuree qu'OpenAI mais reste variable | 95/100 -- Local, output deterministe, mock trivial | 80/100 -- OCR mockable, LLM moins |
| **Cout par run (20%)** | 65/100 -- ~0.05-0.15 EUR/doc | 75/100 -- ~0.01-0.05 EUR/page | 70/100 -- ~0.015 EUR/page | 70/100 -- ~0.01-0.10 EUR/doc selon modele | 30/100 -- ~0.10-0.50 EUR/doc (vision = cher) | 35/100 -- ~0.08-0.40 EUR/doc (vision = cher) | 100/100 -- 0 EUR (local) | 85/100 -- OCR gratuit + cout LLM reduit (texte seulement) |
| **Facilite integration (15%)** | 70/100 -- SDK Python/JS, API REST | 75/100 -- SDK multi-langues, well-documented | 70/100 -- SDK AWS standard | 80/100 -- SDK multi-langues, Form Recognizer | 85/100 -- API la plus documentee, ecosysteme riche | 75/100 -- API bien documentee, SDK TS natif | 60/100 -- WASM en browser, Node binding, config OCR | 55/100 -- 2 composants a integrer et orchestrer |
| **Observabilite (10%)** | 65/100 -- Logs API, pas de metriques detaillees | 85/100 -- Metriques par champ, confiance par bloc | 80/100 -- Confiance par bloc, metriques CloudWatch | 85/100 -- Confiance par champ, analytics | 60/100 -- Peu de metriques de confiance granulaires | 60/100 -- Pas de score de confiance natif | 40/100 -- Aucune metrique de confiance | 60/100 -- Confiance OCR + absence confiance LLM |
| **Maintenabilite (10%)** | 70/100 -- Modeles mis a jour par Mistral, pas de maintenance | 80/100 -- Modeles geres, versioning | 75/100 -- Service manage | 80/100 -- Service manage, modeles custom possibles | 65/100 -- Changements de modele imprevisibles (deprecation GPT-4V?) | 70/100 -- API stable mais modele peut changer | 50/100 -- Maintenance WASM, mises a jour manuelles | 55/100 -- Double maintenance (OCR + LLM) |
| **SCORE TESTABILITE** | **59/100** | **81/100** | **79/100** | **81/100** | **52/100** | **55/100** | **78/100** | **71/100** |

### 4.2 Classement par testabilite

| Rang | Solution | Score | Verdict QA |
|------|----------|-------|------------|
| 1 | **Google Document AI** | 81/100 | Excellente testabilite -- deterministe, observable, couts maitrisables |
| 1 ex aequo | **Azure AI Document Intelligence** | 81/100 | Excellente testabilite -- memes atouts que Google, modeles custom un plus |
| 3 | **AWS Textract** | 79/100 | Tres bonne testabilite -- legerement moins d'observabilite que Google/Azure |
| 4 | **Tesseract.js** | 78/100 | Bonne testabilite (determinisme maximal) MAIS absence de confiance par champ et precision brute inferieure |
| 5 | **Hybride Tesseract + LLM** | 71/100 | Correcte -- le determinisme OCR est compense par la variabilite LLM |
| 6 | **Mistral AI** | 59/100 | Mediocre -- non-determinisme LLM degrade la testabilite malgre localisation EU |
| 7 | **Claude Vision / Bedrock** | 55/100 | Mediocre -- meme probleme que Mistral, cout vision eleve |
| 8 | **GPT-4 Vision** | 52/100 | Faible -- non-determinisme + cout eleve + transfert US |

### 4.3 Matrice risque RGPD

| Solution | Localisation traitement | Transfert hors UE | DPA disponible | Retention donnees | Risque RGPD |
|----------|------------------------|-------------------|----------------|-------------------|-------------|
| Mistral AI | EU (Paris) | Non | Oui | Zero retention API | **Faible** |
| Google Document AI | EU (eu-west) configurable | Non si region EU | Oui (DPA Google Cloud) | Pas de retention | **Faible** |
| AWS Textract | EU (eu-west-1) configurable | Non si region EU | Oui (DPA AWS) | Pas de retention | **Faible** |
| Azure AI Doc Intel | EU (westeurope) configurable | Non si region EU | Oui (DPA Microsoft) | Pas de retention | **Faible** |
| GPT-4 Vision | **US par defaut** | **OUI** | DPA OpenAI disponible | Zero retention (API) | **ELEVE** |
| Claude Vision | US ou EU (Bedrock eu-west-1) | Configurable | DPA Anthropic / AWS | Zero retention | **Moyen** (faible si Bedrock EU) |
| Tesseract.js | **Local** | **Aucun** | N/A | Aucune | **NUL** |
| Hybride Tess+LLM | Depend du LLM choisi | Depend du LLM | Depend du LLM | Mixte | **Variable** |

---

## 5. Strategie de test par solution

### 5.1 Architecture de test a 3 niveaux

```
Niveau 3 -- E2E (nightly ou pre-release)
  Upload document -> Extraction -> Matching -> Rapport d'adequation
  Environnement : staging avec APIs reelles
  Frequence : quotidien nightly ou pre-merge sur branches release
  Budget : ~10-20 EUR/run (25 docs x 1 solution retenue)

Niveau 2 -- Integration (CI, pre-merge)
  Appel API reel sur sous-corpus de 5 documents de reference
  Verification F1-score > seuils d'acceptation
  Frequence : a chaque PR touchant le code d'extraction
  Budget : ~1-5 EUR/run

Niveau 1 -- Unitaire (CI, chaque commit)
  Mocks des reponses API basees sur les runs de reference captures
  Tests des fonctions de normalisation, parsing JSON, mapping garanties
  Frequence : chaque commit, chaque PR
  Budget : 0 EUR (aucun appel reseau)
```

### 5.2 Strategies par solution

#### 5.2.1 Solutions LLM (Mistral AI, GPT-4V, Claude Vision)

**Niveau 1 -- Unitaire (sans appel reseau) :**

```
Tests unitaires :
- Parser de reponse JSON (gestion des formats non-conformes, JSON partiel, markdown wrapping)
- Normalisation des champs (assureur, type_contrat, dates, montants)
- Mapping garantie_id -> referentiel normalise
- Validation du schema de sortie
- Gestion des null / champs absents
- Gestion des cas limites : reponse vide, timeout, erreur 429/503

Mocks :
- Capturer 3 reponses reelles par document de reference (run 1, 2, 3)
- Stocker comme fixtures JSON dans tests/fixtures/extraction/
- Alterner aleatoirement entre les 3 variantes pour simuler le non-determinisme
- Ajouter des fixtures de reponses degradees (JSON malformed, champs manquants)

Cout : 0 EUR
Temps execution : < 5 secondes
Frequence : chaque commit
```

**Niveau 2 -- Integration (avec appel reel) :**

```
Sous-corpus de validation : 5 documents (DOC-01, DOC-06, DOC-11, DOC-16, DOC-19)
  = 1 par type de contrat, mix qualite

Pour chaque document :
  - 1 appel API reel
  - Comparaison avec ground truth
  - F1-score par champ calcule
  - Verification : F1-score Niveau 1 > 0.90, F1-score Niveau 2 > 0.75

Alerte si :
  - F1-score global < 0.80
  - Un champ Niveau 1 a recall = 0 (regression)
  - Temps de traitement > 60 secondes

Cout : 0.50-2.50 EUR par run (5 docs x 0.10-0.50 EUR)
Temps execution : 1-3 minutes
Frequence : chaque PR modifiant le code d'extraction ou le prompt
```

**Niveau 3 -- E2E :**

```
Corpus complet : 25 documents
Parcours complet : upload -> stockage Supabase -> Edge Function -> extraction -> matching -> rapport

Verifications :
  - Le document est stocke dans le bon bucket avec les bonnes metadonnees
  - L'extraction produit un JSON conforme au schema
  - Le matching genere un rapport d'adequation coherent
  - Le rapport est accessible en lecture depuis le client
  - Le rapport est accessible en lecture depuis la vue conseiller
  - L'audit trail est bien genere
  - Les performances respectent le SLA (< 30s moyenne)
  - Le score de confiance affiche est coherent avec la precision reelle

Cout : 2.50-12.50 EUR par run
Temps execution : 10-20 minutes
Frequence : nightly + pre-release
```

**Gestion du non-determinisme :**

```
Strategie "golden response + tolerance band" :
1. Executer 10 runs de reference sur chaque document
2. Calculer la reponse mediane (golden response) et l'ecart-type par champ
3. En CI, verifier que la reponse est dans la bande de tolerance :
   - Champs texte : match exact avec la golden response OU match avec une des variantes observees
   - Champs numeriques : dans l'intervalle [mediane - 2*sigma, mediane + 2*sigma]
   - Champs enum : match exact (pas de tolerance)
4. Si > 2 champs hors bande sur un run : FAIL -> investigation

IMPORTANT : Pas de snapshot testing classique pour les LLM.
Le snapshot serait trop fragile (faux negatifs a chaque mise a jour de modele).
Utiliser plutot les seuils F1-score et les bandes de tolerance.
```

#### 5.2.2 Solutions OCR pures (Google Document AI, AWS Textract, Azure AI Doc Intel)

**Niveau 1 -- Unitaire (sans appel reseau) :**

```
Tests unitaires :
- Parser de blocs OCR -> structure (bloc -> ligne -> mot -> champ)
- Regles d'extraction par position (layouts connus des assureurs LU)
- Normalisation post-OCR (correction des erreurs courantes : 0/O, 1/l, EUR/€)
- Mapping des champs extraits vers le schema cible
- Gestion des blocs de confiance faible (< 0.70)

Mocks :
- Capturer la sortie brute de l'API OCR pour chaque document de reference
- Stocker comme fixtures JSON (structure preservee)
- Deterministe : 1 fixture par document suffit (OCR = deterministe)

Cout : 0 EUR
Temps execution : < 5 secondes
Frequence : chaque commit
```

**Niveau 2 -- Integration :**

```
Meme sous-corpus que les LLM (5 documents)
1 seul run par document suffit (deterministe)
Memes seuils F1

Specificite : verifier la confiance par bloc retournee par l'API
  - Alerter si confiance moyenne < 0.85 sur un document "Bon" ou "Excellent"
  - Alerter si confiance < 0.60 sur un document "Degrade"

Cout : 0.05-0.50 EUR par run
Temps execution : 30 secondes - 1 minute
Frequence : chaque PR
```

**Niveau 2bis -- Extraction structuree (specifique Google/Azure) :**

```
Pour les solutions offrant des modeles pre-entraines (formulaires, factures) :
  - Tester le modele generic vs le modele custom (si entraine)
  - Comparer les F1-scores
  - Evaluer si un modele custom vaut le cout d'entrainement

Google Document AI : processeur "Custom Document Extractor" -- entrainable
Azure AI Doc Intel : modele "Custom extraction" -- entrainable
AWS Textract : AnalyzeDocument avec FeatureTypes -- pas de custom training natif
```

**Niveau 3 -- E2E :**

```
Identique aux LLM mais avec une etape supplementaire :
  - Apres OCR brut, appliquer les regles d'extraction TypeScript
  - Verifier que le JSON produit est identique au JSON de reference
  - Regression stricte possible (snapshot testing applicable car deterministe)

Cout : 0.25-2.50 EUR par run
Frequence : nightly
```

#### 5.2.3 Tesseract.js (local)

**Niveau 1 -- Unitaire :**

```
Tests unitaires :
- Chargement du worker WASM
- OCR sur image de reference (baseline.png)
- Verification que le texte brut contient les mots-cles attendus
- Performance : OCR d'une page A4 < 5 secondes
- Gestion des langues : eng+fra+deu

Pas besoin de mocks : Tesseract est local et deterministe.
Le test unitaire EST un test d'integration avec la librairie.

Cout : 0 EUR
Frequence : chaque commit
```

**Niveau 2 -- Integration :**

```
Sous-corpus de 5 documents
OCR brut -> extraction de texte -> regles de parsing
Comparaison avec ground truth

Specificite : Tesseract ne produit PAS de champs structures.
Il faut une couche de parsing regles-based (regex, position, mots-cles)
pour transformer le texte brut en JSON structure.

Cette couche de parsing est le point faible : fragile, dependante du layout.
Tester exhaustivement les regles de parsing sur chaque assureur.

Cout : 0 EUR
Frequence : chaque PR
```

**Niveau 3 -- E2E :**

```
Corpus complet, parcours complet.
Le plus lent des solutions (OCR local = CPU-intensive).
Temps attendu : 20-60 secondes par page (vs < 5s pour les APIs cloud).

ALERTE PERFORMANCE : Sur un document de 10 pages, Tesseract.js en WASM
peut prendre 3-10 minutes. Incompatible avec le SLA de 30 secondes
sauf si pre-processing agressif (extraction des pages pertinentes seulement).

Cout : 0 EUR
Frequence : nightly (trop lent pour CI pre-merge)
```

#### 5.2.4 Hybride Tesseract + LLM

**Niveau 1 -- Unitaire :**

```
2 couches de tests independantes :
  Couche 1 : Tests Tesseract (cf. 5.2.3)
  Couche 2 : Tests LLM avec mock (cf. 5.2.1) mais en mode texte (pas vision)

Test de l'orchestration :
  - Tesseract -> texte brut -> truncation -> envoi au LLM -> parsing JSON
  - Tester la gestion de la propagation d'erreurs OCR
  - Simuler des erreurs OCR typiques (O/0, l/1, EUR mal reconnu) dans les mocks

Cout : 0 EUR
Frequence : chaque commit
```

**Niveau 2 -- Integration :**

```
Chaine complete sur 5 documents :
  Tesseract (reel) -> texte brut -> LLM (reel, mode texte) -> JSON

Comparer avec :
  - Le resultat du LLM en mode vision directe (si la solution le supporte)
  - Le resultat du LLM avec le texte ground truth (pas d'OCR)

Cela permet d'isoler :
  - L'impact des erreurs OCR sur la qualite finale
  - Le delta de precision entre vision directe et texte OCR
  - Le delta de cout entre vision (cher) et texte (moins cher)

Cout : OCR gratuit + 0.01-0.05 EUR/doc (LLM mode texte = beaucoup moins cher que vision)
Frequence : chaque PR
```

---

## 6. Risques qualite specifiques

### 6.1 Risques par famille de solution

#### 6.1.1 LLM Vision (Mistral, GPT-4V, Claude Vision)

| Risque | Probabilite | Impact | Detection | Mitigation |
|--------|-------------|--------|-----------|------------|
| **HALL-01 : Hallucination de garanties** -- Le LLM invente une garantie absente du contrat | Haute | Critique -- faux sentiment de couverture | F1-score precision < 0.90 sur les garanties | Prompt "ne jamais inventer" + validation humaine + cross-check avec referentiel |
| **HALL-02 : Fabrication de montants** -- Le LLM invente un plafond ou une franchise | Haute | Critique -- rapport d'adequation faux | Verification des montants extraits vs ground truth | Prompt "retourne null si pas present" + alerte si confiance < 70 |
| **HALL-03 : Confusion inter-documents** -- Si plusieurs pages, le LLM melange les informations | Moyenne | Majeur -- garanties attribuees au mauvais contrat | Tests multi-pages avec separation claire | Decoupe par page + extraction page par page |
| **NDET-01 : Non-determinisme** -- Resultats differents a chaque appel | Certaine | Significatif -- instabilite des tests et des resultats | Ecart-type sur 5 runs | Temperature 0 + bande de tolerance + mediane |
| **COST-01 : Cout en vision** -- L'envoi d'images est 5-10x plus cher que le texte | Certaine | Significatif -- viabilite economique | Suivi des couts par run | Evaluer le mode texte (post-OCR) vs vision |
| **DEPS-01 : Deprecation modele** -- Le modele LLM est deprecie sans preavis | Moyenne | Majeur -- regression brutale | Tests de regression nightly | Abstraction du provider + tests multi-modeles |

#### 6.1.2 OCR structure (Google Document AI, AWS Textract, Azure AI Doc Intel)

| Risque | Probabilite | Impact | Detection | Mitigation |
|--------|-------------|--------|-----------|------------|
| **OCR-01 : Erreurs sur scans degrades** -- OCR echoue sur les photos smartphone | Haute | Majeur -- une part significative du corpus utilisateur sera en photos | Tests sur DOC-19, 20, 21, 22 | Pre-processing image (redressement, contraste) + seuil qualite minimum |
| **OCR-02 : Confusion FR/DE** -- OCR melange les langues dans un document bilingue | Moyenne | Significatif -- champs mal extraits | Tests sur DOC-10, 24 | Detection de langue par bloc + configuration multi-langues |
| **OCR-03 : Perte de structure** -- OCR perd la relation entre labels et valeurs dans les tableaux | Haute | Critique -- impossible de savoir quel montant correspond a quelle garantie | Tests sur documents avec tableaux complexes (DOC-09, 15, 24) | Modeles de formulaires (Azure/Google) + post-processing positionnel |
| **OCR-04 : Pas d'intelligence semantique** -- OCR brut ne comprend pas le contexte metier | Certaine | Significatif -- necessite une couche supplementaire de parsing | Comparer OCR brut vs OCR + parsing vs LLM | Layer de parsing TypeScript avec regles metier |
| **LOCK-01 : Vendor lock-in** -- Dependance a un fournisseur cloud specifique | Faible | Significatif -- migration couteuse | Architecture abstraite | Interface d'extraction abstraite + implementation interchangeable |

#### 6.1.3 Tesseract.js (local)

| Risque | Probabilite | Impact | Detection | Mitigation |
|--------|-------------|--------|-----------|------------|
| **TES-01 : Precision insuffisante** -- Tesseract est moins precis que les OCR cloud | Certaine | Majeur -- taux d'erreur trop eleve | F1-score < 0.70 sur Niveau 2 | Acceptable uniquement en pre-processing pour LLM |
| **TES-02 : Performance** -- WASM lent pour documents multi-pages | Haute | Bloquant -- SLA 30s impossible pour >3 pages | Tests de performance P95 | Traitement server-side (Node.js) ou decoupe selective |
| **TES-03 : Absence de confiance** -- Pas de score de confiance par champ | Certaine | Significatif -- impossible d'alerter l'utilisateur sur les extractions douteuses | Pas de metrique dispo | Heuristiques de confiance basees sur la lisibilite |
| **TES-04 : Maintenance WASM** -- Tesseract.js peut casser avec les mises a jour navigateur | Faible | Significatif | Tests navigateurs croises | Traitement cote serveur (Edge Function) plutot que client |

#### 6.1.4 Hybride Tesseract + LLM

| Risque | Probabilite | Impact | Detection | Mitigation |
|--------|-------------|--------|-----------|------------|
| **HYB-01 : Propagation d'erreurs OCR -> LLM** -- Une erreur OCR (ex: 350 lu comme 850) est validee par le LLM qui ne detecte pas l'incoherence | Haute | Critique -- double validation de l'erreur, pas de filet de securite | Tests avec erreurs OCR injectees volontairement | Cross-check : si OCR lit 850 mais le LLM lit 350 en vision -> investigation |
| **HYB-02 : Complexite operationnelle** -- Deux composants a maintenir, debugger, monitorer | Certaine | Significatif -- cout de maintenance double | Monitoring des deux composants | Architecture claire avec interface de decouplage |
| **HYB-03 : Latence cumulee** -- OCR + LLM = temps cumule | Haute | Significatif -- SLA 30s difficile a tenir | Tests de latence chaine complete | Parallelisation OCR par page + streaming LLM |

### 6.2 Risque transversal : hallucination de garanties

Ce risque merite un traitement specifique car il est **le plus critique pour le produit**.

**Definition** : Le systeme retourne une garantie comme "couverte" alors qu'elle n'est pas mentionnee dans le contrat. Le rapport d'adequation affiche alors un gap en moins qu'il ne devrait. Le client croit etre couvert. En cas de sinistre, il ne l'est pas.

**Protocole de detection :**

```
Pour chaque solution, calculer le taux d'hallucination :

  taux_hallucination = nombre_de_garanties_extraites_absentes_de_la_ground_truth
                       / nombre_total_de_garanties_extraites

Seuil d'acceptation : taux_hallucination < 2%

Si taux > 2% : la solution est ELIMINEE pour usage en production
sans validation humaine obligatoire.
Si taux > 5% : la solution est ELIMINEE meme avec validation humaine
(le risque que l'utilisateur valide une hallucination par defaut est trop eleve).
```

**Tests specifiques anti-hallucination :**

| Test ID | Scenario | Resultat attendu |
|---------|----------|-----------------|
| HALL-T01 | Document contenant UNIQUEMENT la RC auto (DOC-02) | Seule `auto_rc` doit etre extraite. Toute autre garantie = hallucination |
| HALL-T02 | Document prevoyance deces+invalidite sans incapacite (DOC-13) | `prev_incapacite` doit etre `absente`. Si `couverte` ou `partielle` = hallucination |
| HALL-T03 | Document habitation basique sans objets de valeur (DOC-06) | `hab_objets_valeur` doit etre `absente` |
| HALL-T04 | Document voyage sans couverture bagages (ajouter au corpus si non disponible) | `voy_bagages` doit etre `absente` |
| HALL-T05 | Document vide (page blanche scannee) | Aucune garantie ne doit etre extraite. Toute extraction = hallucination |
| HALL-T06 | Document non-assurance (facture, releve bancaire) | Le systeme doit retourner une erreur "document non reconnu", pas tenter d'extraire |

---

## 7. Cahier de test du benchmark

### 7.1 Tests du protocole de benchmark lui-meme

| Test ID | Domaine | Objectif | Prerequisites | Donnees | Etapes | Resultat attendu | Criticite |
|---------|---------|----------|---------------|---------|--------|-------------------|-----------|
| BM-01 | Corpus | Verifier la completude du corpus | Corpus constitue | 25 documents | 1. Verifier que chaque DOC-ID existe 2. Verifier format/langue/qualite | 25 documents conformes aux specifications | Bloquant |
| BM-02 | Ground truth | Verifier la completude des annotations | Corpus annote | 25 fichiers JSON | 1. Valider chaque JSON contre le schema 2. Verifier coherence inter-champs | 25 annotations valides, 0 champ obligatoire null | Bloquant |
| BM-03 | Ground truth | Verifier l'accord inter-annotateurs | 2 annotateurs | 5 documents annotes en double | 1. Comparer les annotations 2. Calculer kappa | Kappa > 0.85 Niveau 1, > 0.75 Niveau 2 | Bloquant |
| BM-04 | Normalisation | Verifier les regles de normalisation | Regles definies | Corpus de test de normalisation | 1. Appliquer les regles sur des exemples limites | 100% des cas limites documentes et arbitres | Majeur |
| BM-05 | Pipeline | Verifier le pipeline d'evaluation | Pipeline code | 1 document + 1 reponse mock | 1. Executer le pipeline 2. Verifier les metriques | Precision/recall/F1 calcules correctement | Bloquant |

### 7.2 Tests par solution -- Extraction

| Test ID | Solution | Document | Objectif | Resultat attendu | Criticite |
|---------|----------|----------|----------|-------------------|-----------|
| EXT-01 | [Toutes] | DOC-01 (Baloise auto PDF) | Extraction nominale, PDF natif, FR | F1 Niveau 1 > 0.95, F1 Niveau 2 > 0.80 | Bloquant |
| EXT-02 | [Toutes] | DOC-03 (Lalux auto PDF DE) | Extraction en allemand | F1 Niveau 1 > 0.90, F1 Niveau 2 > 0.75 | Majeur |
| EXT-03 | [Toutes] | DOC-04 (AXA auto scan 300dpi) | Extraction sur scan correct | F1 Niveau 1 > 0.90, F1 Niveau 2 > 0.75 | Majeur |
| EXT-04 | [Toutes] | DOC-19 (Foyer auto photo JPG) | Extraction sur photo smartphone | F1 Niveau 1 > 0.70, F1 Niveau 2 > 0.50 | Significatif |
| EXT-05 | [Toutes] | DOC-22 (Foyer auto degrade) | Extraction sur document degrade | F1 Niveau 1 > 0.50 OU erreur propre | Significatif |
| EXT-06 | [Toutes] | DOC-24 (Lalux bilingue 15p) | Extraction document complexe bilingue | F1 Niveau 1 > 0.85, F1 Niveau 2 > 0.65, temps < 60s | Majeur |
| EXT-07 | [Toutes] | DOC-25 (AXA avenant) | Extraction sur avenant seul | Type detecte, donnees partielles, statut = `partiel` acceptable | Significatif |
| EXT-08 | [Toutes] | DOC-23 (IPID Baloise) | Extraction sur format standardise IDD | F1 Niveau 1 > 0.95 (format structure) | Majeur |

### 7.3 Tests de stabilite

| Test ID | Solution | Objectif | Etapes | Resultat attendu | Criticite |
|---------|----------|----------|--------|-------------------|-----------|
| STAB-01 | [LLM] | Determinisme sur 5 runs | 5 runs identiques sur DOC-01 | Concordance > 85% des champs | Majeur |
| STAB-02 | [LLM] | Determinisme sur 5 runs, doc degrade | 5 runs sur DOC-19 | Concordance > 70% (tolerance plus large) | Significatif |
| STAB-03 | [OCR] | Determinisme sur 5 runs | 5 runs sur DOC-01 | Concordance = 100% (deterministe) | Bloquant |
| STAB-04 | [Hybride] | Stabilite chaine complete | 5 runs chaine complete sur DOC-01 | Concordance OCR = 100%, concordance finale > 85% | Majeur |

### 7.4 Tests de performance

| Test ID | Solution | Objectif | Etapes | Resultat attendu | Criticite |
|---------|----------|----------|--------|-------------------|-----------|
| PERF-01 | [Toutes] | Temps extraction page simple | Timer sur DOC-02 (2 pages) | < 15 secondes | Majeur |
| PERF-02 | [Toutes] | Temps extraction document standard | Timer sur DOC-07 (6 pages) | < 30 secondes | Majeur |
| PERF-03 | [Toutes] | Temps extraction document complexe | Timer sur DOC-24 (15 pages) | < 60 secondes | Significatif |
| PERF-04 | [Tesseract] | Temps extraction WASM | Timer en contexte navigateur sur DOC-07 | < 60 secondes (tolerance doublée car local) | Majeur |
| PERF-05 | [Toutes] | Cout par document | Releve API billing | < 0.50 EUR/doc (sauf Tesseract = 0) | Significatif |

### 7.5 Tests anti-hallucination

| Test ID | Solution | Document | Objectif | Resultat attendu | Criticite |
|---------|----------|----------|----------|-------------------|-----------|
| HALL-T01 | [LLM] | DOC-02 (RC seule) | Zero hallucination sur doc minimaliste | Seule auto_rc extraite comme couverte | Bloquant |
| HALL-T02 | [LLM] | DOC-13 (deces+inval) | Zero hallucination incapacite | prev_incapacite = absente | Bloquant |
| HALL-T03 | [LLM] | DOC-06 (hab base) | Zero hallucination objets valeur | hab_objets_valeur = absente | Majeur |
| HALL-T04 | [LLM] | Page blanche | Zero extraction | JSON vide ou erreur "non reconnu" | Bloquant |
| HALL-T05 | [LLM] | Facture (hors perimetre) | Rejet document non-assurance | Erreur "document non reconnu" | Bloquant |
| HALL-T06 | [LLM] | DOC-11 complet | Taux hallucination < 2% | Toutes garanties extraites sont dans ground truth | Bloquant |

### 7.6 Tests de gestion d'erreur

| Test ID | Solution | Scenario | Resultat attendu | Criticite |
|---------|----------|----------|-------------------|-----------|
| ERR-01 | [Cloud] | Timeout API (simuler latence > 120s) | Erreur propre retournee, pas de crash | Majeur |
| ERR-02 | [Cloud] | Erreur 429 (rate limit) | Retry avec backoff, puis erreur propre | Majeur |
| ERR-03 | [Cloud] | Erreur 500 (service indisponible) | Erreur propre avec message utilisateur | Majeur |
| ERR-04 | [Toutes] | PDF corrompu (0 octets) | Erreur propre, pas de crash | Bloquant |
| ERR-05 | [Toutes] | PDF protege par mot de passe | Erreur propre, message "document protege" | Significatif |
| ERR-06 | [Toutes] | Fichier >10 Mo | Rejet avant envoi, message "fichier trop volumineux" | Significatif |
| ERR-07 | [LLM] | Reponse LLM non-JSON (texte libre) | Parser detecte l'erreur, retry ou erreur propre | Majeur |
| ERR-08 | [LLM] | Reponse LLM avec JSON partiel | Parser extrait ce qui est exploitable, marque les champs manquants | Significatif |

### 7.7 Synthese du cahier de test

| Domaine | Nombre de cas | Bloquants | Majeurs | Significatifs |
|---------|---------------|-----------|---------|---------------|
| Protocole | 5 | 3 | 1 | 1 |
| Extraction | 8 x 8 solutions = 64 | 8 | 32 | 24 |
| Stabilite | 4 x 8 = 32 | 8 | 16 | 8 |
| Performance | 5 x 8 = 40 | 0 | 24 | 16 |
| Anti-hallucination | 6 x 3 LLM = 18 | 12 | 3 | 3 |
| Gestion erreur | 8 x 8 = 64 | 16 | 32 | 16 |
| **TOTAL** | **223 cas** | **47** | **108** | **68** |

---

## 8. Recommandation QA

### 8.1 Classement global (testabilite + qualite attendue + cout + RGPD)

| Rang | Solution | Testabilite | Qualite attendue | Cout | RGPD | Recommandation |
|------|----------|-------------|------------------|------|------|----------------|
| **1** | **Google Document AI (EU) + post-processing TS** | 81/100 | Haute (OCR + modeles) | Faible (0.01-0.05/page) | Faible (EU) | **RECOMMANDEE Phase 2** |
| **2** | **Azure AI Document Intelligence (EU)** | 81/100 | Haute (modeles custom) | Faible-moyen | Faible (EU) | **ALTERNATIVE 1** |
| **3** | **Hybride Tesseract + Mistral AI** | 71/100 mais composite | Moyenne-haute | Tres faible | Faible (EU+local) | **STRATEGIE DE FALLBACK** |
| 4 | AWS Textract (EU) | 79/100 | Haute (OCR) | Faible | Faible (EU) | Viable mais moins de modeles custom |
| 5 | Mistral AI (vision) | 59/100 | Moyenne-haute | Moyen | Faible (EU) | Trop peu deterministe pour CI/CD |
| 6 | Claude Vision (Bedrock EU) | 55/100 | Haute (comprehension) | Eleve | Moyen-faible | Excellent en qualite mais non-deterministe et cher |
| 7 | Tesseract.js seul | 78/100 | Faible-moyenne | Nul | Nul | Insuffisant seul pour le Niveau 2 |
| 8 | GPT-4 Vision | 52/100 | Haute | Eleve | **ELEVE (US)** | **ELIMINEE** -- transfert US incompatible avec DPIA contrats |

### 8.2 Architecture recommandee

```
STRATEGIE EN 2 COUCHES :

Couche 1 -- OCR structure (Google Document AI EU ou Azure AI Doc Intel EU)
  - Extrait le texte structure avec coordonnees et confiance par bloc
  - Deterministe, testable, observable
  - Gere nativement les scans et photos
  - Modele custom entrainable sur les contrats LU

Couche 2 -- Post-processing TypeScript (local, deterministe)
  - Recoit le texte structure de la Couche 1
  - Applique les regles metier de mapping garanties
  - Normalise les champs selon le referentiel
  - Calcule le score de confiance composite
  - Genere le JSON structure pour le moteur d'adequation

FALLBACK (si confiance < 70% sur un document) :
  - Soumettre le texte brut a Mistral AI (EU, texte seul, pas vision)
  - Comparer les deux extractions
  - Si convergence : valider
  - Si divergence : marquer comme "verification manuelle requise"
```

**Justification QA de cette architecture :**

1. **Determinisme** : La Couche 1 OCR est deterministe, la Couche 2 TS est deterministe. Le pipeline complet est donc deterministe -> snapshot testing applicable, CI/CD fiable.
2. **Testabilite** : Chaque couche est testable independamment. Les mocks sont triviaux (sortie OCR fixe + regles TS testees unitairement).
3. **Cout** : OCR cloud = ~0.01-0.05/page. Pas de cout LLM sauf fallback. Le budget de test est maitrise.
4. **RGPD** : Tout reste en EU. Pas de transfert vers des serveurs US.
5. **Observabilite** : Google/Azure retournent des scores de confiance par bloc, ce qui alimente le score de confiance affiche a l'utilisateur.
6. **Maintenabilite** : Les regles metier sont dans du TypeScript versionne, pas dans un prompt LLM qui peut varier.
7. **Le LLM en fallback** gere les cas limites sans etre le chemin principal. Cela limite le risque d'hallucination aux cas deja identifies comme incertains.

### 8.3 Seuils d'acceptation pour mise en production

| Metrique | Seuil minimum | Seuil cible | Seuil d'excellence |
|----------|---------------|-------------|---------------------|
| F1-score Niveau 1 global | **> 0.90** | > 0.95 | > 0.98 |
| F1-score Niveau 2 global | **> 0.75** | > 0.85 | > 0.92 |
| F1-score assureur | > 0.95 | > 0.98 | 1.00 |
| F1-score type_contrat | > 0.95 | > 0.98 | 1.00 |
| F1-score prime_annuelle | **> 0.85** | > 0.92 | > 0.97 |
| F1-score garanties (statut) | **> 0.80** | > 0.88 | > 0.95 |
| F1-score plafonds | > 0.70 | > 0.80 | > 0.90 |
| F1-score franchises | > 0.70 | > 0.80 | > 0.90 |
| Taux d'hallucination | **< 2%** | < 1% | < 0.5% |
| Concordance 5 runs | > 90% | > 95% | > 98% |
| Temps moyen | < 30s | < 15s | < 8s |
| Cout moyen par doc | < 0.50 EUR | < 0.20 EUR | < 0.05 EUR |
| Taux d'echec | < 5% | < 2% | < 1% |

**Regle de decision :**
- **Tous les seuils minimums atteints** : GO production (validation conditionnelle, monitoring rapproche)
- **Un seuil minimum non atteint sur un champ Niveau 1** : NO-GO -- remediation obligatoire
- **Un seuil minimum non atteint sur un champ Niveau 2** : GO avec reserve -- le champ est marque "confiance faible" dans l'UI
- **Taux d'hallucination > 2%** : NO-GO absolu -- la solution ne peut pas etre deployee

### 8.4 Protocole de validation pre-production

```
Phase 1 : Benchmark initial (ce document)
  - 25 documents x 8 solutions x 5 runs = 1000 evaluations
  - Classement et selection de la solution retenue
  - Duree : 2 semaines

Phase 2 : Calibration de la solution retenue
  - Ajuster les regles de post-processing TS
  - Entrainer un modele custom (Google/Azure) si necessaire
  - Re-evaluer sur le corpus de 25 documents
  - Duree : 2 semaines

Phase 3 : Validation elargie
  - Elargir le corpus a 50 documents (ajout d'assureurs rares, cas limites)
  - Tester avec des utilisateurs reels (5-10 beta-testeurs internes Baloise)
  - Mesurer le taux de correction manuelle (cible < 30%)
  - Duree : 3 semaines

Phase 4 : Validation metier
  - Faire valider 20 rapports d'adequation complets par un expert underwriting
  - Verifier la coherence entre extraction et rapport final
  - Identifier les cas ou l'adequation est trompeuse
  - Duree : 1 semaine

Phase 5 : GO/NO-GO production
  - Tous les seuils minimums atteints ?
  - Validation metier positive ?
  - DPIA validee ?
  - Disclaimer juridique integre ?
  -> PV de validation signe
```

---

## 9. PV de benchmark -- Template

Ce template sera rempli a l'issue de l'execution du benchmark.

### PV DE BENCHMARK -- SOLUTIONS D'EXTRACTION DOCUMENTAIRE

**Objet** : Benchmark comparatif de 8 solutions d'extraction pour la fonctionnalite d'adequation contrats -- Roue des Besoins Assurance

**Version / perimetre** : Phase 2, contrats auto + habitation + prevoyance + voyage, 25 documents, 8 solutions

**Date d'execution** : [A COMPLETER]

**Executants** : [A COMPLETER]

#### Rappel de la strategie de test
- 25 documents couvrant 4 familles, 6 assureurs, 5 formats, 3 langues, 4 niveaux de qualite
- 223 cas de test (47 bloquants, 108 majeurs, 68 significatifs)
- 5 runs par solution par document (mesure de stabilite)
- Metriques : F1-score, stabilite, performance, cout, hallucination

#### Resultats globaux

| Solution | F1 N1 | F1 N2 | Stabilite | Temps moy | Cout/doc | Halluc. | Echecs | Score global |
|----------|-------|-------|-----------|-----------|----------|---------|--------|--------------|
| Mistral AI | [--] | [--] | [--] | [--] | [--] | [--] | [--] | [--] |
| Google Doc AI | [--] | [--] | [--] | [--] | [--] | [--] | [--] | [--] |
| AWS Textract | [--] | [--] | [--] | [--] | [--] | [--] | [--] | [--] |
| Azure AI DI | [--] | [--] | [--] | [--] | [--] | [--] | [--] | [--] |
| GPT-4 Vision | [--] | [--] | [--] | [--] | [--] | [--] | [--] | [--] |
| Claude Vision | [--] | [--] | [--] | [--] | [--] | [--] | [--] | [--] |
| Tesseract.js | [--] | [--] | [--] | [--] | [--] | [--] | [--] | [--] |
| Hybride T+L | [--] | [--] | [--] | [--] | [--] | [--] | [--] | [--] |

#### Anomalies trouvees
[A COMPLETER -- classees par criticite]

#### Reservations
[A COMPLETER]

#### Recommandation
[A COMPLETER -- solution retenue + justification]

#### Opinion de validation
[ ] VALIDE -- La solution [X] satisfait tous les seuils minimums
[ ] VALIDE SOUS RESERVES -- Seuils atteints sauf [champs], deploiement avec monitoring rapproche
[ ] NON VALIDE -- Seuils non atteints, remediation necessaire avant redemarrage du benchmark

#### Risques residuels
[A COMPLETER]

#### Prochaines actions
[A COMPLETER]

**Signatures** :
- QA Expert : _________________
- Product Manager : _________________
- IT Architect : _________________

---

## 10. Annexes

### Annexe A : Estimation budgetaire du benchmark

| Poste | Calcul | Cout estime |
|-------|--------|-------------|
| Mistral AI | 25 docs x 5 runs x ~0.10 EUR | ~12.50 EUR |
| Google Document AI | 25 docs x 5 runs x 4 pages moy x 0.03 EUR | ~15.00 EUR |
| AWS Textract | 25 docs x 5 runs x 4 pages moy x 0.015 EUR | ~7.50 EUR |
| Azure AI Doc Intel | 25 docs x 5 runs x ~0.05 EUR | ~6.25 EUR |
| GPT-4 Vision | 25 docs x 5 runs x ~0.30 EUR | ~37.50 EUR |
| Claude Vision | 25 docs x 5 runs x ~0.25 EUR | ~31.25 EUR |
| Tesseract.js | Local | 0 EUR |
| Hybride (Tess + Mistral texte) | 25 docs x 5 runs x ~0.03 EUR | ~3.75 EUR |
| **TOTAL API** | | **~114 EUR** |
| Constitution corpus (temps expert) | 5 jours x expert underwriting | Interne |
| Annotation ground truth | 3 jours x 2 annotateurs | Interne |
| Pipeline d'evaluation | 3 jours x developpeur | Interne |
| Execution + analyse | 3 jours x QA expert | Interne |
| **TOTAL TEMPS** | | **~14 jours-homme** |

### Annexe B : Planning previsionnel

```
Semaine 1 (S+0) : Constitution du corpus + annotations ground truth
  - Collecte des documents Baloise (interne)
  - Generation des documents synthetiques concurrents
  - Double annotation + reconciliation
  - Validation QA du corpus

Semaine 2 (S+1) : Setup technique + runs initiaux
  - Configuration des 8 comptes API
  - Codage du pipeline d'evaluation automatisee
  - Tests sur 3 documents pilotes (DOC-01, DOC-06, DOC-11)
  - Ajustements du protocole si necessaire

Semaine 3 (S+2) : Execution complete du benchmark
  - 1000 runs (25 docs x 8 solutions x 5 runs)
  - Collecte des resultats bruts
  - Calcul des metriques
  - Identification des anomalies

Semaine 4 (S+3) : Analyse + PV + decision
  - Remplissage de la matrice de resultats
  - Redaction du PV de benchmark
  - Presentation au comite de pilotage
  - Decision GO/NO-GO sur la solution retenue
```

### Annexe C : Referentiel de normalisation des assureurs

| Variantes possibles | Nom normalise |
|--------------------|---------------|
| Baloise, Baloise Assurances, Baloise Assurances Luxembourg S.A., Bâloise | `baloise` |
| Foyer, Le Foyer, Foyer Assurances, Foyer Luxembourg, Foyer S.A. | `foyer` |
| La Luxembourgeoise, Lalux, LaLux, La Lux | `lalux` |
| AXA, AXA Assurances Luxembourg, AXA Luxembourg S.A. | `axa` |
| DKV, DKV Luxembourg, Deutsche Krankenversicherung | `dkv` |
| Le Foyer Vie, Foyer Vie | `foyer_vie` |
| CARDIF, BNP Paribas Cardif | `cardif` |
| Generali, Generali Luxembourg | `generali` |
| Zurich, Zurich Insurance | `zurich` |
| Allianz, Allianz Luxembourg | `allianz` |

### Annexe D : Checklist de revue pre-benchmark

- [ ] Le corpus de 25 documents est complet et conforme au tableau 3.1.2
- [ ] Chaque document a une annotation ground truth au format JSON 3.2.1
- [ ] L'accord inter-annotateurs est mesure et > seuils (BM-03)
- [ ] Les regles de normalisation sont documentees et validees (BM-04)
- [ ] Le pipeline d'evaluation est operationnel et verifie (BM-05)
- [ ] Les 7 comptes API cloud sont actifs et testes (ping OK)
- [ ] Tesseract.js est installe et fonctionnel (version, langues fra+deu+eng)
- [ ] Le prompt standardise est redige et valide par l'equipe
- [ ] Le budget est approuve (~150 EUR API + ~14 jours-homme)
- [ ] L'expert underwriting est disponible pour la validation
- [ ] Le planning est acte (4 semaines)

---

*Document redige par le QA Expert / IT Acceptance Testing Manager*
*Roue des Besoins Assurance -- Baloise Luxembourg*
*Version 1.0 -- 28 mars 2026*
