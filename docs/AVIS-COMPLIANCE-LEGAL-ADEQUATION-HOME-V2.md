# Avis conjoint Compliance Officer + Legal Counsel
# Fonctionnalite d'adequation contrats -- V2 Protection des Biens (MRH)

> Roue des Besoins Assurance -- Baloise Luxembourg
> Date : 28 mars 2026
> Statut : AVIS DEFINITIF POUR COMITE DE DECISION
> Auteurs : Insurance Compliance Officer + Insurance Legal Counsel
> Destinataires : Direction, Product Manager, IT Architect, DPO, Service juridique Baloise Luxembourg
> Classification : Confidentiel -- usage interne

---

## Table des matieres

1. [Objet et perimetre](#1-objet-et-perimetre)
2. [Qualification IDD](#2-qualification-idd)
3. [Impact du recentrage sur RGPD](#3-impact-du-recentrage-sur-rgpd)
4. [Impact sur AI Act](#4-impact-sur-ai-act)
5. [Disclaimers precis](#5-disclaimers-precis)
6. [Formulations interdites](#6-formulations-interdites)
7. [Position sur la responsabilite](#7-position-sur-la-responsabilite)
8. [Points necessitant validation juridique interne](#8-points-necessitant-validation-juridique-interne)
9. [Synthese decisionnelle](#9-synthese-decisionnelle)

---

## 1. Objet et perimetre

### Ce qui est analyse

La V2 de la fonctionnalite d'adequation contrats, restreinte a :
- **Perimetre produit** : protection des biens uniquement = assurance multirisque habitation (MRH) au Luxembourg
- **Fonctionnement** : l'utilisateur uploade son contrat MRH existant (PDF), le systeme extrait les garanties et les compare aux besoins detectes par la Roue des Besoins
- **Restitution** : categorique uniquement -- couvert / partiellement couvert / gap detecte / non evaluable
- **Exclusions explicites** : pas de pourcentage, pas de score numerique, pas de recommandation de produit, pas de prevoyance, pas de sante, pas de RC vie privee standalone, pas de protection juridique standalone

### Ce qui a change par rapport a la V1

La V1 envisageait les 4 quadrants (biens, personnes, projets, futur) avec 48 garanties, incluant des produits de prevoyance (B-SAFE), d'epargne (futur), et de voyage (TRAVEL). La V2 se recentre sur un seul quadrant et un seul type de produit.

**Ce recentrage est significatif du point de vue conformite. Il simplifie materiellement l'analyse sur trois axes : IDD, RGPD et AI Act.**

---

## 2. Qualification IDD

### 2.1. Les quatre niveaux IDD et leur application

La Directive sur la Distribution d'Assurance (IDD -- Directive 2016/97) et sa transposition luxembourgeoise distinguent des niveaux d'interaction avec le client qui emportent des obligations croissantes.

#### a) Information pure

**Definition** : communiquer au client des faits objectifs sur son contrat sans mise en perspective.

**Exemple** : "Votre contrat inclut les garanties suivantes : incendie, degats des eaux, vol."

**Obligations** : minimales. Pas d'exigence IDD specifique au-dela de l'exactitude.

**La V2 n'est PAS a ce niveau.** Des l'instant ou le systeme croise les garanties extraites avec les besoins detectes, il depasse l'information pure.

#### b) Comparaison / mise en adequation

**Definition** : mettre en regard la situation du client (besoins detectes) avec sa couverture existante, sans orienter vers une solution.

**Exemple** : "Votre diagnostic indique un besoin de couverture pour les degats des eaux. Votre contrat actuel ne mentionne pas cette garantie."

**Obligations** : l'information doit etre claire, exacte et non trompeuse (art. 17 IDD transpose). L'outil ne doit pas creer une attente de completude ou d'exhaustivite qu'il ne peut pas tenir.

**C'est ICI que se situe la V2 telle que decrite.** La V2 effectue une comparaison factuelle entre les besoins identifies par le questionnaire et les garanties extraites du contrat. La restitution categorique (couvert / gap / partiel / non evaluable) est le format type d'une comparaison, pas d'une recommandation.

#### c) Recommandation

**Definition** : suggerer une action ou un produit au client sur la base de l'analyse.

**Exemple** : "Nous vous suggerons de renforcer votre couverture degats des eaux."

**Obligations** : obligations IDD intermediaires. Pas de test d'adequation complet requis mais l'information ne doit pas induire en erreur.

**La V2 NE DOIT PAS franchir ce seuil.** Aucune formulation de type "nous vous suggerons", "il serait souhaitable", "nous vous recommandons" ne doit apparaitre dans l'interface.

#### d) Conseil (au sens IDD)

**Definition** : recommandation personnalisee fondee sur une analyse des exigences et besoins du client, presentee comme adaptee a sa situation.

**Exemple** : "Au vu de votre situation familiale et de la valeur de votre bien, nous vous recommandons le produit Baloise HOME avec l'option objets de valeur."

**Obligations** : test d'adequation complet (art. 20 IDD), declaration de la nature du conseil, document de conseil, formation du distributeur, supervision, etc.

**La V2 ne doit EN AUCUN CAS atteindre ce niveau.** C'est le scenario a eviter absolument.

### 2.2. Position definitive : la V2 est une COMPARAISON

**Notre qualification : la V2 se situe au niveau (b) -- comparaison / mise en adequation informative.**

Justification :

| Critere | Analyse |
|---------|---------|
| Le systeme croise-t-il des donnees client avec une couverture ? | Oui -- c'est le coeur de la fonctionnalite |
| Le systeme oriente-t-il vers un produit Baloise ? | Non -- pas de recommandation de produit |
| Le systeme propose-t-il une action ? | Non -- il constate un ecart, il ne prescrit pas |
| Le systeme se presente-t-il comme un conseil ? | Non -- disclaimer explicite |
| Le resultat est-il binaire/categorique ? | Oui -- couvert / gap / partiel / non evaluable |
| Le systeme prend-il en compte la situation globale du client ? | Non -- il se limite au contrat MRH uploade |

### 2.3. La frontiere exacte a ne pas franchir

La frontiere entre comparaison et recommandation est une **frontiere de langage ET de fonctionnalite**. Voici les deux cotes de la ligne :

| COTE AUTORISE (comparaison) | COTE INTERDIT (recommandation/conseil) |
|-----------------------------|----------------------------------------|
| "Gap detecte : degats des eaux" | "Nous vous suggerons d'ajouter la garantie degats des eaux" |
| "Votre contrat ne mentionne pas cette garantie" | "Il serait judicieux de completer votre couverture" |
| "Non evaluable -- informations insuffisantes" | "Contactez votre assureur pour verifier ce point" |
| Afficher les 4 statuts sans commentaire | Ajouter un bouton "Obtenir un devis Baloise" a cote d'un gap |
| Lien vers un conseiller Baloise (generique, non contextuel) | Lien vers un produit Baloise specifique en fonction du gap detecte |

**Point critique : le CTA post-adequation**

Le CTA qui suit l'affichage des resultats est le point le plus sensible. Un bouton "Contactez un conseiller" generique, non conditionne par le resultat de l'adequation, est acceptable. Un bouton "Couvrez ce gap" qui s'affiche uniquement en face d'un gap detecte est une recommandation deguisee.

**Recommandation** : le CTA post-adequation doit etre identique quel que soit le resultat (couvert, gap, ou partiel). Il doit etre generique : "Echanger avec un conseiller sur mon diagnostic" -- pas "Combler ce gap".

### 2.4. Le recentrage "biens only" change-t-il la qualification ?

**Oui, il la facilite materiellement, sans changer la nature juridique.**

| Facteur | V1 (4 quadrants, 48 garanties) | V2 (MRH only) |
|---------|-------------------------------|----------------|
| Risque de requalification en conseil | Plus eleve : la prevoyance et la sante touchent des besoins vitaux ; le regulateur est plus vigilant | Plus faible : la MRH est un produit IARD standard, le risque de confusion information/conseil est moindre |
| Donnees sensibles traitees | Oui (art. 9 RGPD : prevoyance = donnees de sante) | Non (pas de donnees de sante dans un contrat MRH) |
| Complexite du matching | 48 garanties, interactions croisees entre quadrants | ~16 garanties MRH, perimetre ferme |
| Risque de perception "pousseur de produit" | Plus eleve : 4 produits Baloise potentiellement concernés | Plus faible : 1 seul type de produit concerne |
| Exigence du CAA (Commissariat aux Assurances) | Plus stricte si la prevoyance est concernee | Standard pour la MRH |

**Conclusion** : le recentrage MRH rend la qualification "comparaison" plus robuste et plus defensible devant le regulateur. La V1 avec prevoyance/sante etait objectivement plus risquee.

### 2.5. Niveau de confiance de cette qualification

| Element | Niveau de confiance |
|---------|-------------------|
| La V2 n'est pas de l'information pure | Certain |
| La V2 n'est pas du conseil au sens IDD | Certain (si les disclaimers et le design sont corrects) |
| La V2 n'est pas une recommandation | Eleve (si aucune formulation suggestive, aucun CTA conditionnel) |
| La V2 est une comparaison factuelle | Eleve -- c'est notre position |
| Le CAA partagerait cette qualification | Probable mais NON CERTAIN -- a confirmer |

**Point de franchise** : cette qualification repose sur notre lecture des textes IDD transposes. Le Commissariat aux Assurances (CAA) au Luxembourg a la competence exclusive pour qualifier une activite. Nous estimons que notre position est solidement defendable, mais elle doit etre validee en interne avec le service juridique Baloise Luxembourg, et idealement faire l'objet d'un echange informel avec le CAA si Baloise le juge opportun.

---

## 3. Impact du recentrage sur RGPD

### 3.1. Les donnees contenues dans un contrat MRH

Un contrat MRH luxembourgeois contient typiquement :

| Categorie de donnees | Exemples | Base RGPD |
|---------------------|----------|-----------|
| Identification | Nom, prenom, date de naissance | Art. 6(1)(a) ou (f) |
| Coordonnees | Adresse du bien assure, adresse postale | Art. 6(1)(a) ou (f) |
| Patrimoine immobilier | Type de bien, surface, annee de construction | Art. 6(1)(a) ou (f) |
| Patrimoine mobilier | Valeur du contenu, objets de valeur | Art. 6(1)(a) ou (f) |
| Donnees financieres | Prime annuelle, montant des capitaux assures | Art. 6(1)(a) ou (f) |
| Donnees contractuelles | Numero de contrat, dates d'effet, assureur | Art. 6(1)(a) ou (f) |

**Constat cle : aucune de ces donnees ne constitue une donnee de categorie particuliere au sens de l'article 9 du RGPD.**

Un contrat MRH ne contient pas :
- De donnees de sante (pas de prevoyance, pas d'hospitalisation)
- De donnees genetiques ou biometriques
- De donnees relatives aux condamnations penales (art. 10)
- De donnees revelant l'origine raciale/ethnique, les opinions politiques, les convictions religieuses, l'appartenance syndicale

### 3.2. La DPIA est-elle encore obligatoire ?

**Position nuancee : la DPIA reste recommandee mais son caractere obligatoire est moins certain que pour la V1.**

Analyse selon les criteres de l'art. 35 RGPD et des lignes directrices WP248 rev.01 (CNIL/EDPB) :

| Critere EDPB (2 sur 9 = DPIA probablement obligatoire) | V1 (4 quadrants) | V2 (MRH only) |
|--------------------------------------------------------|-------------------|----------------|
| 1. Evaluation/scoring | Oui (needScore, productScore) | Oui (adequation categorique) |
| 2. Decision automatique avec effet juridique/significatif | Discutable (pas d'effet juridique direct) | Discutable (idem) |
| 3. Surveillance systematique | Non | Non |
| 4. Donnees sensibles (art. 9) | **OUI** (prevoyance = sante) | **NON** |
| 5. Traitement a grande echelle | Non (MVP) | Non |
| 6. Croisement de jeux de donnees | Oui (questionnaire x contrat) | Oui (questionnaire x contrat MRH) |
| 7. Personnes vulnerables | Possible (sinistres) | Moins probable (MRH = patrimoine) |
| 8. Usage innovant | Oui (premier usage de ce type pour Baloise LU) | Oui |
| 9. Blocage d'un droit ou acces a un service | Non | Non |

**V1** : 4+ criteres positifs -> DPIA obligatoire (notamment critere 4 : donnees de sante).
**V2** : 3 criteres positifs (1, 6, 8) -> DPIA recommandee mais pas certainement obligatoire au strict sens du texte.

**Notre recommandation : faire la DPIA quand meme.**

Raisons :
1. La CNPD (Commission Nationale pour la Protection des Donnees) au Luxembourg a une liste nationale d'operations exigeant une DPIA. Le croisement de donnees de contrats d'assurance avec un profil de besoins pourrait y tomber.
2. La DPIA est un document de defense en cas de controle. Son absence est un risque reputationnel.
3. Pour un perimetre MRH, la DPIA sera significativement plus legere que pour la V1.

### 3.3. La DPIA V2 est-elle plus legere ?

**Oui, substantiellement.**

| Element de la DPIA | V1 | V2 |
|-------------------|-----|-----|
| Categorie de donnees | Art. 6 + Art. 9 (sante) | Art. 6 uniquement |
| Base legale pour art. 9 | Consentement explicite art. 9(2)(a) -- lourd a implementer | Non applicable |
| Evaluation des risques | Elevee (fuite de donnees de sante = sanction aggravee) | Moderee (donnees patrimoniales = risque standard) |
| Mesures de securite specifiques | Chiffrement renforce, acces restreint, traitement separe | Mesures standard (RLS, audit, suppression) |
| Complexite du document | 15-25 pages | 8-12 pages |
| Temps de realisation estime | 3-4 semaines | 1-2 semaines |

### 3.4. Le consentement explicite art. 9 est-il encore necessaire ?

**Non. Pour un perimetre strictement MRH, le consentement explicite art. 9(2)(a) n'est pas necessaire.**

L'article 9 s'applique aux "categories particulieres de donnees a caractere personnel", dont les donnees concernant la sante. Un contrat MRH ne contient pas de donnees de sante. Le fondement juridique du traitement releve de l'article 6, pas de l'article 9.

**Attention** : cela suppose que le systeme rejette ou ne traite pas les contrats qui ne sont pas des MRH. Si un utilisateur uploade un contrat B-SAFE (prevoyance) ou un contrat sante, le systeme DOIT :
1. Detecter que ce n'est pas un contrat MRH
2. Refuser le traitement avec un message clair
3. Supprimer le fichier uploade immediatement
4. Logger le rejet (sans logger le contenu du document)

**C'est un point de design critique.** Le filtre MRH-only doit etre implementé des l'extraction, pas apres.

### 3.5. Quel consentement reste necessaire ?

Meme sans art. 9, le traitement de donnees personnelles (art. 6) requiert une base legale. Pour l'upload de contrats, deux bases sont envisageables :

| Base legale | Applicabilite | Recommandation |
|-------------|---------------|----------------|
| Art. 6(1)(a) : Consentement | Oui -- le client consent activement en uploadant | **Recommandee.** Consentement granulaire avant upload : "J'accepte que mes donnees de contrat soient analysees pour comparer ma couverture actuelle a mes besoins identifies." |
| Art. 6(1)(f) : Interet legitime | Potentiellement (interet legitime de Baloise a fournir un service d'analyse) | Risquee. L'upload de contrats concurrents depasse probablement l'attente raisonnable du client. Necessite un test de balance des interets. |

**Recommandation** : consentement art. 6(1)(a), libre, specifique, eclaire et univoque. Pas de pre-cochage. Checkbox explicite avant l'upload.

### 3.6. Obligations RGPD restantes

| Obligation | Statut V2 | Action requise |
|------------|-----------|----------------|
| Information art. 13 (transparence) | CRIT-3 de l'audit : pas de politique de confidentialite | Politique de confidentialite a creer/mettre a jour pour inclure le traitement des contrats |
| Droit d'acces (art. 15) | `export_my_data()` existante | Etendre pour inclure les contrats uploades et les resultats d'adequation |
| Droit de suppression (art. 17) | `delete_my_data()` existante | Etendre pour supprimer les fichiers du Storage + les resultats d'adequation |
| Droit de rectification (art. 16) | Fonctionnalite de correction manuelle prevue | OK si implementee correctement |
| Duree de conservation | MOD-6 de l'audit : non mentionnee | Definir une duree (proposition : 12 mois apres le dernier diagnostic, puis suppression automatique) |
| Registre des traitements (art. 30) | A mettre a jour | Ajouter le traitement "analyse d'adequation MRH" au registre |

---

## 4. Impact sur AI Act

### 4.1. Cadre applicable

Le Reglement (UE) 2024/1689 (AI Act) est entre en vigueur le 1er aout 2024 avec une mise en application progressive :
- Pratiques interdites : depuis fevrier 2025
- Obligations pour IA a usage general : depuis aout 2025
- Systemes a haut risque : a partir d'aout 2026
- Conformite totale : a partir d'aout 2027

### 4.2. Scenario A : extraction via OCR structure (pas d'IA)

**Si le systeme utilise un OCR deterministe** (type Tesseract, Google Document AI Form Parser en mode extraction pure, regex + heuristiques) **sans modele de machine learning** :

| Element | Analyse |
|---------|---------|
| Le systeme est-il un "systeme d'IA" au sens de l'AI Act ? | **Probablement non.** L'AI Act definit un systeme d'IA comme un systeme base sur l'apprentissage automatique, concu pour generer des sorties telles que des predictions, contenus, recommandations ou decisions. Un OCR deterministe classique n'est pas un systeme d'IA au sens du reglement. |
| Charge reglementaire AI Act | **Nulle.** Pas de classification, pas d'obligation de transparence au titre de l'AI Act, pas de documentation technique specifique. |
| Obligations restantes | RGPD (voir section 3), IDD (voir section 2), droit commun de la responsabilite. |

**Attention** : Google Document AI Form Parser, meme en mode "extraction", utilise internement du machine learning. La qualification depend de si Baloise considere qu'elle "deploie" un systeme d'IA ou si elle utilise un service tiers. En tant que "deployer" au sens de l'AI Act, Baloise aurait des obligations meme si le systeme est fourni par un tiers.

### 4.3. Scenario B : extraction via LLM (Mistral, GPT, Claude)

**Si le systeme utilise un LLM** pour l'extraction et/ou la structuration des donnees :

| Element | Analyse |
|---------|---------|
| Le systeme est-il un "systeme d'IA" ? | **Oui, sans ambiguite.** Un LLM est un modele d'IA a usage general (GPAI). |
| Classification dans l'AI Act | **C'est la question critique -- voir ci-dessous.** |

#### Classification du risque

L'Annexe III de l'AI Act liste les systemes d'IA a haut risque. Le point 5(a) concerne :

> "Les systemes d'IA destines a etre utilises pour evaluer la solvabilite des personnes physiques ou etablir leur note de credit, a l'exception des systemes d'IA utilises dans le but de detecter les fraudes financieres."

Le point 5(b) concerne :

> "Les systemes d'IA destines a etre utilises pour l'evaluation des risques et la tarification en ce qui concerne les personnes physiques dans le cas de l'assurance-vie et de l'assurance maladie."

**Analyse pour la V2 MRH :**

| Critere Annexe III | V2 MRH | V1 (prevoyance incluse) |
|-------------------|--------|------------------------|
| 5(a) Evaluation de solvabilite | Non -- l'outil n'evalue pas la solvabilite | Non |
| 5(b) Evaluation des risques assurance-vie/sante | **NON** -- la MRH n'est ni de l'assurance-vie ni de l'assurance maladie | **POTENTIELLEMENT OUI** si la prevoyance/sante etait concernee |
| Autre categorie Annexe III | Non identifiee | Non identifiee |

**Conclusion : la V2 MRH avec LLM n'est PAS un systeme d'IA a haut risque au sens de l'AI Act.**

Le recentrage MRH evacue le risque principal de classification a haut risque, qui est le point 5(b) de l'Annexe III (assurance-vie et assurance maladie).

#### Obligations residuelles avec un LLM

Meme si le systeme n'est pas a haut risque, l'AI Act impose des obligations pour les systemes d'IA en interaction avec des personnes physiques :

| Obligation | Applicable ? | Action |
|-----------|-------------|--------|
| Transparence (art. 50) : informer l'utilisateur qu'il interagit avec un systeme d'IA | **Oui** si LLM | Disclaimer : "L'extraction des donnees de votre contrat utilise une technologie d'intelligence artificielle." |
| Pas de manipulation (art. 5) | Oui | Le systeme ne doit pas induire en erreur sur la nature ou la fiabilite de l'analyse |
| Supervision humaine | Recommandee (pas obligatoire pour risque non-haut) | Validation utilisateur des donnees extraites |

#### Obligations du fournisseur GPAI

Mistral AI, en tant que fournisseur d'un modele d'IA a usage general, a ses propres obligations au titre de l'AI Act (art. 53) : documentation technique, transparence, politique de respect du droit d'auteur, etc. Ces obligations pesent sur Mistral, pas sur Baloise en tant que "deployer". Mais Baloise doit verifier que Mistral respecte ses obligations (due diligence minimale sur le fournisseur).

### 4.4. Recommandation OCR vs LLM du point de vue reglementaire pur

| Critere | OCR structure | LLM (Mistral) |
|---------|---------------|----------------|
| Charge AI Act | Nulle | Faible (transparence + due diligence fournisseur) |
| Charge RGPD supplementaire | Nulle | Faible (transfert de donnees a Mistral = sous-traitance art. 28) |
| Risque de classification a haut risque | Nul | Nul pour MRH -- mais le risque revient si le scope est elargi a la prevoyance |
| Qualite d'extraction | Plus faible (pas de comprehension semantique) | Plus elevee (comprehension contextuelle du contrat) |
| Risque d'hallucination | Nul | Present (le LLM peut inventer des garanties) |
| Defensibilite en cas de litige | Plus forte (resultat deterministe et reproductible) | Plus faible (resultat non deterministe, difficulte a expliquer pourquoi le LLM a produit tel resultat) |

**Recommandation reglementaire** :

1. **Si la qualite d'extraction OCR est suffisante pour la MRH** (ce qui est plausible pour des PDF natifs) : privilegier l'OCR. La charge reglementaire est nulle et la defensibilite est maximale.

2. **Si le LLM est necessaire** (scans, photos, structuration semantique) : acceptable pour la MRH sans risque reglementaire majeur. Mais trois conditions :
   - Disclaimer IA obligatoire (art. 50 AI Act)
   - Contrat de sous-traitance RGPD (art. 28) avec Mistral AI
   - Validation humaine obligatoire des donnees extraites

3. **Approche hybride recommandee** : OCR pour les PDF natifs (deterministe, sans IA), LLM uniquement pour les scans/photos quand l'OCR echoue. Cela minimise l'exposition reglementaire AI Act tout en preservant la qualite.

4. **Alerte strategique** : si Baloise envisage d'etendre le scope a la prevoyance/sante dans une V3, le recours a un LLM pour l'extraction reouvrirait la question de la classification a haut risque (Annexe III, 5(b)). Cette decision doit etre anticipee maintenant dans l'architecture.

---

## 5. Disclaimers precis

### 5.1. Disclaimer AVANT upload

**Emplacement** : ecran de consentement, avant que l'utilisateur ne puisse selectionner un fichier.

**Wording propose** :

> **Analyse de votre contrat habitation**
>
> En uploadant votre contrat, vous acceptez que Baloise analyse automatiquement les informations qu'il contient afin de les comparer aux besoins identifies par votre diagnostic.
>
> Important :
> - Cette analyse est purement informative et ne constitue pas un conseil en assurance au sens de la loi.
> - Seuls les contrats d'assurance habitation (multirisque habitation) sont acceptes.
> - L'analyse se fonde exclusivement sur les informations lisibles dans le document que vous fournissez. Elle ne prend pas en compte les conditions generales, les avenants, les exclusions detaillees ou les clauses particulieres qui ne figurent pas dans le document uploade.
> - Les resultats sont indicatifs et ne se substituent pas a la lecture de votre contrat ni a l'avis d'un professionnel de l'assurance.
>
> Vos donnees sont traitees conformement a notre politique de confidentialite. Vous pouvez supprimer vos donnees a tout moment depuis votre espace personnel.
>
> [ ] J'ai lu et j'accepte les conditions ci-dessus.
>
> [Selectionner mon contrat]

### 5.2. Disclaimer AVEC les resultats

**Emplacement** : en tete de la page de resultats d'adequation, visible sans scroll.

**Wording propose** :

> **A propos de cette analyse**
>
> Cette comparaison est realisee a titre informatif uniquement. Elle ne constitue ni un conseil en assurance, ni une evaluation exhaustive de votre couverture. Les resultats se fondent sur les informations extraites de votre document et les besoins declares dans votre diagnostic. Des ecarts peuvent exister en raison de conditions, exclusions ou avenants non presents dans le document analyse. Pour une analyse complete de votre situation, consultez un conseiller en assurance.

### 5.3. Disclaimer dans le PDF/export

**Emplacement** : page 1 du PDF, en-tete ou pied de page recurrent, ET en fin de document.

**Wording propose (en-tete recurrent)** :

> Document a titre informatif -- Ne constitue pas un conseil en assurance

**Wording propose (fin de document)** :

> **Avertissement**
>
> Le present document est genere automatiquement a des fins purement informatives. Il presente une comparaison entre les besoins identifies lors de votre diagnostic Roue des Besoins et les informations extraites de votre contrat d'assurance habitation. Cette analyse ne constitue pas un conseil en assurance au sens de la legislation applicable, notamment la Directive sur la Distribution d'Assurance (IDD). Elle ne prend pas en compte l'ensemble des conditions de votre contrat (conditions generales, exclusions detaillees, avenants, limitations specifiques). Les statuts affiches (couvert, partiellement couvert, gap detecte, non evaluable) sont indicatifs et ne sauraient engager la responsabilite de Baloise Assurances Luxembourg S.A. quant a l'exhaustivite ou l'exactitude de l'analyse. Pour toute decision relative a votre couverture d'assurance, nous vous invitons a consulter un conseiller qualifie.
>
> Analyse generee le [date] -- Version [version du moteur d'adequation]

### 5.4. Disclaimer supplementaire si LLM utilise

**A ajouter au disclaimer avant upload si et seulement si un LLM est utilise pour l'extraction** :

> L'extraction des informations de votre contrat utilise une technologie d'intelligence artificielle. Les donnees extraites vous sont presentees pour verification avant toute analyse. Nous vous invitons a verifier l'exactitude des informations extraites.

### 5.5. Ce qui DOIT etre valide par le service juridique Baloise Luxembourg

**Tous les wordings ci-dessus sont des propositions.** Le service juridique Baloise Luxembourg doit :

1. Valider que les formulations sont conformes au droit luxembourgeois (transposition IDD, droit des contrats, droit de la consommation)
2. Confirmer que la mention "ne constitue pas un conseil en assurance" est juridiquement suffisante en droit luxembourgeois
3. Verifier la conformite avec les eventuelles circulaires du CAA relatives aux outils digitaux
4. Ajuster le wording pour le rendre conforme aux standards de communication Baloise
5. Valider la reference a la legislation IDD dans le disclaimer du PDF (certains juristes preferent eviter les references explicites a des textes legislatifs dans un document grand public)

**Nous ne pretendons pas que nos formulations sont definitives.** Elles sont une base de travail structuree et juridiquement orientee, pas un avis juridique au sens strict.

---

## 6. Formulations interdites

### 6.1. Liste noire -- formulations a bannir de l'interface

| Formulation INTERDITE | Pourquoi | Alternative acceptable |
|----------------------|----------|----------------------|
| "Vous etes bien couvert" | Jugement de valeur = franchit la ligne vers la recommandation. Cree une attente de garantie de la part de Baloise. | "Couvert : votre contrat mentionne cette garantie." |
| "Votre couverture est suffisante" | Jugement de suffisance = conseil implicite. | "Couvert" (statut categorique, sans qualificatif) |
| "Votre couverture est insuffisante" | Idem en negatif. | "Gap detecte : cette garantie n'a pas ete identifiee dans votre contrat." |
| "Nous vous recommandons..." | Recommandation explicite = IDD niveau (c) ou (d). | Aucune alternative -- cette formulation ne doit simplement pas exister dans l'interface. |
| "Nous vous conseillons..." | Conseil explicite = IDD niveau (d). | Aucune alternative. |
| "Il serait souhaitable de..." | Conseil implicite. | Aucune alternative. |
| "Vous devriez envisager..." | Conseil implicite. | Aucune alternative. |
| "Attention, vous n'etes pas couvert" | Ton alarmiste + jugement = frontiere recommandation. | "Gap detecte" (neutre, factuel). |
| "Votre contrat presente des lacunes" | Jugement de qualite sur le contrat d'un concurrent. | "Ecarts identifies entre vos besoins declares et les garanties detectees dans votre contrat." |
| "Risque identifie" ou "Risque de sous-assurance" | Evaluation de risque = potentiellement conseil. | "Non evaluable" ou "Gap detecte" (categories factuelles). |
| "Couverture optimale" | Jugement de qualite. | "Couvert" (sans qualificatif). |
| "Score d'adequation : 73%" | Fausse precision + notation = evaluation (cf. position actuaire). | Statuts categoriques uniquement. |
| "Vos besoins ne sont pas couverts" | Trop categorique, peut etre faux sans acces aux CG/exclusions. | "Gap detecte sur la base des informations extraites de votre document." |
| "Comparativement au marche..." | Benchmark concurrentiel = autre perimetre reglementaire. | Aucune comparaison de marche. |
| "Decouvrez notre offre habitation" | Publicite conditionnee au resultat = recommandation deguisee. | CTA generique non conditionnel (voir section 2.3). |

### 6.2. Formulations acceptables -- guide de redaction

| Contexte | Formulation acceptable |
|----------|----------------------|
| Garantie trouvee | "Couvert -- Garantie [nom] identifiee dans votre contrat." |
| Garantie partiellement trouvee | "Partiellement couvert -- La garantie [nom] est presente avec des conditions qui ne correspondent pas entierement a vos besoins declares." |
| Garantie non trouvee | "Gap detecte -- La garantie [nom] n'a pas ete identifiee dans le document analyse. Cela ne signifie pas necessairement que vous n'etes pas couvert : verifiez vos conditions generales ou consultez votre assureur." |
| Information insuffisante | "Non evaluable -- Les informations disponibles dans le document ne permettent pas de determiner le statut de cette garantie." |
| Synthese globale | "Sur les [X] besoins identifies, [Y] sont couverts, [Z] presentent un ecart, et [W] n'ont pas pu etre evalues." |
| Invitation a l'action | "Pour une analyse complete de votre situation, un conseiller Baloise peut vous accompagner." (CTA generique, non conditionnel) |

### 6.3. Regle de conception UX

**Regle absolue** : aucun element de l'interface (couleur, icone, animation, taille de police, position) ne doit creer une hierarchie d'urgence entre les resultats qui n'existe pas dans les donnees.

Concretement :
- Un gap detecte ne doit PAS etre affiche en plus gros qu'un statut "couvert"
- Pas d'icone d'alerte rouge clignotante sur les gaps
- Pas de compteur "X gaps a combler" en haut de page
- Les couleurs (vert/ambre/rouge/gris) sont acceptables comme code visuel standard, mais sans dramatisation

---

## 7. Position sur la responsabilite

### 7.1. Scenario 1 : "gap detecte" mais le client est couvert en realite

**Description** : l'outil indique "gap detecte" pour la garantie degats des eaux, mais le client a en realite cette garantie dans ses conditions generales ou un avenant non uploade.

**Risque pour Baloise** :

| Element | Analyse |
|---------|---------|
| Prejudice potentiel pour le client | Faible a nul. Le client ne perd rien. Au pire, il contacte un conseiller "pour rien" ou verifie inutilement son contrat. |
| Risque reputationnel | Modere. Le client peut perdre confiance dans l'outil si les faux negatifs sont frequents. |
| Risque juridique | Faible. Le disclaimer protege Baloise ("analyse indicative, verifiez votre contrat"). Aucun prejudice patrimonial. |
| Risque reglementaire | Faible. L'outil a indique "non evaluable" ou "gap" avec un disclaimer -- c'est prudent, pas fautif. |
| Risque commercial | Modere. Si l'outil sur-detecte des gaps, il devient un "vendeur" deguise. Perception negative. |

**Niveau de risque global : MODERE**

### 7.2. Scenario 2 : "couvert" mais le client n'est pas couvert en realite

**Description** : l'outil indique "couvert" pour la garantie vol, mais le contrat comporte une exclusion (ex: absence de serrure certifiee) ou un plafond tres bas (ex: 500 EUR) que l'outil n'a pas detecte. Le client subit un sinistre et n'est pas indemnise.

**Risque pour Baloise** :

| Element | Analyse |
|---------|---------|
| Prejudice potentiel pour le client | **Eleve.** Le client a pu renoncer a verifier sa couverture ou a souscrire une protection supplementaire sur la foi de l'indication "couvert". Le lien de causalite est discutable mais le risque existe. |
| Risque reputationnel | **Eleve.** "Baloise m'a dit que j'etais couvert et je ne l'etais pas" -- c'est un scenario de crise. |
| Risque juridique | **Significatif.** Meme avec le disclaimer, un tribunal pourrait considerer que l'indication "couvert" a cree une apparence de securite qui a influence le comportement du client. La question serait : le disclaimer etait-il suffisamment visible et comprehensible pour neutraliser l'indication "couvert" ? |
| Risque reglementaire | **Significatif.** Le CAA pourrait considerer que l'indication "couvert" constitue une information trompeuse au sens de l'art. 17 IDD transpose, meme si elle est assortie d'un disclaimer. |

**Niveau de risque global : ELEVE**

### 7.3. Lequel est le pire ?

**Le scenario 2 (faux positif "couvert") est incomparablement plus dangereux que le scenario 1 (faux negatif "gap detecte").**

Le faux positif "couvert" cumule :
1. Un prejudice reel potentiel pour le client
2. Un risque de contentieux avec indemnisation
3. Un risque reputationnel majeur
4. Un risque reglementaire (information trompeuse)
5. Un lien de causalite arguable entre l'information de Baloise et le comportement du client

Le faux negatif "gap detecte" genere au pire de l'agacement et une perte de credibilite de l'outil.

### 7.4. Comment le disclaimer protege-t-il Baloise ?

Le disclaimer protege Baloise **partiellement, pas totalement**.

| Effet du disclaimer | Analyse |
|--------------------|---------|
| Il exclut la qualification de conseil | Oui, s'il est visible et comprehensible. Il cree un cadre clair : l'outil est informatif. |
| Il exonere Baloise de toute responsabilite | **Non.** En droit luxembourgeois comme en droit europeen, une clause de non-responsabilite ne peut pas exonerer de la responsabilite pour faute ou pour information trompeuse. Le disclaimer reduit le risque, il ne l'elimine pas. |
| Il attenue le lien de causalite | Oui. Si le client a lu le disclaimer qui dit "verifiez votre contrat", il est plus difficile d'arguer que le client s'est fie exclusivement a l'outil. |
| Il est opposable au consommateur | Probablement, s'il est visible, comprehensible, et que le consentement est actif (checkbox). Mais un juge pourrait considerer qu'un disclaimer noye dans un flux digital n'a pas ete veritablement lu. |

### 7.5. Faut-il un mecanisme de "non evaluable" plus large que prevu ?

**Oui. C'est notre recommandation la plus forte sur la responsabilite.**

Le statut "non evaluable" est le filet de securite juridique. Il doit etre utilise genereusement. Mieux vaut un exces de "non evaluable" (qui ne cree aucun risque juridique) qu'un exces de "couvert" (qui cree un risque majeur).

**Regle d'or** : en cas de doute, "non evaluable" -- JAMAIS "couvert".

Cas ou le statut devrait etre "non evaluable" :

| Situation | Statut |
|-----------|--------|
| La garantie est mentionnee mais sans detail (plafond, franchise) | Non evaluable |
| Le document est de mauvaise qualite (OCR incertain) | Non evaluable |
| Le contrat est ancien (> 5 ans, fortes chances d'avenants) | Non evaluable avec mention "Verifiez aupres de votre assureur si des avenants recents modifient votre couverture." |
| Le contrat est etranger (frontalier) | Non evaluable avec mention "Ce contrat semble relever d'une juridiction etrangere. L'analyse n'est pas applicable." |
| Le score de confiance d'extraction est inferieur au seuil | Non evaluable |
| La garantie extraite ne correspond pas exactement a la garantie du referentiel | Non evaluable (pas "couvert") |
| Le document uploade n'est pas un contrat MRH | Rejet complet, pas d'analyse |

**Recommandation technique** : definir un seuil de confiance strict en dessous duquel toute garantie est automatiquement "non evaluable". Si la confiance d'extraction < 0.75, ne pas afficher "couvert" -- afficher "non evaluable".

**Recommandation de design** : le statut "non evaluable" doit etre presente positivement ("Nous n'avons pas assez d'informations pour evaluer ce point -- verifiez directement dans votre contrat"), pas comme un echec de l'outil.

### 7.6. Matrice de risque synthetique

| Scenario | Probabilite | Impact | Risque net | Mitigation |
|----------|------------|--------|------------|------------|
| Faux negatif ("gap" a tort) | Elevee (les exclusions et plafonds echappent souvent a l'extraction) | Faible | **Modere** | Disclaimer + "sur la base du document fourni" |
| Faux positif ("couvert" a tort) | Moyenne (une garantie mentionnee peut avoir des exclusions) | Eleve | **Eleve** | Seuil de confiance strict + "non evaluable" genereux + disclaimer + validation humaine |
| Upload de contrat non-MRH | Moyenne | Modere (risque art. 9 si prevoyance/sante) | **Modere** | Detection et rejet automatique + suppression immediate |
| Client qui se fie exclusivement a l'outil | Faible (disclaimer visible) | Eleve | **Modere** | Disclaimer + checkbox + formulation "verifiez votre contrat" |
| Exploitation commerciale des donnees concurrentes | Faible (si architecture correcte) | Tres eleve (concurrence deloyale + secret des affaires) | **Modere** | Isolation des donnees + interdiction d'exploitation + politique interne |

---

## 8. Points necessitant validation juridique interne

### 8.1. Liste des questions a poser au service juridique Baloise Luxembourg

| # | Question precise | Urgence | Le dev peut-il commencer avant la reponse ? |
|---|-----------------|---------|---------------------------------------------|
| **Q1** | La qualification de notre outil comme "comparaison informative" (pas conseil) est-elle partagee par le service juridique ? Le CAA a-t-il emis des circulaires ou positions specifiques sur les outils digitaux d'analyse de couverture ? | **Bloquante** | **NON.** C'est la condition C1 de la synthese collegiale. Sans cette validation, le perimetre exact de l'outil ne peut pas etre fige. Le design UX et les formulations en dependent. |
| **Q2** | Les disclaimers proposes sont-ils juridiquement suffisants en droit luxembourgeois ? Faut-il une formulation specifique pour etre opposable en cas de litige ? | **Bloquante** | **NON pour le front-end.** Le dev backend (extraction, matching engine) peut commencer, mais les ecrans ne doivent pas etre finalises sans les disclaimers valides. |
| **Q3** | Baloise peut-elle legalement traiter (extraire, stocker, analyser) des contrats d'assurance emis par des concurrents ? Y a-t-il un risque au titre du secret des affaires (Directive (UE) 2016/943 transposee) ou de la concurrence deloyale ? | **Haute** | **OUI, le dev peut commencer**, mais le service juridique doit repondre avant la mise en production. Si le risque est avere, l'architecture de stockage devra etre adaptee (anonymisation de l'assureur, retention limitee). |
| **Q4** | Faut-il notifier la CNPD avant la mise en service, meme si la DPIA conclut a un risque acceptable ? La CNPD a-t-elle une position sur les outils digitaux d'analyse de contrats ? | **Moyenne** | **OUI, le dev peut commencer.** La notification CNPD intervient en fin de parcours. |
| **Q5** | Si un LLM est utilise pour l'extraction, le contrat de sous-traitance RGPD (art. 28) avec Mistral AI est-il suffisant, ou faut-il une analyse de transfert de donnees supplementaire (les serveurs sont en UE mais l'entite est francaise) ? | **Moyenne** | **OUI, le dev peut commencer** avec l'architecture LLM. La validation du contrat Mistral est un pre-requis de production, pas de developpement. |
| **Q6** | Le CTA post-adequation ("Echanger avec un conseiller") doit-il etre identique pour tous les resultats, ou peut-il etre legerement adapte (ex: visible seulement quand il y a des gaps) sans requalification en recommandation ? | **Haute** | **OUI pour le dev de base**, mais la reponse conditionne le design final de la page resultats. |
| **Q7** | En cas de litige (client non couvert malgre un "couvert" affiche par l'outil), la limitation de responsabilite par disclaimer est-elle opposable au consommateur luxembourgeois ? Existe-t-il une jurisprudence pertinente ? | **Moyenne** | **OUI, le dev peut commencer.** C'est une question de gestion du risque residuel, pas un bloqueur technique. |
| **Q8** | Les obligations AI Act (transparence, art. 50) s'appliquent-elles des maintenant (mars 2026) ou seulement a partir d'aout 2026 pour les systemes a risque non-haut ? | **Faible** | **OUI.** Le disclaimer IA est facile a ajouter, pas de risque a l'inclure des maintenant par precaution. |

### 8.2. Synthese du sequencement dev/juridique

```
PEUT COMMENCER IMMEDIATEMENT (independamment des reponses juridiques) :
- Architecture backend (tables, RLS, triggers)
- Moteur d'adequation (logique de matching)
- Pipeline d'extraction (OCR / LLM)
- Referentiel des garanties MRH
- Tests unitaires et d'integration

DOIT ATTENDRE LA REPONSE A Q1 :
- Design UX final des ecrans de resultats
- Formulations affichees a l'utilisateur
- CTA post-adequation

DOIT ATTENDRE LA REPONSE A Q2 :
- Ecrans de consentement
- Disclaimers dans le PDF/export
- Page de politique de confidentialite mise a jour

DOIT ATTENDRE LA REPONSE A Q3 POUR LA MISE EN PRODUCTION :
- Politique de retention des contrats concurrents
- Architecture de stockage definitive

BLOQUEUR PRODUCTION (toutes reponses requises) :
- Q1 + Q2 + Q3 + Q5 (si LLM) valides avant toute mise en production
```

---

## 9. Synthese decisionnelle

### 9.1. Objet analyse

Fonctionnalite V2 d'adequation contrats, restreinte a la protection des biens (MRH) au Luxembourg, avec restitution categorique sans recommandation de produit.

### 9.2. Enjeu metier / business

Permettre au client de comparer sa couverture MRH existante a ses besoins identifies, sans que Baloise ne franchisse la ligne du conseil IDD. Outil de differenciation commerciale et de generation de leads vers le reseau de conseillers.

### 9.3. Principaux risques de conformite

| Risque | Criticite |
|--------|----------|
| Requalification en conseil par le CAA | Elevee si formulations/CTA mal cadres |
| Faux positif "couvert" -> prejudice client | Elevee |
| Traitement de contrats non-MRH (contenant des donnees de sante) | Moderee |
| Exploitation des donnees concurrentes (secret des affaires) | Moderee |
| Non-conformite RGPD (consentement, retention, droits) | Moderee (CRIT-3 pre-existant) |
| Non-conformite AI Act (si LLM, transparence) | Faible pour MRH |

### 9.4. Niveau de criticite global

**MODERE** -- significativement plus faible que la V1 grace au recentrage MRH.

### 9.5. Points acceptables

- Le recentrage MRH evacue le risque le plus critique (donnees de sante, art. 9 RGPD)
- La restitution categorique (pas de %) est conforme aux recommandations de l'actuaire et de la compliance
- L'absence de recommandation de produit est le bon positionnement
- L'architecture avec validation humaine des donnees extraites est solide

### 9.6. Points sensibles

- Le CTA post-adequation doit etre generique et non conditionnel
- Le seuil de "non evaluable" doit etre volontairement conservateur
- La qualification IDD doit etre validee en interne avant finalisation du design
- Les disclaimers doivent etre valides par le service juridique
- Le filtre "MRH only" doit etre robuste pour eviter le traitement de contrats hors perimetre

### 9.7. Points non acceptables

- Toute formulation suggestive, evaluative ou orientante (voir section 6)
- Un CTA conditionnel qui s'active uniquement sur les gaps
- L'affichage d'un pourcentage ou score numerique d'adequation
- Le traitement de contrats contenant des donnees de sante sans consentement art. 9
- La mise en production sans validation juridique de Q1, Q2, Q3

### 9.8. Recommandations concretes

1. **Valider Q1 (qualification IDD) avec le service juridique cette semaine** -- c'est le chemin critique
2. **Implementer un filtre strict "MRH only"** en amont de toute extraction
3. **Definir un seuil de confiance conservateur** pour le statut "non evaluable" (proposer 0.75)
4. **Privilegier l'OCR deterministe** pour les PDF natifs, LLM uniquement en fallback
5. **Realiser la DPIA** (version allegee, 1-2 semaines)
6. **Ne pas conditionner les CTA** au resultat de l'adequation
7. **Integrer les disclaimers dans le design des le premier sprint** (meme avec un wording provisoire)
8. **Etendre `delete_my_data()` et `export_my_data()`** pour inclure les contrats et les resultats d'adequation
9. **Logger les rejets de documents non-MRH** (sans logger le contenu)

### 9.9. Niveau de validation requis

| Validation | Qui | Quand |
|-----------|-----|-------|
| Qualification IDD | Service juridique Baloise LU + Compliance | Avant design UX final |
| Disclaimers | Service juridique Baloise LU | Avant front-end |
| DPIA | DPO + Compliance + Security | Avant mise en production |
| Referentiel garanties MRH | Metier (souscription) + Product Manager | Avant dev du moteur |
| Architecture LLM/OCR | IT Architect + Security + Compliance | Avant Phase 2 extraction |
| Go production | Direction + Juridique + Compliance + DPO | Apres toutes les gates |

### 9.10. Documentation / preuves a conserver

- Le present avis et sa date d'emission
- La reponse du service juridique a Q1-Q8
- Le PV de la DPIA
- Le consentement utilisateur (horodatage, version du texte, IP)
- L'audit trail complet (upload, extraction, adequation, suppression)
- Le referentiel des garanties et sa version
- Les disclaimers affiches et leur version
- Le contrat de sous-traitance RGPD avec Mistral AI (si LLM)

### 9.11. Conclusion

**GO SOUS CONDITIONS**

Le recentrage MRH est une decision strategique judicieuse du point de vue conformite. Il reduit materiellement les risques reglementaires sur les trois axes (IDD, RGPD, AI Act). La V2 MRH est faisable dans un cadre de comparaison informative, a condition de :

1. Obtenir la validation IDD du service juridique (bloquant)
2. Maintenir une discipline absolue sur les formulations (pas de glissement vers la recommandation)
3. Implementer un mecanisme de "non evaluable" genereux (protege contre le faux positif)
4. Realiser la DPIA (meme allegee)
5. Valider les disclaimers

Le dev backend peut commencer immediatement. Le front-end doit attendre la validation des questions Q1 et Q2.

### 9.12. Niveau de confiance / zones a confirmer localement

| Element | Confiance | A confirmer |
|---------|-----------|-------------|
| Qualification "comparaison" (pas conseil) | Elevee | Oui -- par le service juridique et idealement le CAA |
| Absence d'obligation art. 9 RGPD pour MRH | Tres elevee | Non -- c'est objectif |
| DPIA recommandee mais pas strictement obligatoire | Elevee | Oui -- par le DPO et la CNPD |
| V2 MRH pas "haut risque" au sens AI Act | Tres elevee | Marginalement -- par le service juridique |
| Suffisance juridique des disclaimers | Moderee | Oui -- impérativement par le service juridique |
| Opposabilite de la limitation de responsabilite | Moderee | Oui -- par le service juridique (jurisprudence LU) |
| Legalite du traitement de contrats concurrents | Moderee | Oui -- question clé (Q3) |

---

*Document produit par Insurance Compliance Officer + Insurance Legal Counsel dans le cadre de l'analyse collegiale de la Roue des Besoins Assurance. Ce document n'est pas un avis juridique au sens strict et ne se substitue pas a la consultation du service juridique de Baloise Assurances Luxembourg S.A.*
