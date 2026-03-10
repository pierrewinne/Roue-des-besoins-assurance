import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.tsx'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backLink?: { to: string; label: string }
  actions?: ReactNode
}

export default function PageHeader({ title, subtitle, backLink, actions }: PageHeaderProps) {
  return (
    <div className="mb-10">
      {backLink && (
        <Link
          to={backLink.to}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-700 transition-colors mb-4"
        >
          <Icon name="chevron-left" size={16} strokeWidth={2} />
          {backLink.label}
        </Link>
      )}
      <div className={`flex items-start justify-between ${backLink ? '' : ''}`}>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
