# Brief Video Motion Design — "La vue d'ensemble qui change tout."

**Projet :** Roue des Besoins Assurance
**Objet :** Video pedagogique de presentation produit
**Cible :** Agents professionnels d'assurance (conseillers)
**Duree :** 2min10 (+/- 10 secondes)
**Date :** Mars 2026

---

## 1. CONCEPT CREATIF / ANGLE NARRATIF

### Titre de travail
**"La vue d'ensemble qui change tout."**

### Angle narratif
La video adopte le point de vue du conseiller en assurance. On ne lui presente pas un outil technique, on lui montre comment son quotidien change. L'arc narratif suit une journee type : de la preparation d'un rendez-vous client a l'exploitation des resultats, en passant par la revelation centrale — la Roue des Besoins.

### Structure narrative en 3 actes

**Acte 1 — Le probleme (0:00 - 0:25)**
Le diagnostic assurance aujourd'hui : des tableurs, des fiches papier, des estimations a vue. Le conseiller navigue entre dix documents, perd du temps, manque des opportunites. Tension visuelle : ecrans encombres, complexite, friction.

**Acte 2 — La solution (0:25 - 1:40)**
Presentation du parcours complet dans l'application. On suit le flux reel : questionnaire client, calcul automatique, visualisation par la Roue, actions recommandees, rapport PDF. Chaque etape est montree dans son contexte d'usage reel.

**Acte 3 — La transformation (1:40 - 2:10)**
Le conseiller maitrise la relation client. Il a une vue d'ensemble, des donnees exploitables, un outil qui renforce sa credibilite. Closing sur les benefices metier et appel a l'action.

### Ton
Professionnel, sobre, confiant. Pas de jargon marketing excessif. Le ton de quelqu'un qui connait le metier et presente un outil qui fonctionne. Ni enthousiasme force, ni demonstration technique seche.

---

## 2. STORYBOARD DETAILLE

---

### SCENE 1 — Ouverture / Le probleme actuel
**Timing : 0:00 - 0:12**

**Visuel :**
Fond navy profond (`#000d6e`). Le logo "RB" (carre navy arrondi, lettres blanches) apparait au centre avec un fade-in net. Il se deplace vers le haut a gauche pendant que le titre "Roue des Besoins" s'inscrit en Inter Semibold blanc, tracking tight. Sous-titre "Diagnostic assurance personnalise" en slate-400 (`#94a3b8`), 2 secondes puis fade.

Transition vers une scene illustree : un bureau de conseiller encombre. Des icones minimalistes (feuilles de papier, tableur, horloge) apparaissent et se multiplient de facon desordonnee — evoquant la complexite actuelle. Pas de realisme photographique : on reste dans un style d'illustration flat, geometrique, epure.

**Voix-off :**
> "Chaque client est unique. Mais aujourd'hui, analyser ses besoins en assurance prend du temps, repose sur l'intuition, et laisse des opportunites passer."

**Animation :**
- Logo : ease-out, 0.8s
- Texte : apparition caractere par caractere ou fade bloc, 0.5s
- Scene illustration : les elements apparaissent en cascade desordonnee, 3 secondes
- Transition : fondu vers blanc

**Son :**
Note de piano basse, unique, resonnante. Ambiance calme mais tendue.

---

### SCENE 2 — Introduction de la solution
**Timing : 0:12 - 0:25**

**Visuel :**
Ecran blanc. Le texte "Et si vous aviez la vue d'ensemble ?" apparait en Inter Bold, taille titrage, couleur slate-900 (`#1e293b`). Le mot "vue d'ensemble" est en primary-700 (`#000d6e`).

Puis une transition fluide : l'ecran se recadre pour reveler le mockup de l'application dans un device frame epure (laptop ou browser frame). On voit la page de connexion LoginPage — le carre RB navy, les champs email/mot de passe, le toggle Client/Conseiller.

**Voix-off :**
> "La Roue des Besoins est un outil de diagnostic structure, qui transforme un echange client en analyse exploitable."

**Animation :**
- Texte : slide-up + fade, 0.6s, ease-out
- Device frame : scale 0.95 vers 1.0, opacity 0 vers 1, 0.8s
- Le curseur clique sur l'onglet "Conseiller" (l'onglet passe en fond blanc avec ombre), puis entre un email et se connecte

**Son :**
La musique demarre veritablement ici. Tempo modere, instruments digitaux subtils, basses profondes. Ambiance professionnelle et moderne.

---

### SCENE 3 — Le tableau de bord conseiller
**Timing : 0:25 - 0:45**

**Visuel :**
Le navigateur affiche le AdvisorDashboard. On voit :
- Le header avec le logo RB, le badge "Conseiller" (bg-primary-50, text-primary-700, ring)
- Les 3 StatCards en ligne : "12 Clients" (icone users, primary), "8 Diagnostics realises" (icone badge-check, emerald), "3 Actions requises" (icone alert-triangle, amber)
- La liste des clients avec leurs noms, badges de score colores (vert/orange/rouge), dates

La camera fait un zoom progressif sur un client dont le badge indique un score rouge. Le curseur clique dessus.

**Voix-off :**
> "Des la connexion, vous voyez vos clients, leurs scores, et les actions prioritaires. En un regard, vous savez ou concentrer votre attention."

**Animation :**
- Les StatCards apparaissent de gauche a droite avec un leger decalage (stagger 0.15s), slide-up + fade
- Les lignes clients apparaissent en cascade (stagger 0.1s)
- Le badge "Score: 72" pulse legerement en rouge pour attirer l'oeil
- Hover sur la ligne client : bg-slate-50 + chevron passe en primary-400
- Transition au clic : ease-in vers la page detail

**Son :**
Accent musical subtil quand les stats apparaissent. Un "click" UI discret au clic sur le client.

---

### SCENE 4 — Le parcours client / Questionnaire
**Timing : 0:45 - 1:10**

**Visuel :**
Changement de perspective : on passe cote client pour montrer le questionnaire. Texte de transition en overlay : "Cote client" en Inter Medium, slate-400, petit.

On voit le QuestionnairePage avec :
- Le PageHeader "Mon diagnostic assurance" / "Repondez aux questions pour decouvrir vos besoins"
- La ProgressBar en haut : 5 etapes (Situation personnelle, Situation patrimoniale, Mobilite, Objets de valeur, Couvertures existantes). L'etape 1 est active (cercle avec ring primary-700)
- Le formulaire dans sa Card blanche (rounded-xl, border slate-200, shadow-card)
- Les boutons de reponse (border-2, rounded-lg, les selectionnes en border-primary-700 bg-primary-50)

On anime le remplissage rapide de quelques questions :
1. "Quelle est votre tranche d'age ?" — clic sur "30-40 ans"
2. "Situation familiale ?" — clic sur "En couple avec enfants"
3. La ProgressBar avance vers l'etape 2, puis 3...

Element cle : le panneau lateral droit affiche l'apercu temps reel de la Roue des Besoins dans une Card. La roue se construit et change de couleurs au fur et a mesure des reponses.

**Voix-off :**
> "Votre client repond a un questionnaire structure en 5 thematiques. Les questions s'adaptent a son profil : un independant avec famille ne voit pas les memes questions qu'un retraite celibataire. Et pendant qu'il repond, son diagnostic se construit en temps reel."

**Animation :**
- Les options du questionnaire apparaissent avec un slide-in doux
- Au clic sur une reponse : la bordure passe en primary-700 avec une transition 200ms, le fond passe en primary-50
- La ProgressBar avance : le cercle se remplit en primary-700, la ligne connectrice aussi, en 300ms ease
- La roue laterale : les segments apparaissent un par un, changent de couleur de facon fluide (vert vers orange, puis rouge quand on arrive aux couvertures insuffisantes). C'est le moment fort de cette scene.
- Time-lapse accelere du remplissage pour ne pas perdre le rythme

**Son :**
Sons UI discrets a chaque clic (sons type Linear/Stripe). La musique gagne en intensite graduellement.

---

### SCENE 5 — La revelation : La Roue des Besoins
**Timing : 1:10 - 1:30**

> **C'est le moment climax visuel de la video.**

**Visuel :**
Le client clique "Voir mon diagnostic" et arrive sur la ResultsPage.

La camera se centre sur la Roue des Besoins. On la montre de facon isolee d'abord, sur un fond epure.

La Roue est un PieChart donut (innerRadius 20%, outerRadius 38%, stroke blanc entre les segments). Chaque segment represente un univers :
- Auto/Mobilite — vert (`#168741`)
- Habitation — rouge (`#d9304c`)
- Prevoyance — rouge fonce (`#99172d`)
- Objets de valeur — orange (`#c97612`)

Les labels sont positionnes a l'exterieur de la roue, en Inter Semibold 11px, colores selon le needLevel.

Au-dessus : le ScoreGauge — un cercle SVG avec arc progressif, le chiffre "67" en gros (text-4xl font-bold) en rouge, "/100" en dessous en slate-400.

A cote, les UniverseCards : chacune avec son icone coloree dans un fond teinte (color + 12% opacity), le nom de l'univers, un Badge de statut ("Bien couvert" en vert, "A ameliorer" en orange, "Action requise" en rouge).

**Voix-off :**
> "En un coup d'oeil, la Roue des Besoins revele la situation complete. Chaque univers — auto, habitation, prevoyance, objets de valeur — est evalue sur cent. Vert, bien couvert. Orange, a ameliorer. Rouge, action requise. Votre client comprend immediatement. Et vous aussi."

**Animation :**
C'est la scene la plus travaillee en animation.

1. La Roue apparait vide (cercle gris slate-100), puis les segments se remplissent un par un dans le sens horaire, chacun prenant sa couleur finale en 0.5s (ease-out-cubic). Delai entre chaque : 0.3s.

2. Le ScoreGauge : l'arc se dessine de 0 a 67 en 1.2s (ease-out), le chiffre s'incremente de 0 a 67 en counter animation synchronisee.

3. Les labels exterieurs de la roue apparaissent en fade-in decale apres que le segment correspondant est rempli.

4. Les UniverseCards glissent depuis la droite (stagger 0.2s), avec leur barre de progression "Exposition au risque" et "Niveau de couverture" qui s'animent (width de 0 a la valeur cible en 0.8s).

5. Le WheelLegend apparait sous la roue : chaque ligne avec son pastille coloree, son label, son message.

**Son :**
Moment musical fort. La melodie atteint son point culminant quand la roue se revele. Un accent de basse profond quand le score global "67" apparait. Les sons UI ponctuent l'apparition de chaque segment.

---

### SCENE 6 — Les actions recommandees et le rapport PDF
**Timing : 1:30 - 1:50**

**Visuel :**
Scroll fluide vers la section "Actions recommandees". On voit l'ActionList :
- Chaque action dans une Card blanche (rounded-xl, shadow-card, hover shadow-card-hover)
- Titre en font-semibold slate-900, description en slate-500
- Badges : univers en bleu, type en rouge ("Action immediate") ou orange ("Action differee")
- Indicateur de priorite : les barres verticales (w-1.5 h-5 rounded-full), remplies en rose-400

On met en evidence 2-3 actions :
- "Souscrire une assurance auto" (priorite 5/5, Auto, Immediate)
- "Verifier votre assurance emprunteur" (priorite 4/5, Habitation, Immediate)
- "Realiser un bilan prevoyance" (priorite 4/5, Prevoyance, Immediate)

Puis transition vers le rapport PDF : un mockup du document PDF s'affiche, montrant la page 1 (synthese avec les 3 grands chiffres dans leurs fonds gris arrondis, l'image de la roue) et la page 3 (plan d'actions avec le bloc vert "Opportunites commerciales").

**Voix-off :**
> "L'outil genere automatiquement des recommandations priorisees. Vous savez exactement quoi proposer, dans quel ordre. Et en un clic, vous generez un rapport PDF professionnel — une version pour votre client, une version enrichie pour vous avec les donnees brutes et les opportunites commerciales."

**Animation :**
- Les actions apparaissent en cascade (stagger 0.15s), slide-up
- Les barres de priorite se remplissent de gauche a droite
- Le PDF : effet de "page turn" 3D subtil, ou le document flotte avec une ombre douce. Zoom sur le bloc "Opportunites commerciales" (fond vert emerald-50, texte emerald)
- Split screen momentane : a gauche le rapport client, a droite le rapport conseiller. Le badge "CONSEILLER" (bg-primary-700, blanc) est mis en evidence

**Son :**
Son satisfaisant de "completion" quand le PDF se genere. La musique se stabilise.

---

### SCENE 7 — Les benefices metier / Closing
**Timing : 1:50 - 2:10**

**Visuel :**
Retour sur fond navy profond (`#000d6e`). Trois blocs de texte apparaissent successivement, chacun avec une icone stylisee :

1. Icone horloge — **"Gagnez du temps"**
   "Un diagnostic structure en 10 minutes."

2. Icone bouclier-check — **"Renforcez votre credibilite"**
   "Des rapports professionnels qui inspirent confiance."

3. Icone graphique — **"Ne manquez plus aucune opportunite"**
   "Identifiez automatiquement le cross-selling pertinent."

Puis les trois blocs se reduisent et s'alignent sous le logo RB qui reprend sa place centrale. Le texte final apparait :

**"Roue des Besoins"**
"Votre outil de diagnostic assurance."

CTA : un bouton anime (style identique au composant Button de l'app — bg-primary-700, text-white, rounded-md, shadow) avec le texte "Commencer maintenant".

**Voix-off :**
> "Gagnez du temps. Renforcez votre credibilite. Ne laissez plus aucune opportunite passer. La Roue des Besoins — votre outil de diagnostic assurance."

**Animation :**
- Les 3 blocs benefices : slide-up + fade, stagger 0.5s
- Reduction/reorganisation : morph fluide 0.8s
- Logo : scale 1.2 vers 1.0, 0.6s
- Bouton CTA : apparition avec une legere pulsation (shadow qui pulse 2 fois)
- Fade final doux

**Son :**
La musique se resout sur un accord plein et satisfaisant. Silence apres le dernier mot de la voix-off, le logo reste 3 secondes.

---

## 3. DIRECTION ARTISTIQUE

### Palette couleurs

La video reprend strictement la charte de l'application.

| Role | Hex | Usage video |
|------|-----|-------------|
| Primary-700 (brand) | `#000d6e` | Fonds principaux, textes titres sur fond clair, boutons, logo |
| Primary-50 | `#f0f1f7` | Fonds secondaires, zones mises en valeur |
| Primary-400 | `#3d4691` | Accents, elements interactifs hover |
| Slate-900 | `#1e293b` | Texte courant sur fond clair |
| Slate-500 | `#64748b` | Texte secondaire |
| Slate-50 | `#f8fafc` | Fonds de sections, cards PDF |
| Blanc | `#ffffff` | Fond principal app, cards |
| Score vert | `#168741` | Segments "bien couvert" |
| Score orange | `#c97612` | Segments "a ameliorer" |
| Score rouge | `#d9304c` | Segments "action requise" |
| Score rouge fonce | `#99172d` | Segments "critique" |
| Emerald-50 | `#ecfdf5` | Bloc opportunites commerciales |

**Regle absolue : aucune couleur hors palette.** Pas de bleu electrique, pas de violet, pas de degrades gratuits. La sobriete navy est l'identite.

### Typographie

| Usage | Font | Weight | Taille reference |
|-------|------|--------|-----------------|
| Titres principaux | Inter | Bold (700) | 32-48px equivalent ecran |
| Sous-titres | Inter | Semibold (600) | 18-24px |
| Corps texte | Inter | Regular (400) | 14-16px |
| Labels UI | Inter | Medium (500) | 11-13px |
| Chiffres / scores | Inter | Bold (700) | 32-64px, tabular-nums |
| Voix-off sous-titres | Inter | Medium (500) | 16px, fond semi-transparent |

Tracking serre (tracking-tight) sur les titres. Line-height genereux sur les corps de texte.

### Style d'illustration

**Flat design geometrique epure.** Pas d'illustration 3D, pas de personnages photorealistes, pas de clipart.

- Les icones reprennent le style Lucide (outline, strokeWidth 2, coins arrondis) utilise dans le composant Icon de l'app
- Les scenes abstraites utilisent des formes geometriques simples : cercles, rectangles arrondis, lignes
- Les mockups d'ecrans sont des captures fideles de l'application reelle, presentees dans des cadres de navigateur epures (pas de chrome OS visible, juste un cadre minimaliste gris clair avec les 3 points de controle)
- Les diagrammes (roue, gauges, barres) sont animes a partir des composants reels de l'app

### Transitions

Toutes les transitions sont fluides et minimalistes :

- **Entre scenes :** Fondu enchaine via blanc (0.4s) ou morph direct (0.6s). Jamais de wipe, de rotation, ou d'effet spectaculaire.
- **Dans les scenes :** Slide-up + fade pour l'apparition d'elements. Ease-out-cubic comme courbe de reference. Stagger 0.1-0.2s entre elements similaires.
- **Camera :** Mouvements lents et deliberes. Zoom progressif (pas de zoom brusque). Pan horizontal doux pour les ecrans larges.

### Grille et composition

La video respecte une grille interne :
- Marges 5% de chaque cote
- Les ecrans de l'app sont toujours centres ou en golden ratio
- Le texte narratif (hors UI) est toujours aligne a gauche ou centre
- Les elements de closing sont centres symetriquement
- Ratio d'air : minimum 30% d'espace vide a l'ecran a tout moment

---

## 4. RECOMMANDATIONS TECHNIQUES

### Format de livraison

| Parametre | Valeur |
|-----------|--------|
| Resolution | 1920x1080 (Full HD) minimum, idealement 3840x2160 (4K) pour la production |
| Ratio | 16:9 |
| Codec | H.264 pour la diffusion web, ProRes 422 pour l'archivage |
| Framerate | 30fps (standard) ou 60fps si budget motion eleve |
| Duree | 2:10 (+/- 10 secondes) |
| Sous-titres | Fichier SRT separe + version incrustee (fond `rgba(0, 7, 57, 0.85)`, texte blanc, Inter Medium 16px) |

### Declinaisons a prevoir

1. **Version 16:9** — version principale, pour presentations, site web, YouTube
2. **Version 1:1** — version carree pour LinkedIn et reseaux sociaux, recadree avec les elements cles recomposes
3. **Version 9:16** — version verticale pour stories/reels, avec recomposition integrale (non un simple crop)
4. **Version courte 30s** — teaser ne gardant que la scene 5 (Roue) et la scene 7 (Closing), pour les ads

### Outils de production recommandes

| Outil | Usage | Justification |
|-------|-------|---------------|
| **After Effects** | Animation principale, motion design | Standard industrie, controle precis des courbes, expressions pour les counters |
| **Figma** | Preparation des mockups, assets, compositions | Les ecrans de l'app peuvent etre recrees fidelement, export SVG/PNG haute resolution |
| **Lottie** | Micro-animations exportables (roue, gauge) | Si on veut reutiliser les animations dans l'app elle-meme |
| **Premiere Pro** | Montage final, voix-off, sound design | Post-production et mixage |
| **Rive / Motion Canvas** | Alternative open-source | Si budget After Effects non disponible, Motion Canvas (TypeScript) permet un controle programmatique fidele au code |

### Preparation des assets depuis le code

Les ecrans de l'application montres dans la video doivent etre **fideles au pixel pres** a l'application reelle :

1. Deployer l'app en local ou staging
2. Remplir avec des donnees de demonstration realistes et credibles
3. Capturer chaque ecran en haute resolution (2x ou 3x pour le retina)
4. Utiliser ces captures comme base dans After Effects
5. Animer par-dessus (apparitions d'elements, transitions d'etat)

Pour la Roue des Besoins specifiquement : exporter le SVG du PieChart Recharts et le reanimer dans After Effects pour avoir un controle total sur le timing de revelation de chaque segment.

Pour le ScoreGauge : reproduire l'animation SVG strokeDashoffset exactement comme dans le code (la transition de 1s ease-out est deja definie dans le composant).

---

## 5. MUSIQUE / SOUND DESIGN

### Direction musicale

**Genre :** Corporate moderne, influence "tech product launch". Pas de musique d'ascenseur generique. Pas de ukulele/clap indie. On vise le registre Stripe Sessions, Apple Services, Linear.

**Tempo :** 90-100 BPM. Assez lent pour etre confiant, assez rythme pour maintenir l'attention.

**Instruments :**
- Basses synthetiques profondes et chaudes (fondation)
- Piano electrique subtil (moments emotionnels — revelation de la roue)
- Pads ambiants (nappes, tension douce)
- Percussions electroniques discretes (hi-hats, kicks legers, pas de snare agressive)
- Pas de guitare. Pas de cordes orchestrales. Pas de voix chantee.

**Structure musicale alignee sur la video :**

| Segment | 0:00-0:12 | 0:12-0:25 | 0:25-0:45 | 0:45-1:10 | 1:10-1:30 | 1:30-1:50 | 1:50-2:10 |
|---------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
| Energie | Basse | Montee | Moderee | Croissante | **Climax** | Plateau | Resolution |
| Instruments | Note piano seule | +Pads, +basse | +Percussions legeres | +Rythme, +layers | Tous instruments | -Percussions | Accord final |

### Sound design UI

Les sons d'interface sont essentiels pour rendre la demonstration credible et immersive :

| Son | Description | Duree |
|-----|-------------|-------|
| Clic bouton | Son bref, net, grave-medium. Type "tock" bois doux. | 0.1s |
| Apparition element | "Swoosh" tres subtil, ascendant. | 0.2s |
| Validation/completion | Son harmonique doux, deux notes ascendantes. | 0.3s |
| Score gauge animation | Son continu de "montee" accompagnant l'animation du chiffre. | 1.2s |
| Roue — apparition segment | Son unique par segment, leger crescendo. Pitch croissant. | 0.4s |
| Generation PDF | Son de "materialisation" satisfaisant. | 0.5s |

**Volume du sound design : -12dB sous la musique.** Les sons UI sont un complement, jamais une distraction.

### Voix-off

- **Registre :** Narrateur confident. Pas de voix publicitaire. Le ton de quelqu'un qui presente un outil qu'il connait et qu'il estime.
- **Rythme :** 140-150 mots par minute. Pauses deliberees entre les scenes. Laisser les visuels respirer.
- **Langue :** Francais metropolitain standard.
- **Enregistrement :** Studio, micro statique, traitement minimal (compression legere, de-esser, EQ douce). Pas de reverb ajoutee.

### Sources musique recommandees

- **Artlist.io** — Categorie "Corporate / Technology / Inspiring"
- **Epidemic Sound** — Categorie "Business / Clean / Minimal"
- **Musicbed** — Si budget plus eleve, meilleure curation
- **Composition sur mesure** — Ideale si le budget le permet

---

## 6. DONNEES DE DEMONSTRATION

Pour que les ecrans soient credibles dans la video, voici le profil client de demonstration a utiliser :

**Client :** Sophie Martin, 38 ans
- En couple avec 2 enfants (7 et 4 ans)
- Salariee cadre
- Revenus foyer : 4000-6000 EUR
- Proprietaire avec credit immobilier
- 1 vehicule de 2 ans, usage quotidien, RC uniquement
- Objets de valeur 10k-50k EUR, domicile sans securite, couverture basique

**Resultat attendu :**

| Univers | Couleur | Score | Statut |
|---------|---------|-------|--------|
| Auto/Mobilite | Vert `#168741` | 82/100 | Bien couvert |
| Habitation | Rouge `#d9304c` | 45/100 | Action requise |
| Prevoyance | Rouge fonce `#99172d` | 28/100 | Critique |
| Objets de valeur | Orange `#c97612` | 55/100 | A ameliorer |

**Score global : 67/100** (rouge)

Ce profil produit une roue avec des couleurs variees qui est visuellement riche et pedagogique, et un plan d'actions fourni avec des recommandations de types differents.

---

## 7. SCRIPT VOIX-OFF COMPLET

**Scene 1 (0:00 - 0:12) :**
"Chaque client est unique. Mais aujourd'hui, analyser ses besoins en assurance prend du temps, repose sur l'intuition, et laisse des opportunites passer."

**Scene 2 (0:12 - 0:25) :**
"La Roue des Besoins est un outil de diagnostic structure, qui transforme un echange client en analyse exploitable."

**Scene 3 (0:25 - 0:45) :**
"Des la connexion, vous voyez vos clients, leurs scores, et les actions prioritaires. En un regard, vous savez ou concentrer votre attention."

**Scene 4 (0:45 - 1:10) :**
"Votre client repond a un questionnaire structure en 5 thematiques. Les questions s'adaptent a son profil : un independant avec famille ne voit pas les memes questions qu'un retraite celibataire. Et pendant qu'il repond, son diagnostic se construit en temps reel."

**Scene 5 (1:10 - 1:30) :**
"En un coup d'oeil, la Roue des Besoins revele la situation complete. Chaque univers — auto, habitation, prevoyance, objets de valeur — est evalue sur cent. Vert, bien couvert. Orange, a ameliorer. Rouge, action requise. Votre client comprend immediatement. Et vous aussi."

**Scene 6 (1:30 - 1:50) :**
"L'outil genere automatiquement des recommandations priorisees. Vous savez exactement quoi proposer, dans quel ordre. Et en un clic, vous generez un rapport PDF professionnel — une version pour votre client, une version enrichie pour vous avec les donnees brutes et les opportunites commerciales."

**Scene 7 (1:50 - 2:10) :**
"Gagnez du temps. Renforcez votre credibilite. Ne laissez plus aucune opportunite passer. La Roue des Besoins — votre outil de diagnostic assurance."

**Nombre total de mots : ~210** (conforme au rythme 140-150 mots/min sur 1:30 de voix-off effective)

---

## 8. FICHIERS SOURCE DE REFERENCE

| Fichier | Contenu |
|---------|---------|
| `src/index.css` | Tokens design system (couleurs, ombres, arrondis) |
| `src/lib/constants.ts` | Couleurs et labels des univers |
| `src/components/wheel/InsuranceWheel.tsx` | Composant Roue (PieChart Recharts) |
| `src/components/ui/ScoreGauge.tsx` | Composant gauge SVG animee |
| `src/pages/client/ResultsPage.tsx` | Page resultats complete |
| `src/pages/advisor/AdvisorDashboard.tsx` | Dashboard conseiller |
| `src/components/questionnaire/QuestionnaireShell.tsx` | Structure questionnaire |
| `src/components/pdf/PdfAdvisorReport.tsx` | Rapport PDF conseiller |
| `src/components/pdf/PdfClientReport.tsx` | Rapport PDF client |
| `src/shared/scoring/engine.ts` | Moteur de scoring |

---

*Brief cree le 10 mars 2026. Document transmissible directement a un motion designer ou une agence de production.*
