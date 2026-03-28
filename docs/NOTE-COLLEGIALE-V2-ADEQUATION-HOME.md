# Note collegiale V2 -- Adequation contrats : Protection des Biens (HOME)

> Roue des Besoins Assurance -- Baloise Luxembourg
> Version 2.0 -- 28 mars 2026
> Statut : NOTE DECISIONNELLE POUR COMITE PRODUIT
> Contributeurs : 14 agents specialises (PM, Insurance PM Habitation, Sales Architect, Compliance Officer, Legal Counsel, Risk Manager, Internal Audit, Senior Underwriting Expert, Actuaire Senior, Process Architect, IT Architect, Security Architect, QA Expert, Art Director)
> Supersede : V1 (perimetre 4 quadrants, 48 garanties)

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

**Recommandation en 10 lignes :** Lancer la V2 sur le perimetre MRH uniquement, avec une Phase 0 de validation marche (CTA factice, 4 semaines), puis une Phase 1 en extraction automatique PDF natifs via pdf-parse + Mistral Large (texte seul). Le full LLM vision n'est PAS le chemin par defaut -- le scope etroit MRH rend l'OCR structuree + normalisation LLM plus efficace et moins chere. La restitution est categorique (couvert / partiel / gap / non evaluable), jamais en pourcentage, toujours sous reserve. Les 2 bloqueurs absolus restent la qualification IDD (a valider par le juridique Baloise) et la DPIA (meme allegee). Le dev peut commencer sur le moteur d'adequation et l'UI pendant que ces validations sont en cours. Ne pas etendre au-dela de HOME avant d'avoir mesure la precision reelle sur 50+ contrats luxembourgeois.

---

# 2. Definition stricte du perimetre V2

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

### c) Elements laisses en "non evaluable" en V2

| Element | Raison |
|---------|--------|
| Perimetres detailles des garanties (ce que couvre exactement "incendie") | Defini dans les CG, pas dans les CP/TRG. Interpretation juridique requise. |
| Exclusions (liste complete) | Trop longues, nuancees, contextuelles. Faux sentiment de securite si extraites partiellement. |
| Regime de vetuste detaille (bareme, duree, abattement) | Formules complexes dans les CG. La mention "valeur a neuf oui/non" est le maximum extractible. |
| Obligations de l'assure (prevention, declaration) | Conditionnent la couverture mais non extractibles automatiquement. |
| Regle proportionnelle de capitaux | Mecanisme de sous-assurance dans les CG, pas dans les CP. |
| Clauses d'indexation | Variables, cachees, non standardisees. |
| Conditions de resiliation | Hors perimetre adequation. |

## 2.2 Ce qui est HORS scope (V2 uniquement)

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

**Ce qu'elle fait :** elle permet a un client ayant complete le questionnaire "biens" de la Roue des Besoins d'uploader son contrat MRH actuel pour obtenir une premiere lecture automatique de sa couverture, comparee a ses besoins declares.

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
**Sous-titre :** "Identifiez ce que votre contrat couvre -- et ce qu'il ne couvre pas."

**Condition d'affichage :** le CTA n'apparait que si le client a complete le quadrant biens ET a declare posseder un contrat MRH (`home_coverage_existing !== 'none'`).

## 3.3 Insertion dans la Roue des Besoins

Le module V2 est une **brique additionnelle** qui enrichit le diagnostic existant. Il ne remplace ni le scoring, ni les recommandations, ni le tunnel de souscription.

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
[V2] Upload contrat MRH --> extraction --> adequation
         |
         v
Page adequation (couvert/partiel/gap/non evaluable par garantie)
         |
         v
CTA principal : "Prendre rendez-vous avec un conseiller"
CTA secondaire : "Telecharger cette synthese"
```

**Avantage du recentrage HOME :** la profondeur remplace l'etendue. Un diagnostic MRH serieux avec 8-10 garanties evaluees individuellement a plus de valeur percue qu'un survol superficiel de 4 branches. Baloise Luxembourg est un acteur de reference en MRH -- c'est une force a exploiter.

---

# 4. Qualification reglementaire et juridique

## 4.1 Position IDD : COMPARAISON INFORMATIVE (niveau b)

La V2 se situe au niveau de la **comparaison factuelle**, pas du conseil.

| Niveau IDD | Description | V2 MRH ? |
|------------|-------------|----------|
| a) Information pure | "Votre contrat inclut X, Y, Z" | Partiellement -- l'extraction seule est de l'information |
| **b) Comparaison** | **"Votre contrat couvre X mais pas Y par rapport a vos besoins declares"** | **OUI -- c'est exactement ce que fait la V2** |
| c) Recommandation | "Nous vous suggerons de souscrire Z" | NON -- aucune suggestion de produit |
| d) Conseil | "Au vu de votre situation personnelle, nous recommandons..." | NON -- aucun conseil personnalise |

**Frontiere a ne pas franchir :**
- **Frontiere de langage :** aucune formulation suggestive ("nous recommandons", "vous devriez", "insuffisant")
- **Frontiere fonctionnelle :** le CTA post-adequation doit etre identique quel que soit le resultat (pas de bouton "combler ce gap" qui apparait uniquement devant un gap)

**Le recentrage MRH renforce cette qualification :** la V1 avec prevoyance/sante comportait un risque de glissement vers le conseil du fait de la sensibilite des donnees. La MRH est un produit de dommages aux biens -- le registre factuel est plus naturel et defensible.

**BLOQUANT :** cette qualification doit etre validee par le service juridique Baloise Luxembourg AVANT la mise en production du front-end. Le dev backend peut demarrer.

## 4.2 Impact RGPD

| Critere | V1 (4 quadrants) | V2 (MRH only) |
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

**Si le scope est elargi a la prevoyance en V3, la question AI Act se reouvre.**

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
| "Vous etes bien assure" | Jugement de valeur = conseil | "Votre contrat semble couvrir ce risque" |
| "Votre couverture est suffisante" | Appreciation d'adequation = conseil | "Le capital apparait coherent avec votre estimation" |
| "Il vous manque la garantie X" | Directive = conseil | "Ce risque ne semble pas couvert par votre contrat actuel" |
| "Vous devriez augmenter votre capital" | Injonction = conseil | "Un ecart possible a ete identifie entre votre estimation et le capital couvert" |
| "Vous n'etes pas protege" | Dramatisation = manipulation | "Nous n'avons pas identifie de couverture pour ce risque dans votre document" |
| Score en pourcentage (78%) | Fausse precision | Statut qualitatif (couvert/partiel/gap/non eval.) |
| "Nous recommandons le produit X" | Recommandation = conseil regule | "Un echange avec votre conseiller permettrait de preciser vos besoins" |
| "Couverture insuffisante" | Jugement = conseil | "Ecart possible detecte" |
| "Risque non couvert" | Trop affirmatif sans CG | "Non detecte dans ce document" |
| "Sous-assure" | Terme technique + jugement | "Ecart possible entre le capital assure et votre estimation" |

## 4.6 Points necessitant validation juridique interne

| # | Question | Bloquant ? | Dev peut commencer ? |
|---|----------|-----------|---------------------|
| Q1 | La V2 MRH constitue-t-elle de l'information ou de la comparaison au sens IDD ? | **OUI -- bloquant front-end** | Backend : oui. UI resultats : non. |
| Q2 | Les disclaimers proposes sont-ils juridiquement suffisants ? | **OUI -- bloquant production** | Dev avec disclaimers provisoires : oui |
| Q3 | Le traitement de contrats concurrents pose-t-il un probleme de secret des affaires ? | Bloquant production | Oui |
| Q4 | Le consentement par checkbox avant upload est-il suffisant ou faut-il une co-signature ? | Non bloquant dev | Oui |
| Q5 | La mention "sous reserve" suffit-elle a exonerer Baloise en cas de faux positif ? | Important | Oui |

---

# 5. Modele metier d'adequation V2

## 5.1 Les 4 statuts -- definition precise en contexte MRH

| Statut | Icone | Couleur | Definition precise |
|--------|-------|---------|-------------------|
| **COUVERT** | Check | Ambre (PAS vert) | La garantie est presente ET le capital/plafond est dans la fourchette standard du marche LU. TOUJOURS accompagne de "sous reserve des conditions de votre contrat". |
| **PARTIEL** | Triangle | Ambre fonce | La garantie est presente MAIS capital/plafond inferieur au standard OU franchise elevee (> 500 EUR) OU sous-limite insuffisante par rapport aux biens declares. |
| **GAP** | Croix | Rouge | La garantie est absente ou explicitement exclue du contrat. |
| **NON EVALUABLE** | Point d'interrogation | Gris | Information insuffisante, champ non extractible, ou confiance d'extraction < 0.75. |

**Decision critique du Risk Manager :** le statut "COUVERT" utilise une icone AMBRE, pas verte. Le vert donnerait un faux sentiment de securite. L'ambre signale "a priori present, mais a verifier". C'est la mitigation la plus forte contre le faux positif.

**Decision critique de l'Actuaire :** si la franchise ou le plafond n'est pas extrait avec confiance >= 0.75, le statut est "non evaluable", JAMAIS "couvert". Mieux vaut un exces de prudence.

## 5.2 Seuils de reference pour "partiel" vs "couvert"

| Champ | Seuil "couvert" | Seuil "partiel" | Source |
|-------|----------------|-----------------|--------|
| Capital contenu | >= 70% de la tranche declaree par le client | 40-70% de la tranche declaree | Croisement questionnaire / extraction |
| Franchise principale | <= 500 EUR | 501-1 500 EUR | Standard marche LU |
| Franchise degats des eaux | <= 300 EUR | 301-1 000 EUR | Standard marche LU |
| Sous-limite objets de valeur | >= 30% du capital contenu | 15-30% | Ratio standard Baloise HOME |
| RC occupant (plafond) | >= 2 500 000 EUR | 1 500 000 - 2 500 000 EUR | Norme marche LU |

**Ces seuils sont des INDICATEURS, pas des verdicts.** Tout statut "couvert" porte la mention "sous reserve".

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

### Niveau D -- Non exploitables en V2

Perimetres detailles des garanties, exclusions, regime de vetuste, obligations de l'assure, regle proportionnelle, clauses d'indexation.

## 5.4 Sous-assurance

**Verdict : le systeme NE PEUT PAS detecter la sous-assurance de maniere fiable.**

Le systeme n'a acces qu'au capital assure (CP/TRG) mais PAS a la valeur reelle du bien. Traitement V2 :

1. **Alertes objectives** (automatisables) : capital contenu < 10 000 EUR → alerte / capital batiment / surface < 1 500 EUR/m2 → alerte indicative
2. **Message pedagogique** (systematique) : "L'adequation de vos capitaux a la valeur reelle de vos biens ne peut etre verifiee automatiquement. Verifiez regulierement que vos capitaux correspondent a la valeur actuelle de votre habitation."
3. **Renvoi conseiller** : si alertes declenchees

**INTERDIT :** donner un verdict "couverture suffisante" ou "couverture insuffisante" base sur des heuristiques.

---

# 6. Referentiel metier HOME / protection des biens

## 6.1 Referentiel V2 -- 16 garanties normalisees

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

## 6.2 HORS referentiel V2

Assistance (depannage, relogement), protection juridique standalone, garantie scolaire, piscine/jardin (detail), cyber/e-reputation, animaux, loyers impayes, panneaux solaires (detail), home office, garantie all-risk.

## 6.3 Documents sources cibles

**CP + TRG = base minimale viable.** L'IPID est un bonus pour confirmer presence/absence d'une garantie.

**Verdict :** le systeme est credible avec CP + TRG pour repondre a :
- "Quelles garanties avez-vous souscrites ?" → OUI
- "Quels sont vos capitaux et franchises ?" → OUI
- "Votre contrat est-il en vigueur ?" → OUI

Le systeme n'est PAS credible pour repondre a :
- "Etes-vous suffisamment couvert ?" → NON (necessite CG + evaluation du bien)
- "Que couvre exactement votre garantie incendie ?" → NON (necessite CG)
- "Quelles sont vos exclusions ?" → NON (necessite CG)

---

# 7. Architecture fonctionnelle cible

## 7.1 Parcours client

```
Etape 1 : DECLENCHEMENT
   Questionnaire biens complete + home_coverage_existing !== 'none'
   → CTA "Faites le point sur votre assurance habitation"

Etape 2 : UPLOAD
   Ecran unique : "Importez vos conditions particulieres MRH"
   → PDF, JPEG, PNG -- max 10 MB
   → Disclaimer consent (checkbox)

Etape 3 : CONFIRMATION RAPIDE (1 ecran, PAS de wizard)
   Pre-rempli depuis le questionnaire :
   - Type de bien (appartement/maison)
   - Statut (proprietaire/locataire)
   → Le client confirme ou corrige ces 2 champs

Etape 4 : ATTENTE
   Loader avec estimation ("Analyse en cours, environ 30 secondes")
   → Le client peut quitter et revenir

Etape 5 : RESULTAT
   Vue synthetique : nombre de points couvert/partiel/gap/non evaluable
   Detail par garantie : 8-10 lignes max
   Bandeau permanent : disclaimer V2
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
| Validation legere ou guidee ? | **Legere** -- 1 ecran, 2 champs | Le wizard est pour la souscription, pas le diagnostic |
| Donnees a confirmer par le client ? | Type de bien + statut (min. absolu) | Structurant pour le matching, pre-rempli depuis questionnaire |
| Le conseiller intervient quand ? | **APRES le resultat** | Il recoit le lead enrichi, pas un formulaire a valider |
| Faut-il un ecran "verification" ? | **NON** -- le bandeau disclaimer suffit | Exception : si > 60% de "non evaluable", message specifique |

## 7.3 UX de l'incertitude (Art Director)

- Statuts visuellement distincts : check ambre (couvert), triangle ambre fonce (partiel), croix rouge (gap), "?" gris (non evaluable)
- "Non evaluable" est visuellement DISTINCT de "gap" -- pas la meme couleur, pas le meme icone
- Nombre d'elements non evaluables affiche clairement
- Presentation : d'abord ce qui est couvert, puis les zones partielles, puis les gaps
- Le client voit d'abord la partie pleine du verre

---

# 8. Position technologique V2

## 8.1 Le scope MRH change-t-il la donne technique ?

**Oui, radicalement.** La V1 (5 familles de produits, 48 garanties, 15+ assureurs) justifiait un LLM capable de comprendre des documents inconnus. Le scope MRH Luxembourg est un domaine ferme : 5 assureurs, 16 garanties, 2 langues, champs connus a l'avance.

C'est un probleme de **pattern matching structure**, pas de **comprehension ouverte du langage naturel**.

## 8.2 Comparaison des 3 options

| Critere | A : OCR + regles | B : pdf-parse + LLM texte | C : Full LLM vision |
|---------|:---:|:---:|:---:|
| Precision PDF natifs MRH | 80-88% | **92-96%** | 93-96% |
| Precision scans | 0% (sans OCR) | 70-80% (Tesseract) | **88-93%** |
| Testabilite CI/CD | **Excellente** | Partielle | Faible |
| Cout mensuel (500p) | **0 EUR** | 8-15 EUR | 15-25 EUR |
| Charge reglementaire | **Nulle** | Moderee (art. 50 AI Act) | Moderee |
| Effort implementation | 10-15j | **8-10j** | 5-7j |
| Maintenance dictionnaire | Lourde | **Nulle** | **Nulle** |
| Risque hallucination | **Zero** | Faible | Modere |
| Gestion FR/DE bilingue | Rigide | **Excellente** | **Excellente** |
| Robustesse nouveaux formats | Fragile | **Bonne** | **Bonne** |

## 8.3 Recommandation : Option B -- pdf-parse + Mistral Large (texte seul)

**Le full LLM vision (Option C) n'est PAS le chemin par defaut pour le scope MRH.**

Raisonnement :
1. L'ecrasante majorite des contrats MRH sont des **PDF natifs** (generes numeriquement). Envoyer une image la ou du texte propre suffit = gaspillage de tokens (cout 2x)
2. Le texte extrait par pdf-parse est **parfait** (c'est le texte original). Le LLM n'a qu'a le structurer en JSON
3. Le scope etroit (16 garanties connues) permet un prompt **tres directif** -- l'espace d'hallucination est drastiquement reduit
4. Pas de dictionnaire a maintenir : Mistral comprend "Wasserschaden" = "degats des eaux" nativement
5. Mistral = Paris, RGPD conforme sans DPA supplementaire
6. Cout optimal : 8-15 EUR/mois pour 500 pages

**Le chemin vision (Pixtral) est le fallback pour les scans** -- branche conditionnelle, pas chemin par defaut. En V2, si le PDF n'est pas natif, proposer la saisie manuelle plutot que d'implementer la branche vision immediatement.

**Pipeline V2 :**

```
Upload PDF → Supabase Storage (bucket prive)
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

**Ce qui change par rapport a la V1 :**
- 1 table au lieu de 3 (JSONB dans contract_uploads)
- 16 garanties au lieu de 48+ (enum ferme)
- Texte par defaut au lieu de vision par defaut
- Pas de stockage du texte brut (risque secret des affaires)
- Pas de stockage de l'identite de l'assure (minimisation RGPD)
- 5 statuts simplifies a 4 (suppression de "review")

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

export type AdequacyStatus = 'covered' | 'partial' | 'gap' | 'not_evaluable'

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
| **En parallele** | Lancer la qualification IDD avec le juridique + DPIA allegee |

## Phase 1 : V2 minimale credible (6-8 semaines dev)

| Element | Detail |
|---------|--------|
| **Scope** | PDF natifs uniquement. Multi-assureurs (Baloise + Foyer + La Lux + AXA + Lalux) |
| **Extraction** | pdf-parse + Mistral Large (texte seul). Pas de vision. |
| **Fallback** | Si PDF non natif (scan) → saisie manuelle structuree |
| **Garanties** | 8 garanties A (coeur) + 8 parametres contractuels |
| **Adequation** | Moteur TypeScript pur, 4 statuts, deterministe |
| **UI** | Upload + confirmation + resultats + PDF export |
| **GO/NO-GO** | IDD validee + DPIA validee + precision >= 70% sur corpus 25 contrats |

**Decisions tranchees Phase 1 :**
- **PDF natifs seulement** : les scans/photos sont un cas minoritaire. Les differer a Phase 2 reduit l'effort de 30% et elimine les risques OCR
- **Multi-assureurs des Phase 1** : la valeur de l'outil est precisement de comparer les contrats concurrents. Baloise-only serait un gadget
- **Pas de vision en Phase 1** : si le PDF n'est pas natif, saisie manuelle. C'est honnete et ca construit le corpus de validation

## Phase 2 : Enrichissement (6-10 semaines apres Phase 1)

| Element | Detail |
|---------|--------|
| **Scope** | Ajout scans/photos via Pixtral (vision). Ajout IPID pour validation croisee |
| **Garanties** | Ajout des 8 garanties B (utiles) |
| **UX** | Parcours conseiller (vue du rapport client, feedback post-RDV) |
| **Adequation** | Alertes sous-assurance (niveau 1 : seuils planchers) |
| **GO/NO-GO** | Precision Phase 1 >= 70% ET taux correction utilisateur < 30% ET feedback conseillers positif |

## Phase 3 : Extension eventuelle (pas avant S2 2027)

| Element | Detail |
|---------|--------|
| **Scope eventuel** | Extension a l'auto (DRIVE) ou a la prevoyance (B-SAFE) |
| **Prerequis** | Precision MRH >= 80% en production + ROI commercial demontre |
| **Alerte** | L'extension a la prevoyance reouvre l'art. 9 RGPD + AI Act Annexe III |

**Hypothese remise en question :** la V1 prevoyait Phase 1 = saisie manuelle, Phase 2 = extraction auto. La V2 inverse : Phase 1 = extraction auto PDF natifs (le cas majoritaire), saisie manuelle uniquement comme fallback. Raison : la saisie manuelle seule n'apporte pas assez de valeur pour justifier l'effort d'implementation du wizard.

---

# 10. Risques majeurs et contre-mesures

## Top 10 par criticite (impact x probabilite)

| # | Risque | Prob. | Impact | Criticite | Mitigation |
|---|--------|-------|--------|-----------|------------|
| R1 | **Faux positif "couvert"** : systeme dit couvert, client ne l'est pas (franchise elevee, exclusion cachee, sous-limite) | Elevee | Critique | **1** | Icone ambre (pas vert), confiance >= 0.75 sinon "non evaluable", disclaimer systematique, CTA conseiller |
| R2 | **Requalification IDD** : le CAA considere l'outil comme du conseil | Faible | Bloquant | **2** | Qualification IDD prealable, formulations interdites, CTA identique quel que soit le resultat |
| R3 | **Sous-assurance non detectee** : capital contenu insuffisant, systeme ne le signale pas | Elevee | Majeur | **3** | Message pedagogique systematique, alertes seuils planchers, renvoi conseiller |
| R4 | **Interpretation abusive du client** : croit que l'analyse est un certificat de couverture | Moyenne | Majeur | **4** | Bandeau disclaimer permanent, pas de vert, "sous reserve" sur chaque statut |
| R5 | **Heterogeneite des contrats MRH LU** : terminologie, structure, format variables entre assureurs | Elevee | Significatif | **5** | Dictionnaire normalisation LLM, monitoring par assureur, fallback "non evaluable" |
| R6 | **Fuite de donnees concurrentielles** : contrats Foyer/AXA stockes par Baloise | Faible | Majeur | **6** | Zero retention du document source post-extraction, pas de stockage texte brut, RGPD minimisation |
| R7 | **Hallucination LLM** : montant ou garantie invente | Moyenne | Significatif | **7** | Schema Zod strict, enum ferme pour garanties, validation montants, confiance < 0.75 → non evaluable |
| R8 | **Derive du dictionnaire** : assureurs changent formulations, qualite d'extraction decline | Elevee | Significatif | **8** | Monitoring mensuel taux de "non evaluable" par assureur, alerte si > 40% |
| R9 | **Indisponibilite API Mistral** | Faible | Significatif | **9** | Fallback saisie manuelle, retry avec backoff, message utilisateur gracieux |
| R10 | **Reputation** : un faux resultat mediatise | Faible | Critique | **10** | Beta fermee obligatoire (4 sem., 20 clients reels), seuil go/no-go < 15% erreurs |

---

# 11. KPIs et criteres de succes

## 11.1 KPIs d'appetence (Phase 0)

| KPI | Seuil GO | Seuil NO-GO | Mesure |
|-----|----------|-------------|--------|
| Taux de clic CTA | > 10% | < 5% | Analytics |
| Taux de completion upload (clic → document uploade) | > 40% | < 20% | Funnel analytics |

## 11.2 KPIs de qualite d'extraction (Phase 1)

| KPI | Seuil minimum | Cible | Mesure |
|-----|---------------|-------|--------|
| Precision extraction champs A (critique) | >= 70% | >= 85% | Corpus annote 25 contrats |
| Taux de "non evaluable" par garantie | < 40% | < 20% | Production |
| Taux de champs corriges par l'utilisateur | < 30% | < 15% | Ecran validation |
| Temps d'extraction | < 30 sec | < 15 sec | Monitoring |
| Taux d'echec (status 'failed') | < 10% | < 5% | Production |
| Cout par extraction | < 0.05 EUR | < 0.03 EUR | Facturation API |

## 11.3 KPIs de qualite d'adequation

| KPI | Seuil minimum | Mesure |
|-----|---------------|--------|
| Taux de faux positifs "couvert" | < 10% | Feedback conseillers post-RDV |
| Taux de faux negatifs "gap" | < 15% | Idem |
| Coherence adequation vs avis conseiller | > 80% | Echantillon mensuel 20 cas |

## 11.4 KPIs de transformation commerciale

| KPI | Cible | Mesure |
|-----|-------|--------|
| Taux de conversion adequation → RDV conseiller | > 25% | CRM |
| Taux de transformation RDV → offre | > 40% | CRM |

## 11.5 KPIs de risque / incidents

| KPI | Seuil alerte | Action |
|-----|-------------|--------|
| Reclamation client liee a l'adequation | > 2/mois | Revue immediate |
| Faux positif detecte par conseiller | > 15% | Suspension + recalibration |
| Derive qualite (taux non evaluable en hausse) | +10pts en 1 mois | Investigation |

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
| Tests integration + corpus 25 contrats | 5 jours | Oui, si corpus disponible |
| **TOTAL** | **34 jours = 7-8 semaines** | **Oui, 1 dev** |

## Version confort (Phase 0 + Phase 1 + Phase 2)

| Poste supplementaire | Estimation |
|---------------------|-----------|
| Branche vision Pixtral (scans/photos) | 5 jours |
| Parcours conseiller (vue client + feedback) | 5 jours |
| Alertes sous-assurance | 3 jours |
| Tests supplementaires + corpus elargi | 5 jours |
| **TOTAL Phase 1 + Phase 2** | **52 jours = 12-14 semaines** |

## Prerequis bloquants

| Prerequis | Responsable | Delai estime | Bloque quoi ? |
|-----------|------------|-------------|---------------|
| Qualification IDD | Service juridique Baloise | 2-4 semaines | Front-end (UI resultats) |
| DPIA allegee | DPO Baloise | 1-2 semaines | Production |
| Corpus 25 contrats MRH (multi-assureurs) | PM + UX | 2-4 semaines | Prompt engineering + tests |
| Validation disclaimers | Service juridique | 1-2 semaines | Production |

**Alerte charge :** le corpus de 25 contrats MRH reels de 5 assureurs est le prerequis le plus difficile a obtenir. Sans contrats reels, le prompt engineering est un travail theorique. Le PM doit mobiliser des contacts internes (Baloise) et des clients volontaires (concurrence) pour constituer ce corpus.

---

# 13. Recommandation finale collegiale

## Verdict : GO CONDITIONNEL -- perimetre MRH uniquement

### Ce qu'il faut lancer MAINTENANT

1. **CTA factice** sur ResultsPage (2 jours) -- mesure d'appetence pendant 4 semaines
2. **Qualification IDD** avec le service juridique Baloise Luxembourg (en parallele)
3. **DPIA allegee** MRH (en parallele, 1-2 semaines)
4. **Constitution du corpus** de 25 contrats MRH reels multi-assureurs
5. **Dev backend** : migration Supabase + Background Function + moteur d'adequation (peut commencer des maintenant, pas bloque par IDD)

### Ce qu'il faut REPOUSSER

| Element | Reporte a | Raison |
|---------|-----------|--------|
| Scans / photos (vision LLM) | Phase 2 | Cas minoritaire, effort +30%, risque OCR |
| Extension a d'autres quadrants (auto, prevoyance) | Phase 3, pas avant S2 2027 | Reouvre art. 9 RGPD + AI Act |
| Fine-tuning de modele | Jamais en V2 | Injustifie a 500 pages/mois |
| Score en pourcentage | JAMAIS | Fausse precision, risque reglementaire |
| Comparaison de prix entre assureurs | JAMAIS en V2 | Hors perimetre IDD |
| Stockage long terme des documents sources | JAMAIS | RGPD minimisation + secret des affaires |

### Ce qu'il faut INTERDIRE dans la V2

1. Toute formulation suggestive ou directive (cf. liste des 10 formulations interdites)
2. Tout statut "couvert" en vert (uniquement ambre)
3. Tout CTA contextuel qui n'apparait que devant un gap ("Combler ce gap" → INTERDIT)
4. Tout stockage du document source au-dela de l'extraction
5. Tout stockage du texte brut extrait (secret des affaires)
6. Toute extraction des Conditions Generales (trop risque en V2)
7. Tout verdict automatique de sous-assurance

### Decision CPO

**Lancer Phase 0 immediatement. Dev backend Phase 1 en parallele. Front-end bloque jusqu'a validation IDD.**

Le recentrage MRH transforme un projet ambitieux et risque en un projet sobre, testable et defensible. La valeur est dans la profondeur (8-10 garanties evaluees serieusement) et non dans l'etendue. Le scope ferme est une force, pas une limite.

**Budget :** 7-8 semaines dev (1 developpeur) + 8-15 EUR/mois API Mistral.
**Pre-requis critiques :** IDD + DPIA + corpus 25 contrats.
**Go/No-Go Phase 1 :** CTA > 10% ET IDD favorable ET DPIA validee ET precision >= 70%.

---

*Note etablie le 28 mars 2026 par le college des 14 agents specialises pour decision en comite produit.*
*Les analyses detaillees de chaque agent sont disponibles dans les documents de travail associes.*
