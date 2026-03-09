import type { Question } from '../../shared/questionnaire/schema.ts'

interface QuestionFieldProps {
  question: Question
  value: unknown
  onChange: (value: unknown) => void
}

export default function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  switch (question.type) {
    case 'boolean':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{question.label}</label>
          {question.helpText && <p className="text-xs text-gray-500">{question.helpText}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange(true)}
              className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                value === true
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Oui
            </button>
            <button
              type="button"
              onClick={() => onChange(false)}
              className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                value === false
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Non
            </button>
          </div>
        </div>
      )

    case 'select':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{question.label}</label>
          {question.helpText && <p className="text-xs text-gray-500">{question.helpText}</p>}
          <div className="grid gap-2">
            {question.options?.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`w-full text-left py-3 px-4 rounded-lg border text-sm transition-colors ${
                  value === option.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )

    case 'number':
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{question.label}</label>
          {question.helpText && <p className="text-xs text-gray-500">{question.helpText}</p>}
          <input
            type="number"
            min="0"
            max="99"
            value={typeof value === 'number' ? value : ''}
            onChange={e => onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )

    default:
      return null
  }
}
