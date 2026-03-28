# Synthese collegiale -- Fonctionnalite d'adequation contrats
## Decision GO/NO-GO -- Analyse des 14 agents specialises

> Roue des Besoins Assurance -- Baloise Luxembourg
> Date : 28 mars 2026
> Statut : SYNTHESE CONSOLIDEE POUR DECISION

---

## 1. Verdict global

### VERDICT : GO CONDITIONNEL (unanime, 14/14 agents)

Aucun agent n'a emis d'avis NO-GO. Tous convergent vers un **GO sous conditions**, avec des pre-requis variant selon le domaine. Les 3 conditions bloquantes transverses sont :

| # | Condition suspensive | Porte par |
|---|---------------------|-----------|
| **C1** | Qualification IDD tranchee (information vs conseil) avant toute ligne de code | Compliance + Legal |
| **C2** | DPIA realisee et validee (donnees sensibles, art. 9 RGPD pour sante) | Compliance + Security |
| **C3** | Phase 1 = saisie structuree manuelle UNIQUEMENT (pas d'OCR/upload PDF) | IT Architect + Product Manager |

---

## 2. Synthese par equipe

### TEAM PRODUIT & STRATEGIE

#### Product Manager (LEAD)
- **Avis** : GO conditionnel -- fake CTA d'abord pour mesurer l'appetence
- **Points cles** :
  - Proposition de valeur forte : passer du declaratif approximatif au factuel ancre dans les contrats reels
  - MVP Phase 1 : saisie structuree (0 cout infra, 4-6 semaines)
  - Phase 2 : OCR-assisted apres validation marche
  - KPI cle : taux de clic sur CTA "Verifier ma couverture" > 15% pour valider l'interet
- **Risque principal** : abandon utilisateur si formulaire trop complexe (30 garanties)
- **Recommandation** : deployer d'abord un CTA factice pour mesurer la demande reelle

#### Sales Architect
- **Avis** : GO -- forte valeur commerciale
- **Points cles** :
  - Le gap documente (besoin vs couverture) est un levier de conversion majeur
  - Scripts commerciaux conseillers : "Votre diagnostic montre un besoin, vos contrats actuels ne couvrent pas..."
  - Formation conseillers necessaire (lecture resultats adequation + posture non-agressive)
  - Risque : perception "vendeur" si l'outil pousse trop vers les produits Baloise
- **Condition** : wording neutre et factuel, pas de recommandation produit Baloise directe dans l'adequation

#### Decision Scientist
- **Avis** : GO -- moteur d'adequation techniquement faisable
- **Architecture proposee** :
  - 3 couches : extraction (saisie/OCR) -> matching engine -> generation d'actions
  - Score de confiance : high >= 0.75, medium 0.45-0.74, low < 0.45
  - Adequation independante du needScore existant (layer supplementaire, pas modification)
  - Statuts categoriques par garantie : couvert / partiellement couvert / non couvert / non evaluable
- **Alerte** : eviter la fausse precision -- un score d'adequation a 73.2% est trompeur sans acces aux conditions particulieres

---

### TEAM GOUVERNANCE & CONFORMITE

#### Compliance Officer
- **Avis** : GO SOUS CONDITIONS STRICTES
- **Conditions obligatoires** :
  1. Qualification IDD : l'outil doit etre qualifie "information" (pas "conseil") -- sinon obligations IDD completes
  2. Disclaimer obligatoire : "Cette analyse ne constitue pas un conseil en assurance"
  3. Consentement explicite RGPD avant toute saisie de contrats
  4. Si donnees de sante (prevoyance/hospitalisation) : consentement art. 9 separe
  5. POG (Product Oversight & Governance) : l'outil ne doit pas orienter directement vers des produits Baloise
- **Bloquant** : sans qualification IDD, le projet ne peut pas demarrer

#### Legal Counsel
- **Avis** : GO sous conditions suspensives
- **Points critiques** :
  1. **Responsabilite** : si l'outil dit "vous etes couvert" et que le client ne l'est pas -> risque contentieux
  2. **IDD** : la frontiere information/conseil est floue pour un outil d'adequation
  3. **Propriete intellectuelle** : les contrats uploades restent propriete du client -- pas d'exploitation a d'autres fins
  4. **Secret des affaires** : les donnees concurrentielles (tarifs, garanties) ne doivent pas etre utilisees a des fins commerciales Baloise
  5. **Limitation de responsabilite** : clause claire que l'analyse est indicative et non contractuelle
- **Condition** : faire valider le disclaimer par le service juridique Baloise Luxembourg

#### Risk Manager
- **Avis** : GO conditionnel avec 4 gates de validation
- **4 risques critiques identifies** :
  1. Risque de reputation : faux positif "vous etes couvert" -> sinistre non couvert -> blame Baloise
  2. Risque reglementaire : requalification en conseil par le CAA (Commissariat aux Assurances)
  3. Risque operationnel : desalignement scoring/adequation -> resultats incoherents
  4. Risque de donnees : fuite de contrats concurrents -> sanctions CNPD
- **Gates** : (G1) DPIA validee, (G2) IDD tranchee, (G3) UAT metier, (G4) revue juridique pre-prod

#### Internal Audit
- **Avis** : GO conditionnel -- maturite actuelle 1/5 pour le perimetre documents
- **Framework de controle requis** :
  - Controles preventifs : validation schema JSONB, RLS, consentement
  - Controles detectifs : audit trail complet (creation/modification/suppression contrats)
  - Controles correctifs : procedure de rectification des donnees
  - Mise a jour du plan d'audit annuel pour inclure le nouveau perimetre
- **Alerte** : l'audit trail existant (`log_audit_event`) doit etre enrichi avec les nouvelles actions

---

### TEAM TECHNIQUE ASSURANCE

#### Actuaire Senior
- **Avis** : GO avec reserves methodologiques
- **Points cles** :
  - L'adequation DOIT rester categorique (couvert/non couvert/partiel), PAS numerique
  - Un score d'adequation chiffre est une fausse precision sans acces aux franchises, plafonds, exclusions
  - Le referentiel de 30 garanties est une estimation basse -- prevoir 40-50 pour le marche luxembourgeois
  - Les frontaliers (45% de l'emploi) sont le point nevralgique : regimes sociaux FR/BE/DE tres differents
- **Reserve** : ne pas afficher de pourcentage d'adequation -- preferer des icones couvert/non couvert

#### Insurance Process Architect
- **Avis** : GO -- workflow en 7 phases
- **Workflow cible** :
  1. Declenchement (post-diagnostic)
  2. Consentement RGPD
  3. Saisie des contrats
  4. Validation des donnees
  5. Matching garanties/besoins
  6. Generation du rapport d'adequation
  7. Actions (contacter conseiller, modifier contrats)
- **Plan de transformation** : 4 phases / 16 semaines
- **RACI** defini pour chaque etape

#### Insurance Product Manager
- **Analyse de la note de cadrage** : solide, approche phasee correcte
- **Points d'attention** :
  - Le mapping garanties/quadrants doit etre valide avec l'equipe technique Baloise
  - Les produits Baloise (DRIVE, HOME, B-SAFE, TRAVEL) ne couvrent pas tous les besoins (ex: protection juridique standalone)
  - Prevoir un statut "non evaluable" pour les garanties hors perimetre Baloise
  - Le score de couverture existant (coverageScore) et l'adequation sont complementaires, pas redondants

---

### TEAM IT & SECURITE

#### IT Architect
- **Avis** : GO Phase 1 uniquement (saisie structuree)
- **Architecture recommandee** :
  - Phase 1 : formulaire React -> tables Supabase (`contracts`, `contract_guarantees`, `adequacy_analyses`) -> calcul TypeScript client-side + validation serveur
  - Phase 2 : Google Document AI EU (region eu-west) pour OCR -- pas avant validation Phase 1
  - Referentiel garanties : fichier `src/shared/contracts/guarantees.ts` avec types stricts
  - Moteur d'adequation : `src/shared/contracts/adequacy-engine.ts` (fonction pure, testable unitairement)
- **Alerte** : ne PAS reproduire le pattern dual scoring (TS + PL/pgSQL) -- choisir un seul moteur autorite

#### Security Architect
- **Avis** : GO sous 3 bloqueurs absolus
- **3 bloqueurs** :
  1. **DPIA** obligatoire avant toute implementation (donnees sensibles)
  2. **Consentement art. 9** si donnees de sante (prevoyance, hospitalisation)
  3. **Bucket Supabase prive** (Phase 2 uniquement) avec chiffrement at-rest
- **Securite Phase 1** :
  - RLS sur les 3 nouvelles tables (meme pattern que l'existant)
  - Mise a jour `delete_my_data()` et `export_my_data()` pour inclure les contrats
  - Audit trail sur toutes les operations CRUD contrats
  - Validation JSONB server-side (trigger)
- **Point positif** : Phase 1 sans upload de fichiers = surface d'attaque minimale

#### QA Expert
- **Avis** : GO conditionnel
- **Strategie de test** : 60 cas Phase 1 (saisie manuelle) + 70 cas Phase 2 (OCR/upload)
- **Phase 1 -- 60 cas en 8 domaines** :
  - A. Saisie manuelle (12 cas, 3 bloquants)
  - B. Matching garanties/quadrants (8 cas, 2 bloquants)
  - C. Scoring d'adequation (10 cas, 3 bloquants)
  - D. Integration parcours existant (6 cas, 2 bloquants)
  - E. Securite & RLS (8 cas, 4 bloquants)
  - F. RGPD (5 cas, 2 bloquants)
  - G. Performance (4 cas, 1 bloquant)
  - H. Ergonomie/UX (7 cas)
- **Phase 2 -- 70 cas en 6 domaines** (cahier complet prepare) :
  - Upload/validation/securite (19 cas -- dont PDF bomb, HEIC iPhone, isolation inter-users)
  - OCR/parsing (14 cas -- PDF natif, scan 300dpi, photo smartphone, allemand, multi-pages)
  - Matching contrat->produit (12 cas -- Baloise, Foyer, multi-risques, contradictions questionnaire)
  - Scoring d'adequation (11 cas -- gap report, non-regression, recalcul dynamique)
  - Restitution (7 cas -- section contrats, gaps par produit, PDF enrichi, vue conseiller)
  - E2E (7 cas -- parcours complet, RGPD, concurrence)
- **Architecture CI/CD 3 niveaux** : unitaire (mocks JSON), integration (Tesseract local), qualification (API reelle nightly)
- **Phasage QA recommande** : V1 = PDF natifs Baloise auto+habitation, V2 = multi-assureurs, V3 = photos/HEIC
- **Alerte critique** : desalignement structurel TS/PL/pgSQL -- trancher l'architecture AVANT dev
- **Reserves** :
  1. Referentiel 30 garanties probablement insuffisant (prevoir 40-50)
  2. Score de confiance "medium" sera le cas le plus frequent -> risque perception negative
  3. `ResultsPage` deja dense -> page dediee recommandee
  4. `delete_my_data()` ne gere PAS Supabase Storage (pas de CASCADE) -- modification obligatoire
  5. Corpus de 22 documents de test specifies (DOC-01 a DOC-22)

---

### TEAM OPS

#### Underwriting Expert
- **Avis** : GO conditionnel (confiance 85/100)
- **Structure des contrats luxembourgeois** (5 couches documentaires) :
  - Couche 1 : Conditions Particulieres (CP) -- piece maitresse pour extraction
  - Couche 2 : Tableau Recapitulatif des Garanties (TRG) -- zone la plus dense
  - Couche 3 : Conditions Generales (CG) -- standard, 20-40 pages
  - Couche 4 : Conditions Speciales / Avenants
  - Couche 5 : IPID (format europeen IDD, 2 pages standardisees)
- **Mapping detaille par produit** :
  - DRIVE : 12 garanties identifiees (RC, omnium, mini-omnium, assistance, PJ auto, valeur a neuf, protection bonus...)
  - HOME : 16 garanties (incendie, DDE, vol, RC VP, bris de glace, objets de valeur, panneaux solaires...)
  - TRAVEL : 7 garanties (rapatriement, frais medicaux, annulation, bagages...)
  - B-SAFE : 9 garanties (deces accident, invalidite, incapacite, hospitalisation...)
  - FUTUR : 4 garanties (art. 111bis, art. 111, epargne employeur, solde restant du)
- **Matrice d'extractibilite** :
  - Fiable (>80%) : assureur, produit, dates, prime, niveau couverture global
  - Moderee (55-75%) : plafonds, garanties detaillees, franchises
  - Non fiable (<40%) : exclusions, mode d'indemnisation, conditions de garantie
- **Specificites Luxembourg** :
  - Frontaliers (200 000 travailleurs) : contrats FR/BE/DE non directement comparables
  - Bilinguisme FR/DE : le pipeline doit gerer les deux langues
  - RC auto illimitee au LU pour corporel (100M EUR combines en pratique)
  - Differences structurelles entre assureurs (Foyer = packs, La Lux = options individuelles, Baloise = packs, AXA = formules)
- **Piege #1 : sous-assurance** -- valeur ajoutee majeure de l'outil (croiser capital contenu assure vs `home_contents_value` declaree)
- **Piege #2 : contrats multi-risques** -- 1 contrat MRH couvre incendie + DDE + vol + RC VP + PJ = doit etre decompose en sous-garanties
- **Risque principal** : faux positifs sans acces franchises/plafonds/exclusions
- **Recommandation** : toujours qualifier avec "sous reserve des conditions particulieres de votre contrat" + extraction Phase 1 limitee au niveau 1 (assureur/produit/niveau global)

---

### TEAM CREATIVE

#### Art Director
- **Avis** : GO -- direction UX complete proposee
- **Principes UX** :
  - Wizard par etapes (pas de formulaire monolithique)
  - Filtrage dynamique des garanties par type de contrat
  - Resultats : synthese visuelle avant le detail
  - Codes couleur : vert (couvert), ambre (partiel), rouge (gap), gris (non evaluable)
  - Page dediee `/results/:id/adequation` plutot qu'integration dans ResultsPage

---

## 3. Convergences majeures (consensus des 14 agents)

| # | Point de convergence | Agents concordants |
|---|---------------------|--------------------|
| 1 | Phase 1 = saisie manuelle structuree, PAS d'OCR | 14/14 |
| 2 | Qualification IDD obligatoire avant dev | Compliance, Legal, Risk, Audit, Sales |
| 3 | DPIA obligatoire | Compliance, Security, Risk, Legal |
| 4 | Adequation categorique (couvert/non/partiel), pas de % trompeur | Actuaire, Decision Scientist, Product Manager |
| 5 | Disclaimer non-conseil obligatoire | Compliance, Legal, Risk, Sales |
| 6 | Referentiel garanties a valider avec le metier (30 = plancher) | Actuaire, Underwriting, QA, Product Manager |
| 7 | Frontaliers = point nevralgique a adresser | Underwriting, Actuaire, Product Manager |
| 8 | Page dediee (pas surcharger ResultsPage) | QA, Art Director, Process Architect |
| 9 | Moteur d'adequation TypeScript (pas dual TS+PL/pgSQL) | IT Architect, QA |
| 10 | Mise a jour delete_my_data/export_my_data obligatoire | Security, QA, Compliance |

---

## 4. Divergences et arbitrages necessaires

| Sujet | Position A | Position B | Arbitrage recommande |
|-------|-----------|-----------|---------------------|
| Score numerique vs categorique | Decision Scientist : score de confiance chiffre (0-1) | Actuaire : categorique uniquement (couvert/non/partiel) | **Categorique pour l'utilisateur, score interne pour le conseiller** |
| CTA factice d'abord vs dev direct | Product Manager : fake CTA pour mesurer | Process Architect : dev direct 16 semaines | **Fake CTA d'abord (2 jours de dev, 4 semaines de mesure)** |
| Referentiel ouvert vs ferme | QA : option "Autre" avec champ libre | Underwriting : referentiel ferme pour fiabilite matching | **Ferme Phase 1 + backlog d'enrichissement** |
| Adequation liee au diagnostic vs independante | Process Architect : liee (post-diagnostic obligatoire) | Product Manager : accessible aussi depuis dashboard | **Liee au diagnostic en Phase 1, elargie en Phase 2** |

---

## 5. Pre-requis avant lancement du developpement

### Gate 0 : Validation marche (2 semaines)
- [ ] Deployer CTA factice "Verifier ma couverture" sur ResultsPage
- [ ] Mesurer le taux de clic pendant 4 semaines
- [ ] Seuil GO : > 15% de taux de clic

### Gate 1 : Juridique & Conformite (4 semaines en parallele)
- [ ] Qualification IDD par le service juridique Baloise Luxembourg
- [ ] DPIA realisee et validee par le DPO
- [ ] Disclaimer valide par Legal
- [ ] Analyse des implications art. 9 RGPD (donnees de sante prevoyance)

### Gate 2 : Specification technique (2 semaines)
- [ ] Referentiel des garanties normalisees valide par le metier
- [ ] Schema DB finalise (migration SQL)
- [ ] Architecture du moteur d'adequation validee (TypeScript uniquement)
- [ ] Maquettes UX validees

### Gate 3 : Developpement Phase 1 (6 semaines)
- [ ] Migration SQL + RLS + triggers
- [ ] Referentiel garanties + types TypeScript
- [ ] Formulaire de saisie (wizard multi-etapes)
- [ ] Moteur d'adequation (fonction pure)
- [ ] Page resultats adequation
- [ ] Mise a jour delete_my_data / export_my_data
- [ ] Audit trail (nouvelles actions dans log_audit_event)
- [ ] Vue conseiller des contrats clients

### Gate 4 : Recette (2 semaines)
- [ ] 60 cas de test QA executes (0 bloquant ouvert)
- [ ] Suite de non-regression existante 100% verte
- [ ] RLS verifiee sur les nouvelles tables
- [ ] Test de coherence scoring/adequation sur 5 profils types
- [ ] Revue securite pre-prod

---

## 6. Estimation de charge Phase 1

| Poste | Estimation | Commentaire |
|-------|-----------|-------------|
| Gate 0 (CTA factice) | 2 jours dev + 4 semaines mesure | Peut demarrer immediatement |
| Gate 1 (Juridique) | 4 semaines | En parallele de Gate 0 |
| Gate 2 (Specs) | 2 semaines | Apres Gates 0+1 validees |
| Gate 3 (Dev) | 6 semaines | 1 developpeur |
| Gate 4 (Recette) | 2 semaines | Chevauchement possible avec fin de Gate 3 |
| **Total** | **~10 semaines de dev** | **+ 4 semaines de validation marche en amont** |

---

## 7. Risques residuels post-implementation

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| Faux positif "couvert" -> sinistre non pris en charge | Moyenne | Critique | Disclaimer + statut "sous reserve" + formulation prudente |
| Abandon formulaire (trop de garanties a saisir) | Elevee | Majeur | Wizard par etapes + filtrage par type de contrat |
| Requalification en "conseil" par le CAA | Faible | Bloquant | Qualification IDD prealable + disclaimer |
| Frontaliers mal geres (regimes sociaux differents) | Elevee | Significatif | Statut "non evaluable" pour les garanties etrangeres |
| Desalignement scoring existant / adequation | Moyenne | Majeur | Moteur unique TypeScript + tests de coherence |
| Referentiel garanties incomplet | Elevee | Significatif | Feedback loop + backlog d'enrichissement |

---

## 8. Recommandation finale

### GO CONDITIONNEL -- approche en gates

**Etape immediate (cette semaine)** :
1. Deployer le CTA factice sur ResultsPage pour mesurer l'appetence
2. Lancer en parallele la qualification IDD avec le juridique Baloise

**Decision finale** apres 4 semaines :
- Si taux de clic CTA > 15% ET qualification IDD favorable -> GO Phase 1
- Si taux de clic < 10% -> reconsiderer la priorite
- Si qualification IDD = "conseil" -> revoir le perimetre (simplifier ou abandonner)

La fonctionnalite a une **forte valeur strategique** (differenciation marche, conversion, donnees concurrentielles) mais les **pre-requis reglementaires sont non negociables**. L'approche en gates minimise le risque d'investissement inutile.

---

---

## Annexe A : Standards du marche luxembourgeois (Underwriting Expert)

### AUTO (DRIVE) -- seuils d'adequation

| Garantie | Standard marche | Premium | Insuffisant |
|----------|----------------|---------|-------------|
| RC | Illimitee corporel (norme LU) | Idem | Pas de RC = illegal |
| Omnium | Vehicule < 5 ans = norme | Valeur a neuf 36 mois + protection bonus | Vehicule < 3 ans en RC seule |
| Franchise omnium | 250-500 EUR | 0-150 EUR | > 1 000 EUR |
| Assistance | Incluse en base | 24h, vehicule remplacement equivalent | Aucune |

### HABITATION (HOME)

| Garantie | Standard marche | Premium | Insuffisant |
|----------|----------------|---------|-------------|
| Capital contenu | 20 000-50 000 EUR | > 75 000 EUR | < 15 000 EUR |
| RC VP | 2 500 000 EUR | 5 000 000 EUR+ | < 1 250 000 EUR ou absente |
| Franchise | 250-500 EUR | 150-250 EUR | > 1 000 EUR |
| Objets de valeur | Sous-limite 5-10k EUR | 25k EUR+ | Aucune sous-limite |

### VOYAGE (TRAVEL)

| Garantie | Standard marche | Premium | Insuffisant |
|----------|----------------|---------|-------------|
| Frais medicaux | 150-300k EUR | > 500k EUR | < 50k EUR (carte bancaire) |
| Annulation | 2-5k EUR/voyage | > 10k EUR | < 1k EUR ou absente |
| Duree sejour | 90 jours | 180 jours | < 30 jours |

### PREVOYANCE (B-SAFE)

| Garantie | Standard marche | Premium | Insuffisant |
|----------|----------------|---------|-------------|
| Capital deces | 50-100k EUR | > 200k EUR (2-3x revenu) | < 25k EUR |
| Invalidite permanente | 100-200k EUR | > 300k EUR avec doublement | < 50k EUR |
| Incapacite | 30-50 EUR/jour | > 75 EUR/jour, carence 0j | < 20 EUR/jour ou carence > 30j |

---

## Annexe B : Fichiers d'implementation cles (QA Expert)

| Fichier | Action requise |
|---------|---------------|
| `src/shared/contracts/guarantees.ts` | Creer -- referentiel normalise avec type `NormalizedGuarantee` |
| `src/shared/contracts/adequacy-engine.ts` | Creer -- fonction pure `computeAdequacy()` |
| `src/shared/scoring/engine.ts` | Pas de modification -- adequation est une couche supplementaire |
| `src/shared/scoring/rules.ts` | Enrichir -- recommandations contextualisees par contrat reel |
| `src/lib/api/diagnostics.ts` | Etendre -- CRUD contrats + logAuditEvent nouvelles actions |
| `src/pages/client/ResultsPage.tsx` | CTA "Verifier ma couverture" (ligne ~142) |
| `supabase/migrations/019_contracts_adequacy.sql` | Creer -- tables + RLS + MAJ delete/export |
| `log_audit_event()` whitelist | Ajouter : `contract_created`, `contract_updated`, `contract_deleted`, `adequacy_computed` |

---

*Document genere a partir de l'analyse collegiale de 14 agents specialises : Product Manager, IT Architect, Security Architect, Decision Scientist, Compliance Officer, Legal Counsel, Risk Manager, Internal Audit, Actuaire Senior, Process Architect, Art Director, Sales Architect, Underwriting Expert, QA Expert.*
