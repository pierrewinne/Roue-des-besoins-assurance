// === Quadrant model (V1 — replaces Universe model) ===

export type Quadrant = 'biens' | 'personnes' | 'projets' | 'futur'

export type Product = 'drive' | 'home' | 'travel' | 'bsafe' | 'pension_plan' | 'life_plan' | 'switch_plan'

export type NeedLevel = 'low' | 'moderate' | 'high' | 'critical'

export interface QuadrantScore {
  quadrant: Quadrant
  exposure: number       // 0-100
  coverage: number       // 0-100
  needScore: number      // 0-100 (via exposure x coverage matrix)
  needLevel: NeedLevel
  active: boolean        // false if quadrant not yet completed
}

export interface OptionScore {
  optionId: string           // e.g. 'drive_pack_mobilite', 'home_cave_vin'
  optionLabel: string
  relevance: number          // 0-100
  triggerQuestions: string[]  // question IDs that activated this option
}

export interface ProductScore {
  product: Product
  relevance: number          // 0-100
  isExistingClient: boolean
  options: OptionScore[]
}

export interface Recommendation {
  id: string
  product: Product
  optionId?: string
  type: 'immediate' | 'deferred' | 'event' | 'optimization'
  priority: number           // 1-5, 5 = highest
  title: string
  message: string            // client-facing
  advisorNote?: string       // advisor-only
}

export interface DiagnosticResult {
  quadrantScores: Record<Quadrant, QuadrantScore>
  globalScore: number        // 0-100
  weightings: Record<Quadrant, number>
  productScores: ProductScore[]
  recommendations: Recommendation[]
}
