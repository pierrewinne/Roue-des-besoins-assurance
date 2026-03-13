import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: 'green' | 'orange' | 'red' | 'blue' | 'gray' | 'purple'
  className?: string
}

const colors = {
  green: 'bg-success-light text-success ring-1 ring-success/15',
  orange: 'bg-warning-light text-warning ring-1 ring-warning/15',
  red: 'bg-danger-light text-danger ring-1 ring-danger/15',
  blue: 'bg-info-light text-info ring-1 ring-info/15',
  gray: 'bg-grey-100 text-grey-400 ring-1 ring-grey-400/10',
  purple: 'bg-accent-purple-bg text-accent-purple-dark ring-1 ring-accent-purple-dark/15',
}

export default function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
