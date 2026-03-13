import type { IconName } from './Icon.tsx'
import Icon from './Icon.tsx'
import Card from './Card.tsx'

const colorMap = {
  primary: { text: 'text-primary-700', bg: 'bg-primary-50 ring-1 ring-primary-700/10' },
  emerald: { text: 'text-success', bg: 'bg-success-light ring-1 ring-success/10' },
  amber: { text: 'text-warning', bg: 'bg-warning-light ring-1 ring-warning/10' },
  rose: { text: 'text-danger', bg: 'bg-danger-light ring-1 ring-danger/10' },
} as const

interface StatCardProps {
  icon: IconName
  value: number | string
  label: string
  color: keyof typeof colorMap
}

export default function StatCard({ icon, value, label, color }: StatCardProps) {
  const { text, bg } = colorMap[color]

  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon name={icon} className={text} />
      </div>
      <div>
        <div className={`text-2xl font-bold ${text}`}>{value}</div>
        <div className="text-sm text-grey-400">{label}</div>
      </div>
    </Card>
  )
}
