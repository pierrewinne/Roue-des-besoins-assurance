import type { RecommendedAction } from '../../shared/scoring/types.ts'
import Badge from '../ui/Badge.tsx'

const UNIVERSE_LABELS: Record<string, string> = {
  auto: 'Auto',
  habitation: 'Habitation',
  prevoyance: 'Prévoyance',
  objets_valeur: 'Objets',
}

const TYPE_LABELS: Record<string, string> = {
  immediate: 'Action immédiate',
  deferred: 'Action différée',
  event: 'Événement de vie',
}

interface ActionListProps {
  actions: RecommendedAction[]
  showType?: boolean
}

export default function ActionList({ actions, showType = false }: ActionListProps) {
  if (actions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        Aucune action recommandée pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {actions.map((action, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                <Badge color={action.universe === 'auto' ? 'blue' : action.universe === 'habitation' ? 'blue' : action.universe === 'prevoyance' ? 'blue' : 'blue'}>
                  {UNIVERSE_LABELS[action.universe]}
                </Badge>
                {showType && (
                  <Badge color={action.type === 'immediate' ? 'red' : action.type === 'deferred' ? 'orange' : 'gray'}>
                    {TYPE_LABELS[action.type]}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className={`w-1.5 h-4 rounded-full ${j < action.priority ? 'bg-red-400' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
