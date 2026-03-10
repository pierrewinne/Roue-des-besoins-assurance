import type { IconName } from './Icon.tsx'
import Icon from './Icon.tsx'
import Card from './Card.tsx'

const colorMap = {
  primary: { text: 'text-primary-700', bg: 'bg-primary-50 ring-1 ring-primary-700/10' },
  emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50 ring-1 ring-emerald-600/10' },
  amber: { text: 'text-amber-600', bg: 'bg-amber-50 ring-1 ring-amber-600/10' },
  rose: { text: 'text-rose-600', bg: 'bg-rose-50 ring-1 ring-rose-600/10' },
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
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </Card>
  )
}
