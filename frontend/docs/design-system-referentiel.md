# Referentiel Charte Graphique — Baloise Luxembourg

> Source: baloise.lu + Baloise Design System (design.baloise.dev)
> Date: 2026-03-13
> Usage: Application "Roue des Besoins" — particuliers Luxembourg

---

## 1. Principes directeurs

| Principe | Application |
|----------|------------|
| **Confiance** | Navy profond (#000d6e) comme ancre visuelle, pas de couleurs criardes |
| **Clarté** | Hiérarchie typographique stricte, espaces généreux, contrastes WCAG AA |
| **Cohérence** | Tokens partagés entre CSS et TS — une seule source de vérité |
| **Sobriété premium** | Ombres navy-tintées, animations subtiles (300ms), pas de gradients arc-en-ciel |

---

## 2. Nuancier complet

### 2.1 Primary Navy (identité Baloise)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#f0f1f7` | Fond très léger, hover subtil |
| `primary-100` | `#e5e7f0` | Fond secondaire, sélection |
| `primary-200` | `#b3b6d4` | Bordures légères |
| `primary-300` | `#656ea8` | Texte désactivé |
| `primary-400` | `#3d4691` | Texte secondaire |
| `primary-500` | `#293485` | Biens (quadrant) |
| `primary-600` | `#0014aa` | Personnes (quadrant), B-SAFE |
| `primary-700` | `#000d6e` | **Couleur de marque — texte principal, headers** |
| `primary-800` | `#000a55` | Fonds sombres |
| `primary-900` | `#000739` | Footer, backgrounds très sombres |
| `primary-950` | `#000420` | Fond hero |

### 2.2 Baloise Light Blue

| Token | Hex | Usage |
|-------|-----|-------|
| `blue-50` | `#e5f1fe` | Fond info, fond B-SAFE light |
| `blue-100` | `#b3d4fc` | Bordure info |
| `blue-200` | `#80b8f9` | Accent léger |
| `blue-300` | `#56a7f5` | Accent B-SAFE |
| `blue-400` | `#2b8ae8` | Lien hover |
| `blue-500` | `#0014aa` | Primaire info |

### 2.3 Baloise Green

| Token | Hex | Usage |
|-------|-----|-------|
| `green-50` | `#cbf2ec` | Fond success, fond Travel light |
| `green-100` | `#97e5d9` | Bordure success |
| `green-200` | `#21d9ac` | Accent Travel |
| `green-300` | `#00b28f` | **Travel primaire**, quadrant Projets |
| `green-400` | `#1b5951` | Texte sur fond vert |
| `green-500` | `#0e3630` | Dark green |

### 2.4 Baloise Purple

| Token | Hex | Usage |
|-------|-----|-------|
| `purple-50` | `#f1e8ff` | Fond léger futur |
| `purple-100` | `#d4bcf5` | Bordure légère |
| `purple-200` | `#b87ee6` | Accent light futur |
| `purple-300` | `#9f52cc` | **Quadrant Futur** |
| `purple-400` | `#7b3da3` | Dark futur |
| `purple-500` | `#4d1f6f` | Texte sur fond purple |

### 2.5 Baloise Red

| Token | Hex | Usage |
|-------|-----|-------|
| `red-50` | `#ffd7d7` | Fond danger, fond Home light |
| `red-100` | `#ffaab3` | Bordure danger |
| `red-200` | `#ff596f` | Accent Home |
| `red-300` | `#d9304c` | **Home primaire**, scoring "high" |
| `red-400` | `#99172d` | Scoring "critical" |
| `red-500` | `#66101d` | Texte sur fond red |

### 2.6 Baloise Yellow

| Token | Hex | Usage |
|-------|-----|-------|
| `yellow-50` | `#ffecbc` | Fond warning, fond Drive light |
| `yellow-100` | `#ffd76e` | Bordure warning |
| `yellow-200` | `#ffbe19` | Accent Drive |
| `yellow-300` | `#fa9319` | **Drive primaire** |
| `yellow-400` | `#b24a00` | Dark Drive |
| `yellow-500` | `#6e2e00` | Texte sur fond yellow |

### 2.7 Neutral Greys

| Token | Hex | Usage |
|-------|-----|-------|
| `grey-50` | `#fafafa` | Fond page |
| `grey-100` | `#f6f6f6` | Fond alterné |
| `grey-200` | `#e8e8e8` | Bordures, séparateurs |
| `grey-300` | `#b6b6b6` | Placeholder, désactivé |
| `grey-400` | `#747474` | Texte secondaire |
| `grey-500` | `#313131` | Texte principal (alternative au navy) |

---

## 3. Mapping Produit ↔ Couleur ↔ Icone

### 3.1 Produits Baloise

| Produit | Famille | Primary | Accent | Light | Dark | BG | Icone |
|---------|---------|---------|--------|-------|------|-----|-------|
| **DRIVE** | Yellow | `#fa9319` | `#ffbe19` | `#ffecbc` | `#b24a00` | `#fff9e8` | `car` |
| **HOME** | Red | `#d9304c` | `#ff596f` | `#ffd7d7` | `#99172d` | `#ffeef1` | `home` |
| **TRAVEL** | Green | `#00b28f` | `#21d9ac` | `#cbf2ec` | `#1b5951` | `#e9fbf7` | `plane` |
| **B-SAFE** | Blue | `#0014aa` | `#56a7f5` | `#e5f1fe` | `#000a55` | `#e5f1fe` | `shield-check` |

### 3.2 Quadrants Roue

| Quadrant | Couleur | Light | Dark | Glow | Icone |
|----------|---------|-------|------|------|-------|
| **Biens** | `#293485` | `#3d4691` | `#1a2260` | `rgba(41,52,133,0.30)` | `home` |
| **Personnes** | `#0014aa` | `#0029d4` | `#000d6e` | `rgba(0,20,170,0.30)` | `shield-check` |
| **Projets** | `#00b28f` | `#2dd4bf` | `#008a6e` | `rgba(0,178,143,0.30)` | `car` |
| **Futur** | `#9f52cc` | `#b87ee6` | `#7b3da3` | `rgba(159,82,204,0.30)` | `gift` |

### 3.3 Scoring / Besoin

| Niveau | Primary | Light | BG | Text | Border |
|--------|---------|-------|----|------|--------|
| **Low** (bien couvert) | `#168741` | `#cbf2ec` | `#e9fbf7` | `#0e3630` | `#168741` |
| **Moderate** (a ameliorer) | `#c97612` | `#ffecbc` | `#fff9e8` | `#6e2e00` | `#c97612` |
| **High** (action requise) | `#d9304c` | `#ffd7d7` | `#ffeef1` | `#66101d` | `#d9304c` |
| **Critical** (action requise) | `#99172d` | `#ffd7d7` | `#ffeef1` | `#66101d` | `#99172d` |

### 3.4 Couleurs semantiques

| Semantic | Couleur | Light |
|----------|---------|-------|
| Success | `#168741` | `#cbf2ec` |
| Warning | `#c97612` | `#ffecbc` |
| Danger | `#d9304c` | `#ffd7d7` |
| Info | `#0014aa` | `#e5f1fe` |

---

## 4. Typographie

### 4.1 Polices

| Police | Poids | Usage |
|--------|-------|-------|
| **BaloiseCreateHeadline** | 300 (light), 700 (bold) | Titres h1-h3, hero, grands chiffres |
| **BaloiseCreateText** | 400 (regular), 700 (bold) | Corps de texte, labels, boutons |
| **Inter** (fallback actif) | 300, 400, 700 | Substitution tant que la licence BaloiseCreate n'est pas acquise |
| **Arial** (fallback systeme) | 400, 700 | Dernier recours |

> Note: Les polices BaloiseCreate sont proprietaires Baloise. Utiliser Inter comme substitution jusqu'a obtention de la licence.

### 4.2 Echelle typographique

| Element | Taille | Poids | Line-height | Classe Tailwind |
|---------|--------|-------|-------------|-----------------|
| Display / Hero | 48px | 700 | 1.1 | `text-5xl font-bold` |
| H1 | 36px | 700 | 1.2 | `text-4xl font-bold` |
| H2 | 30px | 700 | 1.25 | `text-3xl font-bold` |
| H3 | 24px | 700 | 1.3 | `text-2xl font-bold` |
| H4 | 20px | 600 | 1.4 | `text-xl font-semibold` |
| Body large | 18px | 400 | 1.6 | `text-lg` |
| Body | 16px | 400 | 1.6 | `text-base` |
| Body small | 14px | 400 | 1.5 | `text-sm` |
| Caption | 12px | 400 | 1.4 | `text-xs` |
| Overline | 11px | 700 | 1.2 | `text-xs font-bold uppercase tracking-wider` |

### 4.3 Couleurs de texte

| Usage | Classe | Hex |
|-------|--------|-----|
| Texte principal | `text-primary-700` | `#000d6e` |
| Texte secondaire | `text-grey-400` | `#747474` |
| Texte desactive | `text-grey-300` | `#b6b6b6` |
| Texte sur fond sombre | `text-white` | `#ffffff` |
| Lien | `text-primary-600` | `#0014aa` |
| Lien hover | `text-blue-400` | `#2b8ae8` |

---

## 5. Ombres (Navy-tinted)

> Regle absolue : **jamais** de gris generique (`rgba(0,0,0,...)`). Toujours utiliser la teinte navy `rgba(0, 7, 57, ...)`.

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-card` | `0 0 10px 0 rgba(0,7,57,0.15)` | Cartes au repos |
| `shadow-card-hover` | `0 0 30px 0 rgba(0,7,57,0.15)` | Cartes au survol |
| `shadow-elevated` | `0 0 30px 0 rgba(0,7,57,0.20)` | Modales, dropdowns |
| `shadow-header` | `0 1px 3px 0 rgba(0,7,57,0.08)` | Header sticky |

---

## 6. Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `radius-sm` | 4px | Pills, petits elements |
| `radius-md` | 6px | **Boutons, inputs** (defaut) |
| `radius-lg` | 8px | List items, tags |
| `radius-xl` | 12px | **Cartes** |
| `radius-2xl` | 16px | Modales |
| `radius-full` | 9999px | Avatars, badges ronds |

---

## 7. Bordures

| Usage | Style |
|-------|-------|
| Separateur | `1px solid grey-200` (`#e8e8e8`) |
| Input au repos | `1px solid grey-200` |
| Input focus | `2px solid primary-600` (`#0014aa`) |
| Card | `1px solid grey-200` |
| Card active/hover | `1px solid primary-400` |
| Scoring badge | `1px solid {scoring.border}` |

---

## 8. Animations & Transitions

### 8.1 Courbe Baloise

```
cubic-bezier(0.25, 0.8, 0.5, 1)
```

Cette courbe est utilisee pour **toutes** les transitions de l'application. Ne jamais utiliser `ease`, `ease-in-out` ou `linear` sauf pour les animations CSS pures (keyframes).

### 8.2 Durees

| Usage | Duree |
|-------|-------|
| Micro-interaction (hover, focus) | 200ms |
| Standard (ouverture/fermeture) | **300ms** (defaut) |
| Panel, slide | 400ms |
| Ambient (glow, float) | 3s-8s |

### 8.3 Keyframes definies

| Animation | Duree | Usage |
|-----------|-------|-------|
| `bal-fade-in` | 800ms | Apparition elements (avec translateY) |
| `hero-float` | 8s | Respiration roue landing |
| `hero-pulse` | 2.5s | Point pulse dans tag |
| `wheel-glow-pulse` | 4s | Glow segment actif |
| `wheel-hint-fade` | 3s | Texte indicatif |
| `dw-pulse` | 3s | Segment actif roue diagnostic |

### 8.4 Reduced motion

Toutes les animations respectent `prefers-reduced-motion: reduce`. Les animations sont desactivees et les transitions supprimees. Voir `index.css` pour l'implementation complete.

---

## 9. Iconographie

### 9.1 Icones applicatives (Icon.tsx)

Heroicons 24 outline, rendu en stroke (`strokeWidth: 1.5`).

| Nom | Usage |
|-----|-------|
| `home` | Quadrant Biens, produit HOME |
| `shield-check` | Quadrant Personnes, produit B-SAFE |
| `car` | Quadrant Projets, produit DRIVE |
| `gift` | Quadrant Futur |
| `plane` | Produit TRAVEL |
| `check` | Validation |
| `check-circle` | Succes |
| `badge-check` | Badge verifie |
| `chevron-right` / `chevron-left` | Navigation |
| `search` | Recherche |
| `lock` | Securite, auth |
| `exclamation-circle` | Erreur |
| `document` | Document, PDF |
| `chart-pie` | Statistiques |
| `users` | Multi-utilisateurs |
| `alert-triangle` | Avertissement |

### 9.2 Icones roue PowerPoint

Images PNG 80x80 dans `public/icons/wheel/`.

| Fichier | Quadrant | Description |
|---------|----------|-------------|
| `home.png` | Biens | Maison |
| `car.png` | Biens | Voiture |
| `moto.png` | Biens | Moto |
| `family.png` | Personnes | Famille |
| `sport.png` | Personnes | Sport |
| `health.png` | Personnes | Sante |
| `travel.png` | Projets | Voyage |
| `savings.png` | Projets | Epargne |
| `property.png` | Projets | Immobilier |
| `retirement.png` | Futur | Retraite |
| `inheritance.png` | Futur | Succession |
| `education.png` | Futur | Education |
| `pets.png` | Futur | Animaux |
| `bike.png` | Biens | Velo |

---

## 10. Specifications composants

### 10.1 Button

| Variante | Fond | Texte | Bordure | Radius | Padding |
|----------|------|-------|---------|--------|---------|
| Primary | `primary-600` | blanc | aucune | `radius-md` | `12px 24px` |
| Secondary | transparent | `primary-600` | `1px primary-600` | `radius-md` | `12px 24px` |
| Ghost | transparent | `primary-600` | aucune | `radius-md` | `8px 16px` |
| Danger | `red-300` | blanc | aucune | `radius-md` | `12px 24px` |
| Disabled | `grey-200` | `grey-300` | aucune | `radius-md` | `12px 24px` |

Hover : opacity 0.9 + `shadow-card` (300ms, courbe Baloise).

### 10.2 Card

| Propriete | Valeur |
|-----------|--------|
| Fond | blanc |
| Bordure | `1px solid grey-200` |
| Radius | `radius-xl` (12px) |
| Ombre | `shadow-card` |
| Ombre hover | `shadow-card-hover` |
| Padding | 24px |
| Transition | 300ms courbe Baloise |

### 10.3 Badge

| Variante | Fond | Texte | Bordure | Radius |
|----------|------|-------|---------|--------|
| Low/Success | `green-50` | `green-400` | `1px green-300` | `radius-full` |
| Moderate/Warning | `yellow-50` | `yellow-400` | `1px yellow-300` | `radius-full` |
| High/Danger | `red-50` | `red-400` | `1px red-300` | `radius-full` |
| Info | `blue-50` | `blue-500` | `1px blue-300` | `radius-full` |

### 10.4 Input

| Etat | Fond | Bordure | Texte |
|------|------|---------|-------|
| Default | blanc | `1px grey-200` | `primary-700` |
| Focus | blanc | `2px primary-600` | `primary-700` |
| Error | blanc | `2px red-300` | `primary-700` |
| Disabled | `grey-100` | `1px grey-200` | `grey-300` |

Radius: `radius-md` (6px). Padding: `10px 14px`. Placeholder: `grey-300`.

### 10.5 ScoreGauge

Arc SVG en demi-cercle. Couleur de l'arc = `SCORING_COLORS[needLevel].primary`. Track fond = `grey-200`. Chiffre central en `text-3xl font-bold` couleur `SCORING_COLORS[needLevel].primary`.

### 10.6 StatCard

Icone dans un cercle `48x48` fond `primary-50`, couleur `primary-600`. Titre en `text-sm text-grey-400`. Valeur en `text-2xl font-bold text-primary-700`.

### 10.7 ProgressBar

Height: 6px. Track: `grey-200`. Fill: `primary-600`. Radius: `radius-full`.

---

## 11. Layout

### 11.1 Espacement

Systeme base 4px:
- `4px` — micro (gap icone-texte)
- `8px` — petit (padding interne compact)
- `12px` — moyen-petit
- `16px` — standard (gap entre elements)
- `24px` — moyen (padding carte)
- `32px` — grand (gap entre sections)
- `48px` — tres grand (espacement sections page)
- `64px` — mega (hero padding)

### 11.2 Container

Max-width: `1200px`. Padding lateral: `16px` (mobile), `24px` (tablette), `32px` (desktop).

### 11.3 Breakpoints

| Nom | Valeur | Usage |
|-----|--------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablette |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |

---

## 12. Tokens Tailwind v4 (@theme)

Tous les tokens sont declares dans `src/index.css` sous le bloc `@theme`. Reference rapide :

```
--color-primary-{50-950}   Navy scale (11 steps)
--color-grey-{50-500}       Neutral greys (6 steps)
--color-blue-{50-500}       Light blue (6 steps)
--color-green-{50-500}      Green (6 steps)
--color-purple-{50-500}     Purple (6 steps)
--color-red-{50-500}        Red (6 steps)
--color-yellow-{50-500}     Yellow (6 steps)
--color-success             #168741
--color-warning             #c97612
--color-danger              #d9304c
--color-info                #0014aa
--color-product-drive       #fa9319
--color-product-home        #d9304c
--color-product-travel      #00b28f
--color-product-bsafe       #0014aa
--shadow-card               Ombre carte
--shadow-card-hover         Ombre carte hover
--shadow-elevated           Ombre elevee
--shadow-header             Ombre header
--radius-{sm,md,lg,xl,2xl,full}
--transition-duration       300ms
--transition-easing         cubic-bezier(0.25, 0.8, 0.5, 1)
```

### Usage dans les composants

```tsx
// Tokens TS (constants.ts)
import { PRODUCT_COLORS, PRODUCT_ICONS, SCORING_COLORS, TRANSITION } from '@/lib/constants'

// Couleur produit
<div style={{ backgroundColor: PRODUCT_COLORS.drive.bg }}>
  <Icon name={PRODUCT_ICONS.drive} style={{ color: PRODUCT_COLORS.drive.primary }} />
</div>

// Scoring
<Badge style={{
  backgroundColor: SCORING_COLORS[needLevel].bg,
  color: SCORING_COLORS[needLevel].text,
  borderColor: SCORING_COLORS[needLevel].border,
}} />

// Transition
<div style={{ transition: `all ${TRANSITION.duration} ${TRANSITION.easing}` }} />
```

```css
/* Tokens CSS (Tailwind v4) */
.product-card-drive { @apply bg-product-drive/10 border-product-drive; }
.product-card-home  { @apply bg-product-home/10 border-product-home; }

.transition-bal { transition: all var(--transition-duration) var(--transition-easing); }
```

---

## 13. Gouvernance

### 13.1 Regles

1. **Aucune couleur en dur** dans les composants — tout passe par les tokens (constants.ts ou @theme)
2. **Aucune ombre generique** — toujours `rgba(0, 7, 57, ...)` (navy-tinted)
3. **Aucune transition `ease`** — toujours la courbe Baloise `cubic-bezier(0.25, 0.8, 0.5, 1)`
4. **Aucun border-radius arbitraire** — utiliser les tokens `radius-*`
5. **Contraste minimum** WCAG AA (4.5:1 texte, 3:1 large text)
6. **Icones** : Heroicons 24 outline uniquement (sauf icones roue PowerPoint)
7. **Polices** : Inter en fallback actif, BaloiseCreate quand la licence est obtenue

### 13.2 Patterns interdits

```tsx
// INTERDIT
className="shadow-lg"              // ombre generique
className="rounded-2xl"            // radius arbitraire si pas dans les tokens
style={{ color: '#ff0000' }}       // couleur en dur
transition: "all 0.3s ease"        // courbe non-Baloise
className="bg-gray-100"            // gris Tailwind par defaut (utiliser grey-*)

// CORRECT
className="shadow-card"
className="rounded-xl"
style={{ color: SCORING_COLORS.high.primary }}
transition: `all ${TRANSITION.duration} ${TRANSITION.easing}`
className="bg-grey-100"
```

### 13.3 Checklist ajout composant

- [ ] Couleurs via tokens (PRODUCT_COLORS, SCORING_COLORS, QUADRANT_COLORS)
- [ ] Ombre = shadow-card / shadow-elevated / shadow-header
- [ ] Radius = radius-md (boutons) / radius-xl (cartes) / radius-full (badges)
- [ ] Transition = 300ms + courbe Baloise
- [ ] Contraste WCAG AA verifie
- [ ] `prefers-reduced-motion` respecte si animation
- [ ] Icone = IconName du registre Icon.tsx
