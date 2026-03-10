import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
}

export default function Card({ children, className = '', padding = true, hover = false }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-card ${hover ? 'transition-all duration-200 hover:shadow-card-hover hover:border-slate-300' : ''} ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}
