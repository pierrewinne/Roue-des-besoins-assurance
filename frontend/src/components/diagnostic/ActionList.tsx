import type { Recommendation } from '../../shared/scoring/types.ts'
import Badge from '../ui/Badge.tsx'
import Card from '../ui/Card.tsx'
import EmptyState from '../ui/EmptyState.tsx'
import { ACTION_TYPE_LABELS, PRODUCT_LABELS, PRODUCT_BADGE_COLORS } from '../../lib/constants.ts'

interface ActionListProps {
  actions: Recommendation[]
  showType?: boolean
}

export default function ActionList({ actions, showType = false }: ActionListProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="check-circle"
          description="Aucune action recommandée pour le moment."
          iconColor="text-success"
          iconBg="bg-success-light ring-1 ring-success/10"
        />
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {actions.map((action, i) => (
        <div key={i} className="bg-white rounded-xl shadow-card p-5 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] hover:shadow-card-hover hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h4 className="font-bold text-primary-700 text-sm">{action.title}</h4>
                <Badge color={PRODUCT_BADGE_COLORS[action.product]}>{PRODUCT_LABELS[action.product]}</Badge>
                {showType && (
                  <Badge color={action.type === 'immediate' ? 'red' : action.type === 'deferred' ? 'orange' : 'gray'}>
                    {ACTION_TYPE_LABELS[action.type]}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-grey-400 leading-relaxed">{action.message}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 pt-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className={`w-1.5 h-5 rounded-full transition-colors ${
                    j < action.priority ? 'bg-danger' : 'bg-grey-100'
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
