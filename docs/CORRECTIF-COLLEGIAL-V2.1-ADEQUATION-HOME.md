# Correctif collegial V2.1 -- Adequation contrats : Protection des Biens (HOME)

> Roue des Besoins Assurance -- Baloise Luxembourg
> Version 2.1 -- 28 mars 2026
> Statut : PATCH DECISIONNNEL -- CORRECTIF DE LA NOTE V2.0
> Nature : verrouillage des 15-20 % de fragilites restantes
> Contributeurs : 14 agents specialises (college identique a la V2)
> Supersede : V2.0 sur les 6 sujets traites. Le reste de la V2 est CONFIRME.

---

# PARTIE 1 -- Verdict V2.1

La V2 est confirmee a 80-85 %. Le GO CONDITIONNEL tient. Le perimetre MRH, l'approche prudente, la restitution categorique, l'Option B (pdf-parse + Mistral Large) et la strategie de phasage sont maintenus.

Le present correctif verrouille 6 fragilites identifiees par relecture collegiale :
1. La contradiction sur ce qui peut demarrer avant validation IDD est levee par une matrice composant par composant.
2. L'incoherence entre formats acceptes (PDF/JPEG/PNG) et strategie Phase 1 (PDF natifs seulement) est eliminee.
3. La position technologique est reecrite avec une honnetete accrue sur les besoins de supervision.
4. Les seuils de qualite sont rehausses et structures en 3 niveaux (build / beta / go-live).
5. Le corpus passe de 25 a 50 contrats structures, avec un plan d'echantillonnage.
6. Le libelle client "couvert" est remplace par "detecte dans votre contrat" pour reduire le risque juridique et reputationnel.

**Apres application de ce correctif, la V2.1 est presentable comme base d'arbitrage finale en comite produit. Aucun tour supplementaire n'est necessaire sur les sujets traites.**

---

# PARTIE 2 -- Les 6 corrections imperatives

---

## SUJET 1 -- Ce qui peut demarrer avant validation IDD

### Contradiction identifiee

La V2 contient deux affirmations incompatibles :
- Section 1, ligne 24 : "Le dev peut commencer sur le moteur d'adequation **et l'UI** pendant que ces validations sont en cours"
- Section 13, ligne 719 : "**Front-end bloque** jusqu'a validation IDD"
- Section 4.6, ligne 226 : "Backend : oui. UI resultats : non."

Le probleme : "l'UI" est un terme ambigu. L'ecran d'upload n'a pas le meme statut IDD que l'ecran de restitution des resultats.

### Decision V2.1

**Regle unique :** tout ce qui ne montre pas de resultat d'adequation au client peut demarrer avant validation IDD. Tout ce qui affiche un statut (detecte/partiel/gap/non evaluable) au client est bloque.

| Composant | Avant IDD ? | Condition | Marquage V2 |
|-----------|:-----------:|-----------|:-----------:|
| Backend : migration Supabase, table, RLS, bucket | OUI | Aucune | KEEP |
| Backend : Background Function (pdf-parse + Mistral) | OUI | Aucune | KEEP |
| Backend : moteur d'adequation TypeScript + tests | OUI | Tests sur donnees fictives, pas d'exposition client | KEEP |
| Backend : schema Zod + validation | OUI | Aucune | KEEP |
| CTA factice (Phase 0) | OUI | Le CTA ne delivre aucun resultat, il mesure l'appetence | KEEP |
| Ecran d'upload + confirmation (2 champs) | OUI | L'upload collecte un document, il ne restitue rien. Disclaimer consent requis. | CHANGE |
| Ecran de restitution des resultats | NON | Affiche des statuts = cree le risque IDD. Bloque jusqu'a validation. | KEEP |
| Wordings des statuts client | NON | Les libelles definitifs doivent etre valides avec le juridique | KEEP |
| PDF export adequation | NON | Contient les resultats = meme blocage que l'ecran | CHANGE |
| Parcours conseiller (vue rapport) | NON | Idem | KEEP |

### Reformulation V2.1 (remplace les 3 passages contradictoires)

**REWRITE** -- Remplace la phrase de la section 1 ("Le dev peut commencer sur le moteur d'adequation et l'UI") ET la decision CPO de la section 13 :

> Le dev backend (migration, extraction, moteur d'adequation, Zod) et le CTA factice Phase 0 peuvent demarrer immediatement, sans attendre la validation IDD. L'ecran d'upload peut etre developpe en parallele car il ne restitue aucun resultat. En revanche, l'ecran de restitution client, le PDF export et les wordings des statuts sont bloques jusqu'a validation IDD par le service juridique Baloise Luxembourg.

---

## SUJET 2 -- Realignement formats UX et strategie Phase 1

### Contradiction identifiee

- Section 7.1, etape 2 : "PDF, JPEG, PNG -- max 10 MB"
- Section 9, Phase 1 : "PDF natifs uniquement", "Pas de vision en Phase 1"

Le client qui voit "JPEG, PNG" dans l'interface s'attend a ce que sa photo de contrat soit traitee. En Phase 1, elle ne le sera pas. C'est une promesse implicite trompeuse.

### Decision V2.1

**Option B retenue : Phase 1 = PDF + images acceptees, mais images non traitees automatiquement.**

Justification :
- L'option A (PDF uniquement) frustre les clients mobiles qui n'ont que des photos. Refuser le fichier est une impasse UX.
- L'option B accepte tout, detecte le type, et redirige honnetement vers la saisie manuelle si necessaire.
- Pas de promesse d'analyse automatique pour les images. Le systeme est transparent.

Detection technique : apres upload, le backend verifie `pdf-parse` text extraction. Si le texte extrait < 50 caracteres/page, le document est classe "non exploitable automatiquement" (scan, image, ou PDF image).

### Textes UX exacts

**REWRITE** -- Section 7.1, etape 2 :

Bouton d'upload :
> "Importer votre document"

Label :
> "Formats acceptes : PDF (recommande), JPEG, PNG -- 10 Mo maximum"

Sous-texte d'aide :
> "Pour une analyse automatique, importez de preference le PDF recu de votre assureur. Les photos de documents seront acceptees mais pourront necessiter une saisie complementaire."

**Message systeme si document non exploitable automatiquement :**

> "Votre document n'a pas pu etre analyse automatiquement (format image ou document scanne). Vous pouvez :"
> - "Reessayer avec le PDF original de votre assureur (si disponible)"
> - "Completer manuellement les informations de votre contrat"

**REWRITE** -- Section 9, Phase 1, ligne "Fallback" :

> Fallback : si le document uploade n'est pas un PDF natif (scan, image, PDF image), le systeme accepte le fichier mais redirige vers une saisie manuelle structuree. Aucune promesse d'analyse automatique pour les images en Phase 1.

---

## SUJET 3 -- Position technologique revisee

### Fragilites identifiees

La V2 contient 3 formulations trop confiantes :

1. **CHANGE** -- Section 8.1 : "C'est un probleme de pattern matching structure, pas de comprehension ouverte du langage naturel" -- Sous-estime la variabilite reelle des CP luxembourgeoises. Meme sur un domaine ferme, la mise en page, la terminologie et les conventions de presentation varient significativement entre Baloise, Foyer, La Luxembourgeoise, AXA et Lalux.

2. **CHANGE** -- Section 8.2, tableau : "Maintenance dictionnaire : Nulle" -- Faux. Le LLM reduit massivement le besoin de dictionnaire explicite, mais ne l'elimine pas. Il faut un prompt MRH avec les 16 garanties + synonymes, et ce prompt devra etre mis a jour si un assureur change sa terminologie.

3. **CHANGE** -- Section 8.3, point 4 : "Pas de dictionnaire a maintenir : Mistral comprend nativement" -- Trop affirmatif. Mistral comprend la plupart des equivalences FR/DE courantes, mais peut echouer sur des formulations locales ou des neologismes assureurs.

### Position techno revisee V2.1

**REWRITE** -- Remplace les paragraphes de la section 8.1 et le point 4 de la section 8.3 :

> L'Option B (pdf-parse + Mistral Large texte seul) reste la recommandation. Le scope MRH ferme (5 assureurs, 16 garanties, 2 langues) reduit considerablement la complexite par rapport a la V1, mais ne l'elimine pas. Les contrats MRH luxembourgeois presentent une heterogeneite reelle : conventions de presentation differentes, terminologie variable entre assureurs (y compris au sein d'un meme assureur selon la generation du contrat), champs parfois absents ou fusionnes dans les tableaux.
>
> Le LLM remplace le dictionnaire de regles explicite, pas le besoin de normalisation. Le prompt MRH contient une table de mapping des 16 garanties avec leurs synonymes FR/DE connus. Ce prompt est un artefact a maintenir : il doit etre revise a chaque ajout d'assureur et lors du monitoring mensuel. Par ailleurs, un taux de "non evaluable" en hausse pour un assureur donne est le signal d'une derive terminologique que le prompt ne couvre plus.
>
> Ce n'est plus un probleme de comprehension ouverte du langage naturel, mais ce n'est pas non plus un simple pattern matching. C'est un probleme de **structuration guidee avec supervision humaine legere**.

### Tableau : automatise / supervise / n'essaie pas

| On automatise | On supervise | On n'essaie pas |
|---------------|-------------|-----------------|
| Extraction texte brut via pdf-parse | Taux de "non evaluable" par assureur (dashboard mensuel) | Interpretation des Conditions Generales |
| Structuration JSON via Mistral Large avec prompt MRH directif | Taux de correction utilisateur par champ (ecran validation) | Extraction des exclusions ou des baremes de vetuste |
| Validation schema via Zod (enum ferme, bornes montants) | Coherence extraction vs avis conseiller (echantillon 20 cas/mois) | Detection automatique de la sous-assurance |
| Detection PDF natif vs scan (seuil 50 chars/page) | Revue prompt trimestrielle (ajout synonymes, nouveaux formats) | Mapping automatique de champs inconnus (si le LLM ne reconnait pas → non evaluable) |
| Classification MRH / non-MRH (rejet si hors scope) | Alertes sur hallucination (montant hors bornes, garantie non MRH) | Traitement des documents manuscrits ou illegibles |

### CHANGE -- Section 8.2, tableau comparatif, ligne "Maintenance dictionnaire"

Remplacer "Nulle" par :

> **Legere** (prompt MRH a maintenir, revue trimestrielle)

### Recommandation techno V2.1

> L'Option B reste optimale pour le scope MRH Phase 1. Le LLM est un accelerateur, pas un pilote automatique. Prevoir 0.5 jour/mois de maintenance du prompt MRH et du monitoring qualite. Ne pas vendre en interne une "solution zero maintenance" -- c'est une solution a maintenance legere et supervisee.

---

## SUJET 4 -- Seuils de qualite rehausses

### Fragilite identifiee

Le GO/NO-GO V2 repose sur "precision >= 70% sur corpus 25 contrats". Ce seuil unique est insuffisant :
- 70% signifie 30% d'erreurs sur un outil qui affiche des statuts a des clients
- Un seul seuil global ne distingue pas champs critiques vs secondaires
- Le corpus de 25 contrats est trop faible pour conclure statistiquement (intervalle de confiance > +/- 15 points)

### Decision V2.1

**REWRITE** -- Remplace le GO/NO-GO de la section 9, les seuils de la section 11.2, et le Go/No-Go de la section 13.

Trois niveaux de seuils :

| KPI | Build interne | Beta fermee (20 clients, 4 sem.) | Ouverture elargie |
|-----|:---:|:---:|:---:|
| Precision champs A (critiques) | >= 75% sur corpus calibration | >= 85% sur corpus pilote | >= 90% en production |
| Precision champs B (utiles) | >= 60% | >= 70% | >= 80% |
| Taux faux positifs "detecte" (ex-couvert) | < 20% | < 10% | < 5% |
| Taux "non evaluable" par garantie A | < 40% | < 25% | < 15% |
| Coherence avec avis conseiller | Non mesurable | >= 75% sur echantillon | >= 85% sur echantillon mensuel |
| Taux reclamation client | N/A | < 5% | < 2% |
| Taux correction utilisateur | Non mesurable | < 30% | < 15% |

**Regle de passage :**
- Build → Beta : tous les seuils "Build interne" atteints ET IDD validee ET DPIA validee
- Beta → Ouverture : tous les seuils "Beta fermee" atteints pendant 4 semaines consecutives ET zero incident critique
- Si un seuil Beta n'est pas atteint apres 6 semaines : STOP, recalibration obligatoire, nouveau cycle beta

**REWRITE** -- Go/No-Go Phase 1 final (section 13) :

> **Go/No-Go Phase 1 :** CTA > 10% ET IDD favorable ET DPIA validee ET precision champs A >= 85% sur corpus pilote ET faux positifs < 10% ET coherence conseiller >= 75%.

---

## SUJET 5 -- Corpus structure

### Fragilite identifiee

25 contrats = 5 contrats par assureur. C'est insuffisant pour couvrir les variantes (FR/DE, proprio/locataire, formule base/confort/premium, qualite documentaire). En statistique d'extraction, un corpus de 25 ne permet pas de conclure avec un intervalle de confiance acceptable.

### Decision V2.1

**REWRITE** -- Remplace "corpus 25 contrats" partout dans la V2.

Trois niveaux de corpus :

| Niveau | Objectif | Taille | Usage |
|--------|----------|:------:|-------|
| Calibration | Developper et calibrer le prompt Mistral | 15-20 contrats | Dev interne, iterations prompt, tests unitaires |
| Pilote | Valider la qualite en conditions reelles | 30-40 contrats | Beta fermee, mesure des seuils |
| Go-live | Autoriser l'ouverture elargie | 50+ contrats | Decision finale, couverture statistique minimale |

### Plan d'echantillonnage -- Corpus pilote (30-40 contrats)

| Dimension | Repartition cible |
|-----------|------------------|
| Baloise | 8-10 contrats (source interne, plus facile) |
| Foyer | 6-8 contrats |
| La Luxembourgeoise | 6-8 contrats |
| AXA Luxembourg | 4-6 contrats |
| Lalux | 4-6 contrats |
| Langue FR | >= 60% du corpus |
| Langue DE ou mixte | >= 20% du corpus |
| Proprietaire | >= 40% du corpus |
| Locataire | >= 30% du corpus |
| Appartement | >= 40% |
| Maison | >= 40% |
| Formule base | >= 30% |
| Formule confort/premium | >= 30% |
| PDF natif propre | >= 70% |
| PDF natif complexe (tableaux fusionnes, anciens formats) | >= 20% |
| Scan (pour tester le rejet) | 3-5 documents |

### Sources d'approvisionnement

| Source | Estimation | Difficulte |
|--------|-----------|:----------:|
| Portefeuille Baloise interne (anonymise) | 8-10 contrats | Faible |
| Clients volontaires Baloise (avec consentement) | 5-10 contrats | Moyenne |
| Collaborateurs Baloise (contrats perso chez la concurrence) | 5-10 contrats | Moyenne |
| Partenariat courtiers / agents generaux | 5-10 contrats | Elevee |
| Contrats specimens publics (si existants) | 2-5 contrats | Variable |

### Phrase de cloture

> En dessous de 30 contrats annotes couvrant au moins 4 assureurs sur 5, on ne peut pas conclure sur la precision d'extraction avec un intervalle de confiance acceptable. En dessous de 50 contrats, on ne peut pas autoriser une ouverture elargie.

**CHANGE** -- Section 12, estimation de charge : remplacer "Tests integration + corpus 25 contrats : 5 jours" par "Tests integration + corpus 50 contrats : 8 jours (dont 3 jours d'annotation)".

**CHANGE** -- Section 12, prerequis bloquants : remplacer "Corpus 25 contrats MRH" par "Corpus 50 contrats MRH (15-20 calibration + 30-40 pilote)".

---

## SUJET 6 -- Libelles client : remplacement de "couvert"

### Fragilite identifiee

Le mot "couvert" reste trop affirmatif pour un outil d'extraction automatique. Meme avec l'ambre et le "sous reserve", un client qui lit "couvert" comprend "je suis protege". En cas de sinistre non pris en charge alors que l'outil disait "couvert", le risque reputationnel et juridique est maximal.

### Analyse comparative

| Critere | Option A : couvert / partiel / gap / non evaluable | Option B : detecte / detecte avec reserve / non detecte / non evaluable |
|---------|---|---|
| **Risque juridique** | MOYEN -- "couvert" peut etre lu comme un avis sur l'adequation (glissement IDD niveau d). Meme avec disclaimer, le mot porte une charge semantique forte | FAIBLE -- "detecte" est factuel. Le systeme constate la presence d'une mention dans un document. Aucun jugement sur la qualite de la couverture |
| **Risque reputationnel** | ELEVE -- en cas de faux positif mediatise, le titre sera "Baloise disait couvert, le client ne l'etait pas" | FAIBLE -- "Baloise avait detecte la mention" est defensible. Le systeme n'a jamais pretendu que le client etait couvert |
| **Impact commercial** | FORT -- "couvert" rassure, incite moins a prendre RDV | BON -- "detecte dans votre contrat" + "Verifiez avec votre conseiller" cree une raison naturelle de prendre RDV. Le gap commercial est faible, le gain de securite est majeur |
| **Comprehension client** | Bonne mais dangereuse -- le client comprend trop bien, il conclut a tort qu'il est protege | Bonne et prudente -- le client comprend que l'outil a trouve une information, pas qu'il est protege. La nuance est accessible |

### Recommandation V2.1

**Option B retenue.** Le gain en securite juridique et reputationnelle depasse largement le cout commercial marginal.

### Libelles exacts finaux

| Statut interne (code) | Libelle client FR | Libelle client DE | Icone | Couleur | Phrase d'accompagnement |
|---|---|---|---|---|---|
| `detected` | Detecte dans votre contrat | In Ihrem Vertrag erkannt | Check | Ambre | "Cette garantie semble presente dans votre contrat. Verifiez les conditions exactes avec votre conseiller." |
| `partial` | Detecte avec reserve | Mit Vorbehalt erkannt | Triangle | Ambre fonce | "Cette garantie semble presente mais un ecart possible a ete identifie (franchise, plafond ou sous-limite). Votre conseiller pourra preciser." |
| `not_detected` | Non detecte dans ce document | In diesem Dokument nicht erkannt | Croix | Rouge doux | "Nous n'avons pas identifie cette garantie dans votre document. Cela ne signifie pas necessairement qu'elle est absente de votre contrat." |
| `not_evaluable` | Non evaluable | Nicht bewertbar | ? | Gris | "L'information n'a pas pu etre extraite de maniere fiable. Consultez votre contrat ou votre conseiller." |

### Impact sur le schema TypeScript

**REWRITE** -- Section 8.4 :

```typescript
export type AdequacyStatus = 'detected' | 'partial' | 'not_detected' | 'not_evaluable'
```

Remplace : `'covered' | 'partial' | 'gap' | 'not_evaluable'`

### Marquages dans la V2

- Section 5.1, les 4 statuts : **REWRITE** -- remplacer les 4 lignes du tableau par les libelles ci-dessus
- Section 5.2, seuils "couvert"/"partiel" : **CHANGE** -- remplacer "couvert" par "detecte" dans les en-tetes de colonne
- Section 7.3, UX de l'incertitude : **REWRITE** -- adapter la description aux nouveaux libelles
- Section 10, risque R1 : **CHANGE** -- remplacer "Faux positif couvert" par "Faux positif detecte"
- Section 11.3, KPI faux positifs : **CHANGE** -- remplacer "couvert" par "detecte"
- Section 13, interdictions point 2 : **CHANGE** -- remplacer "couvert en vert" par "detecte en vert"
- Toute occurrence de "couvert" comme libelle client dans la note : **CHANGE** systematique

---

# PARTIE 3 -- Recapitulatif des marquages KEEP / CHANGE / DELETE / REWRITE

## Sections KEEP (confirmees sans changement)

| Section V2 | Statut | Commentaire |
|------------|:------:|-------------|
| 2. Definition stricte du perimetre | KEEP | Perimetre MRH 16 garanties confirme |
| 3.1 A quoi sert cette fonctionnalite | KEEP | Proposition de valeur confirmee |
| 3.2 Wordings CTA evalues | KEEP | "Faites le point" confirme |
| 3.3 Insertion dans la Roue des Besoins | KEEP | Architecture confirmee |
| 4.1 Position IDD | KEEP | Comparaison informative niveau b confirmee |
| 4.2 Impact RGPD | KEEP | Art. 9 non applicable confirme |
| 4.3 Impact AI Act | KEEP | MRH exclue confirmee |
| 4.4 Disclaimers | KEEP | Sous reserve validation juridique |
| 4.5 Formulations interdites | KEEP | Liste des 10 confirmee |
| 4.6 Points validation juridique | KEEP | 5 questions confirmees |
| 5.2 Seuils de reference | CHANGE | Renommer "couvert" → "detecte" dans les en-tetes |
| 5.3 Hierarchie des champs | KEEP | Niveaux A/B/C/D confirmes |
| 5.4 Sous-assurance | KEEP | Approche prudente confirmee |
| 6. Referentiel metier | KEEP | 16 garanties confirmees |
| 7.2 Decisions tranchees | KEEP | 5 decisions confirmees |
| 8.4 Schema TypeScript | CHANGE | AdequacyStatus renomme |
| 10. Risques majeurs | CHANGE | Terminologie "detecte" |
| 12. Estimation de charge | CHANGE | Corpus 50 au lieu de 25, +3 jours |

## Sections CHANGE (correction ponctuelle)

| Passage V2 | Nature du changement |
|------------|---------------------|
| Section 5.1, tableau des 4 statuts | Libelles client : couvert → detecte, gap → non detecte |
| Section 5.2, en-tetes seuils | "couvert" → "detecte" |
| Section 7.3, UX incertitude | Adapter aux nouveaux libelles |
| Section 8.2, tableau, ligne "Maintenance dictionnaire" | "Nulle" → "Legere (prompt MRH, revue trimestrielle)" |
| Section 8.4, AdequacyStatus | covered → detected, gap → not_detected |
| Section 10, R1 | "Faux positif couvert" → "Faux positif detecte" |
| Section 11.3, KPI faux positifs | "couvert" → "detecte" |
| Section 12, corpus | 25 → 50, +3 jours |
| Section 13, Go/No-Go | Seuils rehausses |

## Sections REWRITE (paragraphe entier a remplacer)

| Passage V2 | Remplacement V2.1 |
|------------|-------------------|
| Section 1, phrase "Le dev peut commencer sur le moteur d'adequation et l'UI" | Reformulation 5 lignes (voir Sujet 1) |
| Section 7.1, etape 2 "PDF, JPEG, PNG" | Textes UX exacts (voir Sujet 2) |
| Section 8.1, "C'est un probleme de pattern matching structure" | Position techno revisee (voir Sujet 3) |
| Section 8.3, point 4 "Pas de dictionnaire a maintenir" | Integre dans la position techno revisee |
| Section 9, GO/NO-GO Phase 1 | Seuils 3 niveaux (voir Sujet 4) |
| Section 9, Phase 1, "Fallback" | Texte realigne (voir Sujet 2) |
| Section 11.2, KPIs extraction | Tableau 3 niveaux (voir Sujet 4) |
| Section 13, decision CPO | Reformulation avec seuils V2.1 |

## Sections DELETE

Aucune suppression. Le scope V2 est integralement maintenu.

---

# PARTIE 4 -- Recommandation finale CPO

La V2.1 confirme le GO CONDITIONNEL sur le perimetre MRH Luxembourg. Six fragilites ont ete corrigees : la matrice IDD est desambiguisee, les formats UX sont realignes avec la strategie Phase 1, la position techno est honnete sur les besoins de supervision, les seuils de qualite sont rehausses a des niveaux credibles pour une exposition client, le corpus passe a 50 contrats structures, et le mot "couvert" est remplace par "detecte dans votre contrat" pour eliminer le risque de requalification IDD et de responsabilite en cas de faux positif.

**Decision CPO V2.1 :**
Lancer Phase 0 (CTA factice) + dev backend + ecran d'upload immediatement. Bloquer l'ecran de restitution et les wordings jusqu'a validation IDD. Constituer le corpus de 50 contrats en parallele. Go beta fermee uniquement si precision champs A >= 85%, faux positifs "detecte" < 10%, et coherence conseiller >= 75%.

**Budget V2.1 :** 8-9 semaines dev (1 developpeur, +3 jours corpus) + 8-15 EUR/mois API Mistral + 0.5 jour/mois maintenance prompt.

**La V2.1 est suffisamment robuste pour etre presentee comme base d'arbitrage finale. Aucun tour supplementaire n'est requis.**

---

*Correctif etabli le 28 mars 2026 par le college des 14 agents specialises.*
*Ce document se lit conjointement avec la Note Collegiale V2.0 qu'il corrige sur les 6 sujets traites.*
