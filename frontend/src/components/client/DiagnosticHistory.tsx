import { Link } from 'react-router-dom'
import Card from '../ui/Card.tsx'
import Icon from '../ui/Icon.tsx'
import { getScoreColorClass } from '../../lib/constants.ts'

interface PastDiagnostic {
  id: string
  global_score: number
  created_at: string
}

interface DiagnosticHistoryProps {
  diagnostics: PastDiagnostic[]
}

export default function DiagnosticHistory({ diagnostics }: DiagnosticHistoryProps) {
  if (diagnostics.length === 0) return null

  return (
    <Card>
      <h2 className="text-lg font-bold text-primary-700 mb-5">Mes diagnostics précédents</h2>
      <div className="space-y-2">
        {diagnostics.map(d => (
          <Link
            key={d.id}
            to={`/results/${d.id}`}
            className="flex items-center justify-between p-3.5 rounded-lg border border-grey-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300 group"
          >
            <span className="text-sm text-grey-400 group-hover:text-primary-700 transition-colors">
              {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${getScoreColorClass(d.global_score)}`}>
                {d.global_score}/100
              </span>
              <Icon name="chevron-right" size={16} strokeWidth={2} className="text-grey-300 group-hover:text-primary-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
