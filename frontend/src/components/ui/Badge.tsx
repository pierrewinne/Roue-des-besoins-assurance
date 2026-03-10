import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: 'green' | 'orange' | 'red' | 'blue' | 'gray' | 'purple'
  className?: string
}

const colors = {
  green: 'bg-[#e8f3ec] text-[#168741] ring-1 ring-[#168741]/15',
  orange: 'bg-accent-yellow-bg text-accent-yellow-dark ring-1 ring-accent-yellow-dark/15',
  red: 'bg-[#ffeef1] text-[#d9304c] ring-1 ring-[#d9304c]/15',
  blue: 'bg-primary-50 text-primary-700 ring-1 ring-primary-700/15',
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
