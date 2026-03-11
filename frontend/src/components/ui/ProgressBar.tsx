import Icon from './Icon.tsx'

interface ProgressBarProps {
  steps: string[]
  currentStep: number
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all duration-300 ${
              i < currentStep
                ? 'bg-primary-700 text-white'
                : i === currentStep
                  ? 'bg-white text-primary-700 ring-2 ring-primary-700'
                  : 'bg-grey-100 text-grey-300'
            }`}>
              {i < currentStep ? (
                <Icon name="check" size={16} strokeWidth={2.5} />
              ) : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden sm:block w-12 md:w-24 h-0.5 mx-2 rounded-full transition-colors duration-300 ${
                i < currentStep ? 'bg-primary-700' : 'bg-grey-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <span key={step} className={`text-xs font-normal hidden sm:block transition-colors ${
            i <= currentStep ? 'text-primary-700' : 'text-grey-300'
          }`}>
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
