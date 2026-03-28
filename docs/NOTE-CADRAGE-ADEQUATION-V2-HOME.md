# Note de cadrage V2 -- Adequation contrats : perimetre HOME / Protection des biens

> Roue des Besoins Assurance -- Baloise Luxembourg
> Version 2.0 -- 28 mars 2026
> Statut : NOTE DE CADRAGE V2 -- POUR COMITE DE DECISION
> Auteur : Lead Product Manager + Insurance Product Manager Habitation
> Supersede : NOTE-CADRAGE-ADEQUATION-CONTRATS.md (V1, perimetre 4 quadrants)

---

## Pourquoi cette V2

La V1 de la note de cadrage couvrait les 4 quadrants (biens, personnes, projets, futur) avec 48 garanties, tous produits confondus (DRIVE, HOME, TRAVEL, B-SAFE). La synthese collegiale des 14 agents (28 mars 2026) a confirme un GO conditionnel mais a revele un risque d'execution majeur : **le perimetre etait trop large pour etre credible en MVP**.

Cette V2 resserre le scope a un seul perimetre : **l'habitation (HOME) au Luxembourg**, c'est-a-dire la multirisque habitation (MRH). Ce choix est delibere :

1. HOME est le produit Baloise avec le plus d'options (13 packs) -- le plus riche a analyser
2. Les contrats MRH luxembourgeois ont une structure relativement homogene entre assureurs
3. Le quadrant "biens" est le plus concret pour le client : il sait ce qu'il possede, il peut verifier
4. L'habitation est le contrat non-vie le plus repandu au Luxembourg apres l'auto
5. HOME est le produit ou l'ecart entre couverture de base et couverture optimale est le plus important

---

## Table des matieres

1. [Section 1 : Definition stricte du perimetre V2](#section-1--definition-stricte-du-perimetre-v2)
2. [Section 2 : Proposition de valeur produit reelle](#section-2--proposition-de-valeur-produit-reelle)
3. [Section 3 : Referentiel metier HOME / protection des biens](#section-3--referentiel-metier-home--protection-des-biens)
4. [Section 4 : Strategie de phasage realiste](#section-4--strategie-de-phasage-realiste)
5. [Section 5 : Estimation de charge](#section-5--estimation-de-charge)

---

# SECTION 1 : Definition stricte du perimetre V2

## 1.1 Ce qui est DANS le scope (liste fermee)

Le perimetre V2 couvre exclusivement l'analyse d'adequation d'un contrat **multirisque habitation (MRH)** au Luxembourg. Concretement :

### Garanties dommages aux biens

| # | Garantie | Justification de l'inclusion |
|---|----------|------------------------------|
| G01 | Incendie et evenements assimiles | Garantie socle de tout MRH, toujours presente |
| G02 | Degats des eaux et gel | Sinistralite n1 en habitation au Luxembourg |
| G03 | Vol / cambriolage / vandalisme | Option la plus souscrite, forte variance entre assureurs |
| G04 | Bris de glace | Systematique chez Baloise, parfois optionnel ailleurs |
| G05 | Tempete / grele / neige | Systematique, sinistralite croissante (climatique) |
| G06 | Catastrophes naturelles / inondation | Critique au Luxembourg (Moselle, Alzette, crues 2021) |
| G07 | Dommages electriques | Systematique chez Baloise, optionnel chez certains concurrents |
| G08 | Attentats et actes de terrorisme | Systematique, generalement sans sous-limite |

### Parametres contractuels

| # | Parametre | Justification de l'inclusion |
|---|-----------|------------------------------|
| P01 | Capital batiment | Dimensionnement du risque immobilier |
| P02 | Capital contenu mobilier | Dimensionnement du risque mobilier |
| P03 | Franchise generale | Premier levier de differenciation entre contrats |
| P04 | Franchise specifique vol | Souvent differente de la franchise generale |
| P05 | Franchise specifique degats des eaux | Souvent differente de la franchise generale |
| P06 | Sous-limite objets de valeur | Plafond standard souvent insuffisant (2 000-5 000 EUR) |
| P07 | Sous-limite bijoux / montres | Plafond specifique, souvent distinct des objets de valeur |
| P08 | Mode d'indemnisation (valeur a neuf vs vetuste) | Determine la qualite reelle de l'indemnisation |

### Garanties annexes incluses (car indissociables du MRH luxembourgeois)

| # | Garantie | Justification |
|---|----------|---------------|
| A01 | RC occupant / RC locataire / RC batiment | Presente dans TOUT contrat MRH luxembourgeois -- ne pas l'extraire serait ignorer un composant structurel |
| A02 | Recours des voisins et des tiers | Garantie systematique dans les MRH luxembourgeois, liee a l'incendie |
| A03 | Troubles du voisinage | Specifique Luxembourg, presente chez la plupart des assureurs |
| A04 | Defense et recours | Systematique, incluse dans la base HOME Baloise |

### Options HOME Baloise qualifiables

| # | Option | Justification |
|---|--------|---------------|
| O01 | Pack Multimedia | Correspond a un besoin identifie par Q11 (valuable_possessions = multimedia) |
| O02 | Pack Objets de valeur / d'art | Correspond a Q11/Q12 (valuable_possessions = art/collections, estimate >= 15k) |
| O03 | Pack Objets precieux / bijoux | Correspond a Q11/Q12 (valuable_possessions = jewelry, estimate >= 15k) |
| O04 | Reequipement a neuf | Correspond a Q10 (home_contents_value >= 50k) |
| O05 | Pack Objets de loisirs | Correspond a Q11 (valuable_possessions = sports_leisure) |
| O06 | Pack equipements de mobilite durable | Correspond a Q11 (valuable_possessions = sustainable_mobility) |
| O07 | Pack Jardin / Piscine | Correspond a Q09 (home_specifics = garden/pool) |
| O08 | Pack Perte de liquide / dommages cuves | Correspond a Q09/Q08 (home_specifics, housing_type = house) |
| O09 | Pack Energie renouvelable | Correspond a Q09 (home_specifics = solar_panels) |
| O10 | Pack Cave a vin / denrees alimentaires | Correspond a Q09 (home_specifics = wine_cellar) |

**Total perimetre V2 : 8 garanties dommages + 8 parametres contractuels + 4 garanties annexes + 10 options = 30 elements.**

---

## 1.2 Ce qui est HORS scope (liste explicite et definitive)

### Produits hors perimetre

| Element exclu | Raison |
|---------------|--------|
| DRIVE (auto) | Quadrant biens mais produit distinct, structures de garanties incompatibles avec le MRH |
| B-SAFE (prevoyance / accidents) | Quadrant personnes/futur, hors perimetre protection des biens |
| TRAVEL (voyage) | Quadrant personnes, aucun lien avec le MRH |
| Assurance vie / epargne | Quadrant futur, hors perimetre |

### Garanties habitation exclues de la V2

| Garantie exclue | Raison de l'exclusion |
|-----------------|----------------------|
| RC Vie Privee (option HOME) | C'est une garantie de protection des personnes (responsabilite), pas des biens. Elle est mappee au quadrant "personnes" dans la spec (Q17/Q18). L'inclure brouille le perimetre. |
| Assistance (depannage, serrurier, relogement) | Garantie de service, pas de dommage aux biens. Extremement difficile a comparer entre assureurs (contenu tres variable). Rapport effort/valeur defavorable. |
| Protection juridique | Produit distinct chez la plupart des assureurs LU (contrat separe). Pas un composant structurel du MRH. |
| Garantie scolaire | Specifique enfants, protection des personnes, hors scope biens. |
| Garantie piscine isolee (hors Pack Jardin) | Incluse via le Pack Jardin/Piscine. Pas de garantie piscine standalone en V2. |
| E-reputation / cyber | Garanties emergentes, pas standardisees, extractibilite quasi nulle. |
| Animaux de compagnie | Protection des personnes / RC, pas des biens. |
| Garantie demenagement | Temporaire, rarement dans les CG, impossible a comparer. |
| Garantie villegiature | Trop complexe a extraire (conditions de duree, superficie). |

### Elements structurels exclus

| Element exclu | Raison |
|---------------|--------|
| Exclusions fines (amiante, guerre, nucleaire...) | Quasi identiques entre assureurs LU, pas de valeur discriminante. Extraction tres complexe. |
| Conditions de garantie detaillees | Ex : "vol avec effraction" vs "vol par ruse" -- trop granulaire pour la V2. |
| Mode d'indemnisation detaille par garantie | Trop complexe. On se limite a la distinction valeur a neuf / vetuste globale (P08). |
| Clauses de resiliation | Pas un element de couverture. |
| Franchise proportionnelle vs absolue | Trop technique pour le client self-service. On capture le montant brut. |
| Indexation des capitaux | Important mais non extractible de maniere fiable des CG. |

---

## 1.3 Garanties par priorite

### Priorite A -- Critique (doivent fonctionner au lancement)

Sans ces elements, l'adequation n'a aucune valeur :

| Code | Element | Raison |
|------|---------|--------|
| G01 | Incendie | Socle absolu du MRH |
| G02 | Degats des eaux | Sinistre n1, presente dans tous les contrats |
| G06 | Catastrophes naturelles / inondation | Enjeu Luxembourg (crues 2021), forte sensibilite client |
| G03 | Vol / vandalisme | Option la plus discriminante entre contrats |
| P01 | Capital batiment | Dimensionnement fondamental |
| P02 | Capital contenu | Dimensionnement fondamental |
| P03 | Franchise generale | Premier element de comparaison |
| P08 | Valeur a neuf vs vetuste | Determine la qualite reelle de la couverture |

**8 elements priorite A = le minimum pour un rapport credible.**

### Priorite B -- Utile (enrichit significativement l'analyse)

| Code | Element | Raison |
|------|---------|--------|
| G04 | Bris de glace | Quasi systematique, facile a extraire |
| G05 | Tempete / grele | Quasi systematique, facile a extraire |
| G07 | Dommages electriques | Discriminant (optionnel chez certains) |
| P04 | Franchise vol | Souvent distincte, forte variance |
| P05 | Franchise degats des eaux | Souvent distincte |
| P06 | Sous-limite objets de valeur | Critique pour les clients concernes |
| P07 | Sous-limite bijoux | Critique pour les clients concernes |
| A01 | RC occupant/locataire | Structurellement presente |
| A02 | Recours des voisins | Structurellement present |
| O04 | Reequipement a neuf | Upsell naturel, facile a identifier |

**10 elements priorite B.**

### Priorite C -- Indicatif (enrichit l'analyse sans etre bloquant)

| Code | Element | Raison |
|------|---------|--------|
| G08 | Attentats / terrorisme | Quasi identique partout, faible valeur discriminante |
| A03 | Troubles du voisinage | Present mais rarement un facteur de decision |
| A04 | Defense et recours | Quasi systematique, faible variance |
| O01-O03, O05-O10 | Options HOME specifiques | Utiles mais conditionnelles au profil client |

**12 elements priorite C.**

---

## 1.4 Regle de cloisonnement

**Le perimetre est FERME.** Si un element n'est pas dans les listes ci-dessus, il est HORS SCOPE V2. Tout ajout au perimetre V2 necessite :

1. Une justification ecrite du demandeur
2. Une evaluation de l'impact sur le referentiel d'extraction
3. Un accord du Product Manager
4. Un recalcul de la charge

Il n'y a pas de "on verra plus tard" ni de "on rajoute si c'est facile". Le perimetre est la condition de credibilite de la V2.

---

# SECTION 2 : Proposition de valeur produit reelle

## 2.1 Ce que cette fonctionnalite fait (et ne fait PAS)

### Ce qu'elle fait

L'adequation contrats V2 HOME permet a un utilisateur de la Roue des Besoins de :

1. **Saisir** (Phase 1) ou **uploader** (Phase 2) les informations de son contrat habitation actuel
2. **Obtenir une cartographie** structuree de sa couverture reelle : garantie par garantie, avec capitaux, franchises, et sous-limites
3. **Visualiser les ecarts** entre ses besoins detectes par le questionnaire (quadrant biens, questions Q07-Q13) et sa couverture effective
4. **Identifier les lacunes concretes** : garanties absentes, capitaux insuffisants, franchises elevees, options non souscrites alors que le profil les justifie
5. **Preparer un echange structure** avec un conseiller Baloise, base sur des faits et non sur des declarations

### Ce qu'elle ne fait PAS

| Promesse interdite | Raison |
|-------------------|--------|
| "Nous vous disons si vous etes bien assure" | Qualification IDD -- c'est du conseil, pas de l'information |
| "Nous comparons votre contrat a celui de Baloise" | Positionnement vendeur, risque de requalification CAA |
| "Nous vous recommandons de changer d'assureur" | Conseil personnalise, obligation IDD complete |
| "Votre couverture est insuffisante" | Jugement de valeur sur un contrat tiers, risque juridique |
| "Nous garantissons l'exactitude de l'analyse" | Fiabilite d'extraction < 100%, disclaimer obligatoire |
| Analyse multi-contrats croisee | Hors scope V2, une seule police MRH a la fois |
| Score d'adequation chiffre (ex: 73.2%) | Fausse precision, alerte actuaire senior V1 |

### Positionnement IDD retenu : INFORMATION, pas CONSEIL

L'outil se positionne comme un **miroir factuel** : "Voici ce que votre contrat couvre. Voici ce que votre diagnostic a identifie. Voici les ecarts." Il ne recommande pas d'action, il ne compare pas a un produit Baloise, il ne juge pas la qualite du contrat existant.

Le passage au conseil est le role du conseiller humain, dans le cadre d'un entretien IDD complet.

---

## 2.2 Cinq wordings de CTA / promesse utilisateur

Du plus ambitieux au plus prudent :

### Wording 1 -- Ambitieux (REJETE)

> **"Decouvrez si vous etes bien protege"**

Probleme : implique un jugement de valeur ("bien") qui releve du conseil. Non conforme au positionnement IDD = information. A ecarter.

### Wording 2 -- Engageant (RISQUE)

> **"Analysez votre contrat habitation en 3 minutes"**

Probleme : le mot "analysez" est ambivalent. Il peut etre interprete comme une analyse experte, ce qui est du conseil. Le "3 minutes" est un engagement de performance difficile a garantir. Risque moyen.

### Wording 3 -- Factuel (ACCEPTABLE)

> **"Comparez votre couverture a vos besoins"**

Avantage : factuel, centre sur l'utilisateur, pas de jugement. Probleme mineur : "comparez" peut etre lu comme une comparaison avec un produit Baloise. A clarifier dans le sous-titre.

### Wording 4 -- Prudent (RECOMMANDE)

> **"Faites le point sur votre assurance habitation"**

Avantage : neutre, factuel, pas d'engagement de resultat, pas de jugement. Le "faire le point" est une demarche d'information, pas de conseil. Compatible IDD. Sous-titre possible : "Identifiez ce que votre contrat couvre -- et ce qu'il ne couvre pas."

### Wording 5 -- Minimal (TROP PRUDENT)

> **"Renseignez les informations de votre contrat habitation"**

Probleme : aucune promesse de valeur. Pas de raison pour le client de cliquer. Trop operationnel, pas assez motivant.

### Recommandation : Wording 4

**"Faites le point sur votre assurance habitation"** avec le sous-titre **"Identifiez ce que votre contrat couvre -- et ce qu'il ne couvre pas."**

Justification :
- Neutre et factuel : pas de conseil, pas de comparaison, pas de jugement
- Suffisamment engageant : le "faire le point" evoque une demarche utile
- Le sous-titre est concret et cree un benefice percu (identifier les lacunes)
- Compatible avec la qualification IDD = information
- Ne promet pas de precision, ne promet pas de rapidite

---

## 2.3 Insertion dans la Roue des Besoins

### Positionnement dans le parcours

```
[Diagnostic des besoins]          [Adequation contrats V2 HOME]          [Contact conseiller]
      Questionnaire        -->    "Faites le point sur votre          -->   RDV / callback /
      32 questions                 assurance habitation"                    demande de devis
      Scoring 5x5                  Saisie ou upload MRH
      Recommandations              Cartographie couverture
                                   Identification des ecarts
```

Le point d'entree est la **ResultsPage** du diagnostic, specifiquement lorsque le quadrant "biens" a ete complete et que des recommandations HOME ont ete generees (regles HOME-01 a HOME-15).

**Condition d'affichage du CTA :**
- Le client a complete le quadrant "biens" (Q07-Q13)
- Au moins une recommandation HOME est active (score de pertinence > 20)
- Le client est authentifie

**Le CTA n'est PAS affiche si :**
- Le quadrant biens n'est pas complete
- Aucune recommandation HOME n'est declenchee
- Le client n'est pas authentifie (donnees sensibles, RGPD)

### Articulation avec le scoring existant

L'adequation V2 HOME **ne modifie pas** le scoring existant (exposure/coverage par quadrant). Elle ajoute une couche supplementaire :

| Couche | Source | Nature | Existant |
|--------|--------|--------|----------|
| Scoring quadrant | Declarations client (Q07-Q13) | Estimation subjective | Oui, V1 |
| Recommandations HOME | Regles HOME-01 a HOME-15 | Conseil generique | Oui, V1 |
| **Adequation V2** | **Contrat reel du client** | **Cartographie factuelle** | **Nouveau** |

L'adequation ne recalcule pas le coverage score. Elle le **complete** par une vue granulaire, garantie par garantie.

---

## 2.4 Avantage du recentrage HOME

| Dimension | V1 (4 quadrants, 48 garanties) | V2 (HOME uniquement, 30 elements) |
|-----------|-------------------------------|-------------------------------------|
| Credibilite | Fragile -- trop large pour etre precis | Forte -- perimetre maitrise, expertise reelle |
| Referentiel | Impossible a stabiliser (auto + MRH + prevoyance + voyage) | Faisable -- 5 assureurs, contrats homogenes |
| Extraction | 4 formats de contrat tres differents | 1 seul format (MRH), structure connue |
| Test qualite | Impossible de tester 48 garanties x 5 assureurs = 240 cas | 30 elements x 5 assureurs = 150 cas, gerable |
| Time-to-market | 12+ semaines | 6-8 semaines |
| Discours commercial | Vague ("on analyse tous vos contrats") | Concret ("on decrypte votre assurance habitation") |
| Risque d'erreur | Eleve (une erreur sur un plafond B-SAFE est grave) | Contenu (une erreur sur un plafond MRH est rectifiable) |
| Expertise metier | Aucun dev ne maitrise auto + MRH + prevoyance + voyage | Un dev peut maitriser le MRH luxembourgeois |

**Le recentrage HOME n'est pas un recul. C'est une condition de credibilite.**

---

# SECTION 3 : Referentiel metier HOME / protection des biens

## 3.1 Methode de construction

Ce referentiel a ete construit en croisant :
- L'IPID HOME Baloise (document source ci-joint)
- Les conditions generales HOME(2) Baloise Luxembourg
- La connaissance du marche MRH luxembourgeois (Foyer, La Luxembourgeoise, AXA Luxembourg, Lalux)
- Les questions du questionnaire V1 (Q07-Q13) et les 15 regles de recommandation HOME

Pour chaque element du referentiel, on documente :
- **Nom normalise** : le terme utilise dans le moteur d'adequation
- **Synonymes assureurs** : les termes utilises dans les CG/CP des 5 assureurs principaux
- **Type de donnee** : ce qu'on cherche a extraire
- **Criticite** : A (critique), B (utile), C (indicatif)
- **Extractibilite** : haute (>80%), moyenne (55-80%), basse (<55%)
- **Piege d'extraction** : le risque d'erreur le plus frequent

---

## 3.2 Referentiel complet -- Garanties dommages

### G01 -- Incendie et evenements assimiles

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `incendie` |
| **Synonymes assureurs** | Baloise: "Incendie et evenements assimiles" / Foyer: "Incendie" / La Lux: "Incendie, explosion, implosion" / AXA LU: "Incendie et risques assimiles" / Lalux: "Incendie, explosion, foudre" |
| **Type de donnee** | Booleen inclus/exclus + plafond EUR (generalement = capital batiment) |
| **Criticite** | A |
| **Extractibilite** | Haute (>90%) |
| **Piege d'extraction** | Toujours inclus dans un MRH -- le risque n'est pas de le rater mais de ne pas identifier les sous-garanties (fumee, choc vehicule tiers, chute d'arbre). Ne pas sur-decomposer en V2. |

### G02 -- Degats des eaux et gel

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `degats_eaux` |
| **Synonymes assureurs** | Baloise: "Degats des eaux et gel" / Foyer: "Degats des eaux" / La Lux: "Degats des eaux, infiltrations" / AXA LU: "Dommages par l'eau" / Lalux: "Degats des eaux" |
| **Type de donnee** | Booleen inclus/exclus + franchise EUR specifique eventuelle |
| **Criticite** | A |
| **Extractibilite** | Haute (>85%) |
| **Piege d'extraction** | Confusion entre "degats des eaux" (fuite interne) et "inondation" (catastrophe naturelle externe). Les CG les distinguent, les clients les confondent. Certains assureurs excluent le refoulement d'egout des degats des eaux standards et le placent en catastrophe naturelle. La franchise degats des eaux est souvent distincte de la franchise generale -- ne pas la rater. |

### G03 -- Vol / cambriolage / vandalisme

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `vol` |
| **Synonymes assureurs** | Baloise: "Vol / vandalisme" (option) / Foyer: "Vol par effraction, vandalisme" / La Lux: "Vol, tentative de vol, vandalisme" / AXA LU: "Vol et vandalisme" / Lalux: "Vol avec effraction" |
| **Type de donnee** | Booleen inclus/exclus + plafond EUR + franchise EUR specifique |
| **Criticite** | A |
| **Extractibilite** | Haute (>85%) pour le booleen, Moyenne (60-75%) pour le plafond |
| **Piege d'extraction** | **Piege majeur** : chez Baloise HOME, le vol est une OPTION (pas incluse en base). Chez Foyer et La Lux, il est souvent inclus en formule complete. Un LLM qui voit "Vol/vandalisme" dans la table des matieres des CG peut conclure "inclus" alors que les CP n'ont pas active l'option. Il faut croiser CG et CP. De plus, la definition de "vol" varie : certains couvrent le vol par ruse, d'autres uniquement l'effraction. En V2, on se limite a inclus/exclus sans entrer dans les conditions. |

### G04 -- Bris de glace

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `bris_glace` |
| **Synonymes assureurs** | Baloise: "Bris des glaces" / Foyer: "Bris de glaces" / La Lux: "Bris de vitrage" / AXA LU: "Bris de glaces et miroirs" / Lalux: "Bris de glaces" |
| **Type de donnee** | Booleen inclus/exclus |
| **Criticite** | B |
| **Extractibilite** | Haute (>90%) |
| **Piege d'extraction** | Generalement systematique. Le piege est la definition du "verre" : certains contrats incluent les plaques vitroceramiques, d'autres non. Hors scope V2 -- on se limite a inclus/exclus. |

### G05 -- Tempete / grele / neige

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `tempete` |
| **Synonymes assureurs** | Baloise: "Evenements climatiques (inondation, tempete, grele, neige)" / Foyer: "Tempete, ouragan, grele" / La Lux: "Tempete, grele, poids de la neige" / AXA LU: "Evenements climatiques" / Lalux: "Tempete, grele, neige" |
| **Type de donnee** | Booleen inclus/exclus |
| **Criticite** | B |
| **Extractibilite** | Moyenne (70-80%) |
| **Piege d'extraction** | **Piege important** : chez Baloise, "evenements climatiques" est un terme parapluie qui inclut inondation + tempete + grele + neige. Chez d'autres assureurs, tempete et inondation sont des garanties SEPAREES. Le LLM/extracteur peut confondre "tempete" et "catastrophe naturelle". En V2, on capture le terme parapluie tel que presente par l'assureur et on normalise ensuite. |

### G06 -- Catastrophes naturelles / inondation

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `catastrophe_naturelle` |
| **Synonymes assureurs** | Baloise: inclus dans "Evenements climatiques" / Foyer: "Catastrophes naturelles" (garantie separee) / La Lux: "Inondation, debordement, coulees de boue" / AXA LU: "Catastrophes naturelles" / Lalux: "Forces de la nature, inondation" |
| **Type de donnee** | Booleen inclus/exclus + franchise EUR specifique eventuelle |
| **Criticite** | A |
| **Extractibilite** | Moyenne (60-75%) |
| **Piege d'extraction** | **Piege critique** : au Luxembourg, il n'y a PAS de regime public de catastrophes naturelles (contrairement a la France avec Cat-Nat). La couverture depend entierement du contrat prive. Les crues de juillet 2021 ont mis en evidence des disparites enormes entre assureurs. Certains contrats excluent les zones inondables connues. L'extraction doit absolument distinguer "tempete" (vent) de "inondation" (eau exterieure) car ce sont des risques et des couvertures differents. |

### G07 -- Dommages electriques

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `dommages_electriques` |
| **Synonymes assureurs** | Baloise: "Dommages electriques" / Foyer: "Dommages aux appareils electriques" / La Lux: "Surtension, court-circuit" / AXA LU: "Dommages electriques" / Lalux: "Degats electriques" |
| **Type de donnee** | Booleen inclus/exclus + plafond EUR eventuel |
| **Criticite** | B |
| **Extractibilite** | Haute (>80%) |
| **Piege d'extraction** | Systematique chez Baloise (base), mais parfois optionnel ou plafonné chez d'autres. Le piege est le plafond : certains assureurs limitent a 2 500 EUR par appareil, d'autres a 10 000 EUR global. L'extracteur doit chercher le plafond, pas seulement le booleen. |

### G08 -- Attentats et actes de terrorisme

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `attentats` |
| **Synonymes assureurs** | Baloise: "Attentats et actes de terrorisme" / Foyer: "Actes de terrorisme" / La Lux: "Attentats" / AXA LU: "Terrorisme" / Lalux: "Attentats et emeutes" |
| **Type de donnee** | Booleen inclus/exclus |
| **Criticite** | C |
| **Extractibilite** | Haute (>85%) |
| **Piege d'extraction** | Quasi systematique partout, faible valeur discriminante. Parfois couple avec "emeutes, mouvements populaires" -- ne pas confondre avec le vandalisme. |

---

## 3.3 Referentiel complet -- Parametres contractuels

### P01 -- Capital batiment

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `capital_batiment` |
| **Synonymes assureurs** | "Valeur de l'immeuble" / "Capital batiment assure" / "Somme assuree batiment" / "Montant assure construction" / "Valeur de reconstruction" |
| **Type de donnee** | Montant EUR |
| **Criticite** | A |
| **Extractibilite** | Haute (>85%) pour PDF natifs |
| **Piege d'extraction** | **Piege important** : le capital batiment est dans les CONDITIONS PARTICULIERES (CP), pas dans les conditions generales (CG). Si le client uploade les CG sans les CP, le capital est introuvable. De plus, certains contrats distinguent "valeur de reconstruction" (cout de rebatir) et "valeur venale" (prix de marche). Au Luxembourg, ou les prix immobiliers sont tres eleves, la valeur venale peut etre 2-3x la valeur de reconstruction. Le contrat assure generalement la valeur de reconstruction. Un LLM qui confond les deux produit un resultat tres trompeur. |

### P02 -- Capital contenu mobilier

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `capital_contenu` |
| **Synonymes assureurs** | "Valeur du contenu" / "Capital mobilier" / "Somme assuree contenu" / "Mobilier et objets personnels" / "Avoir de menage" (terme luxembourgeois/allemand : Hausrat) |
| **Type de donnee** | Montant EUR |
| **Criticite** | A |
| **Extractibilite** | Haute (>80%) pour PDF natifs |
| **Piege d'extraction** | Memes reserves que P01 : present dans les CP, pas les CG. Le piege additionnel est que certains assureurs utilisent une "formule d'evaluation" (nombre de pieces x montant forfaitaire) plutot qu'une valeur declaree. L'extracteur peut tomber sur "20 m2 x 500 EUR/m2 = 10 000 EUR" au lieu d'un montant clair. De plus, le contenu est parfois divise en sous-categories (mobilier, vetements, electromenager, reserves) avec des sous-limites distinctes. En V2, on capture le montant global. |

### P03 -- Franchise generale

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `franchise_generale` |
| **Synonymes assureurs** | "Franchise" / "Franchise contractuelle" / "Montant a charge de l'assure" / "Selbstbeteiligung" (DE) / "Eigenanteil" (DE) |
| **Type de donnee** | Montant EUR |
| **Criticite** | A |
| **Extractibilite** | Moyenne (65-80%) |
| **Piege d'extraction** | **Piege tres frequent** : les franchises sont le terrain d'extraction le plus fragile. Raisons : (1) plusieurs franchises dans un meme contrat (generale, vol, degats eaux, tempete) -- le LLM peut retourner la mauvaise, (2) franchise "absolue" vs "proportionnelle" (ex: 10% du sinistre, min 250 EUR, max 2 500 EUR) -- le LLM ne sait pas laquelle retourner, (3) franchise qui a ete negociee et modifiee par avenant -- le montant dans les CP peut differer du montant standard. En V2, on capture le montant de la franchise generale tel qu'indique dans les CP. Si le format est proportionnel, on capture le min/max et on indique "proportionnelle". |

### P04 -- Franchise specifique vol

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `franchise_vol` |
| **Synonymes assureurs** | "Franchise vol" / "Franchise vol par effraction" / "Franchise vandalisme" |
| **Type de donnee** | Montant EUR (ou "identique a la franchise generale") |
| **Criticite** | B |
| **Extractibilite** | Moyenne (55-70%) |
| **Piege d'extraction** | Souvent NON mentionnee explicitement si elle est identique a la franchise generale. L'absence de mention peut signifier "identique a la franchise generale" ou "pas de franchise specifique" -- ambiguite irresolvable sans connaitre les pratiques de l'assureur. En V2, si non trouvee, on indique "non specifiee" et non "0 EUR". |

### P05 -- Franchise specifique degats des eaux

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `franchise_degats_eaux` |
| **Synonymes assureurs** | "Franchise degats des eaux" / "Franchise recherche de fuite" |
| **Type de donnee** | Montant EUR (ou "identique a la franchise generale") |
| **Criticite** | B |
| **Extractibilite** | Moyenne (55-70%) |
| **Piege d'extraction** | Meme piege que P04. En plus, certains assureurs ont une franchise specifique pour la "recherche de fuite" (localisation de la fuite avant reparation) qui est distincte de la franchise degats des eaux. Ne pas confondre. |

### P06 -- Sous-limite objets de valeur

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `souslimite_objets_valeur` |
| **Synonymes assureurs** | "Plafond objets de valeur" / "Limite objets d'art" / "Plafond objets precieux" / "Sous-limite collections" / "Sonderhaftung Wertgegenstande" (DE) |
| **Type de donnee** | Montant EUR (plafond par objet et/ou global) |
| **Criticite** | B |
| **Extractibilite** | Moyenne (55-70%) |
| **Piege d'extraction** | **Piege majeur** : les sous-limites sont la bete noire de l'extraction. Raisons : (1) elles sont enfouies dans les CG, souvent en annexe ou dans des tableaux denses, (2) il y a souvent une sous-limite PAR OBJET et une sous-limite GLOBALE -- le LLM peut retourner l'une ou l'autre sans distinction, (3) la definition d'"objet de valeur" varie (certains incluent l'electronique, d'autres non), (4) les montants sont parfois exprimes en pourcentage du capital contenu (ex: "10% du capital contenu, max 5 000 EUR"). En V2, on capture le montant brut et on indique si c'est par objet ou global. |

### P07 -- Sous-limite bijoux / montres

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `souslimite_bijoux` |
| **Synonymes assureurs** | "Plafond bijoux" / "Plafond montres et bijoux" / "Objets precieux" / "Schmuck und Uhren" (DE) |
| **Type de donnee** | Montant EUR |
| **Criticite** | B |
| **Extractibilite** | Basse (45-60%) |
| **Piege d'extraction** | Souvent confondue avec la sous-limite objets de valeur (P06). Certains assureurs ne distinguent pas bijoux et objets de valeur. D'autres ont un plafond bijoux DANS le plafond objets de valeur (sous-sous-limite). L'extracteur confond frequemment les deux. En V2, si la distinction n'est pas claire, on regroupe P06 et P07 sous un seul element "sous-limite objets de valeur/bijoux". |

### P08 -- Mode d'indemnisation (valeur a neuf vs vetuste)

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `mode_indemnisation` |
| **Synonymes assureurs** | "Valeur a neuf" / "Remplacement a neuf" / "Valeur de remplacement" / "Valeur reelle" / "Valeur vetuste" / "Valeur d'usage" / "Neuwert" / "Zeitwert" (DE) |
| **Type de donnee** | Categorique : valeur_neuf / vetuste / mixte / non_determine |
| **Criticite** | A |
| **Extractibilite** | Moyenne (60-75%) |
| **Piege d'extraction** | **Piege subtil** : la plupart des contrats MRH luxembourgeois indemnisent en "valeur de remplacement" (valeur a neuf) pour le batiment, mais en "valeur vetuste" (valeur d'usage) pour le contenu, SAUF si l'option "reequipement a neuf" est souscrite. Le LLM peut extraire "valeur a neuf" du paragraphe batiment et conclure que tout le contrat est en valeur a neuf. Il faut differencier le mode pour le batiment et le mode pour le contenu. En V2, on capture le mode global avec la distinction batiment/contenu si elle est disponible. |

---

## 3.4 Referentiel complet -- Garanties annexes

### A01 -- RC occupant / locataire / batiment

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `rc_occupant` |
| **Synonymes assureurs** | Baloise: "Responsabilite civile des biens" / Foyer: "RC occupant" / La Lux: "Responsabilite locative" / AXA LU: "RC habitation" / Lalux: "Responsabilite civile batiment" |
| **Type de donnee** | Booleen inclus/exclus + plafond EUR eventuel |
| **Criticite** | B |
| **Extractibilite** | Haute (>80%) |
| **Piege d'extraction** | Quasi systematique. Le piege est de confondre avec la RC Vie Privee (qui est HORS SCOPE V2). La RC occupant couvre les dommages causes au batiment ou par le batiment (tuile qui tombe sur la voiture du voisin). La RC Vie Privee couvre les dommages causes dans la vie quotidienne (enfant qui casse une vitre). En V2, on extrait la RC occupant/batiment, PAS la RC Vie Privee. |

### A02 -- Recours des voisins et des tiers

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `recours_voisins` |
| **Synonymes assureurs** | "Recours des voisins et des tiers" / "Recours des tiers" / "Nachbarschaftsregress" (DE) |
| **Type de donnee** | Booleen inclus/exclus |
| **Criticite** | B |
| **Extractibilite** | Haute (>80%) |
| **Piege d'extraction** | Generalement incluse dans tout MRH luxembourgeois. Le terme varie mais le concept est stable : si un sinistre chez vous cause des dommages chez le voisin, cette garantie couvre les recours. Extraction fiable car le terme est specifique. |

### A03 -- Troubles du voisinage

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `troubles_voisinage` |
| **Synonymes assureurs** | "Troubles de voisinage" / "Troubles anormaux de voisinage" / "Nachbarschaftsstorung" (DE) |
| **Type de donnee** | Booleen inclus/exclus |
| **Criticite** | C |
| **Extractibilite** | Moyenne (65-75%) |
| **Piege d'extraction** | Specifique au droit luxembourgeois (article 544 du Code civil). Pas toujours explicite dans les CG -- parfois incluse implicitement dans la RC occupant. Si non mentionnee, le statut est "non determine", pas "exclu". |

### A04 -- Defense et recours

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `defense_recours` |
| **Synonymes assureurs** | Baloise: "Defense recours" / Foyer: "Protection juridique habitation" / La Lux: "Defense et recours" / AXA LU: "Assistance juridique" / Lalux: "Defense et recours" |
| **Type de donnee** | Booleen inclus/exclus |
| **Criticite** | C |
| **Extractibilite** | Haute (>85%) |
| **Piege d'extraction** | Attention a ne pas confondre "defense et recours" (incluse dans le MRH, couvre les litiges lies a l'habitation) avec la "protection juridique" (contrat separe, couvre tous les litiges). Certains assureurs (Foyer) utilisent "protection juridique habitation" pour designer la defense-recours incluse dans le MRH. |

---

## 3.5 Referentiel complet -- Options HOME Baloise

### O01 -- Pack Multimedia

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `pack_multimedia` |
| **Synonymes assureurs** | "Pack Multimedia" (Baloise) / "Garantie appareils electroniques" / "Couverture multimedia" / "Apparateschutz" (DE) |
| **Type de donnee** | Booleen souscrit/non souscrit + plafond EUR |
| **Criticite** | C |
| **Extractibilite** | Moyenne (60-70%) |
| **Piege d'extraction** | Specifique Baloise. Les concurrents n'ont pas forcement un pack equivalent nomme de la meme maniere. Certains incluent l'electronique dans les objets de valeur, d'autres dans le contenu standard avec un plafond. L'extracteur doit chercher tout ce qui touche a "electronique", "informatique", "multimedia", "photo", "home cinema" et normaliser. Lien diagnostic : Q11 valuable_possessions = multimedia. |

### O02 -- Pack Objets de valeur / d'art

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `pack_objets_valeur` |
| **Synonymes assureurs** | "Pack Objets de valeur / d'art" (Baloise) / "Garantie objets d'art" / "Couverture collections" / "Kunstversicherung" (DE) |
| **Type de donnee** | Booleen souscrit/non souscrit + plafond EUR |
| **Criticite** | C |
| **Extractibilite** | Moyenne (55-70%) |
| **Piege d'extraction** | Chez les concurrents, la couverture objets de valeur est souvent definie par la sous-limite (P06) plutot que par un pack separe. L'extracteur doit comprendre que la sous-limite haute = equivalent d'un pack souscrit, et la sous-limite basse = equivalent de non souscrit. Lien diagnostic : Q11/Q12. |

### O03 -- Pack Objets precieux / bijoux

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `pack_bijoux` |
| **Synonymes assureurs** | "Pack Objets precieux / bijoux" (Baloise) / "Garantie bijoux" / "Bijouterie et horlogerie" / "Schmuckversicherung" (DE) |
| **Type de donnee** | Booleen souscrit/non souscrit + plafond EUR |
| **Criticite** | C |
| **Extractibilite** | Basse (45-60%) |
| **Piege d'extraction** | Meme logique que O02. Difficulte supplementaire : chez certains assureurs, bijoux et objets de valeur sont dans la meme sous-limite, pas dans des packs separes. Lien diagnostic : Q11/Q12. |

### O04 -- Reequipement a neuf

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `reequipement_neuf` |
| **Synonymes assureurs** | "Reequipement a neuf" (Baloise) / "Remplacement a neuf" / "Valeur de remplacement" / "Neuanschaffungswert" (DE) / "Neuwertentschadigung" (DE) |
| **Type de donnee** | Booleen souscrit/non souscrit |
| **Criticite** | B |
| **Extractibilite** | Moyenne (60-75%) |
| **Piege d'extraction** | **Piege important** : le reequipement a neuf est une OPTION chez Baloise (le contrat de base indemnise en valeur d'usage/vetuste pour le contenu). Mais chez certains concurrents, le remplacement a neuf est INCLUS dans la formule complete. L'extracteur ne doit pas conclure "pas de reequipement a neuf" simplement parce qu'il n'y a pas d'option nommee ainsi -- le contrat peut inclure le remplacement a neuf en base. Il faut analyser le mode d'indemnisation (P08). Lien diagnostic : Q10 home_contents_value >= 50k. |

### O05 -- Pack Objets de loisirs

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `pack_loisirs` |
| **Synonymes assureurs** | "Pack Objets de loisirs" (Baloise) / "Garantie equipement sportif" / "Couverture loisirs" |
| **Type de donnee** | Booleen souscrit/non souscrit + plafond EUR |
| **Criticite** | C |
| **Extractibilite** | Basse (40-55%) |
| **Piege d'extraction** | Pack specifique Baloise, pas d'equivalent standardise chez les concurrents. Certains incluent l'equipement sportif dans les objets de valeur, d'autres dans le contenu standard. Difficile a normaliser. Lien diagnostic : Q11 valuable_possessions = sports_leisure. |

### O06 -- Pack Mobilite durable

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `pack_mobilite_durable` |
| **Synonymes assureurs** | "Pack equipements de mobilite durable" (Baloise) / "Garantie velo electrique" / "Couverture VAE" / "E-Bike-Versicherung" (DE) |
| **Type de donnee** | Booleen souscrit/non souscrit + plafond EUR |
| **Criticite** | C |
| **Extractibilite** | Basse (40-55%) |
| **Piege d'extraction** | Garantie emergente (2023-2025), pas encore standardisee. Chez certains assureurs, le velo electrique est couvert par l'assurance RC auto ou par un contrat standalone. Chez d'autres, il est dans le contenu mobilier avec un plafond bas. L'extracteur doit chercher "velo", "trottinette", "VAE", "E-Bike", "mobilite douce". Lien diagnostic : Q11 valuable_possessions = sustainable_mobility. |

### O07 -- Pack Jardin / Piscine

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `pack_jardin` |
| **Synonymes assureurs** | "Pack jardin / piscine" (Baloise) / "Garantie amenagements exterieurs" / "Couverture jardin" / "Gartenversicherung" (DE) |
| **Type de donnee** | Booleen souscrit/non souscrit + plafond EUR |
| **Criticite** | C |
| **Extractibilite** | Moyenne (55-65%) |
| **Piege d'extraction** | Chez les concurrents, les amenagements exterieurs sont parfois inclus dans le capital batiment (si fixes au sol) ou exclus completement (si mobiles). Le terme "jardin" n'apparait pas toujours explicitement -- il faut chercher "amenagements exterieurs", "clotures", "abris", "piscine". Lien diagnostic : Q09 home_specifics = garden/pool. |

### O08 -- Pack Perte de liquide / dommages cuves

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `pack_liquide_cuves` |
| **Synonymes assureurs** | "Pack perte de liquide / dommages aux cuves" (Baloise) / "Garantie mazout/fioul" / "Couverture cuves" / "Olschadenversicherung" (DE) |
| **Type de donnee** | Booleen souscrit/non souscrit |
| **Criticite** | C |
| **Extractibilite** | Basse (40-55%) |
| **Piege d'extraction** | Garantie tres specifique aux maisons avec chauffage au mazout (encore repandu au Luxembourg). Pas toujours nommee explicitement. Parfois incluse dans "degats des eaux" (mais techniquement differente : il s'agit de fuites d'hydrocarbures, pas d'eau). L'extracteur peut confondre. Lien diagnostic : Q09/Q08 housing_type = house. |

### O09 -- Pack Energie renouvelable

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `pack_energie` |
| **Synonymes assureurs** | "Pack Energie renouvelable" (Baloise) / "Garantie panneaux solaires" / "Couverture photovoltaique" / "Photovoltaikversicherung" (DE) / "Pompe a chaleur" |
| **Type de donnee** | Booleen souscrit/non souscrit + plafond EUR |
| **Criticite** | C |
| **Extractibilite** | Moyenne (55-65%) |
| **Piege d'extraction** | Au Luxembourg, les panneaux solaires sont tres repandus (incitations PRIMe House). Chez certains assureurs, ils sont couverts par le capital batiment s'ils sont fixes au toit (consideres comme partie du batiment). Chez d'autres, ils necessitent une couverture specifique. L'extracteur doit chercher "solaire", "photovoltaique", "pompe a chaleur", "PAC", "geothermie". Lien diagnostic : Q09 home_specifics = solar_panels. |

### O10 -- Pack Cave a vin / denrees alimentaires

| Champ | Valeur |
|-------|--------|
| **Nom normalise** | `pack_cave_vin` |
| **Synonymes assureurs** | "Pack Cave a vin / denrees alimentaires" (Baloise) / "Garantie cave a vin" / "Couverture denrees" / "Weinkellerversicherung" (DE) |
| **Type de donnee** | Booleen souscrit/non souscrit + plafond EUR |
| **Criticite** | C |
| **Extractibilite** | Basse (40-55%) |
| **Piege d'extraction** | Pack tres specifique Baloise. Chez les concurrents, la cave a vin est generalement couverte par le capital contenu, avec un plafond souvent insuffisant (1 000-2 000 EUR). Le vrai enjeu est la comparaison du plafond, pas l'existence d'un pack nomme. Lien diagnostic : Q09 home_specifics = wine_cellar. |

---

## 3.6 Ce qui est HORS referentiel V2

| Element hors referentiel | Raison |
|--------------------------|--------|
| Assistance (depannage, serrurier, plombier, relogement) | Service, pas garantie dommage. Non comparable entre assureurs. |
| Protection juridique (contrat standalone) | Produit distinct, pas un composant du MRH. |
| Garantie scolaire | Protection personnes, hors scope biens. |
| RC Vie Privee | Protection personnes (quadrant "personnes"), exclue du perimetre biens. |
| E-reputation / cyber | Non standardisee, extractibilite nulle. |
| Animaux de compagnie (RC chien, mortalite) | RC = personnes. Mortalite = trop specifique. |
| Demenagement / villegiature | Temporaire, non extractible, non comparable. |
| Vacance du risque (inoccupation > X mois) | Condition de garantie, pas garantie en soi. |
| Indexation des capitaux | Important mais releve du conseil, pas de l'information. |
| Exclusions detaillees (amiante, guerre, nucleaire...) | Quasi identiques entre assureurs, pas discriminant. |
| Conditions de prise en charge detaillees | Trop granulaire pour la V2. |

---

## 3.7 Tableau de synthese du referentiel V2

| Code | Nom normalise | Type donnee | Criticite | Extractibilite | Piege principal |
|------|---------------|-------------|-----------|----------------|-----------------|
| G01 | incendie | bool | A | >90% | Sur-decomposition |
| G02 | degats_eaux | bool + franchise | A | >85% | Confusion avec inondation |
| G03 | vol | bool + plafond + franchise | A | >85% (bool), 60-75% (plafond) | Option vs base selon assureur |
| G04 | bris_glace | bool | B | >90% | -- |
| G05 | tempete | bool | B | 70-80% | Confusion avec cat nat |
| G06 | catastrophe_naturelle | bool + franchise | A | 60-75% | Pas de regime public au LU |
| G07 | dommages_electriques | bool + plafond | B | >80% | Plafond variable |
| G08 | attentats | bool | C | >85% | -- |
| P01 | capital_batiment | EUR | A | >85% | Dans CP, pas CG |
| P02 | capital_contenu | EUR | A | >80% | Formule evaluation |
| P03 | franchise_generale | EUR | A | 65-80% | Proportionnelle vs absolue |
| P04 | franchise_vol | EUR | B | 55-70% | Non mentionnee si identique |
| P05 | franchise_degats_eaux | EUR | B | 55-70% | Recherche de fuite |
| P06 | souslimite_objets_valeur | EUR | B | 55-70% | Par objet vs global |
| P07 | souslimite_bijoux | EUR | B | 45-60% | Confondue avec P06 |
| P08 | mode_indemnisation | categ. | A | 60-75% | Batiment vs contenu |
| A01 | rc_occupant | bool | B | >80% | Confusion avec RC Vie Privee |
| A02 | recours_voisins | bool | B | >80% | -- |
| A03 | troubles_voisinage | bool | C | 65-75% | Implicite dans RC occupant |
| A04 | defense_recours | bool | C | >85% | Confusion avec PJ standalone |
| O01 | pack_multimedia | bool + EUR | C | 60-70% | Pas d'equivalent standardise |
| O02 | pack_objets_valeur | bool + EUR | C | 55-70% | Sous-limite = equivalent pack |
| O03 | pack_bijoux | bool + EUR | C | 45-60% | Confondue avec O02 |
| O04 | reequipement_neuf | bool | B | 60-75% | Inclus en base chez certains |
| O05 | pack_loisirs | bool + EUR | C | 40-55% | Pas standardise |
| O06 | pack_mobilite_durable | bool + EUR | C | 40-55% | Emergent, pas standardise |
| O07 | pack_jardin | bool + EUR | C | 55-65% | Inclus dans capital batiment |
| O08 | pack_liquide_cuves | bool | C | 40-55% | Confondu avec degats eaux |
| O09 | pack_energie | bool + EUR | C | 55-65% | Couvert par capital batiment |
| O10 | pack_cave_vin | bool + EUR | C | 40-55% | Plafond contenu standard |

---

# SECTION 4 : Strategie de phasage realiste

## 4.1 Phase 0 -- Validation marche (4 semaines)

### Objectif

Verifier que les utilisateurs de la Roue des Besoins sont reellement interesses par l'adequation contrats HOME, avant d'investir dans le developpement.

### Mecanisme

Deployer un **CTA factice** ("Faites le point sur votre assurance habitation") sur la ResultsPage, pour les utilisateurs ayant complete le quadrant biens et ayant au moins une recommandation HOME active.

Le CTA declenche :
- Un clic traque (analytics)
- Un ecran intermediaire : "Cette fonctionnalite est en cours de developpement. Souhaitez-vous etre informe de sa disponibilite ?" avec un champ email
- Tracking du taux de clic et du taux d'inscription a la notification

### Seuils GO/NO-GO Phase 0

| Metrique | Seuil NO-GO | Seuil GO conditionnel | Seuil GO franc |
|----------|-------------|----------------------|----------------|
| Taux de clic sur CTA | < 10% | 10-20% | > 20% |
| Taux d'inscription email | < 3% | 3-8% | > 8% |
| Volume minimum | < 50 clics | 50-150 clics | > 150 clics |

**Duree : 4 semaines apres deploiement du CTA.**

### Charge Phase 0

- 2-3 jours de dev (CTA + tracking + ecran intermediaire)
- Pas de backend, pas de base de donnees, pas de referentiel
- Deploiement immediat sur l'existant

---

## 4.2 Phase 1 -- V2 minimale credible (6-8 semaines)

### Condition d'entree

Phase 0 validee (seuil GO conditionnel atteint).

### Scope exact

| Composant | Detail |
|-----------|--------|
| **Saisie** | Formulaire structure UNIQUEMENT (pas d'upload, pas d'OCR, pas de LLM) |
| **Assureurs** | Multi-assureurs des le depart (5 assureurs LU : Baloise, Foyer, La Lux, AXA LU, Lalux) |
| **Elements** | Priorite A uniquement (8 elements : G01, G02, G03, G06, P01, P02, P03, P08) |
| **Rapport** | Categorique par garantie : couvert / non couvert / non determine |
| **Matching** | Croisement avec les reponses Q07-Q13 et les regles HOME-01 a HOME-15 |
| **Output** | Ecran de resultats avec tableau garantie par garantie + statut + ecarts identifies |
| **Disclaimer** | Obligatoire : "Cette analyse est indicative et ne constitue pas un conseil en assurance" |

### Justification du choix multi-assureurs

Le choix "Baloise only d'abord" a ete evalue et rejete pour les raisons suivantes :

1. **Le client Baloise est deja client** -- il n'a pas besoin d'un outil pour savoir ce que couvre son contrat. Le conseiller a les donnees dans le systeme de gestion.
2. **La valeur de l'adequation est dans le PROSPECT** -- le client qui a un contrat chez Foyer ou La Lux et qui decouvre ses lacunes. Limiter a Baloise tue la proposition de valeur.
3. **Le referentiel HOME est relativement homogene** -- les 5 assureurs LU ont les memes garanties de base avec des noms legerement differents. Le surcout du multi-assureurs est mineur par rapport au mono-assureur.
4. **Le CTA promet "faites le point sur votre assurance habitation"** -- pas "faites le point sur votre contrat Baloise". Limiter a Baloise serait trompeur.

### Justification du choix saisie structuree

Le choix "PDF natifs des la Phase 1" a ete evalue et rejete pour les raisons suivantes :

1. **Complexite technique** : PDF parsing + LLM extraction + validation = 8-12 semaines supplementaires
2. **Risque de fiabilite** : extraction a 70-80% en Phase 1 = rapport d'adequation avec 20-30% d'erreurs = credibilite detruite
3. **RGPD** : upload de documents = donnees personnelles = DPIA obligatoire = 6-8 semaines de compliance
4. **Le formulaire structure est un filtre de qualite** : le client qui prend 5 minutes pour saisir ses garanties est motive et fournit des donnees fiables
5. **Le formulaire est un MVP veritable** : on valide l'interet pour l'adequation (pas pour l'upload)

### Charge Phase 1

| Composant | Charge estimee |
|-----------|---------------|
| Referentiel HOME TypeScript (types + mapping synonymes) | 3-4 jours |
| Formulaire de saisie (React, 8 champs priorite A) | 4-5 jours |
| Moteur d'adequation (matching besoins/couverture) | 3-4 jours |
| Ecran de resultats (tableau + statuts + ecarts) | 3-4 jours |
| Tables Supabase + RLS + audit | 2-3 jours |
| Disclaimer + consentement RGPD | 1 jour |
| Tests + correction + validation | 3-5 jours |
| **TOTAL** | **19-26 jours = 4-6 semaines dev** |

Avec les aleas et la validation metier : **6-8 semaines calendaires.**

---

## 4.3 Phase 2 -- Enrichissement (6-10 semaines apres Phase 1)

### Condition d'entree

Phase 1 deployee et validee :
- > 30 adequations completees en 4 semaines
- Taux de completion du formulaire > 60%
- Pas de signalement d'erreur d'adequation majeur
- Retours utilisateurs positifs (qualitatif)

### Quoi en plus

| Composant | Detail |
|-----------|--------|
| **Priorite B** | Ajout des 10 elements B (G04, G05, G07, P04, P05, P06, P07, A01, A02, O04) |
| **Upload PDF natif** | Uniquement PDF texte (pas de scans, pas de photos) |
| **Extraction assistee** | LLM (Mistral, serveurs Paris EU) pour pre-remplir le formulaire a partir du PDF |
| **Validation obligatoire** | Le client DOIT valider/corriger les champs pre-remplis avant generation du rapport |
| **Score de confiance** | Par champ extrait : haute / moyenne / basse, visible pour le client |
| **Parcours conseiller** | Le conseiller peut lancer une adequation pour un client (parcours `/conseiller/clients/:id/adequation`) |
| **Historique** | Historique des adequations realisees, accessible au client et au conseiller |

### Prerequis bloquants Phase 2

| Prerequis | Responsable | Duree estimee |
|-----------|-------------|---------------|
| DPIA validee (upload de documents = donnees personnelles) | Compliance + DPO | 6-8 semaines (a lancer EN PARALLELE de la Phase 1) |
| Contrat LLM provider (Mistral) avec DPA et non-reutilisation | Legal + IT | 4-6 semaines |
| Corpus de test : 5 contrats MRH par assureur = 25 contrats | Product Manager | 2-4 semaines |
| Benchmark d'extraction sur le corpus (precision par champ) | Dev + Product Manager | 2-3 semaines |

### Charge Phase 2

| Composant | Charge estimee |
|-----------|---------------|
| Extension referentiel (10 elements B) | 2-3 jours |
| Upload PDF + stockage Supabase Storage | 3-4 jours |
| Integration Mistral (Edge Function, prompt engineering) | 5-7 jours |
| Formulaire pre-rempli avec scores de confiance | 3-4 jours |
| Parcours conseiller | 4-5 jours |
| Historique | 2-3 jours |
| Tests extraction (25 contrats x validation) | 5-7 jours |
| **TOTAL** | **24-33 jours = 5-7 semaines dev** |

Avec compliance, tests metier, et aleas : **6-10 semaines calendaires.**

---

## 4.4 Phase 3 -- Extension (a evaluer apres Phase 2)

### Condition d'entree

Phase 2 deployee et validee depuis au moins 2 mois :
- > 100 adequations HOME completees
- Precision d'extraction mesurable et > 80% sur les champs priorite A
- ROI positif (adequation -> contact conseiller -> conversion mesurable)
- Retour d'experience suffisant pour calibrer l'effort d'extension

### Quand et pourquoi etendre

| Extension | Condition de declenchement | Effort estime |
|-----------|---------------------------|---------------|
| DRIVE (auto) | Demande client constatee + referentiel auto stabilise | 4-6 semaines (referentiel different, garanties differentes) |
| Priorite C HOME (options specifiques) | Taux d'utilisation des packs > 15% dans le diagnostic | 2-3 semaines (extension du referentiel existant) |
| OCR (scans, photos) | Volume de rejet "PDF non natif" > 30% | 4-6 semaines (Google Document AI ou equivalent) |
| Allemand | Part des contrats DE > 15% du volume | 2-3 semaines (referentiel bilingue + prompt DE) |
| B-SAFE (prevoyance) | Adequation HOME validee + DPIA etendue aux donnees de sante | 6-10 semaines (donnees sensibles art. 9, referentiel complexe) |
| TRAVEL (voyage) | Faible priorite -- contrats simples, peu de valeur ajoutee | 2-3 semaines |

**Recommandation** : ne PAS planifier la Phase 3 tant que la Phase 2 n'a pas prouve sa valeur. Le risque de sur-engineering est reel.

---

## 4.5 Recommandations tranchees

### PDF natifs seulement ou scans/photos des V2 ?

**Recommandation : PDF natifs UNIQUEMENT en Phase 2. Pas de scans, pas de photos.**

Raison : l'OCR ajoute une couche de complexite (qualite d'image, orientation, resolution) et d'erreur (precision OCR 85-95% * precision LLM 75-85% = precision combinee 65-80% -- inacceptable). Les PDF natifs representent environ 70% des contrats MRH recus par email. Les 30% restants (courrier papier, scans) peuvent utiliser le formulaire de saisie manuelle de la Phase 1 en fallback. L'OCR est un sujet Phase 3.

### Baloise only d'abord ou multi-assureurs ?

**Recommandation : multi-assureurs des la Phase 1.**

Voir justification en 4.2 ci-dessus. L'adequation Baloise-only n'a pas de proposition de valeur. Le prospect concurrent est la cible prioritaire.

### Criteres GO/NO-GO par phase

| Phase | Critere GO | Critere NO-GO | Decideur |
|-------|-----------|---------------|----------|
| 0 -> 1 | Taux de clic CTA > 10% ET > 50 clics | Taux < 10% OU < 50 clics en 4 semaines | Product Manager |
| 1 -> 2 | > 30 adequations ET taux completion > 60% | < 30 adequations OU taux < 40% | Product Manager + Sponsor |
| 2 -> 3 | Precision extraction > 80% ET conversion adequation -> contact > 10% | Precision < 70% OU conversion < 5% | Comite produit |

---

# SECTION 5 : Estimation de charge

## 5.1 Version minimale credible (Phase 0 + Phase 1)

| Composant | Charge | Faisable par 1 dev ? |
|-----------|--------|---------------------|
| **Phase 0 : CTA factice + tracking** | 2-3 jours | Oui |
| **Phase 1 : Referentiel TypeScript** | 3-4 jours | Oui |
| **Phase 1 : Formulaire saisie (8 champs A)** | 4-5 jours | Oui |
| **Phase 1 : Moteur adequation** | 3-4 jours | Oui |
| **Phase 1 : Ecran resultats** | 3-4 jours | Oui |
| **Phase 1 : Tables Supabase + RLS + audit** | 2-3 jours | Oui |
| **Phase 1 : Disclaimer + RGPD** | 1 jour | Oui |
| **Phase 1 : Tests + validation** | 3-5 jours | Oui (mais validation metier = PM) |
| **TOTAL Phase 0 + Phase 1** | **21-29 jours** | **Oui, 1 dev suffit** |

**En semaines calendaires : 6-8 semaines** (incluant les aleas, reviews, et validation metier).

**Prerequis bloquants Phase 1 :**
- Validation Phase 0 (4 semaines de mesure)
- Consentement RGPD basique (pas de DPIA car pas d'upload)
- Aucun prerequis compliance lourd (saisie manuelle = pas de donnees transmises a un tiers)

---

## 5.2 Version confort (Phase 0 + Phase 1 + Phase 2)

| Composant | Charge | Faisable par 1 dev ? |
|-----------|--------|---------------------|
| **Phase 0 + Phase 1** | 21-29 jours | Oui |
| **Phase 2 : Extension referentiel** | 2-3 jours | Oui |
| **Phase 2 : Upload PDF + Supabase Storage** | 3-4 jours | Oui |
| **Phase 2 : Integration Mistral** | 5-7 jours | Oui, si experience LLM |
| **Phase 2 : Formulaire pre-rempli** | 3-4 jours | Oui |
| **Phase 2 : Parcours conseiller** | 4-5 jours | Oui |
| **Phase 2 : Historique** | 2-3 jours | Oui |
| **Phase 2 : Tests extraction (25 contrats)** | 5-7 jours | Non -- PM doit valider metier |
| **TOTAL Phase 0 + 1 + 2** | **45-62 jours** | **1 dev + PM temps partiel** |

**En semaines calendaires : 14-18 semaines** (incluant la DPIA en parallele, le contrat Mistral, et le corpus de test).

**Prerequis bloquants Phase 2 :**
- DPIA validee (6-8 semaines -- a lancer des le debut de Phase 1)
- Contrat LLM provider signe (4-6 semaines)
- Corpus de 25 contrats MRH reels (5 par assureur)
- Benchmark d'extraction valide (precision > 75% sur champs A)

---

## 5.3 Ce qui est faisable par 1 dev / ce qui ne l'est pas

### Faisable par 1 dev

- Phase 0 complete (CTA factice)
- Phase 1 complete (referentiel, formulaire, moteur, resultats, Supabase)
- Phase 2 technique (upload, integration Mistral, formulaire pre-rempli, parcours conseiller)

### PAS faisable par 1 dev seul

| Tache | Qui est necessaire | Pourquoi |
|-------|-------------------|----------|
| Validation metier du referentiel HOME | Product Manager + Actuaire | Le dev ne connait pas les subtilites des CG des 5 assureurs |
| Corpus de 25 contrats MRH reels | Product Manager + Conseillers | Necessite de collecter des vrais contrats (RGPD : anonymisation) |
| Benchmark d'extraction | Product Manager + Dev | Le PM doit valider les resultats champ par champ |
| DPIA | DPO + Compliance | Processus reglementaire, pas technique |
| Contrat LLM provider | Legal + IT | Negociation contractuelle |
| Qualification IDD finale | Compliance + Legal + CAA | Processus reglementaire |
| Formation conseillers | Sales Architect + Formateur | Pas une tache dev |
| Test utilisateur reel | PM + UX (si disponible) | Le dev ne doit pas etre juge et partie |

---

## 5.4 Fragilites declarees

Je signale les fragilites suivantes, sans complaisance :

### Fragilite 1 : Le formulaire de saisie peut tuer l'experience

Un formulaire de 8 champs (Phase 1) avec des termes techniques ("franchise generale", "sous-limite objets de valeur", "mode d'indemnisation") risque un taux d'abandon de 40-60%. Le client moyen ne sait pas ce qu'est une franchise, encore moins la sienne. **Mitigation** : textes d'aide contextuels, valeurs par defaut ("si vous ne savez pas, laissez vide"), mode "je ne sais pas" pour chaque champ. Mais le risque reste reel.

### Fragilite 2 : L'adequation sans les conditions particulieres n'est qu'une estimation

Les garanties de base (incendie, degats eaux, tempete) sont dans les CG. Mais les capitaux, franchises, sous-limites et options souscrites sont dans les CONDITIONS PARTICULIERES (CP). Si le client n'a pas ses CP sous la main (et la plupart ne les ont pas), le formulaire sera incomplet. L'adequation sera alors partielle -- ce qui est honnete mais decevant.

### Fragilite 3 : La precision de l'extraction LLM est une inconnue

Les benchmarks publics de Mistral/GPT-4/Claude sur l'extraction de contrats d'assurance luxembourgeois n'existent pas. Les 70-80% de precision cites dans la V1 sont des estimations basees sur des contrats francais et americains. La realite luxembourgeoise (bilingue, formats heterogenes, petits assureurs) peut etre tres differente. **Le corpus de test est un prerequis absolu avant toute Phase 2.**

### Fragilite 4 : Le scoring d'adequation est categorique, pas quantifie

Par conception (recommandation actuaire), le rapport d'adequation dit "couvert / non couvert / non determine", pas "adequation a 73%". C'est methodologiquement juste mais commercialement moins impactant. Le client peut percevoir le resultat comme "un tableau de cases cochees" plutot que comme une analyse. La qualite du design UX sera determinante.

### Fragilite 5 : La RC Vie Privee est exclue mais souvent attendue

En excluant la RC Vie Privee du scope V2 (justification : c'est une garantie "personnes", pas "biens"), on exclut l'une des options HOME les plus importantes et les plus meconnues. Un client qui fait le point sur son assurance habitation s'attend a voir la RC Vie Privee. L'exclure est coherent metier mais potentiellement frustrant pour l'utilisateur. **Mitigation** : mentionner dans les resultats que "la RC Vie Privee est evaluee dans le quadrant Protection des Personnes" avec un lien vers le diagnostic correspondant.

### Fragilite 6 : Le multi-assureurs sans contrats reels est un pari

On recommande le multi-assureurs des la Phase 1, mais le referentiel des synonymes est base sur la connaissance marche, pas sur l'analyse de vrais contrats des 5 assureurs. Les termes reels peuvent differer des termes attendus. Le corpus de 25 contrats (Phase 2) corrigera, mais en Phase 1 (saisie manuelle), les labels du formulaire doivent etre comprehensibles quelle que soit l'assureur du client.

---

## 5.5 Timeline synthetique

```
Semaine 1-4     : Phase 0 -- CTA factice, mesure appetence
                   [EN PARALLELE] Lancement DPIA si GO anticipe
Semaine 5        : Decision GO/NO-GO Phase 1
Semaine 5-12     : Phase 1 -- Saisie structuree, 8 elements A, multi-assureurs
                   [EN PARALLELE] DPIA, contrat LLM, corpus de test
Semaine 13       : Decision GO/NO-GO Phase 2
Semaine 13-22    : Phase 2 -- Upload PDF natif, 18 elements A+B, extraction Mistral
Semaine 23+      : Stabilisation, retours, decision Phase 3
```

**Horizon total Phase 0-2 : 22 semaines calendaires (5-6 mois).**

---

## Conclusion decisionnelle

### Ce que cette V2 apporte par rapport a la V1

| Dimension | V1 | V2 |
|-----------|----|----|
| Perimetre | 4 quadrants, 48 garanties, tous produits | 1 produit (HOME), 30 elements, perimetre ferme |
| Credibilite | Faible (trop large) | Forte (expertise reelle, referentiel maitrise) |
| Time-to-market | 12+ semaines MVP | 6-8 semaines MVP (apres validation Phase 0) |
| Risque | Eleve (erreurs multi-produits) | Contenu (erreurs sur un seul perimetre connu) |
| Proposition de valeur | Vague | Concrete ("votre assurance habitation, garantie par garantie") |

### Recommandation

**GO Phase 0 immediat** (2-3 jours de dev). Le CTA factice ne coute quasi rien et valide l'appetence avant tout investissement.

**GO Phase 1 conditionnel** au resultat de la Phase 0. Si le taux de clic depasse 10%, lancer le developpement de la saisie structuree.

**GO Phase 2 conditionnel** au resultat de la Phase 1 ET a la DPIA validee. Ne pas lancer l'extraction LLM sans un corpus de test valide et un benchmark de precision.

La V2 HOME est un choix de raison, pas de renoncement. Mieux vaut une adequation habitation credible et utilisee qu'une adequation 4 quadrants approximative et abandonnee.

---

> Document genere le 28 mars 2026
> Pour comite de decision -- version 2.0
