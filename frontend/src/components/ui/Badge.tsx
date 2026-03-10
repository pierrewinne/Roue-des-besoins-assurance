import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: 'green' | 'orange' | 'red' | 'blue' | 'gray' | 'purple'
  className?: string
}

const colors = {
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15',
  orange: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/15',
  red: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/15',
  blue: 'bg-primary-50 text-primary-700 ring-1 ring-primary-700/15',
  gray: 'bg-slate-50 text-slate-600 ring-1 ring-slate-500/10',
  purple: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/15',
}

export default function Badge({ children, color = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
