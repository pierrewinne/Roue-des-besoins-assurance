import { useState, type ReactNode } from 'react'
import ProgressBar from '../ui/ProgressBar.tsx'
import Button from '../ui/Button.tsx'
import { BLOCKS, BLOCK_LABELS, getBlockQuestions, isQuestionVisible, type QuestionBlock } from '../../shared/questionnaire/schema.ts'
import QuestionField from './QuestionField.tsx'

interface QuestionnaireShellProps {
  answers: Record<string, unknown>
  onAnswer: (questionId: string, value: unknown) => void
  onComplete: () => void
  sideContent?: ReactNode
}

export default function QuestionnaireShell({ answers, onAnswer, onComplete, sideContent }: QuestionnaireShellProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const currentBlock: QuestionBlock = BLOCKS[currentStep]
  const questions = getBlockQuestions(currentBlock)
  const visibleQuestions = questions.filter(q => isQuestionVisible(q, answers))

  const stepLabels = BLOCKS.map(b => BLOCK_LABELS[b])

  function isStepValid(): boolean {
    return visibleQuestions.every(q => {
      if (!q.required) return true
      const val = answers[q.id]
      return val !== undefined && val !== null && val !== ''
    })
  }

  function handleNext() {
    if (currentStep < BLOCKS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  function handlePrev() {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressBar steps={stepLabels} currentStep={currentStep} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{BLOCK_LABELS[currentBlock]}</h2>
            <div className="space-y-6">
              {visibleQuestions.map(q => (
                <QuestionField
                  key={q.id}
                  question={q}
                  value={answers[q.id]}
                  onChange={(val) => onAnswer(q.id, val)}
                />
              ))}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                Précédent
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {currentStep === BLOCKS.length - 1 ? 'Voir mon diagnostic' : 'Suivant'}
              </Button>
            </div>
          </div>
        </div>

        {sideContent && (
          <div className="hidden lg:block">
            {sideContent}
          </div>
        )}
      </div>
    </div>
  )
}
