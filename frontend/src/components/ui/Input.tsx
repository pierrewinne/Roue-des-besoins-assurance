import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
}

export default function Input({ label, icon, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200/50 focus:border-primary-400 transition-colors ${icon ? 'pl-9' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  )
}
