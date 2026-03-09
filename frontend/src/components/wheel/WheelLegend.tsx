import type { DiagnosticResult } from '../../shared/scoring/types.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'

const UNIVERSE_LABELS: Record<string, string> = {
  auto: 'Auto / Mobilité',
  habitation: 'Habitation / Propriétaire',
  prevoyance: 'Prévoyance',
  objets_valeur: 'Objets de valeur',
}

const NEED_MESSAGES: Record<string, string> = {
  low: 'Votre protection est adaptée',
  moderate: 'Des améliorations sont possibles',
  high: 'Action recommandée',
  critical: 'Action recommandée',
}

interface WheelLegendProps {
  diagnostic: DiagnosticResult
  showScores?: boolean
}

export default function WheelLegend({ diagnostic, showScores = false }: WheelLegendProps) {
  return (
    <div className="space-y-3 mt-6">
      {Object.entries(diagnostic.universeScores).map(([key, score]) => {
        if (!score.active) return null
        const color = getNeedColor(score.needLevel)
        return (
          <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{UNIVERSE_LABELS[key]}</span>
                {showScores && (
                  <span className="text-sm font-semibold" style={{ color }}>{score.needScore}/100</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{NEED_MESSAGES[score.needLevel]}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
