import type { IconName } from './Icon.tsx'
import Icon from './Icon.tsx'
import Card from './Card.tsx'

const colorMap = {
  primary: { text: 'text-primary-700', bg: 'bg-primary-50 ring-1 ring-primary-700/10' },
  emerald: { text: 'text-[#168741]', bg: 'bg-[#e8f3ec] ring-1 ring-[#168741]/10' },
  amber: { text: 'text-[#c97612]', bg: 'bg-accent-yellow-bg ring-1 ring-accent-yellow-dark/10' },
  rose: { text: 'text-[#d9304c]', bg: 'bg-[#ffeef1] ring-1 ring-[#d9304c]/10' },
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
