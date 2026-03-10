import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
  hover?: boolean
}

export default function Card({ children, className = '', padding = true, hover = false }: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-card ${hover ? 'transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] hover:shadow-card-hover hover:-translate-y-0.5' : ''} ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}
