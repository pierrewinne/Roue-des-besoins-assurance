import type { DiagnosticResult } from '../../shared/scoring/types.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'
import { UNIVERSE_LABELS, NEED_LEGEND_MESSAGES } from '../../lib/constants.ts'

interface WheelLegendProps {
  diagnostic: DiagnosticResult
  showScores?: boolean
}

export default function WheelLegend({ diagnostic, showScores = false }: WheelLegendProps) {
  return (
    <div className="space-y-2 mt-6">
      {Object.entries(diagnostic.universeScores).map(([key, score]) => {
        if (!score.active) return null
        const color = getNeedColor(score.needLevel)
        return (
          <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{UNIVERSE_LABELS[key]}</span>
                {showScores && (
                  <span className="text-sm font-semibold tabular-nums" style={{ color }}>{score.needScore}/100</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{NEED_LEGEND_MESSAGES[score.needLevel]}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
