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
          <label className="block text-sm font-medium text-slate-900">{question.label}</label>
          {question.helpText && <p className="text-xs text-slate-500 leading-relaxed">{question.helpText}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange(true)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                value === true
                  ? 'border-primary-700 bg-primary-50 text-primary-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              Oui
            </button>
            <button
              type="button"
              onClick={() => onChange(false)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                value === false
                  ? 'border-primary-700 bg-primary-50 text-primary-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
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
          <label className="block text-sm font-medium text-slate-900">{question.label}</label>
          {question.helpText && <p className="text-xs text-slate-500 leading-relaxed">{question.helpText}</p>}
          <div className="grid gap-2">
            {question.options?.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`w-full text-left py-3 px-4 rounded-lg border-2 text-sm transition-all duration-200 ${
                  value === option.value
                    ? 'border-primary-700 bg-primary-50 text-primary-700 font-medium'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-700'
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
          <label className="block text-sm font-medium text-slate-900">{question.label}</label>
          {question.helpText && <p className="text-xs text-slate-500 leading-relaxed">{question.helpText}</p>}
          <input
            type="number"
            min="0"
            max="99"
            value={typeof value === 'number' ? value : ''}
            onChange={e => onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200/50 focus:border-primary-400 transition-all"
          />
        </div>
      )

    default:
      return null
  }
}
