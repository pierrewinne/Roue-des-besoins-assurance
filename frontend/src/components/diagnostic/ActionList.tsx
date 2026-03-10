import type { RecommendedAction } from '../../shared/scoring/types.ts'
import Badge from '../ui/Badge.tsx'
import Card from '../ui/Card.tsx'
import EmptyState from '../ui/EmptyState.tsx'
import { UNIVERSE_SHORT_LABELS, ACTION_TYPE_LABELS } from '../../lib/constants.ts'

interface ActionListProps {
  actions: RecommendedAction[]
  showType?: boolean
}

export default function ActionList({ actions, showType = false }: ActionListProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="check-circle"
          description="Aucune action recommandée pour le moment."
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 ring-1 ring-emerald-600/10"
        />
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {actions.map((action, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-card p-5 transition-all duration-200 hover:shadow-card-hover">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h4 className="font-semibold text-slate-900 text-sm">{action.title}</h4>
                <Badge color="blue">{UNIVERSE_SHORT_LABELS[action.universe as keyof typeof UNIVERSE_SHORT_LABELS]}</Badge>
                {showType && (
                  <Badge color={action.type === 'immediate' ? 'red' : action.type === 'deferred' ? 'orange' : 'gray'}>
                    {ACTION_TYPE_LABELS[action.type]}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{action.description}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 pt-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className={`w-1.5 h-5 rounded-full transition-colors ${
                    j < action.priority ? 'bg-rose-400' : 'bg-slate-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
