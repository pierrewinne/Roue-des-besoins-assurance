interface ProgressBarProps {
  steps: string[]
  currentStep: number
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
              i < currentStep ? 'bg-blue-600 text-white' :
              i === currentStep ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < currentStep ? '\u2713' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden sm:block w-12 md:w-24 h-0.5 mx-1 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <span key={step} className={`text-xs hidden sm:block ${i <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}
