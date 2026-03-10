interface SpinnerProps {
  className?: string
}

export default function Spinner({ className = 'py-20' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-grey-200 border-t-primary-700" />
    </div>
  )
}
