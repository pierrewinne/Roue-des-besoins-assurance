import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon.tsx'

interface EmptyStateProps {
  icon: IconName
  title?: string
  description: string
  action?: ReactNode
  iconColor?: string
  iconBg?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  iconColor = 'text-grey-300',
  iconBg = 'bg-grey-100',
}: EmptyStateProps) {
  return (
    <div className="py-10 text-center">
      <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
        <Icon name={icon} className={iconColor} size={28} strokeWidth={1.5} />
      </div>
      {title && <h3 className="text-sm font-bold text-primary-700 mb-1">{title}</h3>}
      <p className="text-sm text-grey-400 max-w-xs mx-auto">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
