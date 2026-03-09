import type { UniverseScore } from '../../shared/scoring/types.ts'
import { getNeedColor } from '../../shared/scoring/thresholds.ts'
import Badge from '../ui/Badge.tsx'

const UNIVERSE_LABELS: Record<string, string> = {
  auto: 'Auto / Mobilité',
  habitation: 'Habitation / Propriétaire',
  prevoyance: 'Prévoyance',
  objets_valeur: 'Objets de valeur',
}

const NEED_BADGE_COLOR: Record<string, 'green' | 'orange' | 'red'> = {
  low: 'green',
  moderate: 'orange',
  high: 'red',
  critical: 'red',
}

const NEED_MESSAGES: Record<string, string> = {
  low: 'Votre protection est adaptée à votre situation.',
  moderate: 'Quelques améliorations pourraient renforcer votre couverture.',
  high: 'Des lacunes ont été identifiées dans votre couverture.',
  critical: 'Votre couverture est insuffisante. Une action rapide est recommandée.',
}

interface UniverseCardProps {
  universe: string
  score: UniverseScore
  showDetails?: boolean
}

export default function UniverseCard({ universe, score, showDetails = false }: UniverseCardProps) {
  if (!score.active) return null

  const color = getNeedColor(score.needLevel)
  const badgeColor = NEED_BADGE_COLOR[score.needLevel]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="font-semibold text-gray-900">{UNIVERSE_LABELS[universe]}</h3>
        </div>
        <Badge color={badgeColor}>
          {score.needLevel === 'low' ? 'Bien couvert' :
           score.needLevel === 'moderate' ? 'À améliorer' :
           'Action requise'}
        </Badge>
      </div>

      <p className="text-sm text-gray-600 mb-3">{NEED_MESSAGES[score.needLevel]}</p>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Exposition au risque</span>
            <span className="font-medium">{Math.round(score.exposure)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${score.exposure}%` }} />
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">Niveau de couverture</span>
            <span className="font-medium">{Math.round(score.coverage)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${score.coverage}%` }} />
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">Score de besoin</span>
            <span className="font-semibold" style={{ color }}>{score.needScore}/100</span>
          </div>
        </div>
      )}
    </div>
  )
}
