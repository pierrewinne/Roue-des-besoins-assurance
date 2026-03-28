# Benchmark Technique -- Extraction Automatique de Contrats d'Assurance

**Date** : 2026-03-28
**Auteur** : IT Architect
**Statut** : Analyse technique initiale
**Stack cible** : React 19 + Supabase (plan gratuit) + Netlify (plan gratuit)

---

## 0. Contraintes Structurantes

Avant toute comparaison, les contraintes non negociables :

| Contrainte | Impact |
|---|---|
| **RGPD** : donnees personnelles + potentiellement donnees de sante (contrats prevoyance/vie) | Hebergement **EU obligatoire**, pas de transfert US sans base legale solide |
| **Pas de backend existant** : zero Edge Functions, zero Netlify Functions | Toute solution necessite la **creation d'une couche backend** |
| **CSP restrictive** : `connect-src` limite a Supabase | Les appels API externes **doivent transiter par un proxy backend** |
| **Plan Supabase gratuit** : limites storage (1 GB), Edge Functions (500K invocations/mois, 2 MB body) | Contrainte sur le stockage des fichiers et le traitement |
| **Plan Netlify gratuit** : Functions (125K invocations/mois, 10s timeout sync, 15 min background) | Timeout critique pour le traitement de documents lourds |
| **Documents luxembourgeois** : bilingues FR/DE, formats varies (Baloise, Foyer, La Luxembourgeoise, AXA LU) | Modeles pre-entraines "assurance" souvent calibres US/UK -- performance incertaine |
| **Budget startup/MVP** : pas de budget cloud enterprise | Les solutions a cout fixe eleve sont eliminatoires |

---

## 1. Analyse Detaillee par Solution

### 1.1. Mistral AI (Pixtral Large / Mistral Large)

**Architecture d'integration** :
- Netlify Background Function (Node 18) appelle `https://api.mistral.ai/v1/chat/completions`
- Upload PDF vers Supabase Storage -> trigger Netlify Function via webhook DB
- Pixtral Large accepte les images directement (vision native)
- Pour PDF natifs : extraction texte cote serveur (pdf-parse) puis prompt Mistral Large
- Pour scans/photos : envoi image a Pixtral Large avec prompt structure

**Qualite d'extraction estimee** :

| Type de document | Qualite | Notes |
|---|---|---|
| PDF natif (texte selectionnable) | Excellente (95%) | Texte extrait en amont, LLM structure seulement |
| Scan 300 dpi | Tres bonne (88-92%) | Pixtral Large performant sur documents structures |
| Photo smartphone | Bonne (80-88%) | Depend eclairage/angle, Pixtral gere correctement |
| Bilingue FR/DE | Excellente | Mistral entraine sur corpus FR, bon DE |

**Latence** : 3-8s par page (selon complexite, modele utilise)

**Cout** :

| Volume | Cout estime/mois |
|---|---|
| 500 pages | ~15-25 EUR (Pixtral Large: ~3-5 centimes/page en input tokens image + output) |
| 5 000 pages | ~150-250 EUR |

**Scalabilite** : Rate limit API standard (requetes/min ajustable), pas de quota dur mensuel.

**Complexite d'integration** : **4-5 jours**
- Creation de la Netlify Function (1j)
- Prompt engineering + schema JSON (1.5j)
- Gestion upload + stockage Supabase (1j)
- Tests + edge cases (1j)

**Maintenance** : Pas de template a maintenir. Les prompts evoluent avec les modeles mais sont versionnes cote code. Risque de regression si changement de modele.

**Avantages specifiques** :
- Hebergement EU natif (Paris) -- RGPD conforme sans effort
- Excellent FR (modele francais)
- API simple, format OpenAI-compatible
- Vision native pour scans/photos
- Cout tres competitif
- Pas de lock-in (format API standard)

**Inconvenients specifiques** :
- Pas de modele pre-entraine "assurance" -- tout repose sur le prompt engineering
- Qualite dependante de la version du modele (regression possible)
- Pas d'OCR dedie -- la vision est "interpretative", pas "extractive"

---

### 1.2. Google Document AI

**Architecture d'integration** :
- Netlify Background Function appelle l'API Document AI (region `eu`)
- Necessite un projet GCP + service account (JSON key)
- Processeur "Custom Document Extractor" a entrainer sur les contrats LU
- Ou processeur generique "Form Parser" + post-traitement

**Qualite d'extraction estimee** :

| Type de document | Qualite | Notes |
|---|---|---|
| PDF natif | Excellente (95%) | OCR Google de reference |
| Scan 300 dpi | Excellente (93-96%) | Meilleur OCR du marche |
| Photo smartphone | Tres bonne (88-93%) | Correction automatique perspective/eclairage |
| Bilingue FR/DE | Tres bonne | Mais le custom extractor demande un entrainement par langue |

**Latence** : 1-3s par page (OCR optimise, infrastructure Google)

**Cout** :

| Volume | Cout estime/mois |
|---|---|
| 500 pages | ~7-15 EUR (Form Parser: 0.065 USD/page pour les 1000 premieres) |
| 5 000 pages | ~65-100 EUR (degressif apres 5M pages/mois) |

**Scalabilite** : Quasi-illimitee (infrastructure Google). Quotas par defaut genereux.

**Complexite d'integration** : **8-12 jours**
- Setup projet GCP + IAM + service account (1j)
- Choix et configuration du processeur (1j)
- Si custom extractor : annotation de 50-100 documents d'entrainement (3-5j)
- Code d'integration Netlify Function (1.5j)
- Post-traitement des resultats en JSON structure (1.5j)
- Tests (1j)

**Maintenance** : **Elevee si custom extractor**. Chaque nouveau format de contrat (nouvel assureur, nouvelle mise en page) peut necessiter un re-entrainement. Le Form Parser generique necessite un post-traitement robuste.

**Avantages specifiques** :
- Meilleur OCR brut du marche
- Region EU disponible
- Processeurs pre-entraines pour factures/formulaires
- Correction automatique de la qualite d'image
- Extraction de tables native

**Inconvenients specifiques** :
- Complexite de setup GCP significative
- Lock-in Google Cloud
- Custom extractor = effort d'annotation important
- Le Form Parser generique ne "comprend" pas le domaine assurance
- Necessite de gerer les credentials GCP de facon securisee
- Surpoids architectural : ajouter GCP a une stack Supabase+Netlify

---

### 1.3. AWS Textract

**Architecture d'integration** :
- Netlify Background Function appelle Textract (region `eu-west-1` Frankfurt)
- Necessite un compte AWS + IAM user/role
- `AnalyzeDocument` (synchrone, < 10s) ou `StartDocumentAnalysis` (asynchrone, pour multi-pages)
- L'API asynchrone necessite un mecanisme de callback (SNS -> webhook)

**Qualite d'extraction estimee** :

| Type de document | Qualite | Notes |
|---|---|---|
| PDF natif | Tres bonne (92-95%) | Bon OCR, extraction tables/forms |
| Scan 300 dpi | Tres bonne (90-94%) | Performant mais legerement sous Google |
| Photo smartphone | Bonne (85-90%) | Moins de correction auto que Google |
| Bilingue FR/DE | Bonne | OCR correct, mais pas de comprehension semantique |

**Latence** :
- Synchrone : 2-5s par page
- Asynchrone : 10-30s (mais permet multi-pages)

**Cout** :

| Volume | Cout estime/mois |
|---|---|
| 500 pages | ~7-10 EUR (Forms: 0.05 USD/page, Tables: 0.015 USD/page) |
| 5 000 pages | ~50-80 EUR |

**Scalabilite** : Bonne. Quotas par defaut moderes (limites TPS par region), augmentables.

**Complexite d'integration** : **7-10 jours**
- Setup AWS + IAM (1j)
- Integration API synchrone (1.5j)
- Gestion asynchrone pour documents multi-pages (2j)
- Post-traitement des blocs Textract en JSON structure (2j)
- Tests (1j)

**Maintenance** : Faible cote AWS. Mais le post-traitement des blocs bruts en donnees structurees assurance est un travail consequent et fragile (les positions de blocs changent selon le format de contrat).

**Avantages specifiques** :
- Region EU (Frankfurt)
- Extraction de tables native et fiable
- Extraction de paires cle-valeur (formulaires)
- Cout bas
- Robuste et mature

**Inconvenients specifiques** :
- **Aucune comprehension semantique** : extrait des blocs de texte, pas des "garanties" ou "franchises"
- Post-traitement lourd : transformer les blocs en donnees metier
- API asynchrone complexe pour multi-pages
- Lock-in AWS
- Surpoids architectural (meme remarque que GCP : ajouter AWS a la stack)
- Le resultat brut necessite **de toute facon un LLM** pour la structuration metier

---

### 1.4. Azure AI Document Intelligence

**Architecture d'integration** :
- Netlify Background Function appelle Azure Document Intelligence (region `West Europe`)
- Necessite un abonnement Azure + resource Document Intelligence
- Modele pre-entraine `prebuilt-insurance` (preview) ou `prebuilt-document`
- API REST standard, client SDK disponible (JS)

**Qualite d'extraction estimee** :

| Type de document | Qualite | Notes |
|---|---|---|
| PDF natif | Tres bonne (93-96%) | OCR Azure excellent |
| Scan 300 dpi | Tres bonne (91-95%) | Performant |
| Photo smartphone | Bonne-Tres bonne (86-92%) | Correction auto presente |
| Bilingue FR/DE | Tres bonne | Bon support multilingue |

**Latence** : 2-5s par page

**Cout** :

| Volume | Cout estime/mois |
|---|---|
| 500 pages | ~50-75 EUR (Read: 0.001/page mais prebuilt: 0.10/page) |
| 5 000 pages | ~250-500 EUR (prebuilt models couteux) |

**Scalabilite** : Bonne. Quotas Azure standard.

**Complexite d'integration** : **6-9 jours**
- Setup Azure + resource (1j)
- Integration API prebuilt-document (1.5j)
- Custom model si necessaire : annotation + entrainement (3-5j)
- Post-traitement (1j)
- Tests (1j)

**Maintenance** : Modele custom = re-entrainement periodique. Prebuilt = maintenance faible mais resultat generique.

**Avantages specifiques** :
- Region EU native
- Modele `prebuilt-insurance` (en preview) -- potentiellement le seul modele pre-entraine assurance
- SDK JavaScript officiel bien documente
- Extraction de tables + paires cle-valeur

**Inconvenients specifiques** :
- **Cout eleve** des modeles prebuilt (10x plus cher que Textract)
- Le modele `prebuilt-insurance` est en preview et calibre US
- Lock-in Azure
- Surpoids architectural (troisieme cloud provider potentiel)
- Les contrats LU ne ressemblent pas aux contrats US

---

### 1.5. GPT-4 Vision (OpenAI)

**Architecture d'integration** :
- Netlify Function appelle `https://api.openai.com/v1/chat/completions` avec images en base64
- Meme pattern que Mistral : prompt structure -> JSON

**Qualite d'extraction estimee** :

| Type de document | Qualite | Notes |
|---|---|---|
| PDF natif | Excellente (95%) | Comprehension contextuelle superieure |
| Scan 300 dpi | Tres bonne (88-93%) | Vision performante mais pas OCR dedie |
| Photo smartphone | Bonne (82-88%) | Correct mais pas le meilleur sur images degradees |
| Bilingue FR/DE | Tres bonne | Bon multilingue, legerement inferieur a Mistral en FR |

**Latence** : 5-12s par page (modeles plus lourds)

**Cout** :

| Volume | Cout estime/mois |
|---|---|
| 500 pages | ~40-80 EUR (GPT-4o : tokens image couteux, ~8-15 centimes/page) |
| 5 000 pages | ~400-800 EUR |

**Scalabilite** : Rate limits dependant du tier. Tier 1 tres limite.

**Complexite d'integration** : **3-4 jours** (API tres bien documentee, pattern connu)

**Maintenance** : Meme que Mistral -- prompts a maintenir, pas de template.

**Avantages specifiques** :
- Meilleure comprehension contextuelle du marche
- Ecosysteme OpenAI mature (SDK, tooling)
- Structured outputs (JSON mode natif fiable)

**Inconvenients specifiques** :
- **PAS DE REGION EU** : les donnees transitent par les US -- **RGPD non conforme** pour des contrats d'assurance contenant potentiellement des donnees de sante
- Cout 3-4x superieur a Mistral pour un resultat comparable
- Latence plus elevee
- Dependance a un acteur US sans engagement EU

**VERDICT : ELIMINE** -- Non-conformite RGPD redhibitoire pour des documents d'assurance luxembourgeois.

---

### 1.6. Claude Vision (Anthropic via AWS Bedrock)

**Architecture d'integration** :
- Netlify Function appelle Claude via AWS Bedrock (region `eu-west-1` ou `eu-central-1`)
- Necessite un compte AWS avec Bedrock active en region EU
- Meme pattern que Mistral/OpenAI : vision + prompt -> JSON

**Qualite d'extraction estimee** :

| Type de document | Qualite | Notes |
|---|---|---|
| PDF natif | Excellente (95%) | Tres bonne comprehension |
| Scan 300 dpi | Tres bonne (87-92%) | Vision correcte, pas OCR dedie |
| Photo smartphone | Bonne (80-87%) | Correct |
| Bilingue FR/DE | Tres bonne | Bon multilingue |

**Latence** : 5-15s par page (Bedrock ajoute une couche de latence)

**Cout** :

| Volume | Cout estime/mois |
|---|---|
| 500 pages | ~50-100 EUR (Claude Sonnet via Bedrock : tokens image eleves) |
| 5 000 pages | ~500-1000 EUR |

**Scalabilite** : Quotas Bedrock par defaut conservateurs, augmentables sur demande.

**Complexite d'integration** : **5-7 jours**
- Setup AWS + Bedrock + IAM (1.5j)
- Integration API (1.5j)
- Prompt engineering (1j)
- Tests (1j)

**Maintenance** : Prompts a maintenir. Bedrock gere le versionning des modeles.

**Avantages specifiques** :
- Region EU via Bedrock
- Excellente comprehension contextuelle
- Bonne gestion des tableaux

**Inconvenients specifiques** :
- **Cout le plus eleve** du benchmark
- Necessite AWS Bedrock (complexite infra supplementaire)
- Latence Bedrock superieure a l'API directe
- Pas d'OCR dedie

---

### 1.7. Tesseract.js (Open Source, Local)

**Architecture d'integration** :
- Execution dans Netlify Function (Node 18)
- `tesseract.js` en dependance npm
- Probleme : les modeles de langue pesent ~10-15 MB chacun (FR + DE)
- Netlify Functions : cold start penalise par la taille du bundle

**Qualite d'extraction estimee** :

| Type de document | Qualite | Notes |
|---|---|---|
| PDF natif | Non applicable | Tesseract fait de l'OCR image -- pour les PDF natifs, utiliser un extracteur de texte |
| Scan 300 dpi | Moyenne (75-85%) | Correct sur scans propres, mais en retrait significatif vs cloud |
| Photo smartphone | Mediocre (55-70%) | Tres sensible a l'eclairage, angle, resolution |
| Bilingue FR/DE | Faible-Moyenne | Detection de langue manuelle, pas de gestion mixte FR+DE dans un meme document |

**Latence** : 5-15s par page (CPU-bound, pas de GPU dans Netlify Functions)

**Cout** :

| Volume | Cout estime/mois |
|---|---|
| 500 pages | 0 EUR (open source) |
| 5 000 pages | 0 EUR |

**Scalabilite** : Limitee par les ressources CPU de Netlify Functions. Timeout de 10s en synchrone, 15 min en background.

**Complexite d'integration** : **3-4 jours** (mais qualite basse)

**Maintenance** : Faible. Mais la qualite insuffisante genere un cout cache : corrections manuelles par l'utilisateur.

**Avantages specifiques** :
- Zero cout
- Zero dependance cloud
- Zero probleme RGPD (tout reste local/serveur)
- Open source

**Inconvenients specifiques** :
- **Qualite d'OCR insuffisante** pour un usage production sur des photos smartphone
- Pas de comprehension semantique (texte brut seulement)
- Necessite de toute facon un LLM pour structurer le texte -> la solution "tout local" n'existe pas
- Taille des modeles de langue = cold start penalisant
- Pas de detection de tables

---

### 1.8. Solution Hybride : Tesseract Local + LLM

**Architecture d'integration** :
- Etape 1 : Netlify Background Function execute Tesseract.js pour OCR
- Etape 2 : Le texte brut extrait est envoye a un LLM (Mistral) pour structuration
- Pour PDF natifs : skip Tesseract, extraction texte directe (pdf-parse)
- Avantage : pas d'envoi d'images au cloud (seul le texte brut part au LLM)

**Qualite d'extraction estimee** :

| Type de document | Qualite | Notes |
|---|---|---|
| PDF natif | Excellente (95%) | pdf-parse + LLM = meme resultat qu'un LLM vision |
| Scan 300 dpi | Moyenne-Bonne (78-87%) | Tesseract limite la qualite du pipeline |
| Photo smartphone | Mediocre-Moyenne (60-75%) | Maillon faible = Tesseract sur photos |
| Bilingue FR/DE | Variable | Depend de la qualite OCR en amont |

**Latence** : 8-20s par page (OCR + appel LLM)

**Cout** :

| Volume | Cout estime/mois |
|---|---|
| 500 pages | ~8-12 EUR (seul le texte est envoye au LLM, beaucoup moins de tokens) |
| 5 000 pages | ~50-80 EUR |

**Scalabilite** : Limitee par Tesseract (meme probleme que 1.7).

**Complexite d'integration** : **6-8 jours**
- Tesseract.js integration (2j)
- Detection type de document (PDF natif vs scan vs photo) (1j)
- Integration LLM (1.5j)
- Pipeline orchestration + gestion erreurs (1.5j)
- Tests (1j)

**Maintenance** : Moyenne. Deux composants a maintenir.

**Avantages specifiques** :
- Cout reduit (moins de tokens envoyes au LLM)
- Pas d'envoi d'images au cloud (argument RGPD renforce)
- Pour les PDF natifs, le pipeline est optimal

**Inconvenients specifiques** :
- **Complexite accrue** pour un gain marginal par rapport a Mistral Vision direct
- La qualite sur photos/scans reste limitee par Tesseract
- Deux points de defaillance au lieu d'un
- Le gain RGPD est relatif : le texte brut contient aussi des donnees personnelles

---

## 2. Tableau Comparatif Synthetique

Scoring : 1 (mauvais) a 5 (excellent). Poids entre crochets.

| Critere [Poids] | Mistral AI | Google DocAI | AWS Textract | Azure DocAI | GPT-4V | Claude/Bedrock | Tesseract | Hybride |
|---|---|---|---|---|---|---|---|---|
| **RGPD EU** [x3] | 5 | 4 | 4 | 4 | **1** | 4 | 5 | 5 |
| **Qualite PDF natif** [x2] | 5 | 5 | 4 | 5 | 5 | 5 | 2 | 5 |
| **Qualite scan** [x2] | 4 | 5 | 4 | 5 | 4 | 4 | 3 | 3 |
| **Qualite photo** [x3] | 4 | 5 | 3 | 4 | 3 | 3 | 1 | 2 |
| **Bilingue FR/DE** [x2] | 5 | 4 | 3 | 4 | 4 | 4 | 2 | 3 |
| **Latence** [x1] | 4 | 5 | 4 | 4 | 3 | 2 | 3 | 2 |
| **Cout 500p/mois** [x2] | 5 | 5 | 5 | 3 | 3 | 2 | 5 | 5 |
| **Cout 5000p/mois** [x2] | 4 | 4 | 4 | 2 | 1 | 1 | 5 | 4 |
| **Simplicite integration** [x2] | 4 | 2 | 2 | 3 | 5 | 3 | 3 | 2 |
| **Maintenance** [x1] | 4 | 2 | 3 | 2 | 4 | 4 | 4 | 3 |
| **Pas de surpoids archi** [x2] | 5 | 2 | 2 | 2 | 4 | 2 | 5 | 4 |
| **Comprehension metier** [x3] | 4 | 2 | 1 | 2 | 5 | 5 | 1 | 3 |
| | | | | | | | | |
| **SCORE PONDERE /125** | **107** | **90** | **77** | **82** | **ELIMINE** | **77** | **72** | **82** |
| **RANG** | **1er** | **2e** | **5e** | **3e ex-aequo** | **--** | **5e** | **7e** | **3e ex-aequo** |

---

## 3. Recommandation Architecturale

### Solution Principale : Mistral AI (Pixtral Large)

**Pourquoi** :

1. **RGPD** : hebergement EU natif (Paris), pas de configuration supplementaire, pas de cloud provider tiers
2. **Qualite FR/DE** : Mistral est le meilleur modele disponible pour le francais, et tres bon en allemand
3. **Coherence architecturale** : une seule API a integrer, format OpenAI-compatible, pas de surcharge d'infrastructure
4. **Cout maitrise** : 15-25 EUR/mois a 500 pages, 150-250 EUR a 5000 pages
5. **Simplicite** : 4-5 jours d'integration, pas de template a entrainer, pas de projet cloud a provisionner
6. **Comprehension contextuelle** : un LLM comprend "franchise", "plafond de garantie", "surprime" -- un OCR brut ne comprend que des caracteres

### Fallback : Google Document AI (Form Parser)

Si Mistral s'avere insuffisant sur les scans/photos de mauvaise qualite (ce qui est le scenario le plus probable de degradation), Google Document AI en mode Form Parser offre le meilleur OCR du marche. L'architecture peut evoluer vers un hybride Google OCR + Mistral structuration si necessaire.

### Solution explicitement deconseilllee :

- **GPT-4 Vision** : elimine pour non-conformite RGPD
- **Tesseract seul** : qualite insuffisante pour un produit professionnel
- **Azure** : cout disproportionne sans gain de qualite justificatif
- **Claude/Bedrock** : cout eleve + complexite Bedrock pour un resultat comparable a Mistral

---

## 4. Architecture Technique Detaillee -- Solution Mistral AI

### 4.1. Flux de Traitement

```
                                    FRONTEND (React 19)
                                         |
                                    [1] Upload PDF/Image
                                         |
                                         v
                              Supabase Storage (bucket "contracts")
                                         |
                                    [2] INSERT dans table "contract_uploads"
                                         |
                                         v
                              Supabase Database Webhook
                                         |
                                    [3] POST vers Netlify Background Function
                                         |
                                         v
                         +------- Netlify Background Function -------+
                         |                                           |
                         |  [4] Telecharge le fichier depuis Storage |
                         |           |                               |
                         |           v                               |
                         |  [5] Detection type :                     |
                         |       - PDF natif ? -> pdf-parse (texte)  |
                         |       - Scan/Image ? -> base64 pour vision|
                         |           |                               |
                         |           v                               |
                         |  [6] Appel Mistral API :                  |
                         |       - PDF natif : Mistral Large (texte) |
                         |       - Scan/Image : Pixtral Large (image)|
                         |           |                               |
                         |           v                               |
                         |  [7] Validation du JSON retourne          |
                         |       - Schema Zod/AJV                    |
                         |       - Verification coherence metier     |
                         |           |                               |
                         |           v                               |
                         |  [8] UPDATE table "contract_uploads"      |
                         |       - status: 'completed'               |
                         |       - extracted_data: JSONB             |
                         |           |                               |
                         +-------------------------------------------+
                                         |
                                    [9] Frontend poll / Realtime
                                         |
                                         v
                              Affichage resultats + confirmation utilisateur
```

### 4.2. Schema de Donnees

```sql
-- Migration: XXX_contract_extraction.sql

-- Table des uploads de contrats
CREATE TABLE contract_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Fichier source
    file_path TEXT NOT NULL,           -- chemin dans Supabase Storage
    file_name TEXT NOT NULL,           -- nom original du fichier
    file_type TEXT NOT NULL,           -- 'application/pdf', 'image/jpeg', etc.
    file_size_bytes INTEGER NOT NULL,

    -- Statut d'extraction
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'review')),
    error_message TEXT,

    -- Donnees extraites
    extracted_data JSONB,              -- schema structure (voir ci-dessous)
    confidence_score NUMERIC(3,2),     -- 0.00 a 1.00
    extraction_model TEXT,             -- 'mistral-large-latest' / 'pixtral-large-latest'
    extraction_tokens_used INTEGER,    -- pour suivi cout

    -- Validation utilisateur
    user_validated BOOLEAN DEFAULT FALSE,
    user_corrections JSONB,            -- corrections manuelles

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE contract_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own uploads"
    ON contract_uploads FOR ALL
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Advisors can view client uploads"
    ON contract_uploads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = contract_uploads.profile_id
            AND profiles.advisor_id = auth.uid()
        )
    );

-- Index
CREATE INDEX idx_contract_uploads_profile ON contract_uploads(profile_id);
CREATE INDEX idx_contract_uploads_status ON contract_uploads(status);

-- Trigger updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON contract_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bucket Storage (a creer via dashboard ou migration)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('contracts', 'contracts', false);
```

**Schema JSON des donnees extraites** :

```typescript
interface ExtractedContractData {
    // Identification
    insurer: string;               // "Baloise", "Foyer", "La Luxembourgeoise", "AXA Luxembourg"
    contract_number: string | null;
    contract_type: string;         // "auto", "habitation", "vie", "sante", "RC", "voyage", etc.
    product_name: string | null;   // "Baloise Drive", "Foyer Auto", etc.

    // Dates
    effective_date: string | null; // ISO 8601
    expiry_date: string | null;    // ISO 8601

    // Financier
    annual_premium: number | null;
    payment_frequency: string | null; // "mensuel", "trimestriel", "semestriel", "annuel"

    // Garanties
    coverages: Array<{
        name: string;              // "RC obligatoire", "Vol", "Incendie", "Bris de glace", etc.
        limit: number | null;      // plafond en EUR
        deductible: number | null; // franchise en EUR
        included: boolean;
    }>;

    // Assure(s)
    policyholder: {
        name: string | null;
        address: string | null;
    };

    // Donnees brutes pour audit
    raw_text_excerpt: string;      // premiers 500 chars du texte extrait
    language_detected: "fr" | "de" | "mixed";
}
```

### 4.3. Netlify Background Function

```
frontend/netlify/functions/
  extract-contract.mts          -- Background Function (ESM)
  lib/
    mistral-client.ts           -- Client API Mistral (fetch, pas de SDK lourd)
    pdf-parser.ts               -- Detection PDF natif + extraction texte
    extraction-prompt.ts        -- Prompts versionnes
    extraction-schema.ts        -- Schema Zod de validation
    supabase-admin.ts           -- Client Supabase service_role
```

**Points architecturaux cles** :

1. **Background Function** (pas synchrone) : le timeout de 10s des Functions synchrones est insuffisant. Les Background Functions Netlify ont un timeout de 15 minutes -- largement suffisant.

2. **Pas de SDK Mistral** : un simple `fetch` vers l'API REST suffit. Evite une dependance lourde.

3. **Detection PDF natif vs scan** : un PDF peut contenir du texte selectionnable (natif) ou etre un scan embede. La detection se fait en verifiant si `pdf-parse` extrait du texte significatif (> 50 caracteres par page). Si oui -> texte ; si non -> image.

4. **Double modele** :
   - PDF natif : `mistral-large-latest` (texte seulement, moins cher, plus rapide)
   - Scan/Image : `pixtral-large-latest` (vision, necessite l'image)

5. **Gestion des erreurs** :
   - Retry automatique (1 fois) en cas d'erreur 5xx de Mistral
   - Pas de retry sur 4xx (erreur de requete)
   - En cas d'echec definitif : status = 'failed', error_message stocke
   - L'utilisateur voit le statut en temps reel (Supabase Realtime ou polling)

6. **Validation stricte** : le JSON retourne par Mistral est valide via un schema Zod. Si le JSON est invalide ou incomplet, status = 'review' pour verification manuelle.

### 4.4. Prompt Engineering

Le prompt est le coeur de la qualite d'extraction. Structure recommandee :

```
SYSTEM:
Tu es un expert en extraction de donnees de contrats d'assurance luxembourgeois.
Extrais les informations suivantes du document fourni.
Reponds UNIQUEMENT en JSON valide selon le schema suivant : {schema}
Si une information n'est pas trouvee, utilise null.
Ne devine jamais -- si une donnee est ambigue, mets null et ajoute un commentaire
dans le champ "notes".
Le document peut etre en francais, allemand, ou un melange des deux.

USER:
[Texte du contrat / Image du contrat]
```

**Versionning** : le prompt est stocke dans le code (pas en base), versionne avec git, et identifie par un hash dans les logs pour tracabilite.

### 4.5. Securite

| Risque | Mitigation |
|---|---|
| Cle API Mistral exposee | Stockee en variable d'environnement Netlify, jamais cote client |
| Fichier malveillant uploade | Validation MIME type + taille max (10 MB) cote client ET serveur |
| Injection via PDF forge | Le contenu extrait est traite comme donnee non fiable, pas execute |
| Acces non autorise aux fichiers | RLS sur `contract_uploads` + bucket Storage prive + policies |
| Surconsommation API | Rate limit applicatif : max 10 extractions/jour/utilisateur |
| Donnees sensibles en log | Ne jamais logger le contenu extrait, seulement les metadata (status, duree, tokens) |
| Prompt injection via contenu PDF | Le prompt systeme est strict, le contenu du document est dans le message user (pas dans le systeme) |

### 4.6. CSP Update

La CSP actuelle doit etre mise a jour pour autoriser la Netlify Function :

```toml
# netlify.toml - ajout connect-src
Content-Security-Policy = "... connect-src 'self' https://tkfaunwvfkvvtokczchd.supabase.co wss://tkfaunwvfkvvtokczchd.supabase.co ..."
```

Pas besoin d'ajouter `api.mistral.ai` dans la CSP : le frontend ne contacte jamais Mistral directement. Il passe par Supabase Storage (upload) et lit les resultats en base.

### 4.7. UX Flow

1. Utilisateur clique "Ajouter un contrat"
2. Selection fichier (PDF, JPG, PNG) -- validation taille < 10 MB
3. Upload vers Supabase Storage (progression affichee)
4. INSERT dans `contract_uploads` (status: 'pending')
5. Webhook declenche la Background Function
6. Frontend affiche un spinner avec le statut (pending -> processing -> completed/failed)
7. Quand status = 'completed' : affichage des donnees extraites pour validation
8. L'utilisateur confirme ou corrige
9. Les donnees validees alimentent le diagnostic existant

### 4.8. Estimation des Couts Mensuels

| Composant | 500 pages/mois | 5 000 pages/mois |
|---|---|---|
| Mistral API (melange Large + Pixtral) | 15-25 EUR | 150-250 EUR |
| Supabase Storage (PDF ~1 MB moyen) | 0 EUR (< 1 GB gratuit) | ~5 EUR (5 GB) |
| Netlify Functions | 0 EUR (< 125K invoc) | 0 EUR (< 125K invoc) |
| **Total** | **15-25 EUR** | **155-255 EUR** |

---

## 5. Plan d'Evolution

### Phase 1 : MVP (Sprint 1 -- 5 jours)
- Upload + extraction Mistral pour PDF natifs uniquement
- Validation manuelle obligatoire
- Pas de lien avec le diagnostic

### Phase 2 : Photos + Scans (Sprint 2 -- 3 jours)
- Ajout Pixtral Large pour images
- Detection automatique PDF natif vs scan vs photo
- Amelioration du prompt avec retours utilisateurs

### Phase 3 : Integration Diagnostic (Sprint 3 -- 3 jours)
- Les contrats valides alimentent le pre-remplissage du questionnaire
- Mapping contrat extrait -> questions du questionnaire
- Indicateur "couverture existante" dans la roue

### Phase 4 : Fallback Google OCR (si necessaire -- 5 jours)
- Si la qualite sur photos smartphone est insuffisante
- Ajout Google Document AI Form Parser en pre-traitement OCR
- Pixtral ne recoit plus l'image brute mais le texte OCR + les tables

---

## 6. Risques Identifies et Mitigations

| Risque | Probabilite | Impact | Mitigation |
|---|---|---|---|
| Qualite insuffisante sur photos smartphone | Moyenne | Haut | Phase 4 (fallback Google OCR) + guidelines photo pour l'utilisateur |
| Mistral API indisponible | Faible | Haut | Retry + queue (la Background Function peut attendre) + status 'failed' gracieux |
| Regression qualite apres mise a jour modele Mistral | Moyenne | Moyen | Tests de regression automatises sur un jeu de 20 documents de reference |
| Cout API derive en phase 2 | Faible | Moyen | Rate limit par utilisateur + monitoring mensuel |
| Documents multi-pages complexes (>20 pages) | Moyenne | Moyen | Traitement page par page avec aggregation + limite a 30 pages |
| Hallucination du LLM (donnees inventees) | Moyenne | Haut | Validation schema stricte + score de confiance + validation utilisateur obligatoire |
| Changement de format contrat assureur | Certaine | Faible | Le LLM generalise mieux que des templates -- impact minimal |

---

## 7. Ce Que Je Deconseille Explicitement

1. **Ne pas construire un pipeline OCR maison** (Tesseract + post-traitement + heuristiques). Le ratio effort/qualite est desastreux. Un LLM vision fait mieux en une seule etape.

2. **Ne pas ajouter un cloud provider supplementaire** (AWS/GCP/Azure) juste pour l'OCR. La stack est Supabase + Netlify. Ajouter GCP signifie : un compte de plus, des credentials de plus, une surface d'attaque de plus, une facture de plus. Le gain de qualite OCR ne justifie pas ce surpoids -- sauf si les photos smartphone s'averent problematiques en production (Phase 4).

3. **Ne pas fine-tuner un modele**. A ce volume (500-5000 pages/mois), le prompt engineering suffit largement. Le fine-tuning est justifie a partir de 50 000+ documents/mois avec un taux d'erreur mesure et non resolu par le prompt.

4. **Ne pas stocker les cles API cote client**. Toute interaction avec Mistral passe par la Background Function.

5. **Ne pas automatiser sans validation humaine** en phase initiale. Tant que le taux de confiance n'est pas mesure sur 200+ documents reels, l'utilisateur doit confirmer chaque extraction.

---

## 8. Decision Record

| Decision | Justification |
|---|---|
| Mistral AI comme solution principale | EU natif, meilleur FR, cout bas, simplicite d'integration, pas de surpoids infra |
| Netlify Background Function (pas Edge Function Supabase) | Timeout 15 min vs 2s, Node 18 compatible pdf-parse, pas de contrainte Deno |
| Pas de SDK Mistral | Un fetch suffit, evite une dependance, <50 lignes de code |
| Detection PDF natif vs scan | Optimise cout (texte = moins de tokens que image) et qualite |
| Validation utilisateur obligatoire | Mitigue les hallucinations, construit le jeu de test de regression |
| Rate limit 10/jour/utilisateur | Protege contre la surconsommation, suffisant pour un usage normal |
| Schema JSONB en base (pas de colonnes separees) | Flexible pour evoluer, le schema est valide cote application |
| Google Document AI en fallback (pas AWS/Azure) | Meilleur OCR brut du marche, si la qualite photo est insuffisante |
