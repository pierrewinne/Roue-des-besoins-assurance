import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants = {
  primary: 'bg-primary-700 text-white hover:bg-primary-600 active:bg-primary-800 shadow-card',
  secondary: 'bg-transparent text-primary-700 border border-primary-700 hover:shadow-card active:bg-primary-50',
  outline: 'border border-grey-200 text-primary-700 hover:border-primary-700 active:bg-primary-50',
  ghost: 'text-primary-700 hover:bg-primary-100 active:bg-primary-200',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-bold rounded transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.5,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
