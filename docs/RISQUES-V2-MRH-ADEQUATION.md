# Analyse de risques V2 -- Adequation Contrats MRH Luxembourg

**Binome Risk Manager + Security Architect**
**Date : 28 mars 2026**
**Statut : NOTE DE RISQUES POUR COMITE DE DECISION**
**Perimetre : V2 recentree strictement sur la protection des biens / HOME / MRH**

---

## PARTIE 1 -- LES 10 RISQUES MAJEURS DE LA V2 MRH

---

### RISQUE 1 : FAUX POSITIF "COUVERT" (R-MRH-01)

**Description precise**
Le systeme conclut "couvert" ou "partiellement couvert" pour une garantie alors que le client ne l'est pas reellement. Trois mecanismes concrets generent ce faux positif en MRH :
- **Franchises elevees non detectees** : le contrat affiche "Vol : oui" mais avec une franchise de 2 500 EUR qui rend la garantie inoperante pour la plupart des sinistres courants (velo electrique a 3 000 EUR, par exemple).
- **Sous-limites masquees** : objets de valeur plafonnes a 2 000 EUR par objet alors que le client possede des bijoux a 15 000 EUR. Le systeme lit "objets de valeur : couvert" sans detecter la sous-limite.
- **Exclusions specifiques** : inondation exclue en zone inondable, jardins/annexes exclus, panneaux solaires non couverts en bris de machine.

Le danger est asymetrique : le client retient "je suis couvert" et ne souscrit pas de protection complementaire. Le jour du sinistre, il decouvre la lacune. Il blame Baloise.

**Probabilite : ELEVEE**
Les contrats MRH luxembourgeois sont structurellement opaques sur les sous-limites et exclusions. Meme un lecteur humain experimente a besoin des Conditions Generales pour trancher, et le systeme ne les a pas.

**Impact : CRITIQUE**
- Prejudice financier direct pour le client (sinistre non indemnise)
- Mise en cause de la responsabilite de Baloise (meme si disclaimer present)
- Risque reputationnel majeur (un seul cas suffit pour une couverture presse)

**Mitigation concrete**
1. **UX** : ne JAMAIS afficher "couvert" tout court. Le statut le plus positif autorise est "couvert sous reserve des conditions particulieres de votre contrat" avec icone ambre, pas verte.
2. **Logique moteur** : si la franchise ou le plafond n'est pas extrait avec un score de confiance >= 0.75, le statut est "non evaluable", jamais "couvert".
3. **Disclaimer juridique** : "Cette analyse ne se substitue pas a la lecture de vos conditions generales et particulieres. Elle est fournie a titre indicatif."
4. **Alerte franchise** : si franchise extraite > 1 000 EUR sur n'importe quelle garantie MRH, alerte explicite "Attention : franchise elevee detectee -- verifiez avec votre assureur."
5. **CTA conseiller** : systematiquement apres chaque analyse, proposer un RDV conseiller pour validation.

**Risque residuel apres mitigation : SIGNIFICATIF**
Le risque ne peut pas etre elimine tant que le systeme n'a pas acces aux CG completes. La mitigation le deplace du juridique (responsabilite) vers le perceptuel (le client comprend que c'est indicatif), mais un client qui ne lit pas les disclaimers reste expose.

---

### RISQUE 2 : SOUS-ASSURANCE MAL DETECTEE OU NON SIGNALEE (R-MRH-02)

**Description precise**
La sous-assurance est le risque numero 1 en MRH au Luxembourg. Le scenario : le client a un capital contenu assure de 25 000 EUR mais possede des biens mobiliers d'une valeur de 80 000 EUR. En cas de sinistre total (incendie), il ne sera indemnise qu'a hauteur de 25 000 EUR -- voire appliquee la regle proportionnelle, ce qui reduit encore l'indemnisation pour les sinistres partiels.

Le systeme doit detecter ce gap, mais il depend de deux donnees :
- Le capital contenu assure (extrait du contrat -- fiabilite moyenne)
- La valeur reelle des biens (declaree par le client dans le questionnaire via `home_contents_value`)

Les deux peuvent etre faux. Le capital contenu est parfois absent des Conditions Particulieres (renvoi aux CG). La valeur declaree par le client est generalement sous-estimee (biais cognitif bien documente : les gens sous-evaluent leur patrimoine mobilier de 30 a 50%).

**Probabilite : ELEVEE**
La sous-assurance touche, selon les statistiques du marche, 40 a 60% des menages en MRH. C'est le probleme le plus frequent et le plus sous-estime.

**Impact : MAJEUR**
- Si le systeme ne detecte pas la sous-assurance, il perd sa raison d'etre (c'est la proposition de valeur numero 1)
- Si le systeme la detecte mais la signale mal (chiffre brut sans explication), le client ne comprend pas ou ignore l'alerte
- Si le systeme la detecte a tort (faux positif sur-assurance), le client perd confiance

**Mitigation concrete**
1. **Comparaison systematique** : croiser `capital_contenu_assure` extrait vs `home_contents_value` declare. Si ratio < 0.6 ou > 1.5, alerte explicite.
2. **Pedagogie UX** : expliquer la regle proportionnelle en langage simple. "Votre contrat assure 25 000 EUR de contenu. Vous avez declare 80 000 EUR de biens. En cas de sinistre partiel de 10 000 EUR, votre assureur pourrait appliquer la regle proportionnelle et ne vous indemniser que 3 125 EUR."
3. **Question de controle** : si l'ecart est > 30%, demander au client de confirmer sa declaration de valeur. "Etes-vous sur que la valeur totale de vos biens mobiliers est de 80 000 EUR ? Pensez a inclure meubles, electromenager, vetements, electronique..."
4. **Seuils metier** : utiliser les seuils de l'Underwriting Expert (standard marche : 20 000-50 000 EUR, insuffisant : < 15 000 EUR, premium : > 75 000 EUR).

**Risque residuel apres mitigation : MODERE**
La mitigation fonctionne si les deux donnees sources sont correctes. Le point faible reste la declaration du client. On ne peut pas forcer la precision de l'auto-evaluation.

---

### RISQUE 3 : INTERPRETATION ABUSIVE PAR LE CLIENT -- "CERTIFICAT DE COUVERTURE" (R-MRH-03)

**Description precise**
Le client traite le rapport d'adequation comme une attestation officielle de son niveau de couverture. Scenarios concrets :
- Le client montre le rapport a un tiers (bailleur, banque) comme preuve de couverture
- Le client utilise le rapport pour justifier de ne pas lire son contrat reel
- Le client invoque le rapport en cas de litige avec son assureur actuel ("mais l'analyse Baloise disait que j'etais couvert")
- Le client prend des decisions patrimoniales (achat immobilier, investissement) sur la base du rapport

En MRH, le risque est particulierement aigu car les enjeux financiers sont concentres : un incendie total d'une maison au Luxembourg, c'est 500 000 EUR a 1 500 000 EUR. Si le client croit etre couvert et ne l'est pas, le prejudice est existentiel.

**Probabilite : MOYENNE**
La majorite des clients comprennent la notion d'outil indicatif. Mais une minorite significative (10-15%) confondra l'analyse avec une validation officielle, surtout si l'interface est trop "professionnelle" et rassurante.

**Impact : CRITIQUE**
- Contentieux direct contre Baloise
- Mise en cause aupres du CAA (Commissariat aux Assurances)
- Dommage reputationnel disproportionne si l'affaire est mediatisee

**Mitigation concrete**
1. **Disclaimer en haut de chaque page** du rapport, pas seulement en bas en petits caracteres. Texte : "Ce document est un outil d'orientation. Il ne constitue ni un conseil en assurance, ni une attestation de couverture. Seul votre contrat fait foi."
2. **Watermark ou bandeau** : barre laterale ou filigrane "DOCUMENT INDICATIF - NON CONTRACTUEL" sur le PDF genere.
3. **Pas de score global** : ne jamais afficher "Votre couverture MRH : 78%". C'est une fausse precision qui suggere une validation quantitative. Statuts categoriques uniquement.
4. **Consentement actif** : avant d'afficher les resultats, faire cocher "Je comprends que cette analyse est indicative et ne remplace pas la lecture de mon contrat."
5. **Tracabilite du consentement** : stocker le timestamp du consentement en base (colonne `disclaimer_accepted_at` dans `contract_uploads`).

**Risque residuel apres mitigation : MODERE**
Le disclaimer protege juridiquement Baloise. Mais il ne protege pas le client qui ne lit pas. Le risque residuel est un risque de reputation, pas un risque juridique.

---

### RISQUE 4 : HETEROGENEITE DES CONTRATS MRH LUXEMBOURGEOIS (R-MRH-04)

**Description precise**
Le marche MRH luxembourgeois est etroit (15 assureurs principaux) mais extremement heterogene dans la structuration des contrats :

| Assureur | Structure | Specificite |
|----------|-----------|-------------|
| Baloise | Packs (Essentiel / Confort / Premium) | Garanties pre-groupees, peu de personnalisation |
| Foyer | Packs + options individuelles | Structure hybride, le plus repandu au LU |
| La Luxembourgeoise | Options individuelles a la carte | Chaque garantie separee, combinaisons multiples |
| AXA Luxembourg | Formules (Eco / Standard / Premium) | Similaire a Baloise mais terminologie differente |
| Baloise Vie (anciens contrats) | Ancienne nomenclature | Contrats pre-fusion, structure differente |

Au-dela de la structure, la terminologie varie :
- "Degats des eaux" vs "Fuites et infiltrations" vs "Wasserschaden"
- "RC vie privee" vs "Responsabilite civile familiale" vs "Privathaftpflicht"
- "Bris de glace" vs "Bris accidentel" vs "Glasbruch"

Le bilinguisme FR/DE complexifie encore : certains contrats La Luxembourgeoise sont integralement en allemand, d'autres mixtes.

**Probabilite : CERTAINE**
Ce n'est pas un risque potentiel, c'est une certitude operationnelle. Les contrats ne sont pas standardises.

**Impact : SIGNIFICATIF**
- Erreurs de mapping garantie (le systeme confond deux garanties ou en rate une)
- Faux resultats d'adequation en cascade
- Necessite un referentiel de synonymes/mapping constamment maintenu

**Mitigation concrete**
1. **Referentiel de synonymes** : table de mapping `guarantee_aliases` avec les variantes par assureur et par langue. Minimum 150 entrees pour la MRH seule.
2. **Fallback "non evaluable"** : si une garantie du contrat ne matche aucune entree du referentiel, statut = "non evaluable", pas "non couvert".
3. **Score de confiance par garantie** : chaque extraction porte son propre score. Le client voit "Vol : couvert (confiance elevee)" vs "Protection juridique : non evaluable (confiance faible)".
4. **Enrichissement continu** : chaque contrat traite alimente le referentiel. Les corrections manuelles des utilisateurs sont remontees.
5. **Phase 1 limitation** : commencer avec les 4 assureurs principaux (Baloise, Foyer, La Luxembourgeoise, AXA). Ne pas pretendre couvrir tous les assureurs des le lancement.

**Risque residuel apres mitigation : MODERE**
Le referentiel ne sera jamais exhaustif. La mitigation par "non evaluable" protege la credibilite mais reduit la valeur percue de l'outil si trop de garanties sont "non evaluables".

---

### RISQUE 5 : REQUALIFICATION PAR LE CAA -- CONFUSION PRODUIT/CONSEIL (R-MRH-05)

**Description precise**
Le Commissariat aux Assurances (CAA), regulateur luxembourgeois, peut requalifier le service d'adequation en "conseil en assurance" au sens de la Directive IDD (Insurance Distribution Directive) transposee en droit luxembourgeois par la loi du 7 decembre 2015 modifiee.

La frontiere est la suivante :
- **Information** : presenter des faits objectifs, sans recommandation personnalisee. Autorise sans agrement.
- **Conseil** : formuler une recommandation personnalisee fondee sur l'analyse des besoins et des contrats du client. Requiert un agrement de distributeur d'assurance.

Le probleme : un rapport d'adequation qui dit "Vous avez un gap en protection vol. Voici les produits qui couvrent ce risque" est difficile a qualifier comme simple "information". Le CAA pourrait considerer que c'est un conseil personnalise, meme sans mention explicite de produits Baloise.

En MRH specifiquement, le risque est amplifie par le fait que l'outil analyse des garanties specifiques (vol, incendie, DDE, RC VP) et les compare a un besoin evalue -- c'est exactement la definition d'un test d'adequation au sens IDD.

**Probabilite : MOYENNE**
Le CAA n'a pas encore tranche de cas similaire au Luxembourg. La qualification depend de la formulation exacte des resultats et de la presence ou non de recommandations produit.

**Impact : CRITIQUE**
- Si requalifie en conseil : obligation de conformite IDD complete (exigences de competence, procedure de conseil, documentation, etc.)
- Sanctions administratives possibles (amende, injonction d'arret)
- Remise en cause du modele economique de l'outil

**Mitigation concrete**
1. **Gate bloquante G1** (deja identifiee) : qualification IDD formelle par le service juridique Baloise Luxembourg AVANT toute ligne de code V2.
2. **Wording defensif** : le rapport ne formule jamais de recommandation. Il presente des "constats". "Constat : votre contrat ne mentionne pas de garantie vol" et non pas "Vous devriez souscrire une garantie vol".
3. **Pas de produit Baloise** dans l'adequation : le rapport ne mentionne pas HOME, DRIVE, B-SAFE. Il reste sur les garanties generiques.
4. **Separation physique** : l'adequation est sur une page separee (`/results/:id/adequation`), distincte des recommandations produit (`/results/:id`). Pas de lien direct entre "gap detecte" et "produit Baloise recommande".
5. **CTA neutre** : "Contactez un conseiller pour en discuter" et non "Souscrivez notre produit HOME".

**Risque residuel apres mitigation : MODERE**
La mitigation deplace la probabilite de moyenne a faible, mais ne l'elimine pas. Le CAA conserve un pouvoir d'appreciation souverain. Seule la Gate G1 (avis juridique formel) apporte une securite reelle.

---

### RISQUE 6 : FUITE DE DONNEES CONCURRENTIELLES (R-MRH-06)

**Description precise**
Les contrats MRH uploades par les clients contiennent des informations commercialement sensibles sur les concurrents de Baloise :
- Tarifs (prime annuelle, fractionnement)
- Structure des garanties et des packs
- Niveaux de franchise
- Politique de souscription (ce qui est couvert, ce qui est exclu)
- Conditions specifiques aux segments de clientele

Si ces donnees fuient ou sont exploitees a des fins commerciales par Baloise, les consequences sont multiples :
- **CNPD** (Commission Nationale pour la Protection des Donnees) : violation du principe de finalite (art. 5.1.b RGPD). Les donnees ont ete collectees pour l'adequation, pas pour du competitive intelligence.
- **Concurrents** : action en concurrence deloyale ou violation du secret des affaires.
- **Clients** : perte de confiance si le client apprend que ses donnees servent a autre chose que l'analyse promise.

**Probabilite : FAIBLE** (pour une fuite technique) / **MOYENNE** (pour une utilisation interne abusive)

**Impact : MAJEUR**
- Sanction CNPD (jusqu'a 4% du CA)
- Action concurrents
- Perte de confiance du marche

**Mitigation concrete**
1. **Finalite stricte en base** : politique d'utilisation des donnees interdisant explicitement l'exploitation commerciale des contrats concurrents.
2. **Pas d'accession brute pour les conseillers** : le conseiller voit le rapport d'adequation, pas le contrat original. Pas d'acces au fichier PDF dans le bucket.
3. **RLS advisor** : la policy `contract_uploads` pour les conseillers donne acces uniquement a `extracted_data` et `confidence_score`, pas a `file_path`.
4. **Audit trail** : chaque acces conseiller a un contrat client est logge.
5. **Retention limitee** : le fichier PDF est supprime du bucket apres extraction et validation utilisateur. Seules les donnees structurees (JSONB) sont conservees.
6. **Anonymisation pour analytics** : si Baloise veut faire des statistiques sur le marche, les donnees doivent etre anonymisees et agregees.

**Risque residuel apres mitigation : FAIBLE**
La suppression du fichier PDF apres extraction est la mesure la plus efficace.

---

### RISQUE 7 : REPRODUCTIBILITE QA -- NON-DETERMINISME LLM (R-MRH-07)

**Description precise**
Si le moteur d'extraction utilise un LLM (Mistral AI), les resultats ne sont pas deterministes. Le meme contrat PDF, soumis deux fois, peut produire des resultats legerement differents.

En MRH, ce non-determinisme est particulierement problematique car les clients comparent. Si un client fait l'analyse deux fois et obtient des resultats differents, la credibilite de l'outil s'effondre.

**Probabilite : ELEVEE**
Propriete inherente des LLM. Meme avec temperature=0, le non-determinisme n'est pas totalement elimine.

**Impact : SIGNIFICATIF**

**Mitigation concrete**
1. **Temperature = 0** + `seed` fixe dans les appels Mistral API.
2. **Cache par document** : une fois un contrat extrait et valide par l'utilisateur, le resultat est stocke en JSONB et JAMAIS re-extrait sauf demande explicite.
3. **Test de regression** : corpus de 20 documents de reference. Seuil : >= 95% de resultats identiques.
4. **Versionning strict** : le modele Mistral utilise un ID de version fixe (pas `latest`).
5. **Double extraction en cas de confiance faible** : si score < 0.65, lancer une deuxieme extraction et comparer.

**Risque residuel apres mitigation : FAIBLE**
Le cache par document est la mesure decisoire. Le non-determinisme n'existe plus une fois le resultat enregistre.

---

### RISQUE 8 : DERIVE DU DICTIONNAIRE / MAPPING (R-MRH-08)

**Description precise**
Les assureurs luxembourgeois modifient periodiquement les noms de produits, la structure des packs, les modeles de documents, les conditions generales. Le referentiel de garanties et le mapping de synonymes deviennent obsoletes progressivement.

**Probabilite : CERTAINE** (a horizon 12 mois)

**Impact : SIGNIFICATIF**

**Mitigation concrete**
1. **Monitoring de confiance** : tracker le score de confiance moyen par assureur et par mois.
2. **Boucle de feedback** : les corrections utilisateur alimentent un backlog de mise a jour du referentiel.
3. **Revue trimestrielle** : verification manuelle du referentiel contre les produits en vigueur.
4. **Resilience LLM** : le LLM generalise mieux que des templates rigides.
5. **Versioning du referentiel** : chaque mise a jour du mapping est versionnee et datee.

**Risque residuel apres mitigation : FAIBLE**

---

### RISQUE 9 : DEPENDANCE TECHNIQUE -- API EXTERNE INDISPONIBLE (R-MRH-09)

**Description precise**
La fonctionnalite d'adequation depend entierement de la disponibilite de l'API Mistral en Phase 2.

**Probabilite : MOYENNE**

**Impact : SIGNIFICATIF** (pas critique -- le diagnostic principal ne depend pas de Mistral)

**Mitigation concrete**
1. **Retry avec backoff** : retry 1 fois avec 30s de delai.
2. **Queue** : re-tentee automatiquement toutes les heures.
3. **Degradation gracieuse** : upload accepte, analyse sous 24h.
4. **Phase 1 independante** : la saisie manuelle ne depend d'aucune API externe.
5. **Monitoring** : alerte si taux d'echec > 5% sur 1 heure.
6. **Fallback Google Document AI** : bascule possible en 5-8 jours.

**Risque residuel apres mitigation : FAIBLE**

---

### RISQUE 10 : REPUTATION -- RESULTAT ERRONE VIRALISE (R-MRH-10)

**Description precise**
Un client recoit un resultat manifestement faux, fait une capture d'ecran et la poste sur les reseaux sociaux.

**Probabilite : FAIBLE**

**Impact : CRITIQUE**

**Mitigation concrete**
1. **Formulations defensives par defaut** : "non evaluable" plutot que "non couvert" en cas de doute.
2. **Pas de capture d'ecran facile** : rapport PDF avec watermark, pas de bouton "Partager".
3. **Monitoring social** : veille sur les mentions "Baloise + adequation".
4. **Protocole de crise** : contact client < 2h, rectificatif, suspension temporaire si defaut systemique.
5. **Beta fermee** : 50-100 clients avant le lancement public.

**Risque residuel apres mitigation : FAIBLE**

---

## PARTIE 2 -- CE QUE LE RECENTRAGE MRH CHANGE COTE RISQUES

### 2.1 Risques qui DISPARAISSENT

| Risque V1 | Pourquoi il disparait |
|-----------|----------------------|
| **Donnees de sante (art. 9 RGPD)** | Les contrats MRH ne contiennent AUCUNE donnee de sante. L'art. 9 ne s'applique pas. Reduction de risque la plus significative. |
| **Consentement art. 9 separe** | Plus necessaire. Consentement RGPD standard suffit. |
| **Complexite B-SAFE / prevoyance** | Pas de garanties incapacite/invalidite/deces a extraire ou mapper. |
| **Regimes sociaux frontaliers** | En MRH, le regime social du frontalier est sans impact. |
| **Complexite TRAVEL** | Pas de garanties rapatriement/frais medicaux/annulation. |
| **Complexite FUTUR / art. 111bis** | Pas de produits d'epargne-pension. |
| **Scoring quadrants projets/futur inertes** | L'adequation V2 ne touche pas ces quadrants. |

**Impact quantitatif** : reduction de la surface de risque d'environ 65%.

### 2.2 Risques qui RESTENT IDENTIQUES

| Risque | Pourquoi il reste |
|--------|-------------------|
| Requalification IDD | Independante de la ligne de produit |
| Responsabilite juridique | Faux positif MRH tout aussi litigieux |
| Non-determinisme LLM | Propriete de la technologie |
| Dependance API | Independante du scope |
| Fuite donnees concurrentielles | Contrats MRH concurrents tout aussi sensibles |
| Desalignement TS/PL/pgSQL | Risque structurel preexistant |

### 2.3 Risques NOUVEAUX specifiques MRH

| Risque | Description | Criticite |
|--------|-------------|-----------|
| Regle proportionnelle | Specifique MRH -- l'outil DOIT l'expliquer | Haute |
| Contrats multi-risques | 1 contrat MRH = 8-16 garanties a decomposer | Haute |
| Valeur patrimoine immobilier | Donnee financiere sensible revelee par le contrat | Moyenne |
| Habitation secondaire / locatif | Plusieurs contrats MRH a distinguer | Moyenne |
| Copropriete vs maison individuelle | Structure de couverture radicalement differente | Haute |

---

## PARTIE 3 -- POSITION SECURITY SUR LES DONNEES MRH

### 3.1 Qualification des donnees

| Donnee | Categorie RGPD | Sensibilite |
|--------|----------------|-------------|
| Nom, prenom | Donnee personnelle (art. 4) | Standard |
| Adresse complete | Donnee personnelle | Standard (revele localisation foyer) |
| Capital batiment assure | Donnee personnelle (indirectement financiere) | Elevee |
| Capital contenu assure | Donnee personnelle (indirectement financiere) | Elevee |
| Prime annuelle | Donnee personnelle | Moderee |
| Nom assureur concurrent | Donnee concurrentielle | Sensible pour Baloise |
| Franchises, plafonds | Donnee contractuelle | Faible en isolation |

**Confirmation : AUCUNE donnee art. 9 RGPD dans un contrat MRH.**

### 3.2 DPIA : toujours obligatoire

3 criteres CEPD sur 7 positifs (seuil = 2) :
- Evaluation/scoring systematique : OUI
- Croisement de donnees : OUI
- Usage innovant de technologie (LLM) : OUI

DPIA allegee (10-15 pages vs 30-40 en V1). Delai : 2-3 semaines.

### 3.3 Recommandations de securite

#### Chiffrement
- Transit : TLS 1.3 (en place)
- Repos DB : AES-256 Supabase natif (en place)
- Repos Storage : chiffrement at-rest natif
- Cle Mistral : variable d'environnement Netlify

#### Bucket Supabase Storage

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'contracts',
    'contracts',
    false,
    10485760,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/heic']
);
```

Structure : `contracts/{user_id}/{upload_id}.pdf`
Policies : upload/view/delete propres a l'utilisateur. PAS de policy advisor sur les fichiers bruts.

#### Retention
| Donnee | Retention |
|--------|-----------|
| Fichier PDF (bucket) | Suppression apres extraction validee (max 30 jours) |
| Donnees extraites (JSONB) | Duree de vie du diagnostic |
| Audit logs | 3 ans |

#### Mises a jour obligatoires
- `delete_my_data()` : inclure `contract_uploads` + suppression Storage
- `export_my_data()` : inclure `extracted_data` (sans `file_path`)

---

## PARTIE 4 -- CONTRE-MESURES PRIORITAIRES

### 4.1 Classement par criticite

| Rang | Risque | P x I | Criticite |
|------|--------|-------|-----------|
| 1 | R-MRH-01 : Faux positif "couvert" | 20 | CRITIQUE |
| 2 | R-MRH-05 : Requalification IDD/CAA | 15 | CRITIQUE |
| 3 | R-MRH-03 : Interpretation abusive "certificat" | 15 | CRITIQUE |
| 4 | R-MRH-02 : Sous-assurance mal detectee | 16 | HAUTE |
| 5 | R-MRH-10 : Resultat errone viralise | 10 | HAUTE |
| 6 | R-MRH-04 : Heterogeneite contrats LU | 15 | HAUTE |
| 7 | R-MRH-07 : Non-determinisme LLM | 12 | HAUTE |
| 8 | R-MRH-06 : Fuite donnees concurrentielles | 10 | MODEREE |
| 9 | R-MRH-08 : Derive dictionnaire/mapping | 15 | MODEREE |
| 10 | R-MRH-09 : Dependance API Mistral | 9 | MODEREE |

### 4.2 Plans d'action (5 risques les plus critiques)

Voir detail dans le corps de la note (actions par type : TECHNIQUE / UX / JURIDIQUE / STRATEGIQUE / QA / OPERATIONS).

---

## PARTIE 5 -- RECOMMANDATION RISK/SECURITY

### Verdict : GO CONDITIONNEL

| Dimension | V1 (tous quadrants) | V2 (MRH seule) | Reduction |
|-----------|---------------------|-----------------|-----------|
| Risques critiques | 4 | 3 | -25% |
| Donnees art. 9 RGPD | OUI | NON | ELIMINE |
| Referentiel garanties | 48+ | 16 | -67% |
| DPIA | Lourde (30-40p) | Allegee (10-15p) | -60% effort |
| Surface de risque scoring | 4 quadrants + 25 options | 1 quadrant + 16 garanties | -70% |

### Gates de validation

| Gate | Contenu | Bloqueur | Delai |
|------|---------|----------|-------|
| G1 : IDD | Qualification juridique formelle | OUI -- ABSOLU | 3-4 sem |
| G2 : DPIA | DPIA allegee validee par DPO | OUI | 2-3 sem |
| G3 : Referentiel | 16 garanties MRH validees par metier | OUI | 1-2 sem |
| G4 : Recette | 60 cas de test, 0 bloquant | OUI | 2 sem |
| G5 : Beta | 50-100 clients, 4 semaines | OUI avant public | 4 sem |
| G6 : Securite | Revue RLS/bucket/delete/export | OUI | 1 sem |

### Bloqueurs absolus
1. G1 echoue (IDD = "conseil")
2. Statut "couvert" sans 3 conditions (garantie + franchise + plafond + confiance >= 0.85)
3. delete_my_data/export_my_data non mis a jour
4. Pas de disclaimer valide par Legal

### Conclusion
Le recentrage MRH est la bonne decision. Il transforme un projet a risque eleve en projet a risque maitrisable. GO CONDITIONNEL avec les 6 gates. Ne pas sauter les gates sous pression de time-to-market.

---

*Document genere par le binome Risk Manager + Security Architect -- 28 mars 2026*
