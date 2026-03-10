// Design tokens — mirroring frontend/src/index.css and frontend/src/lib/constants.ts

export const colors = {
  primary: {
    900: '#000739',
    700: '#000d6e',
    400: '#3d4691',
    100: '#e5e7f0',
    50: '#f0f1f7',
  },
  slate: {
    900: '#1e293b',
    700: '#334155',
    500: '#64748b',
    400: '#94a3b8',
    200: '#e2e8f0',
    100: '#f1f5f9',
    50: '#f8fafc',
  },
  white: '#ffffff',
  scoring: {
    green: '#168741',
    amber: '#c97612',
    red: '#d9304c',
    darkRed: '#99172d',
  },
  emerald: {
    50: '#ecfdf5',
    600: '#059669',
  },
  amber: {
    50: '#fffbeb',
    600: '#d97706',
  },
  red: {
    50: '#fef2f2',
    700: '#b91c1c',
  },
  rose: {
    400: '#fb7185',
    200: '#fecdd3',
  },
} as const;

export const fonts = {
  inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

// Demo data — Sophie Martin — scores aligned with thresholds.ts
export const demoData = {
  client: {
    name: 'Sophie Martin',
    age: 38,
    situation: 'En couple, 2 enfants',
  },
  globalScore: 57,
  universes: [
    {
      id: 'auto',
      label: 'Auto / Mobilité',
      icon: 'car',
      score: 15,
      needLevel: 'low' as const,
      color: colors.scoring.green,
      badge: 'Bien couvert',
      message: 'Votre protection est adaptée à votre situation.',
      exposure: 25,
      coverage: 85,
      weight: 23,
    },
    {
      id: 'objets_valeur',
      label: 'Objets de valeur',
      icon: 'gem',
      score: 40,
      needLevel: 'moderate' as const,
      color: colors.scoring.amber,
      badge: 'À améliorer',
      message: 'Quelques améliorations pourraient renforcer votre couverture.',
      exposure: 55,
      coverage: 45,
      weight: 9,
    },
    {
      id: 'habitation',
      label: 'Habitation',
      icon: 'home',
      score: 60,
      needLevel: 'high' as const,
      color: colors.scoring.red,
      badge: 'Action requise',
      message: 'Des lacunes ont été identifiées dans votre couverture.',
      exposure: 75,
      coverage: 40,
      weight: 32,
    },
    {
      id: 'prevoyance',
      label: 'Prévoyance',
      icon: 'shield',
      score: 85,
      needLevel: 'critical' as const,
      color: colors.scoring.darkRed,
      badge: 'Action requise',
      message: 'Votre couverture est insuffisante. Une action rapide est recommandée.',
      exposure: 90,
      coverage: 15,
      weight: 36,
    },
  ],
  actions: [
    {
      title: 'Revoir la couverture prévoyance familiale',
      description: 'Famille avec enfants et couverture basique — risque majeur en cas d\'accident.',
      universe: 'Prévoyance',
      type: 'Immédiate' as const,
      priority: 5,
    },
    {
      title: 'Améliorer l\'assurance habitation',
      description: 'Propriétaire avec crédit immobilier — la couverture standard est insuffisante.',
      universe: 'Habitation',
      type: 'Immédiate' as const,
      priority: 4,
    },
    {
      title: 'Sécuriser les objets de valeur',
      description: 'Objets stockés au domicile sans sécurité — envisager alarme et coffre.',
      universe: 'Objets de valeur',
      type: 'Différée' as const,
      priority: 3,
    },
  ],
} as const;

// Frame constants at 30fps
export const FPS = 30;
export const TOTAL_DURATION = 130; // seconds
export const TOTAL_FRAMES = FPS * TOTAL_DURATION; // 3900

export const scenes = {
  scene1: { start: 0, duration: 10 * FPS },         // 0:00-0:10  Opening
  scene2: { start: 10 * FPS, duration: 10 * FPS },   // 0:10-0:20  Introduction
  scene3: { start: 20 * FPS, duration: 18 * FPS },   // 0:20-0:38  Dashboard
  scene4: { start: 38 * FPS, duration: 8 * FPS },    // 0:38-0:46  Client Detail
  scene5: { start: 46 * FPS, duration: 20 * FPS },   // 0:46-1:06  Questionnaire
  scene6: { start: 66 * FPS, duration: 20 * FPS },   // 1:06-1:26  Wheel Reveal
  scene7: { start: 86 * FPS, duration: 18 * FPS },   // 1:26-1:44  Actions + PDF
  scene8: { start: 104 * FPS, duration: 6 * FPS },   // 1:44-1:50  Responsive
  scene9: { start: 110 * FPS, duration: 20 * FPS },  // 1:50-2:10  Closing
} as const;
