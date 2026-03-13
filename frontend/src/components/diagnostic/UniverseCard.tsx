import type { UniverseScore, Universe } from '../../shared/scoring/types.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'
import Badge from '../ui/Badge.tsx'
import Icon from '../ui/Icon.tsx'
import { UNIVERSE_LABELS, UNIVERSE_ICONS, NEED_BADGE_LABELS, NEED_BADGE_COLORS, NEED_MESSAGES } from '../../lib/constants.ts'

interface UniverseCardProps {
  universe: string | Universe
  score: UniverseScore
  showDetails?: boolean
}

export default function UniverseCard({ universe, score, showDetails = false }: UniverseCardProps) {
  if (!score.active) return null

  const color = getNeedColor(score.needLevel)
  const badgeColor = NEED_BADGE_COLORS[score.needLevel]
  const iconName = UNIVERSE_ICONS[universe as Universe]

  return (
    <div className="bg-white rounded-xl shadow-card p-5 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}12` }}>
            {iconName && <Icon name={iconName} size={20} style={{ color }} />}
          </div>
          <h3 className="font-bold text-primary-700 text-sm">{UNIVERSE_LABELS[universe as keyof typeof UNIVERSE_LABELS]}</h3>
        </div>
        <Badge color={badgeColor}>
          {NEED_BADGE_LABELS[score.needLevel]}
        </Badge>
      </div>

      <p className="text-sm text-grey-400 leading-relaxed">{NEED_MESSAGES[score.needLevel as keyof typeof NEED_MESSAGES]}</p>

      {showDetails && (
        <div className="mt-5 pt-5 border-t border-grey-100 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-grey-400">Exposition au risque</span>
              <span className="font-bold text-primary-700">{Math.round(score.exposure)}%</span>
            </div>
            <div className="w-full bg-grey-100 rounded-full h-2">
              <div className="bg-warning h-2 rounded-full transition-all duration-500" style={{ width: `${score.exposure}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-grey-400">Niveau de couverture</span>
              <span className="font-bold text-primary-700">{Math.round(score.coverage)}%</span>
            </div>
            <div className="w-full bg-grey-100 rounded-full h-2">
              <div className="bg-primary-400 h-2 rounded-full transition-all duration-500" style={{ width: `${score.coverage}%` }} />
            </div>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm text-grey-400">Score de besoin</span>
            <span className="text-lg font-bold" style={{ color }}>{score.needScore}/100</span>
          </div>
        </div>
      )}
    </div>
  )
}
