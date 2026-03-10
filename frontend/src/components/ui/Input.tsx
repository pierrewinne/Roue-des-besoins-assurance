import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
}

export default function Input({ label, icon, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-sm font-bold text-primary-700 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-grey-300">
            {icon}
          </div>
        )}
        <input
          className={`w-full px-3.5 py-3 bg-white border border-grey-200 rounded text-sm text-primary-700 placeholder:text-grey-300 focus:outline-none focus:border-2 focus:border-primary-700 focus:ring-2 focus:ring-primary-200/50 transition-all duration-300 ${icon ? 'pl-9' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  )
}
