export type Universe = 'auto' | 'habitation' | 'prevoyance' | 'objets_valeur'

export type NeedLevel = 'low' | 'moderate' | 'high' | 'critical'

export interface UniverseScore {
  universe: Universe
  exposure: number      // 0-100
  coverage: number      // 0-100
  needScore: number     // 0-100
  needLevel: NeedLevel
  active: boolean       // false if universe disabled (no vehicle, no valuables)
}

export interface DiagnosticResult {
  universeScores: Record<Universe, UniverseScore>
  globalScore: number   // 0-100
  weightings: Record<Universe, number>
  actions: RecommendedAction[]
}

export interface RecommendedAction {
  type: 'immediate' | 'deferred' | 'event'
  universe: Universe
  priority: number      // 1-5, 5 = highest
  title: string
  description: string
}
