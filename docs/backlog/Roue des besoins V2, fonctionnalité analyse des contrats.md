# Note collegiale V2.1 consolidee -- Adequation contrats : Protection des Biens (HOME)

> Roue des Besoins Assurance -- Baloise Luxembourg
> Version 2.1 consolidee -- 28 mars 2026
> Statut : NOTE DECISIONNELLE POUR COMITE PRODUIT
> Contributeurs : 14 agents specialises (PM, Insurance PM Habitation, Sales Architect, Compliance Officer, Legal Counsel, Risk Manager, Internal Audit, Senior Underwriting Expert, Actuaire Senior, Process Architect, IT Architect, Security Architect, QA Expert, Art Director)

---

# 1. Executive summary

## Verdict : GO CONDITIONNEL

Le recentrage sur la protection des biens (MRH Luxembourg) transforme un projet a risque eleve et perimetre flou en un projet maitrisable, testable et commercialement credible.

**Ce qui change fondamentalement par rapport a la V1 :**
- L'article 9 RGPD (donnees de sante) ne s'applique plus -- le bloqueur le plus lourd de la V1 disparait
- 16 garanties MRH au lieu de 48+ multi-produits -- le referentiel est fini et bornable
- 5 assureurs luxembourgeois au lieu de 15+ -- le dictionnaire de mapping est gerable
- L'AI Act Annexe III.5(b) ne couvre pas la MRH -- la charge reglementaire IA s'allege massivement
- La DPIA reste necessaire mais devient significativement plus legere (1-2 semaines au lieu de 3-4)

**Recommandation :** Lancer la V2 sur le perimetre MRH uniquement, avec une Phase 0 de validation marche (CTA factice, 4 semaines), puis une Phase 1 en extraction automatique PDF natifs via pdf-parse + Mistral Large (texte seul). Le full LLM vision n'est PAS le chemin par defaut -- le scope etroit MRH rend la structuration guidee par LLM plus efficace et moins chere. La restitution est categorique (detecte / detecte avec reserve / non detecte / non evaluable), jamais en pourcentage, toujours sous reserve. Les 2 bloqueurs absolus restent la qualification IDD (a valider par le juridique Baloise) et la DPIA (meme allegee). Le dev backend (migration, extraction, moteur d'adequation, Zod) et le CTA factice Phase 0 peuvent demarrer immediatement, sans attendre la validation IDD. L'ecran d'upload peut etre developpe en parallele car il ne restitue aucun resultat. En revanche, l'ecran de restitution client, le PDF export et les wordings des statuts sont bloques jusqu'a validation IDD par le service juridique Baloise Luxembourg. Ne pas etendre au-dela de HOME avant d'avoir mesure la precision reelle sur 50+ contrats luxembourgeois.

---

# 2. Definition stricte du perimetre

## 2.1 Ce qui est DANS le scope (liste fermee)

### a) Garanties coeur de protection des biens

| # | Garantie normalisee | Criticite |
|---|---------------------|-----------|
| G01 | Incendie et evenements assimiles | A - critique |
| G02 | Degats des eaux et gel | A - critique |
| G03 | Vol / cambriolage / vandalisme | A - critique |
| G04 | Bris de glace | B - utile |
| G05 | Tempete / grele / neige | A - critique |
| G06 | Catastrophes naturelles / inondation | A - critique |
| G07 | Dommages electriques | B - utile |
| G08 | RC occupant / RC locataire | B - utile (indissociable du MRH LU) |

### b) Parametres contractuels critiques

| # | Parametre | Criticite |
|---|-----------|-----------|
| P01 | Capital batiment (proprietaire) | A - critique |
| P02 | Capital contenu mobilier | A - critique |
| P03 | Franchise generale | A - critique |
| P04 | Franchise specifique vol | B - utile |
| P05 | Franchise specifique degats des eaux | B - utile |
| P06 | Sous-limite objets de valeur | B - utile |
| P07 | Mode d'indemnisation (valeur a neuf : oui/non) | B - utile |
| P08 | Date d'effet / date d'echeance | A - critique |
| P09 | Assureur / nom du produit | A - critique |
| P10 | Prime annuelle TTC | C - indicatif |

### c) Elements laisses en "non evaluable"

| Element | Raison |
|---------|--------|
| Perimetres detailles des garanties (ce que signifie exactement "incendie") | Defini dans les CG, pas dans les CP/TRG. Interpretation juridique requise. |
| Exclusions (liste complete) | Trop longues, nuancees, contextuelles. Faux sentiment de securite si extraites partiellement. |
| Regime de vetuste detaille (bareme, duree, abattement) | Formules complexes dans les CG. La mention "valeur a neuf oui/non" est le maximum extractible. |
| Obligations de l'assure (prevention, declaration) | Conditionnent la couverture mais non extractibles automatiquement. |
| Regle proportionnelle de capitaux | Mecanisme de sous-assurance dans les CG, pas dans les CP. |
| Clauses d'indexation | Variables, cachees, non standardisees. |
| Conditions de resiliation | Hors perimetre adequation. |

## 2.2 Ce qui est HORS scope

| Element exclus | Justification |
|----------------|---------------|
| Assurance auto (DRIVE) | Autre quadrant, autre structure de contrat |
| Prevoyance (B-SAFE) | Donnees de sante art. 9 RGPD = bloqueur |
| Voyage (TRAVEL) | Contrats courts, faible enjeu adequation |
| Epargne / pension (FUTUR) | Produits financiers, reglementation distincte |
| RC vie privee standalone | Contrat separe, pas un MRH |
| Protection juridique standalone | Idem |
| Assistance (depannage, relogement) | Garantie de service, pas de dommages aux biens |
| Garantie scolaire | Hors protection des biens |
| Cyber / e-reputation | Garantie recente, faible penetration, non standardisee |
| Animaux de compagnie | Hors protection des biens |
| Piscine / jardin (detail) | Peut etre mentionne mais pas evalue en profondeur |

**Regle : si c'est absent de cette liste, c'est HORS scope. Pas d'interpretation extensive.**

---

# 3. Proposition de valeur produit reelle

## 3.1 A quoi sert cette fonctionnalite

**Ce qu'elle fait :** elle permet a un client ayant complete le questionnaire "biens" de la Roue des Besoins d'uploader son contrat MRH actuel pour obtenir une premiere lecture automatique de son contenu, comparee a ses besoins declares.

**Ce qu'elle ne promet PAS :**
- Ce n'est PAS un audit de couverture
- Ce n'est PAS un conseil en assurance
- Ce n'est PAS une comparaison de prix
- Ce n'est PAS un certificat de couverture
- Ce n'est PAS une recommandation de produit Baloise

## 3.2 Wordings CTA evalues

| # | Wording | Risque juridique | Impact commercial | Recommandation |
|---|---------|-----------------|-------------------|----------------|
| 1 | "Verifiez si votre assurance habitation vous protege vraiment" | ELEVE -- "vraiment" implique un jugement | Fort | **REJETE** |
| 2 | "Analysez votre couverture habitation" | MOYEN -- "analysez" peut etre lu comme conseil | Fort | ACCEPTABLE avec disclaimer |
| 3 | "Faites le point sur votre assurance habitation" | FAIBLE -- constatation factuelle | Moyen-Fort | **RECOMMANDE** |
| 4 | "Comparez votre contrat habitation a vos besoins" | MOYEN -- "comparez" implique une comparaison qualitative | Fort | ACCEPTABLE avec disclaimer |
| 5 | "Consultez un apercu de votre couverture habitation" | FAIBLE -- "apercu" = modestie assumee | Faible | Trop timide |

**Wording retenu :** "Faites le point sur votre assurance habitation"
**Sous-titre :** "Identifiez les garanties presentes dans votre contrat -- et celles qui ne le sont pas."

**Condition d'affichage :** le CTA n'apparait que si le client a complete le quadrant biens ET a declare posseder un contrat MRH (`home_coverage_existing !== 'none'`).

## 3.3 Insertion dans la Roue des Besoins

Le module est une **brique additionnelle** qui enrichit le diagnostic existant. Il ne remplace ni le scoring, ni les recommandations, ni le tunnel de souscription.

```
Questionnaire biens (7 questions)
         |
         v
Scoring quadrant biens (needScore / coverageScore)
         |
         v
Page resultats --> CTA "Faites le point sur votre assurance habitation"
         |
         v
Upload contrat MRH --> extraction --> adequation
         |
         v
Page adequation (detecte / detecte avec reserve / non detecte / non evaluable par garantie)
         |
         v
CTA principal : "Prendre rendez-vous avec un conseiller"
CTA secondaire : "Telecharger cette synthese"
```

**Avantage du recentrage HOME :** la profondeur remplace l'etendue. Un diagnostic MRH serieux avec 8-10 garanties evaluees individuellement a plus de valeur percue qu'un survol superficiel de 4 branches. Baloise Luxembourg est un acteur de reference en MRH -- c'est une force a exploiter.

---

# 4. Qualification reglementaire et juridique

## 4.1 Position IDD : COMPARAISON INFORMATIVE (niveau b)

La fonctionnalite se situe au niveau de la **comparaison factuelle**, pas du conseil.

| Niveau IDD | Description | Fonctionnalite MRH ? |
|------------|-------------|----------------------|
| a) Information pure | "Votre contrat mentionne X, Y, Z" | Partiellement -- l'extraction seule est de l'information |
| **b) Comparaison** | **"Votre contrat mentionne X mais pas Y par rapport a vos besoins declares"** | **OUI -- c'est exactement ce que fait la fonctionnalite** |
| c) Recommandation | "Nous vous suggerons de souscrire Z" | NON -- aucune suggestion de produit |
| d) Conseil | "Au vu de votre situation personnelle, nous recommandons..." | NON -- aucun conseil personnalise |

**Frontiere a ne pas franchir :**
- **Frontiere de langage :** aucune formulation suggestive ("nous recommandons", "vous devriez", "insuffisant")
- **Frontiere fonctionnelle :** le CTA post-adequation doit etre identique quel que soit le resultat (pas de bouton conditionnel lie a un statut particulier)

**Le recentrage MRH renforce cette qualification :** la MRH est un produit de dommages aux biens -- le registre factuel est plus naturel et defensible que sur la prevoyance ou la sante.

**BLOQUANT :** cette qualification doit etre validee par le service juridique Baloise Luxembourg AVANT la mise en production de l'ecran de restitution client. Le dev backend et l'ecran d'upload peuvent demarrer sans attendre.

## 4.2 Impact RGPD

| Critere | V1 (4 quadrants) | MRH uniquement |
|---------|-------------------|----------------|
| Donnees de sante (art. 9) | OUI (prevoyance, sante) | **NON** |
| Consentement art. 9 separe | Obligatoire | **Non necessaire** |
| DPIA | Obligatoire, complexe (3-4 sem.) | **Necessaire mais allegee (1-2 sem.)** |
| Donnees personnelles | Oui (nom, adresse, patrimoine) | Oui (idem) |
| Consentement art. 6(1)(a) | Requis | Requis (checkbox avant upload) |
| Transfert hors UE | A evaluer selon provider | Mistral = Paris, pas de transfert |

**Condition critique :** le systeme DOIT rejeter tout contrat non-MRH pour eviter de traiter des donnees de sante par accident. Si un utilisateur uploade un contrat prevoyance, le systeme doit detecter le type et refuser le traitement.

## 4.3 Impact AI Act

L'Annexe III point 5(b) du reglement AI Act ne couvre que l'assurance-vie et l'assurance maladie. **La MRH en est exclue.**

| Option technique | Charge AI Act |
|-----------------|---------------|
| OCR structure (pas d'IA) | Aucune |
| Hybride OCR + LLM normalisation | Transparence art. 50 uniquement : informer que l'IA est utilisee |
| Full LLM Vision | Idem |

**Si le scope est elargi a la prevoyance ulterieure, la question AI Act se reouvre.**

## 4.4 Disclaimers precis

**Disclaimer 1 -- Avant upload :**
> "En important votre contrat, vous autorisez Baloise a analyser automatiquement son contenu pour le comparer a vos besoins declares. Cette analyse est fournie a titre informatif et ne constitue ni un conseil en assurance, ni un avis sur l'adequation de votre couverture. Votre document est supprime apres analyse."

**Disclaimer 2 -- Avec les resultats :**
> "Cette analyse repose sur les informations lisibles de votre contrat et sur vos reponses au questionnaire. Elle ne se substitue pas a la lecture de vos conditions generales et particulieres. Consultez votre conseiller pour une analyse detaillee."

**Disclaimer 3 -- Dans le PDF/export :**
> "Document genere automatiquement a titre informatif. Ne constitue pas un conseil en assurance au sens de la Directive sur la Distribution d'Assurance (IDD). Les resultats presentes sont soumis aux reserves liees a la qualite de l'extraction documentaire."

**Ces disclaimers doivent etre valides par le service juridique Baloise Luxembourg avant production.**

## 4.5 Formulations interdites

| INTERDIT | POURQUOI | ACCEPTABLE |
|----------|----------|------------|
| "Vous etes bien assure" | Jugement de valeur = conseil | "Cette garantie semble presente dans votre contrat" |
| "Votre couverture est suffisante" | Appreciation d'adequation = conseil | "Le capital apparait coherent avec votre estimation" |
| "Il vous manque la garantie X" | Directive = conseil | "Cette garantie n'a pas ete detectee dans votre document" |
| "Vous devriez augmenter votre capital" | Injonction = conseil | "Un ecart possible a ete identifie entre votre estimation et le capital detecte" |
| "Vous n'etes pas protege" | Dramatisation = manipulation | "Nous n'avons pas identifie cette garantie dans votre document" |
| Score en pourcentage (78%) | Fausse precision | Statut qualitatif (detecte / non detecte / non evaluable) |
| "Nous recommandons le produit X" | Recommandation = conseil regule | "Un echange avec votre conseiller permettrait de preciser vos besoins" |
| "Couverture insuffisante" | Jugement = conseil | "Ecart possible detecte" |
| "Risque non couvert" | Trop affirmatif sans CG | "Non detecte dans ce document" |
| "Sous-assure" | Terme technique + jugement | "Ecart possible entre le capital assure et votre estimation" |

## 4.6 Points necessitant validation juridique interne

| # | Question | Bloquant ? | Dev peut commencer ? |
|---|----------|-----------|---------------------|
| Q1 | La fonctionnalite MRH constitue-t-elle de l'information ou de la comparaison au sens IDD ? | **OUI -- bloquant ecran de restitution** | Backend + upload : oui. Ecran resultats : non. |
| Q2 | Les disclaimers proposes sont-ils juridiquement suffisants ? | **OUI -- bloquant production** | Dev avec disclaimers provisoires : oui |
| Q3 | Le traitement de contrats concurrents pose-t-il un probleme de secret des affaires ? | Bloquant production | Oui |
| Q4 | Le consentement par checkbox avant upload est-il suffisant ou faut-il une co-signature ? | Non bloquant dev | Oui |
| Q5 | La mention "sous reserve" suffit-elle a exonerer Baloise en cas de faux positif ? | Important | Oui |

---

# 5. Modele metier d'adequation

## 5.1 Les 4 statuts -- definition precise en contexte MRH

| Statut interne | Libelle client FR | Libelle client DE | Icone | Couleur | Definition precise |
|----------------|-------------------|-------------------|-------|---------|-------------------|
| **detected** | Detecte dans votre contrat | In Ihrem Vertrag erkannt | Check | Ambre (PAS vert) | La garantie semble presente ET le capital/plafond est dans la fourchette standard du marche LU. TOUJOURS accompagne de "Verifiez les conditions exactes avec votre conseiller." |
| **partial** | Detecte avec reserve | Mit Vorbehalt erkannt | Triangle | Ambre fonce | La garantie semble presente MAIS capital/plafond inferieur au standard OU franchise elevee (> 500 EUR) OU sous-limite insuffisante par rapport aux biens declares. |
| **not_detected** | Non detecte dans ce document | In diesem Dokument nicht erkannt | Croix | Rouge doux | La garantie n'a pas ete identifiee dans le document. "Cela ne signifie pas necessairement qu'elle est absente de votre contrat." |
| **not_evaluable** | Non evaluable | Nicht bewertbar | Point d'interrogation | Gris | Information insuffisante, champ non extractible, ou confiance d'extraction < 0.75. "Consultez votre contrat ou votre conseiller." |

**Decision critique du Risk Manager :** le statut "detecte" utilise une icone AMBRE, pas verte. Le vert donnerait un faux sentiment de securite. L'ambre signale "a priori present, mais a verifier". C'est la mitigation la plus forte contre le faux positif.

**Decision critique de l'Actuaire :** si la franchise ou le plafond n'est pas extrait avec confiance >= 0.75, le statut est "non evaluable", JAMAIS "detecte". Mieux vaut un exces de prudence.

## 5.2 Seuils de reference pour "detecte avec reserve" vs "detecte"

| Champ | Seuil "detecte" | Seuil "detecte avec reserve" | Source |
|-------|----------------|------------------------------|--------|
| Capital contenu | >= 70% de la tranche declaree par le client | 40-70% de la tranche declaree | Croisement questionnaire / extraction |
| Franchise principale | <= 500 EUR | 501-1 500 EUR | Standard marche LU |
| Franchise degats des eaux | <= 300 EUR | 301-1 000 EUR | Standard marche LU |
| Sous-limite objets de valeur | >= 30% du capital contenu | 15-30% | Ratio standard Baloise HOME |
| RC occupant (plafond) | >= 2 500 000 EUR | 1 500 000 - 2 500 000 EUR | Norme marche LU |

**Ces seuils sont des INDICATEURS, pas des verdicts.** Tout statut "detecte" porte la mention "sous reserve".

## 5.3 Hierarchie des champs

### Niveau A -- Champs porteurs d'un avis robuste

| Champ | Confiance attendue | Justification |
|-------|--------------------|---------------|
| Assureur / produit | > 95% | En-tete standardise |
| N° contrat | > 90% | Format reconnaissable |
| Qualite d'occupation (proprietaire / locataire) | > 85% | Structurant, CP |
| Capital batiment | > 85% | Chiffre, CP/TRG |
| Capital contenu | > 85% | Chiffre, CP/TRG |
| Franchise generale | > 80% | Chiffre, CP/TRG |
| Liste des garanties actives | > 75% | CP/TRG, necessite normalisation |
| Dates d'effet / echeance | > 90% | Structurees |

### Niveau B -- Champs exploitables avec reserve

Sous-limite objets de valeur, franchise vol, franchise degats des eaux, catastrophes naturelles (mention), prime TTC, valeur a neuf (mention oui/non), RC occupant (mention), surface.

### Niveau C -- Champs indicatifs (ne soutiennent jamais seuls une conclusion)

Bris de glace, dommages electriques, troubles du voisinage, recours des voisins, formule/niveau de garantie.

### Niveau D -- Non exploitables

Perimetres detailles des garanties, exclusions, regime de vetuste, obligations de l'assure, regle proportionnelle, clauses d'indexation.

## 5.4 Sous-assurance

**Verdict : le systeme NE PEUT PAS detecter la sous-assurance de maniere fiable.**

Le systeme n'a acces qu'au capital assure (CP/TRG) mais PAS a la valeur reelle du bien. Traitement :

1. **Alertes objectives** (automatisables) : capital contenu < 10 000 EUR → alerte / capital batiment / surface < 1 500 EUR/m2 → alerte indicative
2. **Message pedagogique** (systematique) : "L'adequation de vos capitaux a la valeur reelle de vos biens ne peut etre verifiee automatiquement. Verifiez regulierement que vos capitaux correspondent a la valeur actuelle de votre habitation."
3. **Renvoi conseiller** : si alertes declenchees

**INTERDIT :** donner un verdict "couverture suffisante" ou "couverture insuffisante" base sur des heuristiques.

---

# 6. Referentiel metier HOME / protection des biens

## 6.1 Referentiel -- 16 garanties normalisees

| # | Garantie normalisee | Synonymes assureurs LU | Type donnee | Criticite | Extractibilite | Piege principal |
|---|---------------------|----------------------|-------------|-----------|---------------|-----------------|
| 1 | Incendie / explosion | Feuer/Brand (DE), Incendie et perils assimiles | Boolean inclus | A | Haute | Toujours present -- le piege est l'exclusion cachee dans les CG |
| 2 | Degats des eaux | Wasserschaden, Leitungswasserschaden, DDE, Gel | Boolean inclus | A | Haute | "Leitungswasserschaden" (conduite) ≠ "Wasserschaden" (au sens large). Inondation souvent separee |
| 3 | Vol / cambriolage | Diebstahl, Einbruchdiebstahl, Vandalismus | Boolean + plafond EUR | A | Haute | "Diebstahl" (vol simple) vs "Einbruchdiebstahl" (effraction) -- MRH couvre le second. Option chez Baloise, base chez d'autres |
| 4 | Bris de glace | Glasbruch, Bris de vitres | Boolean inclus | B | Moyenne | Perimetre variable (vitres seules ? plaques vitroceramiques ? panneaux solaires ?) |
| 5 | Tempete / grele / neige | Sturm, Hagel, Schneedruck, Evenements climatiques | Boolean inclus | A | Haute | Souvent integre dans "evenements climatiques" sans distinction |
| 6 | Catastrophes naturelles | Naturkatastrophen, Elementarschaden, Inondation | Boolean + franchise EUR | A | Moyenne | "Elementarschaden" (DE) est plus large que "catastrophes naturelles" (FR). Pas de regime Cat-Nat au Luxembourg |
| 7 | Dommages electriques | Elektrische Schaden, Surtension, Uberspannung | Boolean + plafond EUR | B | Moyenne | Sous-limite rarement dans CP. Systematique chez Baloise, optionnel chez certains |
| 8 | RC occupant | Haftpflicht, RC locative, RC batiment | Boolean + plafond EUR | B | Moyenne | Peut etre integree au MRH ou en contrat RC vie privee separe |
| 9 | Capital batiment | Gebaudewert, Valeur de reconstruction, Valeur batiment | Capital EUR | A | Haute | Peut etre exprime en "indice" (ABEX) plutot qu'en EUR. Absent si locataire |
| 10 | Capital contenu | Inhalt, Mobiliar, Hausrat, Biens mobiliers | Capital EUR | A | Haute | Terminologie tres variable. Peut inclure ou exclure les objets de valeur |
| 11 | Franchise generale | Selbstbeteiligung, Selbstbehalt, Eigenanteil | Montant EUR | A | Haute | Confusion franchise absolue / relative / par evenement. Franchises specifiques cachees |
| 12 | Franchise vol | Franchise specifique vol | Montant EUR | B | Moyenne | Peut etre identique a la franchise generale ou differenciee. Pas toujours visible dans les CP |
| 13 | Franchise degats des eaux | Franchise specifique DDE | Montant EUR | B | Moyenne | Idem vol |
| 14 | Sous-limite objets de valeur | Wertsachen, Bijoux, Objets precieux | Sous-limite EUR | B | Moyenne | Perimetre "objet de valeur" variable entre assureurs. Souvent 2 000-5 000 EUR par objet |
| 15 | Valeur a neuf | Neuwert, Wiederbeschaffungswert, Reequipement a neuf | Boolean oui/non | B | Haute (mention) | Extraire "oui/non" est fiable. Extraire les conditions (duree, bareme) ne l'est pas |
| 16 | Recours des voisins | Nachbarregress, Recours des tiers | Boolean inclus | C | Basse | Confusion avec RC occupant. Souvent inclus mais plafond variable |

## 6.2 HORS referentiel

Assistance (depannage, relogement), protection juridique standalone, garantie scolaire, piscine/jardin (detail), cyber/e-reputation, animaux, loyers impayes, panneaux solaires (detail), home office, garantie all-risk.

## 6.3 Documents sources cibles

**CP + TRG = base minimale viable.** L'IPID est un bonus pour confirmer presence/absence d'une garantie.

**Verdict :** le systeme est credible avec CP + TRG pour repondre a :
- "Quelles garanties figurent dans mon contrat ?" → OUI
- "Quels sont mes capitaux et franchises ?" → OUI
- "Mon contrat est-il en vigueur ?" → OUI

Le systeme n'est PAS credible pour repondre a :
- "Suis-je suffisamment assure ?" → NON (necessite CG + evaluation du bien)
- "Que signifie exactement ma garantie incendie ?" → NON (necessite CG)
- "Quelles sont mes exclusions ?" → NON (necessite CG)

---

# 7. Architecture fonctionnelle cible

## 7.1 Parcours client

```
Etape 1 : DECLENCHEMENT
   Questionnaire biens complete + home_coverage_existing !== 'none'
   → CTA "Faites le point sur votre assurance habitation"

Etape 2 : UPLOAD
   Ecran unique : "Importer votre document"
   → Formats acceptes : PDF (recommande), JPEG, PNG -- 10 Mo maximum
   → Sous-texte : "Pour une analyse automatique, importez de preference le PDF
     recu de votre assureur. Les photos de documents seront acceptees mais
     pourront necessiter une saisie complementaire."
   → Disclaimer consent (checkbox)

Etape 3 : CONFIRMATION RAPIDE (1 ecran, PAS de wizard)
   Pre-rempli depuis le questionnaire :
   - Type de bien (appartement/maison)
   - Statut (proprietaire/locataire)
   → Le client confirme ou corrige ces 2 champs

Etape 4 : TRAITEMENT
   Si PDF natif (texte > 50 chars/page) → extraction automatique Mistral
   Si scan / image / PDF image → message :
     "Votre document n'a pas pu etre analyse automatiquement.
      Vous pouvez reessayer avec le PDF original de votre assureur
      ou completer manuellement les informations de votre contrat."
   Cas automatique : loader avec estimation ("Analyse en cours, environ 30 sec.")
   → Le client peut quitter et revenir

Etape 5 : RESULTAT
   Vue synthetique : nombre de points par statut
   Detail par garantie : 8-10 lignes max
   Bandeau permanent : disclaimer
   → CTA principal : "Prendre rendez-vous avec un conseiller"
   → CTA secondaire : "Telecharger cette synthese"

Etape 6 : ACTION
   Si RDV → lead qualifie pousse au conseiller avec le rapport
   Si telechargement PDF → trace audit
```

## 7.2 Decisions tranchees

| Question | Decision | Justification |
|----------|----------|---------------|
| Upload direct ? | **OUI** -- un seul bouton, pas de selection de type | Chaque etape divise le taux de completion par 2 |
| Formats acceptes ? | **PDF + JPEG + PNG** -- mais seuls les PDF natifs sont traites automatiquement | Les images sont redirigees vers saisie manuelle sans promesse implicite |
| Validation legere ou guidee ? | **Legere** -- 1 ecran, 2 champs | Le wizard est pour la souscription, pas le diagnostic |
| Donnees a confirmer par le client ? | Type de bien + statut (min. absolu) | Structurant pour le matching, pre-rempli depuis questionnaire |
| Le conseiller intervient quand ? | **APRES le resultat** | Il recoit le lead enrichi, pas un formulaire a valider |
| Faut-il un ecran "verification" ? | **NON** -- le bandeau disclaimer suffit | Exception : si > 60% de "non evaluable", message specifique |

## 7.3 UX de l'incertitude (Art Director)

- Statuts visuellement distincts : check ambre (detecte), triangle ambre fonce (detecte avec reserve), croix rouge doux (non detecte), "?" gris (non evaluable)
- "Non evaluable" est visuellement DISTINCT de "non detecte" -- pas la meme couleur, pas le meme icone
- Nombre d'elements non evaluables affiche clairement
- Presentation : d'abord ce qui est detecte, puis les reserves, puis les non detectes
- Le client voit d'abord la partie pleine du verre
- Chaque statut est accompagne d'une phrase d'explication factuelle et d'un renvoi conseiller

## 7.4 Matrice de demarrage IDD

**Regle unique :** tout ce qui ne montre pas de resultat d'adequation au client peut demarrer avant validation IDD. Tout ce qui affiche un statut au client est bloque.

| Composant | Peut demarrer avant IDD ? | Condition |
|-----------|:-------------------------:|-----------|
| Backend : migration Supabase, table, RLS, bucket | OUI | Aucune |
| Backend : Background Function (pdf-parse + Mistral) | OUI | Aucune |
| Backend : moteur d'adequation TypeScript + tests | OUI | Tests sur donnees fictives, pas d'exposition client |
| Backend : schema Zod + validation | OUI | Aucune |
| CTA factice (Phase 0) | OUI | Ne delivre aucun resultat, mesure l'appetence |
| Ecran d'upload + confirmation (2 champs) | OUI | Collecte un document, ne restitue rien. Disclaimer requis |
| Ecran de restitution des resultats | **NON** | Affiche des statuts = cree le risque IDD |
| Wordings des statuts client | **NON** | Doivent etre valides avec le juridique |
| PDF export adequation | **NON** | Contient les resultats = meme blocage |
| Parcours conseiller (vue rapport) | **NON** | Idem |

---

# 8. Position technologique

## 8.1 Le scope MRH change-t-il la donne technique ?

**Oui, significativement.** Le scope MRH Luxembourg est un domaine considerablement plus restreint que la V1 : 5 assureurs, 16 garanties, 2 langues, champs connus a l'avance. Cela reduit la complexite, mais ne l'elimine pas. Les contrats MRH luxembourgeois presentent une heterogeneite reelle : conventions de presentation differentes entre assureurs, terminologie variable (y compris au sein d'un meme assureur selon la generation du contrat), champs parfois absents ou fusionnes dans les tableaux.

Ce n'est plus un probleme de comprehension ouverte du langage naturel, mais ce n'est pas non plus un simple pattern matching. C'est un probleme de **structuration guidee avec supervision humaine legere**.

## 8.2 Comparaison des 3 options

| Critere | A : OCR + regles | B : pdf-parse + LLM texte | C : Full LLM vision |
|---------|:---:|:---:|:---:|
| Precision PDF natifs MRH | 80-88% | **92-96%** | 93-96% |
| Precision scans | 0% (sans OCR) | 70-80% (Tesseract) | **88-93%** |
| Testabilite CI/CD | **Excellente** | Partielle | Faible |
| Cout mensuel (500p) | **0 EUR** | 8-15 EUR | 15-25 EUR |
| Charge reglementaire | **Nulle** | Moderee (art. 50 AI Act) | Moderee |
| Effort implementation | 10-15j | **8-10j** | 5-7j |
| Maintenance prompt / mapping | N/A (dictionnaire lourd) | **Legere** (prompt MRH, revue trimestrielle) | **Legere** |
| Risque hallucination | **Zero** | Faible | Modere |
| Gestion FR/DE bilingue | Rigide | **Excellente** | **Excellente** |
| Robustesse nouveaux formats | Fragile | **Bonne** | **Bonne** |

## 8.3 Recommandation : Option B -- pdf-parse + Mistral Large (texte seul)

L'Option B (pdf-parse + Mistral Large texte seul) est la recommandation. Le scope MRH ferme reduit considerablement la complexite mais ne l'elimine pas. Le LLM remplace le dictionnaire de regles explicite, pas le besoin de normalisation.

Raisonnement :
1. L'ecrasante majorite des contrats MRH sont des **PDF natifs** (generes numeriquement). Envoyer une image la ou du texte propre suffit = gaspillage de tokens (cout 2x)
2. Le texte extrait par pdf-parse est **fidele** (c'est le texte original). Le LLM n'a qu'a le structurer en JSON
3. Le scope etroit (16 garanties connues) permet un prompt **tres directif** -- l'espace d'hallucination est reduit
4. Le prompt MRH contient une table de mapping des 16 garanties avec leurs synonymes FR/DE connus. Ce prompt est un artefact a maintenir : revise a chaque ajout d'assureur et lors du monitoring mensuel
5. Mistral = Paris, RGPD conforme sans DPA supplementaire
6. Cout optimal : 8-15 EUR/mois pour 500 pages

**Le chemin vision (Pixtral) est le fallback pour les scans** -- branche conditionnelle, pas chemin par defaut. En Phase 1, si le PDF n'est pas natif, le systeme redirige vers la saisie manuelle.

**Le LLM est un accelerateur, pas un pilote automatique.** Prevoir 0.5 jour/mois de maintenance du prompt MRH et du monitoring qualite.

### Ce qu'on automatise / supervise / n'essaie pas

| On automatise | On supervise | On n'essaie pas |
|---------------|-------------|-----------------|
| Extraction texte brut via pdf-parse | Taux de "non evaluable" par assureur (dashboard mensuel) | Interpretation des Conditions Generales |
| Structuration JSON via Mistral Large avec prompt MRH directif | Taux de correction utilisateur par champ (ecran validation) | Extraction des exclusions ou des baremes de vetuste |
| Validation schema via Zod (enum ferme, bornes montants) | Coherence extraction vs avis conseiller (echantillon 20 cas/mois) | Detection automatique de la sous-assurance |
| Detection PDF natif vs scan (seuil 50 chars/page) | Revue prompt trimestrielle (ajout synonymes, nouveaux formats) | Mapping automatique de champs inconnus (→ non evaluable) |
| Classification MRH / non-MRH (rejet si hors scope) | Alertes sur hallucination (montant hors bornes, garantie non MRH) | Traitement des documents manuscrits ou illegibles |

**Pipeline :**

```
Upload document → Supabase Storage (bucket prive)
    |
    v
Netlify Background Function (timeout 15 min)
    |
    v
pdf-parse → texte extrait
    |
    v
Texte > 50 chars/page ?
    |           |
   OUI         NON
    |           |
    v           v
Mistral Large   Status 'manual' → saisie manuelle
(texte seul)
    |
    v
Validation Zod (schema MRH strict, enum garanties)
    |
    v
UPDATE contract_uploads (status: 'completed', extracted_data: JSONB)
    |
    v
Frontend : Supabase Realtime → affichage
    |
    v
Moteur d'adequation TypeScript (fonction pure, client-side)
```

## 8.4 Schema TypeScript MRH

```typescript
export type MrhGuaranteeId =
  | 'fire' | 'water_damage' | 'theft' | 'glass_breakage'
  | 'storm' | 'natural_disaster' | 'electrical_damage'
  | 'liability' | 'valuables'

export interface MrhGuarantee {
  id: MrhGuaranteeId
  included: boolean
  limit_eur: number | null
  deductible_eur: number | null
  confidence: number  // 0-1
}

export interface MrhExtractedData {
  insurer: string
  product_name: string | null
  contract_number: string | null
  effective_date: string | null
  expiry_date: string | null
  annual_premium_eur: number | null
  contents_capital_eur: number | null
  building_capital_eur: number | null
  general_deductible_eur: number | null
  new_value_replacement: boolean | null
  guarantees: MrhGuarantee[]
  language_detected: 'fr' | 'de' | 'mixed'
  extraction_confidence: 'high' | 'medium' | 'low'
}

export type AdequacyStatus = 'detected' | 'partial' | 'not_detected' | 'not_evaluable'

export interface GuaranteeAdequacy {
  guaranteeId: MrhGuaranteeId
  label: string
  status: AdequacyStatus
  detail: string
  contractValue: string | null
  needValue: string | null
}
```

---

# 9. Strategie de phasage realiste

## Phase 0 : Validation marche (4 semaines)

| Element | Detail |
|---------|--------|
| **Action** | Deployer CTA factice "Faites le point sur votre assurance habitation" sur ResultsPage |
| **Condition** | Uniquement si quadrant biens complete + contrat MRH declare |
| **Mesure** | Taux de clic pendant 4 semaines |
| **Seuil GO** | > 10% de taux de clic |
| **Seuil NO-GO** | < 5% → reconsiderer la priorite |
| **Effort** | 2 jours dev |
| **En parallele** | Lancer la qualification IDD avec le juridique + DPIA allegee + constitution du corpus |

## Phase 1 : Minimale credible (6-8 semaines dev)

| Element | Detail |
|---------|--------|
| **Scope** | PDF natifs + images acceptees (images redirigees vers saisie manuelle). Multi-assureurs (Baloise + Foyer + La Lux + AXA + Lalux) |
| **Extraction** | pdf-parse + Mistral Large (texte seul). Pas de vision. |
| **Fallback** | Si document non exploitable automatiquement (scan, image, PDF image) → saisie manuelle structuree. Aucune promesse d'analyse automatique pour les images. |
| **Garanties** | 8 garanties A (coeur) + 8 parametres contractuels |
| **Adequation** | Moteur TypeScript pur, 4 statuts, deterministe |
| **UI** | Upload + confirmation + resultats + PDF export |
| **GO/NO-GO** | IDD validee + DPIA validee + precision champs A >= 85% sur corpus pilote + faux positifs < 10% + coherence conseiller >= 75% |

**Decisions tranchees Phase 1 :**
- **PDF natifs = extraction automatique.** Les scans/photos sont acceptes mais reroutes vers saisie manuelle. Pas de branche vision en Phase 1.
- **Multi-assureurs des Phase 1** : la valeur de l'outil est precisement de comparer les contrats de differents assureurs. Baloise-only serait un gadget.
- **Transparence sur les limites** : si le document n'est pas exploitable automatiquement, le systeme l'indique clairement et propose une alternative.

## Phase 2 : Enrichissement (6-10 semaines apres Phase 1)

| Element | Detail |
|---------|--------|
| **Scope** | Ajout scans/photos via Pixtral (vision). Ajout IPID pour validation croisee |
| **Garanties** | Ajout des 8 garanties B (utiles) |
| **UX** | Parcours conseiller (vue du rapport client, feedback post-RDV) |
| **Adequation** | Alertes sous-assurance (niveau 1 : seuils planchers) |
| **GO/NO-GO** | Precision Phase 1 >= 85% en production ET taux correction utilisateur < 30% ET feedback conseillers positif |

## Phase 3 : Extension eventuelle (pas avant S2 2027)

| Element | Detail |
|---------|--------|
| **Scope eventuel** | Extension a l'auto (DRIVE) ou a la prevoyance (B-SAFE) |
| **Prerequis** | Precision MRH >= 90% en production + ROI commercial demontre |
| **Alerte** | L'extension a la prevoyance reouvre l'art. 9 RGPD + AI Act Annexe III |

---

# 10. Risques majeurs et contre-mesures

## Top 10 par criticite (impact x probabilite)

| # | Risque | Prob. | Impact | Criticite | Mitigation |
|---|--------|-------|--------|-----------|------------|
| R1 | **Faux positif "detecte"** : systeme detecte une garantie, client ne l'a pas reellement (franchise elevee, exclusion cachee, sous-limite) | Elevee | Critique | **1** | Icone ambre (pas vert), confiance >= 0.75 sinon "non evaluable", disclaimer systematique, CTA conseiller |
| R2 | **Requalification IDD** : le CAA considere l'outil comme du conseil | Faible | Bloquant | **2** | Qualification IDD prealable, formulations interdites, CTA identique quel que soit le resultat |
| R3 | **Sous-assurance non detectee** : capital contenu insuffisant, systeme ne le signale pas | Elevee | Majeur | **3** | Message pedagogique systematique, alertes seuils planchers, renvoi conseiller |
| R4 | **Interpretation abusive du client** : croit que l'analyse est un certificat de couverture | Moyenne | Majeur | **4** | Bandeau disclaimer permanent, pas de vert, "sous reserve" sur chaque statut |
| R5 | **Heterogeneite des contrats MRH LU** : terminologie, structure, format variables entre assureurs | Elevee | Significatif | **5** | Prompt MRH avec mapping synonymes, monitoring par assureur, fallback "non evaluable" |
| R6 | **Fuite de donnees concurrentielles** : contrats Foyer/AXA stockes par Baloise | Faible | Majeur | **6** | Zero retention du document source post-extraction, pas de stockage texte brut, RGPD minimisation |
| R7 | **Hallucination LLM** : montant ou garantie invente | Moyenne | Significatif | **7** | Schema Zod strict, enum ferme pour garanties, validation montants, confiance < 0.75 → non evaluable |
| R8 | **Derive du prompt** : assureurs changent formulations, qualite d'extraction decline | Elevee | Significatif | **8** | Monitoring mensuel taux de "non evaluable" par assureur, alerte si > 40%, revue prompt trimestrielle |
| R9 | **Indisponibilite API Mistral** | Faible | Significatif | **9** | Fallback saisie manuelle, retry avec backoff, message utilisateur gracieux |
| R10 | **Reputation** : un faux resultat mediatise | Faible | Critique | **10** | Beta fermee obligatoire (4 sem., 20 clients reels), seuil go/no-go strict |

---

# 11. KPIs et criteres de succes

## 11.1 KPIs d'appetence (Phase 0)

| KPI | Seuil GO | Seuil NO-GO | Mesure |
|-----|----------|-------------|--------|
| Taux de clic CTA | > 10% | < 5% | Analytics |
| Taux de completion upload (clic → document uploade) | > 40% | < 20% | Funnel analytics |

## 11.2 KPIs de qualite -- 3 niveaux

| KPI | Build interne | Beta fermee (20 clients, 4 sem.) | Ouverture elargie |
|-----|:---:|:---:|:---:|
| Precision extraction champs A (critiques) | >= 75% sur corpus calibration | >= 85% sur corpus pilote | >= 90% en production |
| Precision extraction champs B (utiles) | >= 60% | >= 70% | >= 80% |
| Taux faux positifs "detecte" | < 20% | < 10% | < 5% |
| Taux "non evaluable" par garantie A | < 40% | < 25% | < 15% |
| Coherence avec avis conseiller | Non mesurable | >= 75% sur echantillon | >= 85% sur echantillon mensuel |
| Taux reclamation client | N/A | < 5% | < 2% |
| Taux correction utilisateur | Non mesurable | < 30% | < 15% |
| Temps d'extraction | < 30 sec | < 30 sec | < 15 sec |
| Taux d'echec (status 'failed') | < 10% | < 5% | < 3% |
| Cout par extraction | < 0.05 EUR | < 0.05 EUR | < 0.03 EUR |

**Regles de passage :**
- Build → Beta : tous seuils Build atteints + IDD validee + DPIA validee
- Beta → Ouverture : tous seuils Beta atteints pendant 4 semaines consecutives + zero incident critique
- Si seuils Beta non atteints apres 6 semaines : STOP, recalibration obligatoire, nouveau cycle beta

## 11.3 KPIs de transformation commerciale

| KPI | Cible | Mesure |
|-----|-------|--------|
| Taux de conversion adequation → RDV conseiller | > 25% | CRM |
| Taux de transformation RDV → offre | > 40% | CRM |

## 11.4 KPIs de risque / incidents

| KPI | Seuil alerte | Action |
|-----|-------------|--------|
| Reclamation client liee a l'adequation | > 2/mois | Revue immediate |
| Faux positif detecte par conseiller | > 15% | Suspension + recalibration |
| Derive qualite (taux non evaluable en hausse) | +10pts en 1 mois | Investigation + revue prompt |

---

# 12. Estimation de charge realiste

## Version minimale credible (Phase 0 + Phase 1)

| Poste | Estimation | Faisable par 1 dev ? |
|-------|-----------|---------------------|
| CTA factice (Phase 0) | 2 jours | Oui |
| Migration Supabase (table + RLS + bucket Storage) | 2 jours | Oui |
| Netlify Background Function (pdf-parse + Mistral) | 5 jours | Oui |
| Prompt engineering + calibration MRH | 5 jours | Oui, mais necessite corpus |
| Moteur d'adequation TypeScript + tests | 4 jours | Oui |
| Schema Zod + validation | 2 jours | Oui |
| UI upload + confirmation + resultats | 5 jours | Oui |
| PDF export adequation | 2 jours | Oui |
| Mise a jour delete_my_data / export_my_data | 1 jour | Oui |
| Audit trail (log_audit_event) | 1 jour | Oui |
| Tests integration + corpus 50 contrats (dont annotation) | 8 jours | Oui, si corpus disponible |
| **TOTAL** | **37 jours = 8-9 semaines** | **Oui, 1 dev** |

## Version confort (Phase 0 + Phase 1 + Phase 2)

| Poste supplementaire | Estimation |
|---------------------|-----------|
| Branche vision Pixtral (scans/photos) | 5 jours |
| Parcours conseiller (vue client + feedback) | 5 jours |
| Alertes sous-assurance | 3 jours |
| Tests supplementaires + corpus elargi | 5 jours |
| **TOTAL Phase 1 + Phase 2** | **55 jours = 12-14 semaines** |

## Corpus structure

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

**En dessous de 30 contrats annotes couvrant au moins 4 assureurs sur 5, on ne peut pas conclure sur la precision d'extraction. En dessous de 50 contrats, on ne peut pas autoriser une ouverture elargie.**

## Prerequis bloquants

| Prerequis | Responsable | Delai estime | Bloque quoi ? |
|-----------|------------|-------------|---------------|
| Qualification IDD | Service juridique Baloise | 2-4 semaines | Ecran de restitution client |
| DPIA allegee | DPO Baloise | 1-2 semaines | Production |
| Corpus 50 contrats MRH (15-20 calibration + 30-40 pilote) | PM + UX | 3-6 semaines | Prompt engineering + tests |
| Validation disclaimers | Service juridique | 1-2 semaines | Production |

**Alerte charge :** le corpus de 50 contrats MRH reels de 5 assureurs est le prerequis le plus difficile a obtenir. Sans contrats reels, le prompt engineering est un travail theorique. Le PM doit mobiliser des contacts internes (Baloise) et des clients volontaires (concurrence) pour constituer ce corpus des le lancement de Phase 0.

---

# 13. Recommandation finale collegiale

## Verdict : GO CONDITIONNEL -- perimetre MRH uniquement

### Ce qu'il faut lancer MAINTENANT

1. **CTA factice** sur ResultsPage (2 jours) -- mesure d'appetence pendant 4 semaines
2. **Qualification IDD** avec le service juridique Baloise Luxembourg (en parallele)
3. **DPIA allegee** MRH (en parallele, 1-2 semaines)
4. **Constitution du corpus** de 50 contrats MRH reels multi-assureurs (15-20 calibration + 30-40 pilote)
5. **Dev backend** : migration Supabase + Background Function + moteur d'adequation + ecran d'upload (peut commencer des maintenant, pas bloque par IDD)

### Ce qu'il faut REPOUSSER

| Element | Reporte a | Raison |
|---------|-----------|--------|
| Scans / photos (vision LLM) | Phase 2 | Cas minoritaire, effort +30%, risque OCR |
| Extension a d'autres quadrants (auto, prevoyance) | Phase 3, pas avant S2 2027 | Reouvre art. 9 RGPD + AI Act |
| Fine-tuning de modele | Jamais en V2 | Injustifie a 500 pages/mois |
| Score en pourcentage | JAMAIS | Fausse precision, risque reglementaire |
| Comparaison de prix entre assureurs | JAMAIS | Hors perimetre IDD |
| Stockage long terme des documents sources | JAMAIS | RGPD minimisation + secret des affaires |

### Ce qu'il faut INTERDIRE

1. Toute formulation suggestive ou directive (cf. liste des 10 formulations interdites)
2. Tout statut "detecte" en vert (uniquement ambre)
3. Tout CTA contextuel qui n'apparait que devant un statut particulier
4. Tout stockage du document source au-dela de l'extraction
5. Tout stockage du texte brut extrait (secret des affaires)
6. Toute extraction des Conditions Generales (trop risque)
7. Tout verdict automatique de sous-assurance

### Decision CPO

**Lancer Phase 0 (CTA factice) + dev backend + ecran d'upload immediatement. Bloquer l'ecran de restitution et les wordings jusqu'a validation IDD. Constituer le corpus de 50 contrats en parallele.**

Le recentrage MRH transforme un projet ambitieux et risque en un projet sobre, testable et defensible. La valeur est dans la profondeur (8-10 garanties evaluees serieusement) et non dans l'etendue. Le scope ferme est une force, pas une limite.

**Budget :** 8-9 semaines dev (1 developpeur) + 8-15 EUR/mois API Mistral + 0.5 jour/mois maintenance prompt.
**Pre-requis critiques :** IDD + DPIA + corpus 50 contrats.
**Go/No-Go Phase 1 :** CTA > 10% ET IDD favorable ET DPIA validee ET precision champs A >= 85% sur corpus pilote ET faux positifs < 10% ET coherence conseiller >= 75%.

---

*Note etablie le 28 mars 2026 par le college des 14 agents specialises pour decision en comite produit.*
*Les analyses detaillees de chaque agent sont disponibles dans les documents de travail associes.*
