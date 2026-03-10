# Charte Graphique de Référence Baloise
## Audit complet du site baloise.lu & Design System exploitable

**Version** : 1.0
**Date** : 10 mars 2026
**Source primaire** : [baloise.lu](https://www.baloise.lu), [@baloise/design-system-components v15.2.4](https://github.com/baloise/design-system), [design.baloise.dev](https://design.baloise.dev/)

---

## Table des matières

1. [Resume executif](#1-resume-executif)
2. [Audit global du site](#2-audit-global-du-site)
3. [Palette couleurs](#3-palette-couleurs)
4. [Typographies](#4-typographies)
5. [Systeme iconographique](#5-systeme-iconographique)
6. [Composants UI recurrents](#6-composants-ui-recurrents)
7. [Principes UX/UI observes](#7-principes-uxui-observes)
8. [Banque de reference graphique](#8-banque-de-reference-graphique)
9. [Charte graphique de reference pour les applications Baloise](#9-charte-graphique-de-reference-pour-les-applications-baloise)
10. [Recommandations pour les equipes](#10-recommandations-pour-les-equipes)

---

## 1. Resume executif

### Identite visuelle Baloise

Baloise Luxembourg deploie une identite visuelle **institutionnelle premium**, fondee sur un bleu marine profond (`#000d6e`) comme couleur de marque. Le design system officiel Baloise (open source, Stencil.js + Web Components) fournit une base solide de tokens, composants et principes reutilisables.

### Constats cles

| Dimension | Observation |
|---|---|
| **ADN visuel** | Institutionnel-moderne, confiance, sobriety premium |
| **Couleur dominante** | Bleu marine `#000d6e` (primary-5) |
| **Typographie** | BaloiseCreateHeadline (titres), BaloiseCreateText (corps) |
| **Composants** | Web Components (`bal-*`) bases sur Stencil.js |
| **Tokens** | ~200 CSS custom properties (`--bal-*`) |
| **Ton** | Rassurant, professionnel, accessible |
| **Niveau de modernite** | Eleve (Web Components, design tokens, responsive fluid) |

### Sources exploitees

- **Site corporate** : baloise.lu (pages accueil, produits auto, simulation, blog, FAQ, contact)
- **Design System officiel** : `@baloise/design-system-components` v15.2.4 sur npm
- **CSS tokens** : `@baloise/design-system-css` v12.4.1
- **Documentation** : Storybook sur design.baloise.dev
- **Repository** : github.com/baloise/design-system (6 966 commits, Apache-2.0)

---

## 2. Audit global du site

### 2.1 Structure du site baloise.lu

| Page | Role | Elements cles |
|---|---|---|
| **Accueil** (`/fr/particuliers.html`) | Doorway landing | Hero, 3 simulateurs, valeurs (responsable, accessible, local), blog |
| **Produit Auto** (`/assurance-auto.html`) | Fiche produit | Hero photo, comparaison formules, packs optionnels, FAQ, CTA devis |
| **Simulateur Auto** (`/simulateur-tarif-auto.html`) | Formulaire | Multi-sections, dropdowns, champs texte, reCAPTCHA, CTA "Envoyer" |
| **Blog** (`/blog/mobilite/...`) | Contenu editorial | Article single-column, hero image 16:9, related articles, CTA devis |
| **FAQ** (`/faq.html`) | Support | Sections categorisees, Q&A en blocs, pas d'accordeon visible |
| **Contact** (`/contact-coordonnees.html`) | Relation client | Formulaire, coordonnees, Google Maps, horaires, agent finder |

### 2.2 Navigation principale

```
Header
├── Barre utilitaire (top)
│   ├── Telephone : +352 290 190 1
│   ├── Selecteur langue : DE | EN | FR
│   └── Lien myBaloise (portail client)
├── Navigation principale
│   ├── Mon assurance Luxembourg
│   │   ├── Assurance auto
│   │   ├── Assurance habitation
│   │   ├── Assurance voyage
│   │   └── ...
│   ├── Protection / Prevoyance / Epargne
│   ├── Professionnels
│   └── Blog
└── Quick actions
    ├── Declaration de sinistre
    └── Contact
```

### 2.3 Footer

```
Footer (4 colonnes)
├── Col 1 : Produits d'assurance (auto, habitation, vie, voyage...)
├── Col 2 : Demandes clients (sinistre, documents, FAQ, portail)
├── Col 3 : Entreprise (a propos, carrieres, agents)
├── Col 4 : Baloise Life (blog, actualites)
├── Social : Facebook, Instagram, LinkedIn, Twitter, YouTube
└── Legal : Mentions legales, Politique donnees, Cookies, Accessibilite
```

### 2.4 Patterns de page identifies

| Pattern | Description |
|---|---|
| **Hero avec photo** | Image pleine largeur + overlay texte + CTA principal |
| **Section alternee** | Fond blanc / fond gris clair en alternance |
| **Grille de cartes** | 2-3 colonnes, cartes avec icone + titre + description + CTA |
| **Comparaison formules** | Colonnes paralleles avec listes de garanties |
| **FAQ** | Blocs Q&A groupes par categorie |
| **Formulaire multi-sections** | Sections thematiques (profil, vehicule, couverture) avec label bold |
| **Banniere d'alerte** | Fond jaune (`--bal-color-yellow-3`), coins arrondis, icone |
| **CTA recurrent** | "Demandez un devis" repete 3-4 fois par page produit |

---

## 3. Palette couleurs

### 3.1 Couleurs primaires (Blue)

La palette primaire Baloise est un bleu marine profond, identitaire et omnipresent.

| Token | Hex | Usage | Frequence |
|---|---|---|---|
| `--bal-color-blue-1` | `#e5e7f0` | Fonds clairs, hover subtle | Haute |
| `--bal-color-blue-2` | `#b3b6d4` | Bordures legeres, etats desactives | Moyenne |
| `--bal-color-blue-3` | `#656ea8` | Texte secondaire, icones inactives | Moyenne |
| `--bal-color-blue-4` | `#293485` | Texte de lien survole, accent fort | Moyenne |
| `--bal-color-blue-5` | `#000d6e` | **Couleur de marque principale** — texte, liens, boutons, navigation | **Tres haute** |
| `--bal-color-blue-6` | `#000739` | Fonds tres sombres, headers premium | Basse |

> **Alias principal** : `--bal-color-primary` = `--bal-color-blue-5` = `#000d6e`

### 3.2 Couleurs secondaires (Light Blue)

| Token | Hex | Usage |
|---|---|---|
| `--bal-color-light-blue-1` | `#e5f1fe` | Fonds informatifs, badges info |
| `--bal-color-light-blue-2` | `#a7d1fa` | Accents legers |
| `--bal-color-light-blue-3` | `#56a7f5` | Liens interactifs, focus |
| `--bal-color-light-blue-4` | `#6672cc` | Accent medium |
| `--bal-color-light-blue-5` | `#0014aa` | Variante intense |
| `--bal-color-light-blue-6` | `#000a55` | Variante sombre |

### 3.3 Couleurs d'accent

#### Vert (Green) — Confiance, validation, ecologie
| Token | Hex | Usage |
|---|---|---|
| `--bal-color-green-1` | `#e9fbf7` | Fond succes subtil |
| `--bal-color-green-2` | `#cbf2ec` | Fond carte verte |
| `--bal-color-green-3` | `#94e3d4` | **Icones produit, accents visuels** |
| `--bal-color-green-4` | `#21d9ac` | CTA secondaire vert |
| `--bal-color-green-5` | `#00b28f` | Texte succes |
| `--bal-color-green-6` | `#1b5951` | Texte sombre sur fond vert |

#### Violet (Purple) — Differentiation, premium
| Token | Hex | Usage |
|---|---|---|
| `--bal-color-purple-1` | `#f9f3ff` | Fond subtil |
| `--bal-color-purple-2` | `#e1d9ff` | Badge, accent |
| `--bal-color-purple-3` | `#b8b2ff` | **Accent principal violet** |
| `--bal-color-purple-4` | `#be82fa` | Illustrations |
| `--bal-color-purple-5` | `#9f52cc` | Texte accent |
| `--bal-color-purple-6` | `#6c2273` | Texte sombre sur fond violet |

#### Jaune (Yellow) — Alertes, attention
| Token | Hex | Usage |
|---|---|---|
| `--bal-color-yellow-1` | `#fff9e8` | Fond alerte subtil |
| `--bal-color-yellow-2` | `#ffecbc` | Fond badge warning |
| `--bal-color-yellow-3` | `#fae052` | **Fond bandeau d'alerte** |
| `--bal-color-yellow-4` | `#ffbe19` | Accent orange |
| `--bal-color-yellow-5` | `#fa9319` | Warning texte |
| `--bal-color-yellow-6` | `#b24a00` | Texte sombre sur fond jaune |

#### Rouge (Red) — Urgence, danger
| Token | Hex | Usage |
|---|---|---|
| `--bal-color-red-1` | `#ffeef1` | Fond erreur subtil |
| `--bal-color-red-2` | `#ffd7d7` | Fond badge erreur |
| `--bal-color-red-3` | `#ffaca6` | Accent erreur leger |
| `--bal-color-red-4` | `#ff596f` | Erreur visible |
| `--bal-color-red-5` | `#d9304c` | **Erreur principale, destruction** |
| `--bal-color-red-6` | `#99172d` | Texte erreur sombre |

### 3.4 Neutres (Grey)

| Token | Hex | Usage | Role |
|---|---|---|---|
| `--bal-color-white` | `#ffffff` | Fond principal, texte sur sombre | Base |
| `--bal-color-grey-1` | `#fafafa` | Fond sections alternees | Fond subtil |
| `--bal-color-grey-2` | `#f6f6f6` | Fond cartes, fond inputs | Fond composant |
| `--bal-color-grey-3` | `#e8e8e8` | **Bordures, separateurs** | Bordure standard |
| `--bal-color-grey-4` | `#b6b6b6` | Placeholder, texte desactive | Desactive |
| `--bal-color-grey-5` | `#747474` | Texte secondaire, labels | Texte subtil |
| `--bal-color-grey-6` | `#313131` | Texte alternatif fonce | Texte fonce |
| `--bal-color-black` | `#000000` | Cas extremes (rare) | Reserve |

### 3.5 Couleurs semantiques (etats)

| Etat | Token principal | Hex | Usage |
|---|---|---|---|
| **Info** | `--bal-color-info-4` | `#1c77d2` | Messages informatifs, bulles d'aide |
| **Succes** | `--bal-color-success-4` | `#168741` | Validation, confirmation, score bas |
| **Warning** | `--bal-color-warning-5` | `#f99319` | Avertissements, score modere |
| **Danger** | `--bal-color-danger-4` | `#ea1800` | Erreurs systeme, formulaires invalides |

> **Note** : Ces couleurs semantiques different legerement des rouge/vert/jaune de la palette d'accent. Les couleurs semantiques sont destinees aux etats fonctionnels (formulaires, notifications), tandis que les accents sont decoratifs.

### 3.6 Couleurs de texte

| Token | Resolu en | Usage |
|---|---|---|
| `--bal-text` | `#000d6e` | Texte principal (bleu marine !) |
| `--bal-text-strong` | `#000d6e` | Texte emphase |
| `--bal-text-light` | `#293485` (blue-4) | Texte secondaire |
| `--bal-text-invert` | `#ffffff` | Texte sur fond sombre |
| `--bal-color-text-grey` | `#747474` (grey-5) | Texte desactive, caption |
| `--bal-color-text-success` | `#168741` | Texte succes |
| `--bal-color-text-warning` | `#f99319` | Texte warning |
| `--bal-color-text-danger` | `#ea1800` | Texte erreur |

> **Point cle** : Le texte principal Baloise est en bleu marine `#000d6e`, pas en noir. C'est un choix de marque distinctif qui doit etre respecte dans les applications.

### 3.7 Couleurs de bordure

| Token | Resolu en | Usage |
|---|---|---|
| `--bal-color-border-primary` | `#000d6e` | Bordure active, focus |
| `--bal-color-border-grey` | `#e8e8e8` | Bordure standard, separateur |
| `--bal-color-border-grey-dark` | `#b6b6b6` | Bordure plus marquee |
| `--bal-color-border-success` | `#168741` | Bordure validation |
| `--bal-color-border-warning` | `#f99319` | Bordure warning |
| `--bal-color-border-danger` | `#ea1800` | Bordure erreur |

### 3.8 Liens

| Token | Hex | Observation |
|---|---|---|
| `--bal-link` | `#000d6e` | Liens en bleu marine (meme couleur que texte) |
| `--bal-link-hover` | `#000d6e` | Pas de changement de couleur au hover |

> Les liens se distinguent par le souligne (`text-decoration: underline`) avec `underline-offset` personnalise, pas par la couleur.

---

## 4. Typographies

### 4.1 Familles de polices

| Token | Valeur | Usage |
|---|---|---|
| `--bal-font-family-title` | `BaloiseCreateHeadline, Arial, sans-serif` | **Tous les titres** (h1-h6) |
| `--bal-font-family-text` | `BaloiseCreateText, Arial, sans-serif` | **Corps de texte**, labels, boutons, navigation |

> **BaloiseCreateHeadline** et **BaloiseCreateText** sont des polices proprietaires Baloise. Le fallback est **Arial** (pas Helvetica, pas system-ui). A confirmer : ces polices sont potentiellement disponibles dans le package `@baloise/design-system-fonts` ou les brand assets.

### 4.2 Poids typographiques

| Token | Valeur | Usage |
|---|---|---|
| `--bal-weight-light` | `300` | Texte de large display, titres fins |
| `--bal-weight-regular` | `400` | Corps de texte standard |
| `--bal-weight-bold` | `700` | Titres, labels de champs, emphase, boutons |

> L'ecosysteme est simple : **3 poids**. Pas de medium (500) ni semi-bold (600) dans les tokens officiels. Cela renforce la lisibilite et la coherence.

### 4.3 Echelle typographique

#### Mobile (base)

| Token | Taille | Line-height | Usage recommande |
|---|---|---|---|
| `--bal-size-xxxxx-large` | `3rem` (48px) | `3.5rem` | Display hero mobile |
| `--bal-size-xxxx-large` | `2rem` (32px) | `2.5rem` | H1 mobile |
| `--bal-size-xxx-large` | `1.75rem` (28px) | `2rem` | H2 mobile |
| `--bal-size-xx-large` | `1.5rem` (24px) | `2rem` | H3 mobile |
| `--bal-size-x-large` | `1.25rem` (20px) | `2rem` | H4 mobile |
| `--bal-size-large` | `1.125rem` (18px) | `1.5rem` | Lead / intro text |
| `--bal-size-medium` | `1rem` (16px) | `1.5rem` | Corps de texte |
| `--bal-size-normal` | `1rem` (16px) | `1.5rem` | Corps standard |
| `--bal-size-small` | `0.875rem` (14px) | `1.125rem` | Labels, captions |
| `--bal-size-x-small` | `0.75rem` (12px) | `1rem` | Footnotes, badges |

#### Tablet (>= 769px)

| Token | Taille | Line-height |
|---|---|---|
| `xxxxx-large` | `5rem` (80px) | `6rem` |
| `xxxx-large` | `3rem` (48px) | `3.5rem` |
| `xxx-large` | `2.5rem` (40px) | `3rem` |
| `xx-large` | `2rem` (32px) | `2.5rem` |
| `x-large` | `1.5rem` (24px) | `2rem` |
| `large` | `1.25rem` (20px) | `2rem` |
| `medium` | `1.125rem` (18px) | `1.625rem` |
| `normal` | `1rem` (16px) | `1.5rem` |
| `small` | `0.875rem` (14px) | `1.125rem` |
| `x-small` | `0.75rem` (12px) | `1rem` |

#### Desktop (>= 1024px)

Identique a tablet. L'echelle se stabilise a partir du breakpoint tablette.

### 4.4 Hierarchie typographique recommandee

| Element | Police | Poids | Taille (desktop) | Couleur |
|---|---|---|---|---|
| **Display** | BaloiseCreateHeadline | 700 | 5rem (80px) | `#000d6e` |
| **H1** | BaloiseCreateHeadline | 700 | 3rem (48px) | `#000d6e` |
| **H2** | BaloiseCreateHeadline | 700 | 2.5rem (40px) | `#000d6e` |
| **H3** | BaloiseCreateHeadline | 700 | 2rem (32px) | `#000d6e` |
| **H4** | BaloiseCreateHeadline | 700 | 1.5rem (24px) | `#000d6e` |
| **Lead** | BaloiseCreateText | 400 | 1.25rem (20px) | `#000d6e` |
| **Body** | BaloiseCreateText | 400 | 1rem (16px) | `#000d6e` |
| **Small** | BaloiseCreateText | 400 | 0.875rem (14px) | `#747474` |
| **X-small** | BaloiseCreateText | 400 | 0.75rem (12px) | `#747474` |
| **Label (bold)** | BaloiseCreateText | 700 | 0.875rem (14px) | `#000d6e` |
| **Button** | BaloiseCreateText | 700 | 1rem (16px) | variable |
| **Navigation** | BaloiseCreateText | 700 | 0.875rem (14px) | `#000d6e` |

> **Observation site** : les titres de page sont en bold, les sous-titres de section egalement. Le body text utilise `hyphens: auto` pour un habillage fluide.

---

## 5. Systeme iconographique

### 5.1 Style d'icones observe

| Propriete | Observation | Confiance |
|---|---|---|
| **Type** | SVG heberges sur DAM Baloise (`/dam/jcr:*`) | Haute |
| **Style** | Line icons + illustrations simples | Haute |
| **Epaisseur** | Trait moyen (~2px), regulier | Haute |
| **Remplissage** | Principalement contour (outline), certaines illustrations remplies | Haute |
| **Couleur dominante** | Vert teal `#94e3d4` pour les icones produit | Haute |
| **Couleur secondaire** | Bleu marine `#000d6e` pour icones de navigation | Haute |
| **Taille standard** | 48-64px pour les icones produit, 24px pour les icones d'interface | Moyenne |
| **Coherence** | Forte — style uniforme sur tout le site | Haute |

### 5.2 Categories d'icones observees

| Categorie | Exemples | Usage |
|---|---|---|
| **Produit / Assurance** | Voiture, maison, famille, voyage, sante | Cartes produit, pages categorie |
| **Service** | Mains serrees, 24h, pont Luxembourg | Valeurs de marque, reassurance |
| **Action** | Telephone, email, document, telechargement | Navigation, CTA, formulaires |
| **Social** | Facebook, Instagram, LinkedIn, Twitter, YouTube | Footer |

### 5.3 Package officiel

Le design system fournit un package d'icones : `@baloise/design-system-icons` (npm). Ce package contient les icones SVG officielles exploitables dans les applications.

### 5.4 Recommandations iconographiques

- **Privilege** : style line/outline, trait regulier 2px
- **Couleur par defaut** : `--bal-color-primary` (`#000d6e`) pour interface, `--bal-color-green-3` (`#94e3d4`) pour illustrations produit
- **Taille minimum** : 24px pour la lisibilite
- **Pas de remplissage** sauf pour les illustrations decoratives
- **Alternative** : Si les icones proprietaires ne sont pas disponibles, utiliser un set comme Lucide ou Phosphor en style `outline`, epaisseur 2px, pour un rendu cohérent

---

## 6. Composants UI recurrents

### 6.1 Inventaire des composants (Design System officiel)

Le Baloise Design System fournit des Web Components (`bal-*`) prefixes. Composants identifies :

#### Containment
| Composant | Description |
|---|---|
| `bal-button` | Boutons primaires, secondaires, tertiaires, ghost |
| `bal-card` | Cartes avec variants de couleur (green, purple, blue) |
| `bal-accordion` | Panneau deroulant |
| `bal-modal` | Fenetre modale |
| `bal-tabs` | Navigation par onglets |
| `bal-tag` | Tag / badge categoriel |
| `bal-badge` | Badge numerique / notification |
| `bal-tooltip` | Infobulle |
| `bal-popover` | Popover contextuel |

#### Navigation
| Composant | Description |
|---|---|
| `bal-navbar` | Barre de navigation principale |
| `bal-pagination` | Pagination |
| `bal-stepper` | Indicateur d'etapes (formulaire multi-step) |
| `bal-breadcrumb` | Fil d'Ariane |

#### Form
| Composant | Description |
|---|---|
| `bal-input` | Champ de saisie texte |
| `bal-select` | Liste deroulante |
| `bal-checkbox` | Case a cocher |
| `bal-radio` | Bouton radio |
| `bal-textarea` | Zone de texte multiligne |
| `bal-datepicker` | Selecteur de date |
| `bal-slider` | Curseur |
| `bal-file-upload` | Upload de fichier |

#### Typography / Content
| Composant | Description |
|---|---|
| `bal-heading` | Titres semantiques (h1-h6) |
| `bal-text` | Paragraphe de texte |
| `bal-label` | Label de formulaire |
| `bal-icon` | Icone SVG |
| `bal-logo` | Logo Baloise |

#### Layout
| Composant | Description |
|---|---|
| `bal-app` | Container d'application racine |
| `bal-stack` | Layout flexible (stack) |
| `bal-content` | Container de contenu |
| `bal-footer` | Footer |

#### Feedback
| Composant | Description |
|---|---|
| `bal-notification` | Notification / alerte |
| `bal-toast` | Toast message |
| `bal-spinner` | Indicateur de chargement |
| `bal-progress-bar` | Barre de progression |

### 6.2 Boutons

#### Variants

| Variant | Fond | Texte | Bordure | Usage |
|---|---|---|---|---|
| **Primary** | `#000d6e` | `#ffffff` | none | CTA principal : "Demandez un devis" |
| **Secondary** | `transparent` | `#000d6e` | `1px solid #000d6e` | Action secondaire |
| **Tertiary** | `transparent` | `#000d6e` | none | Action tertiaire, lien style |
| **Danger** | `#ea1800` | `#ffffff` | none | Actions destructives |
| **Inverted** | `#ffffff` | `#000d6e` | none | Sur fond sombre |

#### Styles communs

| Propriete | Valeur |
|---|---|
| Font | `--bal-button-font-family` (BaloiseCreateText) |
| Poids | `--bal-button-font-weight` (700 bold) |
| Border-radius | `--bal-radius-normal` (4px) |
| Padding | ~12-16px vertical, 24-32px horizontal |
| Shadow (hover) | `--bal-button-shadow` (elevation subtile) |
| Transition | `300ms cubic-bezier(0.25, 0.8, 0.5, 1)` |

#### Etats

| Etat | Comportement |
|---|---|
| **Default** | Couleur de base |
| **Hover** | Shadow subtile + legere elevation |
| **Active/Pressed** | Shadow reduite |
| **Focus** | Outline bleu `#56a7f5` (accessibilite) |
| **Disabled** | Opacite reduite, couleur grisee |

### 6.3 Cartes

| Propriete | Valeur |
|---|---|
| Background | `#ffffff` ou teinte de couleur (green-1, purple-1) |
| Border | Aucune bordure visible (ou `--bal-color-border-grey`) |
| Border-radius | `--bal-radius-large` = `0.75rem` (12px) |
| Shadow | `--bal-shadow-normal` = `0 0 10px 0 rgba(0, 7, 57, 0.15)` |
| Shadow hover | `--bal-shadow-large` = `0 0 30px 0 rgba(0, 7, 57, 0.15)` |
| Padding interne | 20-30px |
| Gap entre cartes | `--bal-column-gap` = `1rem` |

> **Observation** : Les ombres Baloise utilisent une teinte navy (`rgba(0, 7, 57, ...)`) et non un gris neutre, ce qui renforce subtillement la marque.

### 6.4 Formulaires

| Element | Style |
|---|---|
| **Label** | BaloiseCreateText bold 14px, couleur `#000d6e` |
| **Input** | Border `1px solid #e8e8e8`, radius `4px`, padding `12px` |
| **Input focus** | Border `#000d6e`, outline bleu subtil |
| **Input error** | Border `#ea1800`, message rouge en dessous |
| **Select** | Style natif ameliore, chevron personnalise |
| **Checkbox/Radio** | Custom styling bleu marine au check |
| **Textarea** | Meme style que input, hauteur auto |
| **Bouton submit** | Variant primary, texte "Envoyer" |

### 6.5 Banniere d'alerte

| Propriete | Valeur |
|---|---|
| Background | `--bal-color-yellow-3` (`#fae052`) |
| Border-radius | `--bal-radius-large` (12px) |
| Padding | 20px |
| Texte | Couleur foncee sur fond jaune |
| Icone | Icone d'attention a gauche |

### 6.6 Navigation Header

| Propriete | Observation |
|---|---|
| Position | Fixed ou sticky |
| Background | Blanc `#ffffff` |
| Border bottom | Subtle `#e8e8e8` |
| Logo | Logo Baloise a gauche |
| Menu items | BaloiseCreateText bold 14px, couleur `#000d6e` |
| Active state | Souligne ou indicateur visuel |
| Mobile | Hamburger menu |

---

## 7. Principes UX/UI observes

### 7.1 Niveau de sobriete

**Eleve**. Baloise adopte un style epure et professionnel. Les pages ne sont jamais surchargees. L'espace blanc est genereux (sections de 60-80px de padding). Les couleurs d'accent sont utilisees avec parcimonie — le bleu marine domine, les couleurs vives (vert, violet, jaune) n'apparaissent que pour les icones et les accents.

### 7.2 Densite visuelle

**Faible a moyenne**. Les pages produit sont spacieuses avec de grands blocs de contenu. Les formulaires sont aeres avec un espacement genereux entre les champs. L'approche est "un seul message par ecran".

### 7.3 Importance de l'espace blanc

**Cruciale**. L'espace blanc est l'un des piliers du design Baloise :
- 60-80px entre les sections majeures
- 20-30px entre les elements d'une meme section
- Largeur de contenu contrainte (`max-width: 1400px`)
- Container spacing : 1rem mobile, 2.5rem tablet, 3rem desktop

### 7.4 Hierarchie visuelle

**Claire et lineaire**. La hierarchie suit un schema previsible :
1. Titre de page (H1 display)
2. Introduction (lead text)
3. Sections avec sous-titres (H2)
4. Cartes ou blocs de contenu (H3)
5. CTA recurrents

### 7.5 Logique des CTA

| Principe | Observation |
|---|---|
| CTA principal | "Demandez un devis" / "Simuler" — repete 3-4 fois par page |
| Placement | Hero, milieu de page, bas de page |
| Style | Bouton primary (bleu marine) |
| CTA secondaire | "Nous contacter" / "En savoir plus" — bouton secondary ou lien |
| Tonalite | Action-oriented, conversationnel |

### 7.6 Ton visuel general

**Rassurant, professionnel, accessible**. Baloise se positionne entre l'institutionnel (banque/assurance) et le moderne (digital-first). Le ton n'est pas froid — les illustrations teal/vert et les photos lifestyle humanisent l'experience.

### 7.7 Confiance / Proximite / Institutionnel

| Dimension | Niveau | Comment |
|---|---|---|
| Confiance | **Eleve** | Couleurs stables, typographie serieuse, reassurance constante |
| Proximite | **Moyen-eleve** | Ton conversationnel, chiffres simples, FAQ |
| Institutionnel | **Eleve** | Bleu marine, mise en page structuree, badge "Conseiller" |

### 7.8 Equilibre marketing / lisibilite

Baloise privilegie la **lisibilite** sur le marketing agressif. Les pages produit informent avant de vendre. Les CTA sont presents mais jamais intrusifs. Les animations sont minimalistes (300ms transitions).

### 7.9 Perception premium

**Oui, moderement**. Le bleu marine profond, l'espace blanc genereux et la typographie proprietaire creent une perception premium sans etre luxueuse. C'est une approche "premium accessible".

### 7.10 Coherence de l'experience

**Tres forte**. Le design system `bal-*` garantit une coherence structurelle. Chaque page utilise les memes tokens, composants et patterns. Le footer, le header et les CTA sont identiques partout.

---

## 8. Banque de reference graphique

### A. Palette de reference

#### Couleurs principales
| Role | Token | Hex | Utilisation |
|---|---|---|---|
| Primary | `--bal-color-primary` | `#000d6e` | Texte, liens, boutons, navigation |
| Primary light | `--bal-color-primary-3` | `#656ea8` | Texte secondaire, icones |
| Primary background | `--bal-color-primary-1` | `#e5e7f0` | Fonds subtils, hover |

#### Couleurs secondaires
| Role | Token | Hex | Utilisation |
|---|---|---|---|
| Accent vert | `--bal-color-green-3` | `#94e3d4` | Icones produit, accents |
| Accent violet | `--bal-color-purple-3` | `#b8b2ff` | Differenciation, premium |
| Accent bleu clair | `--bal-color-light-blue-3` | `#56a7f5` | Focus, interactif |

#### Couleurs neutres
| Role | Token | Hex | Utilisation |
|---|---|---|---|
| Fond principal | `--bal-color-white` | `#ffffff` | Fond de page |
| Fond subtil | `--bal-color-grey-1` | `#fafafa` | Sections alternees |
| Fond composant | `--bal-color-grey-2` | `#f6f6f6` | Cartes, inputs |
| Bordure | `--bal-color-grey-3` | `#e8e8e8` | Separateurs |
| Placeholder | `--bal-color-grey-4` | `#b6b6b6` | Texte desactive |
| Texte secondaire | `--bal-color-grey-5` | `#747474` | Captions, aide |
| Texte fonce | `--bal-color-grey-6` | `#313131` | Alternative au navy |

#### Etats recommandes
| Etat | Fond | Bordure | Texte | Icone |
|---|---|---|---|---|
| **Succes** | `#e8f3ec` | `#168741` | `#168741` | Check vert |
| **Info** | `#e8f1fb` | `#1c77d2` | `#1c77d2` | Info bleu |
| **Warning** | `#fff9e8` | `#f99319` | `#c97612` | Attention orange |
| **Danger** | `#fce8e6` | `#ea1800` | `#ea1800` | Croix rouge |

### B. Typographie de reference

#### Police principale
- **Titres** : `BaloiseCreateHeadline, Arial, sans-serif`
- **Texte** : `BaloiseCreateText, Arial, sans-serif`
- **Source** : Polices proprietaires Baloise (package `@baloise/design-system-fonts` a confirmer)
- **Fallback** : Arial, sans-serif (et non Helvetica)

#### Hierarchie de titres (desktop)
| Element | Font | Size | Weight | Line-height | Color |
|---|---|---|---|---|---|
| Display | Headline | 80px | 700 | 96px | `#000d6e` |
| H1 | Headline | 48px | 700 | 56px | `#000d6e` |
| H2 | Headline | 40px | 700 | 48px | `#000d6e` |
| H3 | Headline | 32px | 700 | 40px | `#000d6e` |
| H4 | Headline | 24px | 700 | 32px | `#000d6e` |
| Lead | Text | 20px | 400 | 32px | `#000d6e` |
| Body | Text | 16px | 400 | 24px | `#000d6e` |
| Small | Text | 14px | 400 | 18px | `#747474` |
| X-Small | Text | 12px | 400 | 16px | `#747474` |

#### Styles de texte complementaires
| Style | Font | Size | Weight | Usage |
|---|---|---|---|---|
| Label | Text | 14px | 700 | Labels formulaire |
| Button | Text | 16px | 700 | Texte des boutons |
| Nav | Text | 14px | 700 | Items de menu |
| Badge | Text | 12px | 700 | Tags, badges |
| Caption | Text | 12px | 400 | Aide, footnotes |

### C. Systeme iconographique

| Regle | Specification |
|---|---|
| Style | Outline / line icons |
| Epaisseur de trait | 2px |
| Coin | Arrondi doux |
| Couleur interface | `#000d6e` (primary) |
| Couleur illustration | `#94e3d4` (green-3) |
| Taille interface | 24px |
| Taille illustration produit | 48-64px |
| Package officiel | `@baloise/design-system-icons` |
| Alternative | Lucide, Phosphor (style outline 2px) |

### D. Composants de reference

| Composant | Border-radius | Shadow | Background | Border |
|---|---|---|---|---|
| **Bouton primary** | 4px | hover: button-shadow | `#000d6e` | none |
| **Bouton secondary** | 4px | hover: button-shadow | transparent | `1px solid #000d6e` |
| **Champ input** | 4px | none | `#ffffff` | `1px solid #e8e8e8` |
| **Champ focus** | 4px | none | `#ffffff` | `2px solid #000d6e` |
| **Carte** | 12px | `0 0 10px rgba(0,7,57,.15)` | `#ffffff` | none |
| **Carte hover** | 12px | `0 0 30px rgba(0,7,57,.15)` | `#ffffff` | none |
| **Badge** | 9999px (pill) | none | variable | none |
| **Alerte info** | 12px | none | `#e8f1fb` | `1px solid #1c77d2` |
| **Alerte succes** | 12px | none | `#e8f3ec` | `1px solid #168741` |
| **Alerte warning** | 12px | none | `#fff9e8` | `1px solid #f99319` |
| **Alerte danger** | 12px | none | `#fce8e6` | `1px solid #ea1800` |
| **Panneau (section)** | 0 | none | `#fafafa` | none |
| **Navigation** | 0 | none | `#ffffff` | bottom `1px solid #e8e8e8` |
| **Tableau header** | 4px top | none | `#f6f6f6` | none |
| **Tableau row** | 0 | none | `#ffffff` | bottom `0.5px solid #e8e8e8` |

### E. Principes de layout

#### Grille
| Propriete | Valeur |
|---|---|
| Type | Flexbox + CSS Grid |
| Largeur max | `1400px` (`--bal-container-max-width`) |
| Colonnes | Pas de grille 12-col stricte, mais patterns 2 et 3 colonnes |
| Gap entre colonnes | `1rem` (`--bal-column-gap`) |

#### Espacements
| Token | Mobile | Tablet | Desktop |
|---|---|---|---|
| xx-small | 4px | 4px | 4px |
| x-small | 8px | 8px | 8px |
| small | 12px | 12px | 12px |
| normal | 16px | 16px | 16px |
| medium | 20px | 20px | 24px |
| large | 24px | 24px | 32px |
| x-large | 32px | 40px | 48px |
| xx-large | 48px | 56px | 64px |
| xxx-large | 56px | 72px | 96px |
| xxxx-large | 64px | 96px | 128px |

#### Container padding
| Breakpoint | Padding lateral |
|---|---|
| Mobile | 16px (`1rem`) |
| Tablet (>=769px) | 40px (`2.5rem`) |
| Desktop (>=1024px) | 48px (`3rem`) |

#### Breakpoints
| Token | Valeur | Usage |
|---|---|---|
| Tablet | `769px` | Passage a 2 colonnes |
| Desktop | `1024px` | Layout complet |
| HD | `1280px` | Ecrans larges |
| Widescreen | `1440px` | Grandes interfaces |
| Full HD | `1920px` | Ecrans tres larges |

#### Rayons d'arrondi
| Token | Valeur | Usage |
|---|---|---|
| `--bal-radius-none` | 0 | Sections, tableaux |
| `--bal-radius-small` | 4px | Boutons, inputs |
| `--bal-radius-normal` | 4px | Composants standard |
| `--bal-radius-large` | 12px | Cartes, alertes, modales |
| `--bal-radius-x-large` | 16px | Grandes cartes, panneaux |
| `--bal-radius-rounded` | 9999px | Badges pill, avatars |

#### Ombres
| Token | Valeur | Usage |
|---|---|---|
| `--bal-shadow-none` | `none` | Etat par defaut |
| `--bal-shadow-normal` | `0 0 10px 0 rgba(0,7,57,0.15)` | Cartes, composants eleves |
| `--bal-shadow-large` | `0 0 30px 0 rgba(0,7,57,0.15)` | Cartes hover, modales |
| Text shadow | `0px 0px 4px rgba(0,0,0,0.15), 0px 4px 12px rgba(0,0,0,0.25), 0px 0px 80px rgba(0,0,0,0.5)` | Texte sur images |

> **Note sur les ombres** : teinte `rgba(0, 7, 57, ...)` (navy) et non `rgba(0, 0, 0, ...)` (noir pur). C'est un detail de marque important.

#### Animation
| Propriete | Valeur |
|---|---|
| Duration | `300ms` |
| Easing | `cubic-bezier(0.25, 0.8, 0.5, 1)` |

---

## 9. Charte graphique de reference pour les applications Baloise

### 9.1 ADN visuel

L'ADN visuel Baloise repose sur **cinq piliers** :

1. **Bleu marine profond** (`#000d6e`) comme ancrage de marque — utilise pour le texte, les liens, les boutons et la navigation
2. **Espace blanc genereux** — le contenu respire, les sections sont aeres, la densite est faible
3. **Typographie proprietaire** a deux voix — Headline pour l'impact, Text pour la lisibilite
4. **Sobriety premium** — pas de couleurs agressives, pas de decorations superflues, pas d'animations complexes
5. **Accents colores contenus** — le vert (confiance), le violet (premium) et le jaune (attention) ne sont utilises que comme ponctuations

### 9.2 Principes de lisibilite

| Regle | Specification |
|---|---|
| Texte principal | **Toujours en bleu marine** `#000d6e`, jamais en noir |
| Texte secondaire | `#747474` (grey-5) pour les captions et l'aide |
| Taille minimum corps | 16px (1rem) — jamais en dessous pour le body text |
| Taille minimum labels | 14px (0.875rem) |
| Line-height body | 1.5 (24px pour 16px) |
| Contraste | WCAG AA minimum sur tous les couples couleur/fond |
| Max-width texte | ~80 caracteres par ligne pour le confort de lecture |

### 9.3 Palette recommandee pour les applications

#### Usage quotidien (80% de l'interface)
| Element | Couleur | Hex |
|---|---|---|
| Texte | Primary | `#000d6e` |
| Fond de page | White | `#ffffff` |
| Fond section | Grey-1 | `#fafafa` |
| Bordures | Grey-3 | `#e8e8e8` |
| Texte aide | Grey-5 | `#747474` |

#### Accents (15% de l'interface)
| Element | Couleur | Hex |
|---|---|---|
| CTA principal | Primary (blue-5) | `#000d6e` |
| Succes / Faible risque | Success-4 | `#168741` |
| Attention / Risque modere | Warning-5 | `#f99319` |
| Erreur / Risque eleve | Danger-4 | `#ea1800` |
| Information | Info-4 | `#1c77d2` |

#### Decoration (5% de l'interface)
| Element | Couleur | Hex |
|---|---|---|
| Accent illustration | Green-3 | `#94e3d4` |
| Accent premium | Purple-3 | `#b8b2ff` |
| Fond alerte | Yellow-3 | `#fae052` |

### 9.4 Typographie recommandee

| Contexte | Police | Fallback |
|---|---|---|
| Applications avec licence | BaloiseCreateHeadline + BaloiseCreateText | Arial, sans-serif |
| Applications sans licence | **Inter** (titres et texte) | system-ui, sans-serif |

> **Inter** est recommandee comme alternative open-source car elle partage les memes qualites : lisibilite ecran, proportion neutre, poids multiples (300, 400, 700 disponibles).

### 9.5 Principes d'iconographie

| Principe | Detail |
|---|---|
| Utiliser les icones officielles | Package `@baloise/design-system-icons` |
| Style coherent | Line icons, 2px trait, outline |
| Une seule couleur par icone | Primary ou couleur contextuelle |
| Pas de decorations | Pas d'ombre, pas de gradient, pas de 3D |
| Accompagnement texte | Les icones ne remplacent pas le texte, elles l'accompagnent |

### 9.6 Niveau de sobriety attendu

| A faire | A eviter |
|---|---|
| Fond blanc ou gris tres clair | Fonds colores agressifs |
| 1-2 couleurs d'accent max par ecran | Arc-en-ciel de couleurs |
| Espace blanc genereux entre sections | Contenu compacte "wall of text" |
| Animations subtiles (300ms, ease) | Animations complexes, rebonds, parallaxe |
| Typographie a 2-3 niveaux max par ecran | 5+ niveaux de titres sur un meme ecran |
| Icones simples outline | Icones 3D, illustrees, detaillees |
| CTA clair et unique par section | Multiples CTA concurrents |

### 9.7 Style des composants UI

| Composant | Esprit attendu |
|---|---|
| Boutons | Carres doux (4px radius), plein ou outline, pas de gradient |
| Cartes | Coins arrondis (12px), ombre navy subtle, pas de bordure visible |
| Inputs | Border fine grise, focus en bleu marine, pas de fond colore |
| Tableaux | Headers gris clair, bordures fines, texte aligne a gauche |
| Modales | Fond overlay semi-transparent, carte large centree |
| Toasts | En bas a droite, discrets, disparition automatique |
| Badges | Pill shape (9999px radius), fond colore clair, texte fonce |

### 9.8 Ton visuel global

**Institutionnel-accessible**. Le design Baloise pour les applications doit evoquer :
- La fiabilite d'une institution financiere
- L'accessibilite d'un outil moderne
- La clarte d'un dashboard bien concu
- La confiance d'une marque etablie

### 9.9 Ce qu'il faut reproduire

- Le bleu marine comme couleur de texte et d'action
- Les ombres navy (pas de gris pur)
- L'espace blanc genereux
- La hierarchie typographique claire (bold Headline + regular Text)
- Les couleurs semantiques cohérentes (succes vert, warning orange, erreur rouge)
- Les coins arrondis cartes (12px) vs boutons (4px)
- La transition standard (300ms cubic-bezier)

### 9.10 Ce qu'il faut eviter

| Anti-pattern | Pourquoi |
|---|---|
| Texte noir `#000000` | Baloise utilise `#000d6e` — le noir pur est hors marque |
| Ombres grises `rgba(0,0,0,...)` | Les ombres Baloise sont navy `rgba(0,7,57,...)` |
| Boutons arrondis (>4px radius) | Le style Baloise est carre doux, pas pill |
| Gradients | Aucun gradient n'est utilise dans le design system |
| Plus de 3 couleurs d'accent | Risque de rupture avec la sobriete Baloise |
| Police Helvetica/Roboto | Le fallback officiel est Arial |
| Animations > 500ms | Les transitions Baloise sont rapides (300ms) |
| Bordures epaisses | Les bordures sont fines (0.5-1px) et grises |
| Icones filled/solid | Le style Baloise est outline/line |

### 9.11 Coherence site corporate / applications

| Dimension | Site corporate | Application |
|---|---|---|
| Tokens | Memes CSS custom properties `--bal-*` | Memes tokens |
| Composants | Web Components `bal-*` | Memes composants ou equivalents |
| Couleurs | Palette complete (accents marketing) | Palette reduite (primary + semantiques) |
| Typographie | BaloiseCreateHeadline + Text | Idem ou Inter en fallback |
| Ton | Marketing + institutionnel | Fonctionnel + institutionnel |
| Densite | Faible (landing pages) | Moyenne (dashboards, formulaires) |
| Espace blanc | Tres genereux | Genereux mais optimise |

---

## 10. Recommandations pour les equipes

### 10.1 Pour les designers (Figma / Design)

1. **Installer les polices** BaloiseCreateHeadline et BaloiseCreateText (ou Inter en alternative)
2. **Utiliser la palette** exacte de ce document — ne pas inventer de couleurs
3. **Respecter l'echelle de spacing** : 4, 8, 12, 16, 20, 24, 32, 48, 64, 96px
4. **Respecter les radius** : 4px (boutons/inputs) et 12px (cartes/panneaux)
5. **Tester les contrastes** WCAG AA sur chaque couple couleur/fond
6. **Limiter a 2 couleurs d'accent** par ecran en plus du bleu marine

### 10.2 Pour les developpeurs front-end

1. **Installer le design system** :
   ```bash
   npm install @baloise/design-system-components
   ```

2. **Utiliser les CSS custom properties** `--bal-*` comme source de verite
3. **Ne pas hard-coder** de valeurs hex — toujours passer par les tokens
4. **Respecter la hierarchie** des composants `bal-*`
5. **Privilegier les Web Components** natifs quand possible
6. Pour les projets React/Vue/Angular, utiliser les packages proxy :
   - `@baloise/design-system-components-react`
   - `@baloise/design-system-components-vue`
   - `@baloise/design-system-components-angular`

### 10.3 Pour les product owners

1. **Ce document** est la base de reference — toute deviation doit etre justifiee
2. **Les couleurs semantiques** (succes, warning, danger) ont un sens precis — ne pas les utiliser a contre-emploi
3. **La sobriety** est un choix de marque — plus de blanc = plus Baloise
4. **Les CTA** doivent etre clairs, uniques par section, en bleu marine
5. **L'accessibilite** (WCAG AA minimum) n'est pas optionnelle

### 10.4 Mapping vers le projet Roue des Besoins

Pour le projet actuel (Roue des Besoins Assurance), voici le mapping recommande :

| Element projet | Token Baloise | Valeur actuelle |
|---|---|---|
| `primary-700` | `--bal-color-primary-5` | `#000d6e` |
| `primary-600` | `--bal-color-primary-4` | `#293485` |
| `primary-500` | `--bal-color-primary-3` | `#656ea8` |
| `primary-200` | `--bal-color-primary-2` | `#b3b6d4` |
| `primary-100` | `--bal-color-primary-1` | `#e5e7f0` |
| Score faible (vert) | `--bal-color-success-4` | `#168741` |
| Score modere (orange) | `--bal-color-warning-6` | `#c97612` |
| Score eleve (rouge) | `--bal-color-red-5` | `#d9304c` |
| Score critique (rouge fonce) | `--bal-color-red-6` | `#99172d` |
| Shadow card | `--bal-shadow-normal` | `0 0 10px rgba(0,7,57,.15)` |
| Shadow hover | `--bal-shadow-large` | `0 0 30px rgba(0,7,57,.15)` |
| Radius card | `--bal-radius-large` | `12px` |
| Radius button | `--bal-radius-normal` | `4px` |

---

## Annexe : Tokens CSS complets

### Palette complete (valeurs hex resolues)

```css
:root {
  /* === BASE === */
  --bal-color-transparent: transparent;
  --bal-color-white: #ffffff;
  --bal-color-black: #000000;

  /* === GREY === */
  --bal-color-grey-1: #fafafa;
  --bal-color-grey-2: #f6f6f6;
  --bal-color-grey-3: #e8e8e8;
  --bal-color-grey-4: #b6b6b6;
  --bal-color-grey-5: #747474;
  --bal-color-grey-6: #313131;

  /* === BLUE (PRIMARY) === */
  --bal-color-blue-1: #e5e7f0;
  --bal-color-blue-2: #b3b6d4;
  --bal-color-blue-3: #656ea8;
  --bal-color-blue-4: #293485;
  --bal-color-blue-5: #000d6e;
  --bal-color-blue-6: #000739;

  /* === LIGHT BLUE === */
  --bal-color-light-blue-1: #e5f1fe;
  --bal-color-light-blue-2: #a7d1fa;
  --bal-color-light-blue-3: #56a7f5;
  --bal-color-light-blue-4: #6672cc;
  --bal-color-light-blue-5: #0014aa;
  --bal-color-light-blue-6: #000a55;

  /* === PURPLE === */
  --bal-color-purple-1: #f9f3ff;
  --bal-color-purple-2: #e1d9ff;
  --bal-color-purple-3: #b8b2ff;
  --bal-color-purple-4: #be82fa;
  --bal-color-purple-5: #9f52cc;
  --bal-color-purple-6: #6c2273;

  /* === GREEN === */
  --bal-color-green-1: #e9fbf7;
  --bal-color-green-2: #cbf2ec;
  --bal-color-green-3: #94e3d4;
  --bal-color-green-4: #21d9ac;
  --bal-color-green-5: #00b28f;
  --bal-color-green-6: #1b5951;

  /* === YELLOW === */
  --bal-color-yellow-1: #fff9e8;
  --bal-color-yellow-2: #ffecbc;
  --bal-color-yellow-3: #fae052;
  --bal-color-yellow-4: #ffbe19;
  --bal-color-yellow-5: #fa9319;
  --bal-color-yellow-6: #b24a00;

  /* === RED === */
  --bal-color-red-1: #ffeef1;
  --bal-color-red-2: #ffd7d7;
  --bal-color-red-3: #ffaca6;
  --bal-color-red-4: #ff596f;
  --bal-color-red-5: #d9304c;
  --bal-color-red-6: #99172d;

  /* === INFO === */
  --bal-color-info-1: #e8f1fb;
  --bal-color-info-2: #a4c9ed;
  --bal-color-info-3: #60a0e0;
  --bal-color-info-4: #1c77d2;
  --bal-color-info-5: #155ba3;
  --bal-color-info-6: #0e457b;

  /* === SUCCESS === */
  --bal-color-success-1: #e8f3ec;
  --bal-color-success-2: #a1cfb3;
  --bal-color-success-3: #5bab7a;
  --bal-color-success-4: #168741;
  --bal-color-success-5: #116b34;
  --bal-color-success-6: #0b5227;

  /* === WARNING === */
  --bal-color-warning-1: #fff9e8;
  --bal-color-warning-2: #ffe5a3;
  --bal-color-warning-3: #ffd25e;
  --bal-color-warning-4: #ffbe19;
  --bal-color-warning-5: #f99319;
  --bal-color-warning-6: #c97612;

  /* === DANGER === */
  --bal-color-danger-1: #fce8e6;
  --bal-color-danger-2: #f7a299;
  --bal-color-danger-3: #f05d4d;
  --bal-color-danger-4: #ea1800;
  --bal-color-danger-5: #cb1501;
  --bal-color-danger-6: #a01100;

  /* === SPACING === */
  --bal-space-xx-small: 0.25rem;
  --bal-space-x-small: 0.5rem;
  --bal-space-small: 0.75rem;
  --bal-space-normal: 1rem;
  --bal-space-medium: 1.25rem;
  --bal-space-large: 1.5rem;
  --bal-space-x-large: 2rem;
  --bal-space-xx-large: 3rem;
  --bal-space-xxx-large: 3.5rem;
  --bal-space-xxxx-large: 4rem;

  /* === TYPOGRAPHY === */
  --bal-font-family-title: BaloiseCreateHeadline, Arial, sans-serif;
  --bal-font-family-text: BaloiseCreateText, Arial, sans-serif;
  --bal-weight-light: 300;
  --bal-weight-regular: 400;
  --bal-weight-bold: 700;

  /* === RADIUS === */
  --bal-radius-none: 0;
  --bal-radius-small: 0.25rem;
  --bal-radius-normal: 0.25rem;
  --bal-radius-large: 0.75rem;
  --bal-radius-x-large: 1rem;
  --bal-radius-rounded: 9999px;

  /* === SHADOW === */
  --bal-shadow-none: none;
  --bal-shadow-normal: 0 0 10px 0 rgba(0, 7, 57, 0.15);
  --bal-shadow-large: 0 0 30px 0 rgba(0, 7, 57, 0.15);

  /* === BREAKPOINTS === */
  --bal-breakpoint-tablet: 769px;
  --bal-breakpoint-desktop: 1024px;
  --bal-breakpoint-high-definition: 1280px;
  --bal-breakpoint-widescreen: 1440px;
  --bal-breakpoint-fullhd: 1920px;

  /* === CONTAINER === */
  --bal-container-max-width: 1400px;
  --bal-container-space: 1rem;
  --bal-container-space-tablet: 2.5rem;
  --bal-container-space-desktop: 3rem;

  /* === ANIMATION === */
  --bal-animation-transition-duration: 300ms;
  --bal-animation-transition-easing: cubic-bezier(0.25, 0.8, 0.5, 1);
}
```

---

**Document genere le 10 mars 2026**
**Sources** : baloise.lu, design.baloise.dev, github.com/baloise/design-system, @baloise/design-system-css v12.4.1
