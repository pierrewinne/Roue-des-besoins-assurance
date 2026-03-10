# Brief Video Motion Design V2 — "La vue d'ensemble qui change tout."

**Projet :** Roue des Besoins Assurance
**Objet :** Video pedagogique de presentation produit
**Cible :** Agents professionnels d'assurance (conseillers)
**Duree :** 2min10 (+/- 10 secondes)
**Date :** Mars 2026
**Version :** 2.0 — integre la revue DA du 10/03/2026

---

## CHANGELOG V1 → V2

| # | Correction | Source |
|---|-----------|--------|
| 1 | **Donnees de demo recalculees** — scores alignes sur les seuils reels de `thresholds.ts` | Revue DA - bloquant |
| 2 | **Scene 4 ajoutee** — page detail client (vue conseiller) | Revue DA - structurel |
| 3 | **Scene 5 reduite** de 25s a 20s pour maintenir le rythme | Revue DA - structurel |
| 4 | **Scene 8 ajoutee** — micro-scene responsive tablette/mobile | Revue DA - opportunite |
| 5 | **Transition Scene 4→5 renforcee** — morph badge Conseiller→Client au lieu d'overlay texte | Revue DA - structurel |
| 6 | **Tableau typographique video** ajoute avec tailles en pixels 1080p | Revue DA - DA |
| 7 | **Specifications de capture** ajoutees (viewport 1440x900, 2x) | Revue DA - DA |
| 8 | **Piano solo remplace** par drone synthetique en ouverture | Revue DA - son |
| 9 | **Ratio voix-off/musique** et silences inter-scenes specifies | Revue DA - son |
| 10 | **Micro-animations ralenties x2** pour la lisibilite video | Revue DA - DA |
| 11 | **Bouton CTA closing** marque comme element video-only | Revue DA - storyboard |
| 12 | **UNIVERSE_COLORS inutilisees** mentionnees en avertissement | Revue DA - bloquant |
| 13 | **Vues client vs conseiller** clarifiees pour chaque scene | Revue DA - bloquant |
| 14 | **LoginPage** — correction : magic link cote client, mot de passe cote conseiller | Revue DA - mineur |
| 15 | **ProgressBar** — ajout de l'icone check sur les etapes completees | Revue DA - mineur |
| 16 | **Fond navy Scene 1** — ajout degrade subtil + texture geometrique | Revue DA - DA |
| 17 | **Son PDF** — description precise au lieu de "materialisation" vague | Revue DA - son |

---

## 1. CONCEPT CREATIF / ANGLE NARRATIF

### Titre de travail
**"La vue d'ensemble qui change tout."**

### Angle narratif
La video adopte le point de vue du conseiller en assurance. On ne lui presente pas un outil technique, on lui montre comment son quotidien change. L'arc narratif suit une journee type : de la preparation d'un rendez-vous client a l'exploitation des resultats, en passant par la revelation centrale — la Roue des Besoins.

### Structure narrative en 3 actes

**Acte 1 — Le probleme (0:00 - 0:20)**
Le diagnostic assurance aujourd'hui : des tableurs, des fiches papier, des estimations a vue. Le conseiller navigue entre dix documents, perd du temps, manque des opportunites. Tension visuelle : ecrans encombres, complexite, friction.

**Acte 2 — La solution (0:20 - 1:44)**
Presentation du parcours complet dans l'application. On suit le flux reel cote conseiller (dashboard, detail client) puis cote client (questionnaire, resultats, roue). Chaque etape est montree dans son contexte d'usage reel, avec identification claire de la vue (conseiller ou client).

**Acte 3 — La transformation (1:44 - 2:10)**
Le conseiller maitrise la relation client. Il a une vue d'ensemble, des donnees exploitables, un outil qui renforce sa credibilite. Closing sur les benefices metier et appel a l'action.

### Ton
Professionnel, sobre, confiant. Pas de jargon marketing excessif. Le ton de quelqu'un qui connait le metier et presente un outil qui fonctionne. Ni enthousiasme force, ni demonstration technique seche.

---

## 2. STORYBOARD DETAILLE

### Vue d'ensemble du timing

| Scene | Timing | Duree | Contenu | Vue |
|-------|--------|-------|---------|-----|
| 1 | 0:00 - 0:10 | 10s | Ouverture / Probleme | — |
| 2 | 0:10 - 0:20 | 10s | Introduction solution | Login |
| 3 | 0:20 - 0:38 | 18s | Dashboard conseiller | **Conseiller** |
| 4 | 0:38 - 0:46 | 8s | Detail client *(NEW)* | **Conseiller** |
| 5 | 0:46 - 1:06 | 20s | Questionnaire | **Client** |
| 6 | 1:06 - 1:26 | 20s | Revelation Roue (climax) | **Client** |
| 7 | 1:26 - 1:44 | 18s | Actions + PDF | **Conseiller** |
| 8 | 1:44 - 1:50 | 6s | Responsive mobile *(NEW)* | — |
| 9 | 1:50 - 2:10 | 20s | Closing benefices | — |

---

### SCENE 1 — Ouverture / Le probleme actuel
**Timing : 0:00 - 0:10 | Vue : aucune (motion design pur)**

**Visuel :**
Fond en degrade lent du primary-900 (`#000739`) au primary-700 (`#000d6e`), mouvement radial, avec une texture geometrique tres discrete (lignes paralleles a 5% d'opacite) pour eviter l'aplat funebre. Le logo "RB" (carre navy arrondi, lettres blanches) apparait au centre avec un fade-in net. Il se deplace vers le haut a gauche pendant que le titre "Roue des Besoins" s'inscrit en Inter Semibold blanc, tracking tight. Sous-titre "Diagnostic assurance personnalise" en slate-400 (`#94a3b8`), 1.5 secondes puis fade.

Transition vers une scene illustree : un bureau de conseiller encombre. Des icones minimalistes Lucide (file-text, table, clock) apparaissent et se multiplient de facon desordonnee — evoquant la complexite actuelle. Style flat, geometrique, epure.

**Voix-off :**
> "Chaque client est unique. Mais analyser ses besoins en assurance prend du temps et laisse des opportunites passer."

**Silence :** 1s de respiration avant Scene 2.

**Animation :**
- Logo : ease-out, 0.8s
- Texte : fade bloc, 0.5s
- Icones : cascade desordonnee, 2.5 secondes
- Transition : fondu vers blanc

**Son :**
Drone synthetique grave, pad avec legere modulation ascendante sur les 10 secondes. Un demi-ton de montee progressive. Ambiance calme mais tendue. Pas de note de piano seule.

---

### SCENE 2 — Introduction de la solution
**Timing : 0:10 - 0:20 | Vue : LoginPage (mode Conseiller)**

**Visuel :**
Ecran blanc. Le texte "Et si vous aviez la vue d'ensemble ?" apparait en Inter Bold, taille titrage, couleur slate-900 (`#1e293b`). Le mot "vue d'ensemble" est en primary-700 (`#000d6e`).

Puis transition fluide : l'ecran se recadre pour reveler le mockup de l'application dans un device frame epure. On voit la LoginPage — le carre RB navy, le toggle Client/Conseiller. Le curseur clique sur l'onglet "Conseiller" (l'onglet passe en `bg-white text-slate-900 shadow-sm`). Le formulaire affiche alors email + mot de passe (note : en mode Client, c'est un magic link sans mot de passe). Le conseiller se connecte.

**Voix-off :**
> "La Roue des Besoins transforme un echange client en analyse exploitable."

**Silence :** 0.5s avant Scene 3.

**Animation :**
- Texte : slide-up + fade, 0.6s, ease-out
- Device frame : scale 0.95 vers 1.0, opacity 0 vers 1, 0.8s
- Toggle Conseiller : transition 400ms (x2 ralenti pour la video, 200ms dans l'app)

**Son :**
La musique demarre. Tempo modere, instruments digitaux subtils, basses synthetiques profondes.

---

### SCENE 3 — Le tableau de bord conseiller
**Timing : 0:20 - 0:38 | Vue : AdvisorDashboard (Conseiller)**

**Visuel :**
Le navigateur affiche le `AdvisorDashboard`. On voit :
- Le header avec le logo RB, le badge "Conseiller" (`bg-primary-50 text-primary-700 ring-1 ring-primary-700/10`)
- Les 3 StatCards en ligne : "12 Clients" (icone `users`, primary), "8 Diagnostics realises" (icone `badge-check`, emerald), "3 Actions requises" (icone `alert-triangle`, amber)
- La liste des clients avec noms, badges de score colores, dates

> **Note technique :** Dans le code, la couleur "primary" des StatCards est mappee via la cle `"indigo"` dans le composant `StatCard.tsx` (vestige de nommage). Le rendu est bien `text-primary-700` / `bg-primary-50`. Le motion designer doit utiliser les couleurs primary, pas chercher d'indigo.

La camera fait un zoom progressif sur le client "Sophie Martin" dont le badge affiche un score rouge (57/100). Le curseur clique dessus.

**Voix-off :**
> "Des la connexion, vous voyez vos clients, leurs scores, et les actions prioritaires. En un regard, vous savez ou concentrer votre attention."

**Silence :** 0s — enchainage direct vers Scene 4.

**Animation :**
- StatCards : stagger 0.15s, slide-up + fade
- Lignes clients : stagger 0.1s
- Badge score rouge : pulse douce (1 battement)
- Hover ligne : `bg-slate-50`, chevron passe en `primary-400` — **transition 400ms** (x2 ralenti, 200ms dans l'app)
- Clic : ease-in vers la page detail

**Son :**
Accent musical subtil a l'apparition des StatCards. "Tock" UI discret au clic.

---

### SCENE 4 — La vue detail client *(NOUVELLE)*
**Timing : 0:38 - 0:46 | Vue : ClientDetailPage (Conseiller)**

**Visuel :**
La `ClientDetailPage` s'affiche. C'est la vue enrichie du conseiller — plus detaillee que ce que voit le client. On montre rapidement :
- Le ScoreGauge (taille 150) avec le score de Sophie Martin
- La Roue des Besoins (taille 250, sans labels exterieurs)
- Les UniverseCards en mode `showDetails` : chaque carte affiche les barres d'exposition au risque (amber) et de couverture (primary-400), plus le score numerique colore
- Le panneau de ponderation (progress bars des poids par univers)

Le regard s'attarde 2s sur les barres d'exposition/couverture d'un univers en rouge, pour montrer le niveau de detail offert au conseiller.

**Voix-off :** Aucune — la musique porte cette transition. On laisse les visuels parler.

**Animation :**
- Les UniverseCards apparaissent en stagger (0.2s) depuis la droite
- Les barres d'exposition (amber `#c97612`) et de couverture (`primary-400 #3d4691`) s'animent de 0 a leur valeur cible en 0.8s
- Les scores numeriques apparaissent en counter (0 vers valeur finale)

**Son :**
Musique en montee progressive. Sons UI subtils pour les barres qui se remplissent.

---

### TRANSITION SCENE 4 → SCENE 5 — Changement de perspective
**Timing : integre dans la fin de Scene 4 et le debut de Scene 5**

**Visuel :**
Fondu vers le fond navy (`#000d6e`). Le badge "Conseiller" (texte blanc, fond primary-50) se morphe en badge "Client" — le texte change, la couleur evolue. C'est un moment de "switch" de perspective delibere et visible.

Puis fondu vers le questionnaire cote client.

**Duree :** 1.5s integre dans le timing existant.

**Son :** Accord musical de transition, comme un changement de tonalite.

---

### SCENE 5 — Le parcours client / Questionnaire
**Timing : 0:46 - 1:06 | Vue : QuestionnairePage (Client)**

**Visuel :**
On voit le `QuestionnairePage` avec :
- Le `PageHeader` "Mon diagnostic assurance" / "Repondez aux questions pour decouvrir vos besoins."
- La `ProgressBar` en haut : 5 etapes. L'etape 1 est active (`bg-white text-primary-700 ring-2 ring-primary-700`). Les etapes completees affichent une **icone check** (`bg-primary-700 text-white`) au lieu du numero.
- Le formulaire dans sa `Card` blanche (`rounded-xl`, `border-slate-200`, `shadow-card`)
- Les boutons de reponse (`border-2 rounded-lg`, selectionnes : `border-primary-700 bg-primary-50`)

On anime le remplissage rapide de 2 questions (pas 3, pour le rythme) :
1. "Quelle est votre tranche d'age ?" — clic sur "30-40 ans"
2. "Situation familiale ?" — clic sur "En couple avec enfants"

Puis jump-cut accelere : la ProgressBar avance d'un coup vers l'etape 4/5 (les etapes 1-3 passent en check vert). Le panneau lateral droit affiche l'apercu temps reel de la Roue des Besoins dans une Card — la roue se construit et ses couleurs changent.

**Voix-off :**
> "Votre client repond a un questionnaire structure en 5 thematiques. Les questions s'adaptent a son profil. Et pendant qu'il repond, son diagnostic se construit en temps reel."

**Silence :** 1.5s avant le climax de la Scene 6. Ce micro-silence est essentiel pour amplifier la revelation.

**Animation :**
- Options : slide-in doux
- Clic reponse : bordure passe en `primary-700` en **400ms** (x2 ralenti), fond en `primary-50`
- ProgressBar : cercle se remplit en `primary-700`, ligne connectrice aussi, 600ms ease (x2 ralenti)
- Jump-cut vers etape 4 : rapide, net
- Roue laterale : segments apparaissent un par un, changent de couleur de facon fluide

**Son :**
Sons UI discrets a chaque clic (type Linear/Stripe). La musique gagne en intensite.

---

### SCENE 6 — La revelation : La Roue des Besoins
**Timing : 1:06 - 1:26 | Vue : ResultsPage (Client)**

> **C'est le moment climax visuel de la video.**

**Visuel :**
Le client clique "Voir mon diagnostic" et arrive sur la `ResultsPage`.

La camera se centre sur la Roue des Besoins. **Liberte cinematographique** : on l'isole d'abord sur un fond epure avant de recadrer sur la page complete. Dans l'application reelle, la Roue et le ScoreGauge cohabitent dans une meme Card a gauche d'un grid 3 colonnes.

La Roue est un PieChart donut (innerRadius 20%, outerRadius 38%, stroke blanc entre les segments). Les couleurs des segments sont determinees par le `needLevel` via la fonction `getNeedColor()` — ce sont les couleurs de scoring, **PAS** les `UNIVERSE_COLORS` de `constants.ts` (qui sont des nuances navy inutilisees dans la version actuelle).

Couleurs des segments pour Sophie Martin :
- Auto/Mobilite — vert (`#168741`) — needLevel `low`
- Objets de valeur — orange (`#c97612`) — needLevel `moderate`
- Habitation — rouge (`#d9304c`) — needLevel `high`
- Prevoyance — rouge fonce (`#99172d`) — needLevel `critical`

Les labels sont positionnes a l'exterieur de la roue, en Inter Semibold, colores selon le needLevel.

Au-dessus : le `ScoreGauge` — cercle SVG avec arc progressif, le chiffre "57" en `text-4xl font-bold` en rouge (`#d9304c`, car score > 50), "/100" en dessous en `text-xs font-medium text-slate-400`.

En dessous du score, le label contextuel : "Lacunes significatives identifiees" (fond rouge-50).

> **Note : le score est un score de BESOIN, pas de couverture.** Score eleve = besoin eleve = mauvaise situation. Vert (0-25) = bien couvert. Rouge (>50) = lacunes.

A cote, les `UniverseCards` (vue client, sans `showDetails`) : icone coloree dans fond teinte (couleur + 12% opacite), nom de l'univers, Badge de statut ("Bien couvert" en vert, "A ameliorer" en orange, "Action requise" en rouge).

**Voix-off :**
> "En un coup d'oeil, la Roue des Besoins revele la situation complete. Chaque univers est evalue : vert, bien couvert. Orange, a ameliorer. Rouge, action requise. Votre client comprend immediatement. Et vous aussi."

**Animation :**
C'est la scene la plus travaillee en animation.

1. La Roue apparait vide (cercle gris `slate-100`), puis les segments se remplissent un par un dans le sens horaire, chacun prenant sa couleur finale en 0.5s (ease-out-cubic). Delai entre chaque : 0.3s.

2. Le ScoreGauge : l'arc se dessine de 0 a 57 en 1.2s (ease-out), le chiffre s'incremente de 0 a 60 en counter animation synchronisee. La couleur de l'arc passe du vert au rouge en traversant les seuils (25 et 50).

3. Les labels exterieurs de la roue apparaissent en fade-in decale apres que le segment correspondant est rempli.

4. Les UniverseCards glissent depuis la droite (stagger 0.2s), chacune avec son message contextuel.

5. Le `WheelLegend` apparait sous la roue : chaque ligne avec sa pastille coloree, son label, son message.

**Son :**
Moment musical fort — la melodie atteint son point culminant. Un accent de basse profond quand le score global "57" apparait. Chaque segment de la roue a un son unique avec un pitch legerement croissant (4 notes ascendantes formant un accord).

---

### SCENE 7 — Les actions recommandees et le rapport PDF
**Timing : 1:26 - 1:44 | Vue : ClientDetailPage (Conseiller) + PDF**

**Visuel :**
Retour cote conseiller. On voit la `ClientDetailPage` scrollee vers la section actions. L'`ActionList` est affichee avec `showType={true}` (badges de type visibles — uniquement sur cette vue conseiller, pas sur la ResultsPage client).

- Chaque action dans une Card blanche (`rounded-xl`, `shadow-card`, hover `shadow-card-hover`)
- Titre en `font-semibold text-slate-900`, description en `text-slate-500`
- Badges : univers en bleu (`bg-primary-50 text-primary-700`), type en rouge ("Immediate" — `bg-red-50 text-red-700`) ou orange ("Differee" — `bg-amber-50 text-amber-700`) ou gris ("Evenement" — `bg-slate-100 text-slate-600`)
- Indicateur de priorite : 5 barres verticales (`w-1.5 h-5 rounded-full`), remplies en `rose-400` jusqu'au niveau de priorite

Actions mises en evidence :
- "Revoir la couverture prevoyance familiale" (priorite 5/5, Prevoyance, Immediate)
- "Ameliorer la couverture habitation" (priorite 4/5, Habitation, Immediate)
- "Securiser les objets de valeur" (priorite 3/5, Objets, Differee)

Puis transition vers le rapport PDF. Split screen :
- **A gauche** : le `PdfClientReport` (2 pages) — synthese avec les 3 grands chiffres, bloc "Prochaines etapes" (fond `#e5e7f0` primary-100)
- **A droite** : le `PdfAdvisorReport` (3 pages) — meme synthese + page 3 avec le bloc "Opportunites commerciales" (fond `#ecfdf5` emerald-50). Le badge "CONSEILLER" (`bg-primary-700`, texte blanc) est mis en evidence.

**Voix-off :**
> "L'outil genere des recommandations priorisees. Vous savez quoi proposer, dans quel ordre. Et en un clic, un rapport PDF professionnel — une version pour votre client, une version enrichie pour vous avec les opportunites commerciales."

**Animation :**
- Actions : cascade stagger 0.15s, slide-up
- Barres de priorite : remplissage gauche-a-droite, stagger
- PDF : le document flotte avec une ombre douce, leger zoom sur le bloc "Opportunites commerciales"
- Split screen : les deux rapports apparaissent simultanement, slide-in depuis les bords

**Son :**
Son de validation enrichi quand le PDF se genere — deux notes synthetiques ascendantes (quarte juste) avec un leger shimmer metallique, 0.5s. Reference : son de completion d'export Figma. La musique se stabilise.

---

### SCENE 8 — Responsive mobile / tablette *(NOUVELLE)*
**Timing : 1:44 - 1:50 | Vue : multiple (mobile + tablette)**

**Visuel :**
Montage rapide de 3 devices montrant l'application :
1. iPad en mode paysage — le conseiller montre la Roue a son client en rendez-vous
2. iPhone — la ResultsPage responsive, la Roue adaptee au petit ecran
3. Laptop — retour sur le dashboard conseiller (boucle narrative)

Les 3 devices sont disposes en composition oblique (30 degres) sur fond slate-50.

**Voix-off :** Aucune — seulement la musique. Laisser les visuels parler.

**Animation :**
- Les devices apparaissent en stagger 0.8s, scale 0.9 vers 1.0, rotation subtile
- Legere parallaxe entre les plans (les devices bougent a des vitesses legerement differentes)

**Son :**
La musique commence sa resolution. Percussions qui s'attenuent.

---

### SCENE 9 — Les benefices metier / Closing
**Timing : 1:50 - 2:10 | Vue : aucune (motion design pur)**

**Visuel :**
Retour sur fond degrade navy (primary-900 vers primary-700, meme traitement que Scene 1 pour la symetrie). Trois blocs de texte apparaissent successivement, chacun avec une icone Lucide stylisee :

1. Icone `clock` — **"Gagnez du temps"**
   "Un diagnostic structure en 10 minutes."

2. Icone `shield-check` — **"Renforcez votre credibilite"**
   "Des rapports professionnels qui inspirent confiance."

3. Icone `trending-up` — **"Ne manquez plus aucune opportunite"**
   "Identifiez automatiquement le cross-selling pertinent."

Puis les trois blocs se reduisent et s'alignent sous le logo RB qui reprend sa place centrale. Le texte final apparait :

**"Roue des Besoins"**
"Votre outil de diagnostic assurance."

CTA : un bouton anime reprenant le style du composant `Button` de l'app (`bg-primary-700 text-white rounded-md shadow`), texte "Commencer maintenant".

> **Note production :** Ce bouton CTA est un element graphique cree pour la video. Il n'existe pas dans l'application. Ne pas chercher a le reproduire depuis un screenshot.

**Voix-off :**
> "Gagnez du temps. Renforcez votre credibilite. Ne laissez plus aucune opportunite passer."

*Silence 1.5s.*

> "La Roue des Besoins — votre outil de diagnostic assurance."

**Animation :**
- Les 3 blocs benefices : slide-up + fade, stagger 0.5s
- Reduction/reorganisation : morph fluide 0.8s
- Logo : scale 1.2 vers 1.0, 0.6s
- Bouton CTA : apparition avec legere pulsation (shadow qui pulse 2 fois)
- Fade final doux — le logo reste 3 secondes

**Son :**
La musique se resout sur un accord plein et satisfaisant. Silence apres le dernier mot de la voix-off.

---

## 3. DIRECTION ARTISTIQUE

### Palette couleurs

La video reprend strictement la charte de l'application.

| Role | Hex | Usage video |
|------|-----|-------------|
| Primary-900 | `#000739` | Fond degrade (extremite sombre) |
| Primary-700 (brand) | `#000d6e` | Fonds principaux, textes titres sur fond clair, boutons, logo |
| Primary-400 | `#3d4691` | Accents, elements interactifs hover, barres de couverture |
| Primary-100 | `#e5e7f0` | Bloc "Prochaines etapes" du PDF client |
| Primary-50 | `#f0f1f7` | Fonds secondaires, badges, zones mises en valeur |
| Slate-900 | `#1e293b` | Texte courant sur fond clair |
| Slate-500 | `#64748b` | Texte secondaire |
| Slate-100 | `#f1f5f9` | Cercle vide de la roue (avant animation) |
| Slate-50 | `#f8fafc` | Fonds de sections, cards PDF, fond devices Scene 8 |
| Blanc | `#ffffff` | Fond principal app, cards |
| Score vert | `#168741` | needLevel `low` — "Bien couvert" |
| Score orange/amber | `#c97612` | needLevel `moderate` — "A ameliorer" + barres d'exposition |
| Score rouge | `#d9304c` | needLevel `high` — "Action requise" |
| Score rouge fonce | `#99172d` | needLevel `critical` — "Action requise" |
| Emerald-50 | `#ecfdf5` | Bloc "Opportunites commerciales" du PDF conseiller |
| Rose-400 | — | Barres de priorite dans l'ActionList |

**Regle absolue : aucune couleur hors palette.** Pas de bleu electrique, pas de violet, pas de degrades gratuits. La sobriete navy est l'identite.

> **AVERTISSEMENT PRESTATAIRE :** Le fichier `constants.ts` contient des `UNIVERSE_COLORS` (auto: `#293485`, habitation: `#656ea8`, prevoyance: `#0014aa`, objets_valeur: `#3d4691`). Ces couleurs navy sont **INUTILISEES** dans la version actuelle de la Roue. La Roue utilise exclusivement les couleurs de scoring (`NEED_COLORS`) via `getNeedColor()`. Ne pas les confondre.

### Typographie — Reference ecran (app)

| Usage | Font | Weight | Taille app |
|-------|------|--------|-----------|
| Titres principaux | Inter | Bold (700) | 32-48px |
| Sous-titres | Inter | Semibold (600) | 18-24px |
| Corps texte | Inter | Regular (400) | 14-16px |
| Labels UI | Inter | Medium (500) | 11-13px |
| Chiffres / scores | Inter | Bold (700) | 32-64px, tabular-nums |
| Voix-off sous-titres | Inter | Medium (500) | 16px, fond semi-transparent |

Tracking serre (tracking-tight) sur les titres. Line-height genereux sur les corps de texte.

### Typographie — Correspondance video (1080p / 4K)

| Usage | Taille 1080p minimum | Taille 4K minimum |
|-------|----------------------|-------------------|
| Titres video (hors mockup) | 72px | 144px |
| Sous-titres video | 42px | 84px |
| Corps/labels video (hors mockup) | 28px | 56px |
| Sous-titres voix-off | 32px | 64px |
| Textes UI dans mockups | Taille naturelle si mockup ≥ 70% largeur ecran | Idem |

### Style d'illustration

**Flat design geometrique epure.** Pas d'illustration 3D, pas de personnages photorealistes, pas de clipart.

- Les icones reprennent le style Lucide (outline, strokeWidth 2, coins arrondis) utilise dans le composant `Icon` de l'app
- Les scenes abstraites utilisent des formes geometriques simples : cercles, rectangles arrondis, lignes
- Les mockups d'ecrans sont des captures fideles de l'application reelle (voir section 4 pour les specs de capture)
- Les diagrammes (roue, gauges, barres) sont animes a partir des composants reels de l'app

### Transitions

Toutes les transitions sont fluides et minimalistes :

- **Entre scenes :** Fondu enchaine via blanc (0.4s) ou morph direct (0.6s). Jamais de wipe, de rotation, ou d'effet spectaculaire. Exception : transition Scene 4→5 avec morph de badge (1.5s).
- **Dans les scenes :** Slide-up + fade pour l'apparition d'elements. Ease-out-cubic comme courbe de reference. Stagger 0.1-0.2s entre elements similaires.
- **Camera :** Mouvements lents et deliberes. Zoom progressif (pas de zoom brusque). Pan horizontal doux pour les ecrans larges.

### Micro-animations UI — Ralentissement video

> **Regle :** Toutes les micro-animations de l'application (hover, clic, transitions d'etat) doivent etre **ralenties x2** pour la video. Les transitions de 200ms dans l'app deviennent 400ms dans la video. Cela garantit qu'elles sont perceptibles par le spectateur.

| Animation app | Duree app | Duree video |
|--------------|-----------|-------------|
| Hover couleur | 200ms | 400ms |
| Clic selection | 200ms | 400ms |
| ProgressBar avance | 300ms | 600ms |
| Toggle login | 200ms | 400ms |

### Grille et composition

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
| Sous-titres | Fichier SRT separe + version incrustee (fond `rgba(0, 7, 57, 0.85)`, texte blanc, Inter Medium 32px en 1080p) |

### Declinaisons a prevoir

1. **Version 16:9** — version principale, pour presentations, site web, YouTube
2. **Version 1:1** — version carree pour LinkedIn et reseaux sociaux, recadree avec les elements cles recomposes
3. **Version 9:16** — version verticale pour stories/reels, avec recomposition integrale (non un simple crop)
4. **Version courte 30s** — teaser : Scene 6 (Roue) + Scene 9 (Closing)

### Outils de production recommandes

| Outil | Usage | Justification |
|-------|-------|---------------|
| **After Effects** | Animation principale, motion design | Standard industrie, controle precis des courbes, expressions pour les counters |
| **Figma** | Preparation des mockups, assets, compositions | Les ecrans de l'app peuvent etre recrees fidelement, export SVG/PNG haute resolution |
| **Lottie** | Micro-animations exportables (roue, gauge) | Si on veut reutiliser les animations dans l'app elle-meme |
| **Premiere Pro** | Montage final, voix-off, sound design | Post-production et mixage |
| **Rive / Motion Canvas** | Alternative open-source | Motion Canvas (TypeScript) permet un controle programmatique fidele au code |

### Preparation des assets depuis le code

Les ecrans de l'application montres dans la video doivent etre **fideles au pixel pres** a l'application reelle.

**Specifications de capture :**

| Parametre | Valeur |
|-----------|--------|
| Viewport | 1440 x 900 px |
| Device pixel ratio | 2x (Retina) — captures a 2880 x 1800 px |
| Navigateur | Chrome, mode plein ecran sans barre d'adresse |
| Donnees | Profil Sophie Martin (voir section 6) |

**Ratio du mockup dans le cadre video :**
- Largeur du mockup : 75-80% de la largeur video
- Position : centre vertical avec 10% de marge haute
- Device frame : `border-radius 12px`, ombre `shadow-elevated`, fond `#f8fafc` derriere le device
- Pas de chrome OS visible, juste un cadre minimaliste gris clair avec les 3 points de controle

**Preparation des composants cles :**

1. **Roue des Besoins :** Exporter le SVG du PieChart Recharts et le reanimer dans After Effects pour controler le timing de revelation de chaque segment.
2. **ScoreGauge :** Reproduire l'animation SVG `strokeDashoffset` exactement comme dans le code (transition 1s ease-out definie dans le composant).
3. **Barres de progression :** Capturer les etats vide et rempli, animer entre les deux dans After Effects.

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

**Structure musicale alignee sur la video V2 :**

| Segment | 0:00-0:10 | 0:10-0:20 | 0:20-0:38 | 0:38-0:46 | 0:46-1:06 | 1:06-1:26 | 1:26-1:44 | 1:44-1:50 | 1:50-2:10 |
|---------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
| Scene | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| Energie | Basse | Montee | Moderee | Montee | Croissante | **Climax** | Plateau | Declin | Resolution |
| Instruments | Drone synth | +Pads, +basse | +Percu legeres | +Tension | +Rythme, +layers | Tous | -Percussions | Pads seuls | Accord final |

### Niveaux sonores et mixage

| Source | Niveau relatif | Comportement |
|--------|---------------|-------------|
| Voix-off | 0 dB (reference) | — |
| Musique (sous voix-off) | -9 dB | Duck automatique, remontee en 0.5s dans les silences |
| Musique (sans voix-off) | -3 dB | Scenes 4, 8 et silences inter-scenes |
| Sound design UI | -12 dB sous la musique | Complement, jamais distraction |

### Silences et respirations inter-scenes

| Transition | Silence voix-off | Note |
|-----------|-----------------|------|
| Scene 1 → 2 | 1.0s | Laisser le drone resoudre |
| Scene 2 → 3 | 0.5s | Enchainement rapide |
| Scene 3 → 4 | 0s | Direct — le clic mene a la page |
| Scene 4 → 5 | 1.0s | Transition de perspective, musique seule |
| Scene 5 → 6 | **1.5s** | Micro-silence crucial avant le climax |
| Scene 6 → 7 | 0.5s | — |
| Scene 7 → 8 | 0.5s | — |
| Scene 8 → 9 | 1.0s | Respiration avant le closing |
| Dans Scene 9 | 1.5s | Silence avant la phrase finale "La Roue des Besoins..." |

### Sound design UI

| Son | Description precise | Duree |
|-----|---------------------|-------|
| Clic bouton | Son bref, net, grave-medium. Type "tock" bois doux. Frequence fondamentale ~200Hz. | 0.1s |
| Apparition element | "Swoosh" tres subtil, ascendant. Bruit blanc filtre passe-haut, fade-in rapide. | 0.2s |
| Validation/completion | Son harmonique doux, deux notes synthetiques ascendantes (tierce majeure). | 0.3s |
| Score gauge animation | Son continu de "montee" — oscillateur sinusoidal glissant de 200Hz a 400Hz, filtre avec resonance douce. | 1.2s |
| Roue — apparition segment | Son unique par segment. 4 notes ascendantes formant un accord (quinte). Synth bell avec decay court. Pitch croissant : segment 1 a Do4, segment 2 a Mi4, segment 3 a Sol4, segment 4 a Do5. | 0.4s chaque |
| Generation PDF | Deux notes synthetiques ascendantes (quarte juste) avec leger shimmer metallique, evoquant la completion d'un processus. Reference : son d'export Figma. | 0.5s |
| Barres de progression | Sweep subtil ascendant, frequence proportionnelle a la valeur finale. | 0.8s |

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

> **V2 : scores entierement recalcules** pour etre coherents avec les seuils de `thresholds.ts`. En V1, les scores etaient inverses (score eleve = bien couvert, ce qui est faux). Le score est un **score de besoin** : score eleve = besoin eleve = mauvaise couverture.

### Profil client

**Client :** Sophie Martin, 38 ans
- En couple avec 2 enfants (7 et 4 ans)
- Salariee cadre
- Revenus foyer : 4000-6000 EUR
- Proprietaire avec credit immobilier
- 1 vehicule de 6 ans, usage occasionnel, assurance **omnium** (tous risques)
- Objets de valeur 10k-50k EUR, stockes au domicile sans securite, couverture **basique**
- Couverture habitation : **standard**
- Couverture prevoyance : **basique**

### Resultat attendu

> Les scores ci-dessous sont des estimations coherentes avec la matrice de scoring `NEED_MATRIX[exposure][coverage]`. Pour une precision absolue, executer le moteur de scoring (`computeDiagnostic` dans `engine.ts`) avec les reponses du profil ci-dessus.

| Univers | Score | needLevel | Couleur | Badge | Message |
|---------|-------|-----------|---------|-------|---------|
| Auto/Mobilite | ~15 | `low` | Vert `#168741` | "Bien couvert" | "Votre protection est adaptee a votre situation." |
| Objets de valeur | ~40 | `moderate` | Orange `#c97612` | "A ameliorer" | "Quelques ameliorations pourraient renforcer votre couverture." |
| Habitation | ~60 | `high` | Rouge `#d9304c` | "Action requise" | "Des lacunes ont ete identifiees dans votre couverture." |
| Prevoyance | ~85 | `critical` | Rouge fonce `#99172d` | "Action requise" | "Votre couverture est insuffisante. Une action rapide est recommandee." |

### Ponderations (apres normalisation)

| Univers | Poids brut | Poids normalise | Justification |
|---------|-----------|----------------|---------------|
| Auto | 25 | ~23% | Actif (1 vehicule) |
| Habitation | 35 | ~32% | 30 de base + 5 (proprietaire + credit) |
| Prevoyance | 40 | ~36% | 35 de base + 5 (famille avec enfants) |
| Objets de valeur | 10 | ~9% | Actif (objets declares) |
| **Total** | 110 | 100% | — |

### Score global

**Score = 15×0.23 + 40×0.09 + 60×0.32 + 85×0.36 = 3.5 + 3.6 + 19.2 + 30.6 = ~57**

**Score global : ~57/100** — rouge (`#d9304c`, car > 50) — "Lacunes significatives identifiees"

> Note : le score global affiché dans le ScoreGauge sera en rouge car > 50. Le label contextuel sur la ResultsPage sera "Lacunes significatives identifiees" (fond rouge-50).

### Actions recommandees pour la demo

| Action | Univers | Type | Priorite |
|--------|---------|------|----------|
| Revoir la couverture prevoyance familiale | Prevoyance | Immediate | 5/5 |
| Ameliorer l'assurance habitation (proprietaire avec credit) | Habitation | Immediate | 4/5 |
| Securiser les objets de valeur (alarme, coffre, assurance) | Objets de valeur | Differee | 3/5 |
| Planifier un bilan prevoyance complet | Prevoyance | Evenement | 3/5 |

---

## 7. SCRIPT VOIX-OFF COMPLET

**Scene 1 (0:00 - 0:10) :**
"Chaque client est unique. Mais analyser ses besoins en assurance prend du temps et laisse des opportunites passer."
*(22 mots)*

*— Silence 1.0s —*

**Scene 2 (0:10 - 0:20) :**
"La Roue des Besoins transforme un echange client en analyse exploitable."
*(12 mots)*

*— Silence 0.5s —*

**Scene 3 (0:20 - 0:38) :**
"Des la connexion, vous voyez vos clients, leurs scores, et les actions prioritaires. En un regard, vous savez ou concentrer votre attention."
*(24 mots)*

**Scene 4 (0:38 - 0:46) :**
*Pas de voix-off. Musique seule. Les visuels parlent.*

*— Silence 1.0s (transition de perspective) —*

**Scene 5 (0:46 - 1:06) :**
"Votre client repond a un questionnaire structure en 5 thematiques. Les questions s'adaptent a son profil. Et pendant qu'il repond, son diagnostic se construit en temps reel."
*(30 mots)*

*— Silence 1.5s (tension avant le climax) —*

**Scene 6 (1:06 - 1:26) :**
"En un coup d'oeil, la Roue des Besoins revele la situation complete. Chaque univers est evalue : vert, bien couvert. Orange, a ameliorer. Rouge, action requise. Votre client comprend immediatement. Et vous aussi."
*(35 mots)*

*— Silence 0.5s —*

**Scene 7 (1:26 - 1:44) :**
"L'outil genere des recommandations priorisees. Vous savez quoi proposer, dans quel ordre. Et en un clic, un rapport PDF professionnel — une version pour votre client, une version enrichie pour vous avec les opportunites commerciales."
*(37 mots)*

**Scene 8 (1:44 - 1:50) :**
*Pas de voix-off. Musique seule.*

*— Silence 1.0s —*

**Scene 9 (1:50 - 2:10) :**
"Gagnez du temps. Renforcez votre credibilite. Ne laissez plus aucune opportunite passer."
*(12 mots)*

*— Silence 1.5s —*

"La Roue des Besoins — votre outil de diagnostic assurance."
*(9 mots)*

---

**Statistiques du script :**
- Mots totaux : ~181
- Scenes avec voix-off : 7 sur 9
- Duree effective de parole : ~75 secondes
- Rythme moyen : ~145 mots/minute (dans la cible 140-150)
- Temps de silence total : ~7 secondes
- Scenes sans voix-off : Scene 4 (8s) et Scene 8 (6s) = 14s de musique pure

---

## 8. FICHIERS SOURCE DE REFERENCE

| Fichier | Contenu | Notes |
|---------|---------|-------|
| `src/index.css` | Tokens design system (couleurs, ombres, arrondis) | Source de verite pour les couleurs |
| `src/lib/constants.ts` | Labels, couleurs, messages des univers | **Attention : `UNIVERSE_COLORS` inutilisees (voir section 3)** |
| `src/shared/scoring/thresholds.ts` | Seuils de scoring, `NEED_MATRIX`, `getNeedLevel`, `getNeedColor` | Source de verite pour les niveaux et couleurs de besoin |
| `src/shared/scoring/engine.ts` | Moteur de scoring `computeDiagnostic` | Pour generer les donnees de demo reelles |
| `src/components/wheel/InsuranceWheel.tsx` | Composant Roue (PieChart Recharts) | Utilise `getNeedColor()`, pas `UNIVERSE_COLORS` |
| `src/components/ui/ScoreGauge.tsx` | Gauge SVG animee | Seuils couleur : vert ≤25, orange ≤50, rouge >50 |
| `src/components/ui/StatCard.tsx` | StatCards du dashboard | **Note : cle `"indigo"` = vestige, mappe vers `primary-*`** |
| `src/components/diagnostic/UniverseCard.tsx` | Cartes univers (basique + detail) | `showDetails` pour les barres expo/couverture |
| `src/components/diagnostic/ActionList.tsx` | Liste d'actions | `showType` pour les badges type (vue conseiller uniquement) |
| `src/pages/client/ResultsPage.tsx` | Page resultats (vue client) | UniverseCards sans `showDetails` |
| `src/pages/client/QuestionnairePage.tsx` | Page questionnaire | ProgressBar 5 etapes avec check sur etapes completees |
| `src/pages/advisor/AdvisorDashboard.tsx` | Dashboard conseiller | StatCards + liste clients |
| `src/pages/advisor/ClientDetailPage.tsx` | Detail client (vue conseiller) | Barres expo/couverture, `showType`, generation PDF |
| `src/pages/auth/LoginPage.tsx` | Page de connexion | Toggle Client/Conseiller, magic link vs mot de passe |
| `src/components/pdf/PdfClientReport.tsx` | Rapport PDF client | 2 pages, bloc "Prochaines etapes" (primary-100) |
| `src/components/pdf/PdfAdvisorReport.tsx` | Rapport PDF conseiller | 3 pages, bloc "Opportunites commerciales" (emerald-50) |

---

*Brief V2 cree le 10 mars 2026. Integre les retours de la revue Direction Artistique. Document transmissible directement a un motion designer ou une agence de production.*
