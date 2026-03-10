import type { UniverseScore } from '../../shared/scoring/types.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'
import Badge from '../ui/Badge.tsx'
import Icon from '../ui/Icon.tsx'
import type { IconName } from '../ui/Icon.tsx'
import { UNIVERSE_LABELS, NEED_BADGE_LABELS, NEED_BADGE_COLORS, NEED_MESSAGES } from '../../lib/constants.ts'

const UNIVERSE_ICONS: Record<string, IconName> = {
  auto: 'car',
  habitation: 'home',
  prevoyance: 'shield-check',
  objets_valeur: 'gift',
}

interface UniverseCardProps {
  universe: string
  score: UniverseScore
  showDetails?: boolean
}

export default function UniverseCard({ universe, score, showDetails = false }: UniverseCardProps) {
  if (!score.active) return null

  const color = getNeedColor(score.needLevel)
  const badgeColor = NEED_BADGE_COLORS[score.needLevel]
  const iconName = UNIVERSE_ICONS[universe]

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5 transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}12` }}>
            {iconName && <Icon name={iconName} size={20} style={{ color }} />}
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">{UNIVERSE_LABELS[universe as keyof typeof UNIVERSE_LABELS]}</h3>
        </div>
        <Badge color={badgeColor}>
          {NEED_BADGE_LABELS[score.needLevel]}
        </Badge>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed">{NEED_MESSAGES[score.needLevel as keyof typeof NEED_MESSAGES]}</p>

      {showDetails && (
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500">Exposition au risque</span>
              <span className="font-medium text-slate-700">{Math.round(score.exposure)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-amber-400 h-2 rounded-full transition-all duration-500" style={{ width: `${score.exposure}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500">Niveau de couverture</span>
              <span className="font-medium text-slate-700">{Math.round(score.coverage)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-primary-400 h-2 rounded-full transition-all duration-500" style={{ width: `${score.coverage}%` }} />
            </div>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm text-slate-500">Score de besoin</span>
            <span className="text-lg font-bold" style={{ color }}>{score.needScore}/100</span>
          </div>
        </div>
      )}
    </div>
  )
}
