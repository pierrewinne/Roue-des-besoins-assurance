# Note de recommandation PM -- Benchmark solutions d'extraction automatique de contrats

> Roue des Besoins Assurance -- Baloise Luxembourg
> Version 1.0 -- 28 mars 2026
> Statut : RECOMMANDATION FINALE POUR COMITE DE DECISION
> Auteur : Lead Product Manager

---

## Table des matieres

1. [Objet](#1-objet)
2. [Reformulation produit / business](#2-reformulation-produit--business)
3. [Enjeu marche](#3-enjeu-marche)
4. [Criteres de decision ponderes](#4-criteres-de-decision-ponderes)
5. [Evaluation detaillee des 8 solutions](#5-evaluation-detaillee-des-8-solutions)
6. [Scoring consolide](#6-scoring-consolide)
7. [Trois scenarios strategiques](#7-trois-scenarios-strategiques)
8. [Direction strategique -- recommandation PM](#8-direction-strategique----recommandation-pm)
9. [Roadmap produit](#9-roadmap-produit)
10. [KPIs de succes](#10-kpis-de-succes)
11. [Points de vigilance](#11-points-de-vigilance)
12. [Conclusion decisionnelle](#12-conclusion-decisionnelle)

---

## 1. Objet

Selectionner la solution technologique d'extraction de contrats d'assurance pour la fonctionnalite d'adequation de la Roue des Besoins. Cette recommandation couvre les phases MVP (T3 2026), Extension (T4 2026) et Pleine puissance (S1 2027), en integrant les contraintes produit, reglementaires, techniques et operationnelles specifiques a Baloise Luxembourg.

**Rappel de la decision prealable** : la synthese collegiale des 14 agents (28 mars 2026) a statue un GO CONDITIONNEL avec Phase 1 = saisie manuelle structuree, pas d'OCR/upload PDF. La question de l'extraction automatique concerne donc la **Phase 2** (T4 2026) et au-dela. Cette note anticipe ce choix pour eviter un re-cadrage couteux en milieu de parcours.

---

## 2. Reformulation produit / business

Le probleme n'est pas "quelle technologie d'OCR choisir". Le probleme est :

**Comment transformer un document d'assurance heterogene (PDF natif, scan, photo) en une structure de donnees fiable, exploitable par le moteur d'adequation, dans un cadre RGPD-conforme, avec un budget et une equipe contraints ?**

Les enjeux imbriques sont :
- **Fiabilite** : une extraction a 80% de precision sur les plafonds/franchises est inacceptable si le resultat influence les recommandations au client (risque R-01 de la note de cadrage)
- **Conformite** : les contrats contiennent des donnees personnelles sensibles, potentiellement des donnees de sante (art. 9 RGPD) -- le choix du fournisseur est un choix reglementaire autant que technique
- **Simplicite** : 1 developpeur, Supabase Edge Functions, pas de DevOps lourd
- **Proportionnalite** : marche luxembourgeois = volumes faibles (500-5 000 pages/mois max a horizon 2027), le sur-dimensionnement technique serait un gaspillage

---

## 3. Enjeu marche

### Contexte Luxembourg

| Parametre | Valeur | Impact sur le choix |
|-----------|--------|---------------------|
| Population cible | ~600k residents + ~200k frontaliers | Volumes modestes : 500-5 000 pages/mois au pic |
| Langue des contrats | Francais (80%), Allemand (15%), Bilingue (5%) | Le provider doit gerer FR + DE avec precision |
| Assureurs locaux | Foyer, La Luxembourgeoise, Baloise, AXA, Bâloise Vie, DKV | Formats heterogenes, pas de standard |
| Format predominant | PDF natif (conditions particulieres) | OCR optionnel en Phase 2, LLM vision en Phase 3 |
| Reglementation | RGPD + CNPD + CAA + IDD | Souverainete des donnees = critere bloquant |
| Concurrence digitale | Faible -- pas d'outil equivalent sur le marche LU | Time-to-market compte, mais fiabilite > vitesse |

### Volume projete

| Horizon | Pages/mois | Justification |
|---------|-----------|---------------|
| MVP (T3 2026) | 0 | Phase 1 = saisie manuelle, pas d'extraction |
| Phase 2 (T4 2026) | 200-500 | Early adopters, PDF natifs auto+habitation |
| Phase 2+ (S1 2027) | 500-2 000 | Extension prevoyance+voyage, debut scans |
| Phase 3 (S2 2027) | 2 000-5 000 | Vie/epargne, parcours conseiller, photos |
| Plein regime (2028) | 5 000-10 000 | Si succes commercial confirme |

**Point critique** : a 500 pages/mois, la difference de cout entre 0.003 EUR/page (Mistral) et 0.065 EUR/page (Google Doc AI) est de 31 EUR/mois. Le cout unitaire n'est PAS le critere discriminant a cette echelle. La fiabilite, la conformite et la maintenabilite le sont.

---

## 4. Criteres de decision ponderes

### Grille de ponderation

Les poids refletent les priorites produit pour Baloise Luxembourg -- compagnie d'assurance reglementee, petit marche, equipe contrainte.

| # | Critere | Poids | Justification |
|---|---------|-------|---------------|
| C1 | **Qualite d'extraction** | **25%** | Impact direct sur la valeur utilisateur et la credibilite. Un rapport d'adequation faux est pire que pas de rapport. Inclut : precision sur les garanties, plafonds, franchises, gestion FR+DE. |
| C2 | **Conformite RGPD / reglementaire** | **25%** | Critere bloquant. Transfert US = eliminatoire. Hebergement EU obligatoire. DPIA requise. Engagement contractuel du provider sur la non-reutilisation des donnees. |
| C3 | **Simplicite d'integration** | **15%** | 1 developpeur, Supabase Edge Functions, pas de Kubernetes. L'integration doit etre possible via API REST simple avec un SDK JS/TS. Time-to-market Phase 2 = 8 semaines. |
| C4 | **Experience utilisateur** | **12%** | Latence acceptable (< 15s pour un contrat de 5 pages), fiabilite percue (pas de timeout, pas d'erreurs aleatoires), gestion gracieuse des echecs. |
| C5 | **Maintenabilite** | **10%** | Evolution des modeles, gestion des versions, monitoring, debugging des erreurs d'extraction. 1 dev doit pouvoir operer et debugger seul. |
| C6 | **Cout a l'echelle** | **8%** | Poids faible car volumes modestes. Neanmoins, evaluer a 500, 5 000 et 50 000 pages/mois pour anticiper. Inclut : cout API + stockage + compute. |
| C7 | **Risque strategique** | **5%** | Vendor lock-in, perennite du service, capacite a changer de provider sans refonte. Important mais mitigue par l'architecture en couches. |

**Total : 100%**

### Echelle de notation

- **5** : Excellent -- repond parfaitement au besoin, aucune reserve
- **4** : Bon -- repond bien, reserves mineures
- **3** : Acceptable -- fonctionnel mais compromis significatifs
- **2** : Insuffisant -- fonctionne avec des workarounds importants
- **1** : Inadequat -- ne repond pas au besoin ou risque bloquant

---

## 5. Evaluation detaillee des 8 solutions

### 5.1 Mistral AI (LLM vision, Paris FR)

**Profil** : LLM francais, serveurs a Paris, tarification agressive, bonne comprehension du francais.

| Critere | Note | Justification |
|---------|------|---------------|
| C1 Qualite | 4 | Bonne comprehension des documents francais. Capacite d'extraction structuree via JSON mode. Gestion native FR, correcte DE. Limitation : moins mature que GPT-4o/Claude sur les documents complexes multi-pages. Pas de benchmark public sur les contrats d'assurance. |
| C2 Conformite | 5 | Serveurs Paris (FR), hebergement EU, societe francaise. Engagement DPA conforme RGPD. Pas de transfert hors UE. Ideal pour une DPIA. Contrat B2B disponible avec clauses de non-reutilisation. |
| C3 Integration | 4 | API REST standard, SDK Python/JS. Compatible avec Supabase Edge Functions (fetch API). JSON structured output. Pas de modele custom a deployer. |
| C4 UX | 3 | Latence 5-15s pour un document de 5 pages (acceptable). Mais fiabilite variable selon la charge serveur. Pas de SLA garanti sur le plan standard. |
| C5 Maintenabilite | 3 | Modeles evolues regulierement (Mistral Large, Pixtral). Pas de fine-tuning sur domaine assurance. Monitoring via logs API. Documentation en progression. |
| C6 Cout | 5 | ~0.003 EUR/page -- le moins cher du marche. A 5 000 pages/mois = 15 EUR/mois. Cout negligeable. |
| C7 Risque | 3 | Startup (fondee 2023), levees importantes mais pas encore profitable. Risque de pivot ou de rachat. API stable mais moins de recul que les hyperscalers. |

**Score pondere : 4.12 / 5**

---

### 5.2 Google Document AI (OCR structure, region EU)

**Profil** : OCR enterprise avec modeles pre-entraines pour les documents structures. Region EU disponible (eu-west).

| Critere | Note | Justification |
|---------|------|---------------|
| C1 Qualite | 3 | Excellent OCR brut. Mais l'extraction structuree d'un contrat d'assurance necessite un "custom processor" -- configuration longue, pas de modele pre-entraine pour l'assurance. Extraction des champs libres (garanties, exclusions) limitee sans LLM complementaire. |
| C2 Conformite | 4 | Region EU (eu-west) disponible. DPA Google Cloud conforme. Mais : donnees transitent par l'infrastructure Google -- sensibilite CNPD possible. Google reste une entreprise US soumise au CLOUD Act. SCC + mesures supplementaires necessaires. |
| C3 Integration | 3 | API REST + SDK Node.js. Mais : setup GCP necessaire (projet, IAM, service account, billing). Plus lourd que les API LLM "API key only". Custom processor = semaines de configuration. |
| C4 UX | 4 | Latence faible (2-5s par page). Tres fiable en OCR pur. SLA enterprise disponible. |
| C5 Maintenabilite | 2 | Le custom processor est une boite noire. Debugging difficile. Les modeles ne s'ameliorent pas automatiquement sur le domaine assurance. Necessite de re-entrainer si les formats de contrats changent. |
| C6 Cout | 2 | ~0.065 EUR/page -- le plus cher. A 5 000 pages/mois = 325 EUR/mois. A 50 000 = 3 250 EUR/mois. Cout significatif pour le benefice. |
| C7 Risque | 4 | Google Cloud = perennite forte. Mais dependance a l'ecosysteme GCP. Migration vers un autre provider = effort significatif. |

**Score pondere : 3.22 / 5**

---

### 5.3 AWS Textract (OCR, Frankfurt EU)

**Profil** : OCR Amazon avec extraction de formulaires et tables. Region eu-central-1 (Frankfurt).

| Critere | Note | Justification |
|---------|------|---------------|
| C1 Qualite | 3 | Bon OCR, bonne extraction de tables et formulaires structures. Mais : les contrats d'assurance luxembourgeois sont rarement des formulaires -- ce sont des documents texte libre avec des tableaux disperses. Textract extrait du texte, pas du sens. Necessite un LLM en aval pour structurer. |
| C2 Conformite | 4 | Frankfurt (EU). DPA AWS conforme. Memes reserves que Google : societe US, CLOUD Act. Schrems II mitigue par SCC + mesures supplementaires. |
| C3 Integration | 3 | SDK AWS (aws-sdk v3 JS). Necessite un compte AWS, IAM roles, configuration S3 pour le buffer. Plus lourd que fetch() vers une API REST. Pas natif dans Supabase Edge Functions sans wrapper. |
| C4 UX | 4 | Latence correcte (3-8s). Fiable. Mode asynchrone disponible pour les documents longs. |
| C5 Maintenabilite | 3 | Service stable, bien documente. Mais opaque (pas de fine-tuning). Monitoring via CloudWatch. |
| C6 Cout | 3 | ~0.015 EUR/page. A 5 000 pages/mois = 75 EUR/mois. Raisonnable. |
| C7 Risque | 4 | AWS = perennite maximale. Lock-in dans l'ecosysteme AWS. |

**Score pondere : 3.35 / 5**

---

### 5.4 Azure AI Document Intelligence (OCR + modeles insurance, EU)

**Profil** : Service Azure avec des modeles pre-entraines incluant un modele "insurance" (en preview). Region EU disponible.

| Critere | Note | Justification |
|---------|------|---------------|
| C1 Qualite | 4 | Le modele pre-entraine "insurance" est un avantage reel : extraction native des champs d'assurance (police, assureur, garanties, primes). Qualite OCR excellente. Gestion multi-langue correcte. Limitation : modele "insurance" en preview, pas valide sur les formats luxembourgeois specifiques. |
| C2 Conformite | 4 | Region EU (West Europe). DPA Microsoft conforme. Memes reserves CLOUD Act. Microsoft a un historique plus favorable avec les regulateurs europeens. |
| C3 Integration | 3 | SDK JS disponible. Necessite un compte Azure, resource group, deployment. API REST utilisable mais setup initial consequent. Pas natif Supabase. |
| C4 UX | 4 | Latence 2-5s. Tres fiable. SLA enterprise. |
| C5 Maintenabilite | 3 | Custom models possibles. Studio UI pour l'entrainement. Mais courbe d'apprentissage Azure. |
| C6 Cout | 4 | ~0.01 EUR/page. A 5 000 pages/mois = 50 EUR/mois. Bon rapport qualite/prix. |
| C7 Risque | 4 | Microsoft = perennite. Lock-in Azure modere (API standard). Preview du modele insurance = risque de deprecation. |

**Score pondere : 3.72 / 5**

---

### 5.5 GPT-4 Vision (OpenAI, LLM multimodal)

**Profil** : LLM leader en capacite de comprehension de documents. API via OpenAI.

| Critere | Note | Justification |
|---------|------|---------------|
| C1 Qualite | 5 | Meilleure capacite de comprehension documentaire du marche (mars 2026). Extraction structuree via JSON mode fiable. Excellente gestion FR+DE. Comprehension du contexte assurance sans fine-tuning. Capacite a extraire des plafonds, franchises, exclusions en langage naturel. |
| C2 Conformite | **1** | **ELIMINATOIRE.** Donnees transitent par les serveurs US (pas de region EU pour l'API OpenAI standard). Transfert hors UE de donnees personnelles sensibles. Incompatible avec les exigences RGPD/CNPD pour des contrats d'assurance. L'option Azure OpenAI (region EU) est distincte et evaluee via le scenario Azure. |
| C3 Integration | 5 | API la plus simple du marche. SDK JS/TS natif. JSON structured output. Compatible fetch() dans Supabase Edge Functions. |
| C4 UX | 4 | Latence 5-15s. Fiable. |
| C5 Maintenabilite | 4 | Documentation excellente. Modeles regulierement ameliores. Large communaute. |
| C6 Cout | 4 | ~0.01 EUR/page. Raisonnable. |
| C7 Risque | 3 | Dependance a OpenAI. Politique de prix volatile. |

**Score pondere : 3.37 / 5 -- MAIS ELIMINE pour non-conformite RGPD (C2 = 1, critere bloquant)**

---

### 5.6 Claude Vision / Bedrock (Anthropic, EU via AWS Bedrock)

**Profil** : LLM Anthropic accessible via AWS Bedrock en region EU (Frankfurt).

| Critere | Note | Justification |
|---------|------|---------------|
| C1 Qualite | 5 | Capacite de comprehension documentaire de premier plan (comparable a GPT-4o). Excellent en extraction structuree JSON. Tres bon en FR, correct en DE. Comprehension fine du contexte assurance. Gestion des documents multi-pages. |
| C2 Conformite | 4 | Via AWS Bedrock, region eu-central-1 (Frankfurt). DPA AWS applicable. Donnees restent en EU. Anthropic s'engage a ne pas utiliser les donnees API pour l'entrainement. Reserve : Anthropic est une societe US, CLOUD Act s'applique via AWS. Neanmoins, Bedrock EU est le meilleur compromis LLM + souverainete. |
| C3 Integration | 4 | API Bedrock via SDK AWS. Un peu plus complexe qu'un simple fetch() (IAM, signing), mais bien documente. Wrapper leger necessaire pour Supabase Edge Functions. |
| C4 UX | 4 | Latence 5-15s via Bedrock. Fiable. Throughput garanti via provisioned mode. |
| C5 Maintenabilite | 4 | Modeles regulierement mis a jour. Bonne documentation. Monitoring via CloudWatch. |
| C6 Cout | 4 | ~0.01 EUR/page (Bedrock pricing). A 5 000 pages/mois = 50 EUR/mois. |
| C7 Risque | 3 | Dependance AWS + Anthropic (double dependance). Mais architecture substituable (prompt-based, pas de model custom). |

**Score pondere : 4.22 / 5**

---

### 5.7 Tesseract.js (OCR local, gratuit)

**Profil** : Moteur OCR open-source, execution cote client ou serveur, sans appel API externe.

| Critere | Note | Justification |
|---------|------|---------------|
| C1 Qualite | 2 | OCR acceptable sur des documents propres (scan 300 DPI). Tres insuffisant sur les PDF natifs (pas necessaire), les photos smartphone, les documents a mise en page complexe. Surtout : OCR pur sans comprehension semantique -- produit du texte brut, pas des garanties structurees. Necessite un LLM en aval pour toute extraction de sens. |
| C2 Conformite | 5 | Local = aucun transfert de donnees. Ideal RGPD. Aucun fournisseur externe. DPIA simplifiee. |
| C3 Integration | 4 | npm install tesseract.js. Pas de compte cloud, pas d'API key. Execution dans Node.js ou meme en browser (WASM). |
| C4 UX | 2 | Latence elevee (15-60s par page en browser, 5-20s en serveur). Qualite variable selon le document source. Pas de feedback intermediaire. |
| C5 Maintenabilite | 3 | Open-source, communaute active. Mais pas d'evolution significative de la qualite OCR. Le maintien de la qualite repose sur le developpeur. |
| C6 Cout | 5 | Gratuit. Zero cout recurrent. |
| C7 Risque | 4 | Open-source = pas de vendor lock-in. Mais risque de stagnation du projet. |

**Score pondere : 3.22 / 5**

---

### 5.8 Hybride Tesseract.js + LLM cloud

**Profil** : OCR local via Tesseract pour l'extraction de texte brut, puis envoi du TEXTE (pas du document) a un LLM cloud pour la structuration semantique.

| Critere | Note | Justification |
|---------|------|---------------|
| C1 Qualite | 3 | Le maillon faible est Tesseract : si l'OCR est mauvais, le LLM ne peut pas rattraper. Sur des PDF natifs, Tesseract est inutile (le texte est directement extractible). Sur des scans propres, acceptable. Sur des photos smartphone, insuffisant. Le LLM structure bien mais sur une base potentiellement corrompue. |
| C2 Conformite | 4 | Le document original reste local. Seul le texte extrait (moins sensible que le PDF) est envoye au LLM. Reduit le risque RGPD mais ne l'elimine pas : le texte contient toujours des donnees personnelles. Necessite quand meme un LLM EU-compliant en aval. |
| C3 Integration | 3 | Double integration : Tesseract + API LLM. Pipeline plus complexe a developper et maintenir. Gestion des erreurs sur 2 etapes. Plus de code, plus de tests. |
| C4 UX | 2 | Latence cumulee : OCR (5-20s) + LLM (5-15s) = 10-35s. Deux points de defaillance. Experience degradee par rapport a un LLM vision direct. |
| C5 Maintenabilite | 2 | Deux systemes a maintenir. Debugging = "est-ce l'OCR ou le LLM qui a fait l'erreur ?". Double surface de regression. |
| C6 Cout | 4 | OCR gratuit + LLM au cout standard. Economie sur les tokens (texte vs image). ~0.002-0.005 EUR/page. |
| C7 Risque | 3 | Complexite architecturale = risque operationnel. Mais pas de lock-in fort. |

**Score pondere : 3.12 / 5**

---

## 6. Scoring consolide

### Matrice de scoring finale

| Solution | C1 (25%) | C2 (25%) | C3 (15%) | C4 (12%) | C5 (10%) | C6 (8%) | C7 (5%) | **Score** | Rang |
|----------|----------|----------|----------|----------|----------|---------|---------|-----------|------|
| **Claude / Bedrock** | 5 | 4 | 4 | 4 | 4 | 4 | 3 | **4.22** | **1** |
| **Mistral AI** | 4 | 5 | 4 | 3 | 3 | 5 | 3 | **4.12** | **2** |
| **Azure Doc Intel** | 4 | 4 | 3 | 4 | 3 | 4 | 4 | **3.72** | **3** |
| **AWS Textract** | 3 | 4 | 3 | 4 | 3 | 3 | 4 | **3.35** | **4** |
| GPT-4 Vision | 5 | **1** | 5 | 4 | 4 | 4 | 3 | 3.37 | **ELIMINE** |
| Google Doc AI | 3 | 4 | 3 | 4 | 2 | 2 | 4 | **3.22** | 5 |
| Tesseract.js | 2 | 5 | 4 | 2 | 3 | 5 | 4 | **3.22** | 6 |
| Hybride Tess+LLM | 3 | 4 | 3 | 2 | 2 | 4 | 3 | **3.12** | 7 |

### Observations cles

1. **GPT-4 Vision est elimine** malgre sa qualite d'extraction superieure. Le transfert US de donnees de contrats d'assurance est incompatible avec les exigences RGPD/CNPD pour Baloise Luxembourg. Pas de negociation possible sur ce point.

2. **Claude/Bedrock arrive en tete** grace a la combinaison qualite LLM + hebergement EU (Bedrock Frankfurt). C'est le seul LLM de premier plan avec une option EU reelle.

3. **Mistral est le challenger serieux** -- souverainete EU native, cout imbattable, bonne qualite FR. L'ecart avec Claude/Bedrock porte sur la maturite de l'extraction documentaire complexe.

4. **Les OCR purs (Google, AWS, Azure) ne suffisent pas seuls** pour l'extraction semantique de contrats d'assurance. Ils produisent du texte ou des tables, pas des garanties structurees avec plafonds et franchises. Ils necessitent un LLM en aval, ce qui annule leur avantage.

5. **Tesseract.js seul est insuffisant** pour le cas d'usage. Son utilite est limitee a l'OCR de scans en pre-traitement.

---

## 7. Trois scenarios strategiques

### Scenario A : Full LLM (Mistral ou Claude/Bedrock)

**Principe** : le document (PDF natif ou image) est envoye directement au LLM via son API vision. Le LLM extrait les informations structurees en un seul appel.

#### Architecture

```
[Upload PDF] --> [Supabase Edge Function]
                        |
                        v
              [PDF -> texte (pdf-parse)]  // pour PDF natifs
                   ou
              [PDF -> image (sharp)]      // pour scans
                        |
                        v
              [API LLM (Mistral/Claude)]
              Prompt: "Extrais les garanties,
               plafonds, franchises..."
                        |
                        v
              [JSON structure] --> [contract_analyses]
```

#### Avantages

- **Simplicite maximale** : un seul service, un seul appel API, un seul point de maintenance
- **Comprehension semantique native** : le LLM comprend le contexte, deduit les garanties implicites, gere les ambiguites
- **Gestion FR+DE** native, sans configuration linguistique
- **Evolutivite** : chaque nouvelle version du modele ameliore automatiquement l'extraction
- **Prompt engineering** : le controle de l'extraction est dans le code, pas dans un modele opaque
- **JSON structured output** : extraction directement exploitable par le moteur d'adequation

#### Inconvenients

- **Dependance a un fournisseur LLM** : si le service est indisponible, l'extraction est bloquee
- **Latence** : 5-15s par document (acceptable mais perceptible)
- **Cout** : chaque re-extraction coute (pas de cache implicite)
- **Hallucination** : le LLM peut inventer des informations -- la validation utilisateur est indispensable
- **Taille des documents** : les contrats de 40+ pages (CG) necessitent du chunking ou des modeles a contexte long

#### Risques

| Risque | Probabilite | Mitigation |
|--------|-------------|------------|
| Hallucination sur plafonds/franchises | Moyenne | Validation utilisateur obligatoire, score de confiance par champ |
| Indisponibilite API | Faible | Fallback vers saisie manuelle, retry avec backoff |
| Degradation qualite apres mise a jour modele | Faible | Suite de tests de regression sur corpus fixe |
| Augmentation des prix API | Moyenne | Architecture abstraction layer, switch possible Mistral <-> Claude |

#### Cout estime

| Volume | Mistral (~0.003 EUR/p) | Claude/Bedrock (~0.01 EUR/p) |
|--------|----------------------|---------------------------|
| 500 p/mois | 1.50 EUR | 5 EUR |
| 5 000 p/mois | 15 EUR | 50 EUR |
| 50 000 p/mois | 150 EUR | 500 EUR |

#### Timeline

- Integration API : 3-5 jours
- Prompt engineering + calibration : 10-15 jours
- Tests sur corpus Baloise : 5-8 jours
- **Total : 4-5 semaines** (dans les 8 semaines Phase 2)

---

### Scenario B : OCR structure classique (Azure Document Intelligence)

**Principe** : utiliser un service OCR enterprise avec un modele pre-entraine "insurance" pour extraire les champs structures, complete par une couche de mapping custom.

#### Architecture

```
[Upload PDF] --> [Supabase Edge Function]
                        |
                        v
              [Azure Document Intelligence]
              modele: "prebuilt-insurance" (preview)
                        |
                        v
              [Champs OCR structures]
                        |
                        v
              [Mapping TS custom]
              normalize(OCR fields) -> guarantees[]
                        |
                        v
              [contract_analyses]
```

#### Avantages

- **OCR de qualite enterprise** : tres fiable sur les caracteres, tables, formulaires
- **Modele insurance pre-entraine** : extraction native des champs standard (police, assureur, dates, primes)
- **Latence faible** : 2-5s par page
- **SLA garanti** : Azure enterprise
- **Studio visuel** : interface de labeling pour creer des modeles custom

#### Inconvenients

- **Pas de comprehension semantique** : l'OCR extrait des champs, pas du sens. "Capital deces 50 000 EUR" est un champ ; comprendre que c'est insuffisant pour un revenu > 5 000 EUR/mois necessite un LLM
- **Modele insurance en preview** : pas de garantie de perennite, probablement pas calibre sur les formats luxembourgeois
- **Mapping custom lourd** : chaque format d'assureur necessite un mapping TS specifique. Foyer, La Lux, AXA, Baloise = 4 mappings differents
- **Setup Azure** : compte, resource group, deployment, IAM -- lourd pour 1 dev
- **Pas de gestion des ambiguites** : si le document est ambigu, l'OCR produit un resultat incorrect sans le signaler

#### Risques

| Risque | Probabilite | Mitigation |
|--------|-------------|------------|
| Modele insurance deprecie (preview) | Moyenne | Developper en parallele un modele custom |
| Mapping non generalisable | Elevee | Maintenance continue par format d'assureur |
| Setup Azure trop lourd pour 1 dev | Elevee | Evaluer le cout d'opportunite vs API LLM |
| Qualite insuffisante sur texte libre | Elevee | Completer par un LLM -> devient scenario hybride |

#### Cout estime

| Volume | Azure Doc Intel (~0.01 EUR/p) | + stockage + compute |
|--------|------------------------------|---------------------|
| 500 p/mois | 5 EUR | ~10 EUR total |
| 5 000 p/mois | 50 EUR | ~70 EUR total |
| 50 000 p/mois | 500 EUR | ~650 EUR total |

#### Timeline

- Setup Azure + integration : 5-8 jours
- Configuration modele insurance + mapping : 15-20 jours
- Tests sur corpus + ajustements : 10-15 jours
- **Total : 6-8 semaines** (consomme la totalite de la Phase 2)

---

### Scenario C : Hybride (OCR local + LLM cloud pour structuration)

**Principe** : Tesseract.js en local pour l'OCR des scans/photos, pdf-parse pour les PDF natifs, puis envoi du texte extrait (pas du document) a un LLM EU-compliant pour la structuration semantique.

#### Architecture

```
[Upload PDF/Image] --> [Supabase Edge Function]
                              |
                    +---------+---------+
                    |                   |
               [PDF natif]         [Scan/Photo]
                    |                   |
              [pdf-parse]        [Tesseract.js]
              texte brut          texte OCR
                    |                   |
                    +---------+---------+
                              |
                              v
                    [API LLM (Mistral/Claude)]
                    Prompt: "Voici le texte d'un
                     contrat. Extrais..."
                              |
                              v
                    [JSON structure]
                              |
                              v
                    [contract_analyses]
```

#### Avantages

- **Document original reste local** : seul le texte extrait est envoye au LLM -- reduit le risque RGPD (mais ne l'elimine pas)
- **Cout LLM reduit** : tokens texte < tokens image (30-50% d'economie)
- **Gestion des scans** : Tesseract permet de traiter les documents non-natifs sans service cloud OCR

#### Inconvenients

- **Double pipeline** : deux systemes a developper, tester, maintenir
- **Maillon faible = Tesseract** : si l'OCR produit du texte corrompu, le LLM ne peut pas rattraper. Qualite insuffisante sur les photos smartphone
- **Latence cumulee** : OCR (5-20s) + LLM (5-15s) = 10-35s par document
- **Debugging complexe** : "l'erreur vient de l'OCR ou du LLM ?" -- diagnostic difficile pour 1 dev
- **Fausse economie RGPD** : le texte contient quand meme les donnees personnelles (nom, adresse, numeros). Le gain de conformite est marginal vs l'envoi du document entier
- **Tesseract.js en WASM** : compatibilite variable avec les runtimes Supabase Edge Functions (Deno)

#### Risques

| Risque | Probabilite | Mitigation |
|--------|-------------|------------|
| Qualite OCR Tesseract insuffisante | Elevee | Limiter Phase 2 aux PDF natifs (pas de scans) |
| Complexite de debug ingerable | Moyenne | Logging detaille a chaque etape |
| Latence inacceptable | Moyenne | Processing asynchrone avec notification |
| Incompatibilite Deno/WASM | Moyenne | Externaliser l'OCR dans une Cloud Function separee |

#### Cout estime

| Volume | Tesseract (0 EUR) + LLM texte (~0.005 EUR/p) |
|--------|----------------------------------------------|
| 500 p/mois | 2.50 EUR |
| 5 000 p/mois | 25 EUR |
| 50 000 p/mois | 250 EUR |

#### Timeline

- Integration pdf-parse + Tesseract.js : 5-8 jours
- Pipeline texte -> LLM + prompt engineering : 10-15 jours
- Tests sur corpus + debugging double pipeline : 10-15 jours
- **Total : 5-7 semaines**

---

### Comparaison synthetique des scenarios

| Dimension | Scenario A (Full LLM) | Scenario B (OCR Azure) | Scenario C (Hybride) |
|-----------|----------------------|----------------------|---------------------|
| Qualite extraction | Excellente | Bonne (OCR) / Faible (semantique) | Variable (depend OCR) |
| Conformite RGPD | Bonne (EU) | Bonne (EU) | Bonne (texte seul) |
| Simplicite | **Un seul service** | Setup lourd | Double pipeline |
| Time-to-market | **4-5 semaines** | 6-8 semaines | 5-7 semaines |
| Cout mensuel (5k p) | 15-50 EUR | 70 EUR | 25 EUR |
| Risque principal | Hallucination LLM | Mapping par assureur | Qualite OCR |
| Maintenabilite | Prompt = code | Config + mapping | 2 systemes |
| 1 dev peut operer | **Oui** | Difficilement | Avec effort |

---

## 8. Direction strategique -- recommandation PM

### RECOMMANDATION : Scenario A -- Full LLM, architecture bi-provider Mistral + Claude/Bedrock

#### Le raisonnement

**1. L'extraction de contrats d'assurance est un probleme de COMPREHENSION, pas d'OCR.**

Les contrats d'assurance ne sont pas des formulaires structures avec des champs predefinis. Ce sont des documents juridiques en langage naturel, avec des garanties formulees differemment selon les assureurs, des exclusions implicites, des plafonds exprimes de multiples facons (montant fixe, pourcentage, reference a un bareme). Un OCR -- aussi bon soit-il -- produit du texte. Il faut un LLM pour produire du SENS.

Le Underwriting Expert l'a clairement documente : la "matrice d'extractibilite" montre que les elements fiables (>80%) sont les metadonnees (assureur, dates, prime), tandis que les garanties detaillees, plafonds et franchises -- qui sont l'objet meme de l'adequation -- sont a 55-75% de fiabilite. Seul un LLM peut atteindre le niveau de comprehension necessaire.

**2. La conformite RGPD elimine GPT-4 Vision et impose un provider EU.**

Deux LLM de premier plan ont une option EU credible :
- **Mistral AI** : natif EU (Paris), societe francaise, cout imbattable
- **Claude/Bedrock** : EU via AWS Bedrock (Frankfurt), qualite de pointe

Je recommande une **architecture bi-provider** : Mistral en provider principal, Claude/Bedrock en fallback. Raisons :
- Mistral est le choix de souverainete (societe francaise, serveurs Paris)
- Claude/Bedrock est le choix de qualite (meilleure comprehension documentaire)
- L'architecture bi-provider elimine le risque de vendor lock-in et de single point of failure
- Les deux ont des API compatibles (prompt-based, JSON structured output)
- Le switch se fait par changement de configuration, pas de code

**3. La simplicite n'est pas un luxe, c'est une exigence operationnelle.**

Avec 1 developpeur, chaque couche d'architecture supplementaire est un risque. Le scenario A (Full LLM) est le seul ou l'extraction complete tient dans une seule Edge Function de 100-150 lignes. Le scenario B necessite un setup Azure + des mappings par assureur. Le scenario C necessite un double pipeline. La complexite n'est pas justifiee par les volumes (500-5 000 pages/mois) ni par le benefice marginal.

**4. Le cout n'est pas un facteur discriminant a cette echelle.**

A 5 000 pages/mois, la difference entre Mistral (15 EUR) et Azure (70 EUR) est de 55 EUR/mois. C'est negligeable face au cout de developpement et de maintenance. Ce qui coute, ce n'est pas l'API -- c'est le temps developpeur a debugger un pipeline OCR+mapping+LLM vs un simple appel LLM.

**5. La Phase 1 (saisie manuelle) donne du temps pour calibrer le LLM.**

Le consensus collegial impose une Phase 1 sans extraction automatique. C'est une opportunite : pendant que les utilisateurs saisissent manuellement, les donnees saisies constituent un corpus d'entrainement/validation parfait pour calibrer les prompts LLM de la Phase 2. La Phase 1 n'est pas une perte de temps -- c'est la construction du referentiel de verite.

#### Architecture cible recommandee

```
                    [Phase 1 : T3 2026]
                    Saisie manuelle structuree
                    (wizard React, pas d'extraction)
                            |
                            | corpus de validation
                            v
                    [Phase 2 : T4 2026]
                    +---[PDF natif]---+
                    |                 |
                    v                 |
              [pdf-parse]             |
              texte brut              |
                    |                 |
                    v                 |
              [Abstraction Layer]     |
              ExtractionProvider {    |
                extract(text): JSON   |
              }                       |
              /          \            |
      [Mistral API]  [Claude/Bedrock] |
      (principal)    (fallback)       |
              \          /            |
               v        v            |
              [JSON structure]        |
                    |                 |
                    v                 |
              [Validation UI]         |
              (correction manuelle)   |
                    |                 |
                    v                 v
              [contract_analyses] ----+
                    |
                    v
              [Moteur d'adequation]
              (adequacy-engine.ts)

                    [Phase 3 : S1 2027]
                    + LLM Vision pour scans/photos
                    + Fine-tuning optionnel
                    + Modele insurance custom
```

#### Provider principal et fallback

| Dimension | Mistral (principal) | Claude/Bedrock (fallback) |
|-----------|-------------------|--------------------------|
| Quand utiliser | Par defaut, pour toutes les extractions | Si Mistral indisponible, ou si confiance < seuil |
| Conformite | France / EU natif | EU via Bedrock Frankfurt |
| Qualite attendue | 80-85% precision garanties | 85-90% precision garanties |
| Cout | ~0.003 EUR/page | ~0.01 EUR/page |
| Latence | 5-10s | 5-15s |
| Strategie de bascule | Si erreur 5xx ou timeout > 30s : switch auto | Retour a Mistral apres 5 min |

#### Abstraction layer -- specification

```typescript
// src/shared/contracts/extraction-provider.ts

interface ExtractionResult {
  assureur: string | null;
  numero_police: string | null;
  date_effet: string | null;       // ISO 8601
  date_echeance: string | null;
  prime_annuelle: number | null;
  formule: string | null;
  garanties: ExtractedGuarantee[];
  confiance_globale: number;       // 0-100
  raw_response: unknown;           // pour debug
}

interface ExtractedGuarantee {
  id: string;                      // ref vers referentiel
  label: string;
  statut: 'couverte' | 'partielle' | 'absente' | 'non_evaluable';
  plafond: number | null;          // EUR
  franchise: number | null;        // EUR
  confiance: number;               // 0-100
  source_text: string;             // extrait du document original
}

interface ExtractionProvider {
  name: string;
  extract(text: string, contractType: ContractType): Promise<ExtractionResult>;
}
```

Ce contrat d'interface permet de changer de provider sans modifier le moteur d'adequation ni l'UI.

---

## 9. Roadmap produit

### Phase 1 -- MVP saisie manuelle (T3 2026, 10 semaines)

**Objectif** : Valider la valeur produit de l'adequation, construire le corpus de verite.

| Livrable | Description | Solution extraction |
|----------|-------------|---------------------|
| CTA factice | Mesurer l'appetence ("Verifier ma couverture") | Aucune |
| Wizard de saisie | Formulaire structure par type de contrat | Saisie manuelle |
| Moteur d'adequation | adequacy-engine.ts, fonction pure | TypeScript, pas de LLM |
| Page resultats | Vue categorique (couvert/non/partiel) | N/A |
| Corpus de verite | Donnees saisies = reference pour Phase 2 | Export JSON |

**Solution extraction : AUCUNE** -- c'est de la saisie structure. L'extraction automatique commence en Phase 2.

**Prerequis bloquants** :
- Qualification IDD validee par le juridique
- DPIA validee par le DPO
- Referentiel des garanties valide par le metier

---

### Phase 2 -- Extraction PDF natifs (T4 2026, 8 semaines)

**Objectif** : Automatiser l'extraction pour les PDF natifs (auto + habitation), valider la qualite LLM.

| Livrable | Description | Solution extraction |
|----------|-------------|---------------------|
| Upload PDF | Supabase Storage, bucket prive, chiffre | pdf-parse (texte) |
| Extraction LLM | Structuration automatique des garanties | **Mistral AI** (principal) |
| Fallback LLM | Bascule si Mistral indisponible | **Claude/Bedrock** (fallback) |
| Validation UI | Ecran de correction des extractions | React, pre-rempli par LLM |
| Calibration | Prompts calibres sur corpus Phase 1 | Prompt engineering |
| Extension types | + Prevoyance (B-SAFE) + Voyage (TRAVEL) | Memes providers |
| Allemand | Support contrats DE | Natif Mistral + Claude |

**Budget recurrent** : 15-50 EUR/mois (500-2 000 pages)

**Critere de succes Phase 2** : precision extraction >= 75% sur les garanties principales (mesuree vs corpus Phase 1)

---

### Phase 3 -- Scaling et enrichissement (S1 2027, 10 semaines)

**Objectif** : Gerer les scans/photos, etendre aux contrats vie/epargne, parcours conseiller.

| Livrable | Description | Solution extraction |
|----------|-------------|---------------------|
| LLM Vision | Extraction directe depuis images | **Claude/Bedrock Vision** (passe en principal) |
| Scans / photos | Support des documents non-natifs | Vision API (pas d'OCR separe) |
| Vie / Epargne | Art. 111, 111bis, SRD | Extension referentiel |
| Parcours conseiller | Vue enrichie AdvisorDashboard | N/A |
| PDF rapport | Export adequation complet | @react-pdf/renderer |
| Fine-tuning optionnel | Modele specialise assurance LU | Evaluation du ROI d'abord |

**Pourquoi Claude/Bedrock devient principal en Phase 3** :
- La Vision API (traitement d'images) est plus mature chez Anthropic que chez Mistral (Pixtral)
- Les documents scans/photos necessitent la meilleure qualite de comprehension visuelle
- Mistral reste en fallback pour les PDF natifs (texte)

**Budget recurrent** : 50-150 EUR/mois (2 000-5 000 pages)

---

### Synthese timeline

```
        T3 2026              T4 2026              S1 2027
  |------ Phase 1 ------|------ Phase 2 ------|------ Phase 3 ------|

  [Saisie manuelle]      [PDF natifs]           [Scans + Photos]
  [0 EUR/mois]           [Mistral principal]    [Claude/Bedrock Vision]
  [Corpus de verite]     [Claude fallback]      [Mistral fallback texte]
  [Validation marche]    [15-50 EUR/mois]       [50-150 EUR/mois]
```

---

## 10. KPIs de succes

### KPIs Phase 1 (saisie manuelle)

| KPI | Seuil GO Phase 2 | Seuil ALERTE | Mesure |
|-----|-------------------|-------------|--------|
| Taux de clic CTA "Verifier ma couverture" | >= 15% | < 10% | Analytics evenement |
| Taux de completion du wizard de saisie | >= 40% | < 25% | Funnel tracking |
| Nombre de contrats saisis par utilisateur | >= 1.5 | < 1.0 | Moyenne |
| Taux d'utilisation adequation (si dispo) | >= 20% des diagnostics | < 10% | Ratio diagnostics/adequations |
| NPS de la fonctionnalite | >= 30 | < 10 | Micro-enquete post-adequation |
| Volume du corpus de verite | >= 200 saisies | < 50 | Count contract_analyses |

### KPIs Phase 2 (extraction LLM)

| KPI | Seuil SUCCES | Seuil ALERTE | Mesure |
|-----|-------------|-------------|--------|
| **Precision extraction garanties principales** | >= 80% | < 70% | Comparaison extraction vs validation manuelle |
| **Precision plafonds/franchises** | >= 70% | < 55% | Idem, sur les champs numeriques |
| Taux de validation sans correction | >= 50% | < 30% | Ratio validations directes / totales |
| Taux de correction manuelle | < 30% | > 50% | Ratio champs corriges / champs extraits |
| Latence extraction | < 15s (P90) | > 25s | Monitoring API |
| Taux d'erreur API | < 2% | > 5% | Monitoring erreurs |
| Cout par extraction reussie | < 0.05 EUR | > 0.10 EUR | API cost / extractions valides |
| Taux de fallback Mistral -> Claude | < 5% | > 15% | Monitoring provider |
| Taux d'upload -> adequation complete | >= 60% | < 40% | Funnel |
| Score de confiance moyen | >= 70 | < 55 | Moyenne confiance_globale |

### KPIs Phase 3 (scans + vision)

| KPI | Seuil SUCCES | Seuil ALERTE | Mesure |
|-----|-------------|-------------|--------|
| Precision OCR scans (via Vision) | >= 75% | < 60% | Comparaison vs corpus |
| Precision photos smartphone | >= 65% | < 50% | Idem |
| Taux d'adoption parcours conseiller | >= 30% des conseillers actifs | < 15% | Usage tracking |
| Volume mensuel extractions | >= 2 000 | < 500 | Count |
| Cout total mensuel extraction | < 200 EUR | > 500 EUR | Facturation API |

### KPIs strategiques (transverses)

| KPI | Objectif | Mesure |
|-----|----------|--------|
| Taux de conversion adequation -> contact conseiller | >= 25% | CTA "Contacter un conseiller" apres adequation |
| Taux de gap identifie -> souscription | >= 10% | Suivi CRM (si disponible) |
| Reduction du temps conseiller par RDV | >= 15 min | Enquete conseillers |
| Nombre d'assureurs concurrents documentes | >= 4 | Count distinct assureur dans contract_analyses |
| Taux de retention (diagnostic -> adequation -> retour) | >= 15% | Cohorte tracking |

### Processus de revue

- **Revue hebdomadaire** (automatisee) : latence, erreurs, cout, volume
- **Revue mensuelle** (PM) : precision, adoption, funnel, NPS
- **Revue trimestrielle** (comite produit) : ROI, decision Phase suivante, pivot ou perseverance

---

## 11. Points de vigilance

### V1 -- Risques critiques a monitorer

| # | Vigilance | Pourquoi | Action |
|---|-----------|----------|--------|
| V1 | **Hallucination LLM sur les montants** | Un plafond hallucine a 100 000 EUR au lieu de 10 000 EUR peut donner un faux sentiment de securite | Validation utilisateur OBLIGATOIRE en Phase 2. Pas de full-auto avant Phase 3 minimum. |
| V2 | **Qualite Mistral vs Claude sur l'assurance** | Pas de benchmark public sur l'extraction de contrats d'assurance luxembourgeois. L'ecart de qualite est une hypothese a valider. | Evaluer les deux providers sur le corpus Phase 1 AVANT de lancer Phase 2. Si Mistral < 70% precision, passer Claude en principal. |
| V3 | **CLOUD Act et Bedrock** | AWS Bedrock en EU ne protege pas integralement contre un subpoena US. Le risque est faible mais reel pour une compagnie d'assurance. | Documenter dans la DPIA. Mistral (societe francaise) offre une meilleure protection. Surveiller l'evolution reglementaire. |
| V4 | **Contrats frontaliers FR/BE/DE** | 45% de l'emploi au Luxembourg est frontalier. Les contrats etrangers ont des formats, des termes et des garanties differents. | Phase 2 = contrats luxembourgeois uniquement. Frontaliers = Phase 3 avec adaptations specifiques. |
| V5 | **Supabase Edge Functions et timeout** | Les Edge Functions ont un timeout de 60s (plan gratuit). Un document de 40 pages peut depasser ce seuil. | Limiter a 10 pages en Phase 2 (conditions particulieres, pas CG). Ou utiliser le mode asynchrone. |
| V6 | **Non-regression scoring** | L'adequation ne doit pas casser le scoring existant (exposure/coverage). Le moteur d'adequation est une couche supplementaire. | Tests de non-regression automatises. Le scoring existant ne doit JAMAIS etre modifie par l'adequation en Phase 2. |
| V7 | **Perception "vendeur"** | Si l'outil identifie des gaps et propose systematiquement des produits Baloise, les clients percevront un outil commercial, pas un outil d'aide. | Wording neutre. Gaps exprimes en termes de besoin, pas de produit. Le lien vers Baloise = optionnel et discret. |
| V8 | **Evolution des API Mistral** | Mistral est une startup (fondee 2023). Les API, les modeles et la tarification peuvent evoluer rapidement. | Abstraction layer obligatoire. Contract de service (SLA) a negocier si volume > 5 000 p/mois. |

### V2 -- Ce que cette recommandation ne couvre PAS

- Le choix du modele Mistral specifique (Large, Medium, Pixtral) -- a evaluer lors du prompt engineering
- Le prompt engineering detaille -- livrable separe
- L'architecture Supabase Storage (bucket, policies, retention) -- traite dans le scope securite
- La DPIA -- prerequis traite par Compliance + Security
- Le referentiel des garanties -- traite par le metier + Underwriting Expert

---

## 12. Conclusion decisionnelle

### Recommandation finale

**Scenario A -- Full LLM avec architecture bi-provider Mistral (principal) + Claude/Bedrock (fallback).**

Cette recommandation repose sur 5 convictions produit :

1. **L'extraction de contrats d'assurance est un probleme de comprehension, pas d'OCR.** Les solutions OCR seules (Google, AWS, Azure) ne produisent pas la structuration semantique necessaire pour le moteur d'adequation. Elles necessitent un LLM en aval, ce qui revient au scenario A avec une couche de complexite supplementaire.

2. **La souverainete EU est un critere bloquant, pas un critere de confort.** GPT-4 Vision est elimine malgre sa qualite. Mistral (Paris) et Claude/Bedrock (Frankfurt) sont les seuls LLM de premier plan avec une option EU credible.

3. **La simplicite architecturale est un avantage competitif pour une equipe contrainte.** Un seul service, un seul appel API, une seule Edge Function. Le scenario A est le seul operationnel a 1 developpeur sans compromis de qualite.

4. **Le cout n'est pas discriminant a 500-5 000 pages/mois.** L'ecart entre les solutions est de 15-70 EUR/mois. Le cout du temps developpeur a maintenir un pipeline complexe depasse largement cette economie.

5. **L'architecture bi-provider elimine le risque de vendor lock-in.** Si Mistral disparait, Claude/Bedrock prend le relais. Si le CLOUD Act devient un probleme pour Bedrock, Mistral reste souverain. Le switch est une ligne de configuration.

### Decision demandee au comite

| Decision | Recommandation PM |
|----------|-------------------|
| Scenario retenu | **A -- Full LLM bi-provider** |
| Provider principal | **Mistral AI** (souverainete EU, cout) |
| Provider fallback | **Claude/Bedrock** (qualite, fiabilite) |
| Phase 2 start | T4 2026 (apres validation Phase 1) |
| Budget API mensuel autorise | 50 EUR/mois (avec alerte a 100 EUR) |
| Prerequis avant integration | Evaluation comparative Mistral vs Claude sur corpus Phase 1 (minimum 50 contrats) |
| DPIA | A realiser AVANT Phase 2 (couvre le transfert de texte vers Mistral/Bedrock) |
| Go/No-Go Phase 2 | Si precision extraction >= 70% sur le corpus de test ET DPIA validee |

### Ce qui change par rapport a la note de cadrage initiale

| Element | Note de cadrage (mars 2026) | Recommandation benchmark (mars 2026) |
|---------|---------------------------|-------------------------------------|
| Phase 2 extraction | "OCR-assisted" (generique) | **Mistral LLM + Claude/Bedrock fallback** (specifique) |
| MVP extraction | "LLM via API (GPT-4o / Claude)" | **Mistral principal** (souverainete) + **Claude fallback** (qualite) |
| Architecture | "Edge Function + extraction + matching" | **Abstraction layer bi-provider** avec interface ExtractionProvider |
| Scans/photos | "Tesseract ou service cloud" (Phase 2) | **LLM Vision Claude/Bedrock** (Phase 3, pas Phase 2) |
| Phase 3 | "Modele fine-tune" | **Evaluation ROI avant fine-tuning** -- pas de fine-tuning par defaut |

---

*Document etabli le 28 mars 2026 par le Lead Product Manager pour decision en comite produit.*
*Les analyses des agents specialises (IT Architect, Security Architect, Compliance Officer, Actuaire Senior, Underwriting Expert, QA Expert, Decision Scientist) sont referenciees et integrees.*
