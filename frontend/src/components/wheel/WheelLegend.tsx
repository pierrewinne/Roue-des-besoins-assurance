import type { DiagnosticResult } from '../../shared/scoring/types.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'
import { QUADRANT_LABELS, NEED_LEGEND_MESSAGES } from '../../lib/constants.ts'

interface WheelLegendProps {
  diagnostic: DiagnosticResult
  showScores?: boolean
}

export default function WheelLegend({ diagnostic, showScores = false }: WheelLegendProps) {
  return (
    <div className="space-y-2 mt-6">
      {Object.entries(diagnostic.quadrantScores).map(([key, score]) => {
        if (!score.active) return null
        const color = getNeedColor(score.needLevel)
        return (
          <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-grey-50">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-700">{QUADRANT_LABELS[key as keyof typeof QUADRANT_LABELS]}</span>
                {showScores && (
                  <span className="text-sm font-bold tabular-nums" style={{ color }}>{score.needScore}/100</span>
                )}
              </div>
              <p className="text-xs text-grey-300 mt-0.5">{NEED_LEGEND_MESSAGES[score.needLevel]}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
