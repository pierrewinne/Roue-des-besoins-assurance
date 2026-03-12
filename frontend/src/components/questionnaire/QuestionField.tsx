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
        <fieldset className="space-y-2.5" role="radiogroup" aria-labelledby={`label-${question.id}`}>
          <legend id={`label-${question.id}`} className="block text-sm font-bold text-primary-700">{question.label}</legend>
          {question.helpText && <p className="text-xs text-grey-400 leading-relaxed">{question.helpText}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              role="radio"
              aria-checked={value === true}
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
              role="radio"
              aria-checked={value === false}
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
        </fieldset>
      )

    case 'select':
      return (
        <fieldset className="space-y-2.5" role="radiogroup" aria-labelledby={`label-${question.id}`}>
          <legend id={`label-${question.id}`} className="block text-sm font-bold text-primary-700">{question.label}</legend>
          {question.helpText && <p className="text-xs text-grey-400 leading-relaxed">{question.helpText}</p>}
          <div className="grid gap-2">
            {question.options?.map(option => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={value === option.value}
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
        </fieldset>
      )

    case 'multi_select': {
      const selected = Array.isArray(value) ? (value as string[]) : []
      const toggleOption = (optionValue: string) => {
        if (optionValue === 'none') {
          // "none" is exclusive — deselect everything else
          onChange(['none'])
          return
        }
        // Remove "none" if selecting a real option
        let next = selected.filter(v => v !== 'none')
        if (next.includes(optionValue)) {
          next = next.filter(v => v !== optionValue)
        } else {
          next = [...next, optionValue]
        }
        onChange(next.length > 0 ? next : [])
      }

      return (
        <fieldset className="space-y-2.5" aria-labelledby={`label-${question.id}`}>
          <legend id={`label-${question.id}`} className="block text-sm font-bold text-primary-700">{question.label}</legend>
          {question.helpText && <p className="text-xs text-grey-400 leading-relaxed">{question.helpText}</p>}
          <div className="grid gap-2">
            {question.options?.map(option => {
              const isSelected = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => toggleOption(option.value)}
                  className={`w-full text-left py-3 px-4 rounded-lg border text-sm transition-all duration-300 ${
                    isSelected
                      ? 'border-primary-700 bg-primary-50 text-primary-700 font-bold'
                      : 'border-grey-200 text-grey-400 hover:border-grey-300 hover:text-primary-700'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded border text-xs ${
                      isSelected ? 'border-primary-700 bg-primary-700 text-white' : 'border-grey-300'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </span>
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </fieldset>
      )
    }

    case 'number':
      return (
        <div className="space-y-2.5">
          <label htmlFor={question.id} className="block text-sm font-bold text-primary-700">{question.label}</label>
          {question.helpText && <p className="text-xs text-grey-400 leading-relaxed">{question.helpText}</p>}
          <input
            id={question.id}
            type="number"
            min="0"
            max="99"
            value={typeof value === 'number' ? value : ''}
            onChange={e => {
              if (e.target.value === '') { onChange(undefined); return }
              const parsed = parseInt(e.target.value, 10)
              onChange(isNaN(parsed) ? undefined : Math.max(0, Math.min(99, parsed)))
            }}
            className="w-full px-4 py-3 bg-white border border-grey-200 rounded text-sm text-primary-700 placeholder:text-grey-300 focus:outline-none focus:border-2 focus:border-primary-700 focus:ring-2 focus:ring-primary-200/50 transition-all duration-300"
          />
        </div>
      )

    default:
      return null
  }
}
