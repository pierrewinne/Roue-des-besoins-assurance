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
        <div className="space-y-2.5">
          <label className="block text-sm font-bold text-primary-700">{question.label}</label>
          {question.helpText && <p className="text-xs text-grey-400 leading-relaxed">{question.helpText}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange(true)}
              className={`flex-1 py-3 px-4 rounded-lg border text-sm font-bold transition-all duration-300 ${
                value === true
                  ? 'border-primary-700 bg-primary-50 text-primary-700'
                  : 'border-grey-200 text-grey-400 hover:border-grey-300 hover:text-primary-700'
              }`}
            >
              Oui
            </button>
            <button
              type="button"
              onClick={() => onChange(false)}
              className={`flex-1 py-3 px-4 rounded-lg border text-sm font-bold transition-all duration-300 ${
                value === false
                  ? 'border-primary-700 bg-primary-50 text-primary-700'
                  : 'border-grey-200 text-grey-400 hover:border-grey-300 hover:text-primary-700'
              }`}
            >
              Non
            </button>
          </div>
        </div>
      )

    case 'select':
      return (
        <div className="space-y-2.5">
          <label className="block text-sm font-bold text-primary-700">{question.label}</label>
          {question.helpText && <p className="text-xs text-grey-400 leading-relaxed">{question.helpText}</p>}
          <div className="grid gap-2">
            {question.options?.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`w-full text-left py-3 px-4 rounded-lg border text-sm transition-all duration-300 ${
                  value === option.value
                    ? 'border-primary-700 bg-primary-50 text-primary-700 font-bold'
                    : 'border-grey-200 text-grey-400 hover:border-grey-300 hover:text-primary-700'
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
        <div className="space-y-2.5">
          <label className="block text-sm font-bold text-primary-700">{question.label}</label>
          {question.helpText && <p className="text-xs text-grey-400 leading-relaxed">{question.helpText}</p>}
          <input
            type="number"
            min="0"
            max="99"
            value={typeof value === 'number' ? value : ''}
            onChange={e => onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
            className="w-full px-4 py-3 bg-white border border-grey-200 rounded text-sm text-primary-700 placeholder:text-grey-300 focus:outline-none focus:border-2 focus:border-primary-700 focus:ring-2 focus:ring-primary-200/50 transition-all duration-300"
          />
        </div>
      )

    default:
      return null
  }
}
