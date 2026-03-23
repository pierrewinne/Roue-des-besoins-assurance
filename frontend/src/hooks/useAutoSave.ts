import { useEffect, useRef, useCallback } from 'react'
import type { QuestionnaireAnswers, AnswerValue } from '../shared/questionnaire/schema.ts'

const DEBOUNCE_MS = 1500

/**
 * Debounced auto-save with visibilitychange flush.
 * Handles timeout ref, answers ref sync, cleanup on unmount, and flush on tab hide.
 */
export function useAutoSave(
  answers: QuestionnaireAnswers,
  saveFn: (answers: QuestionnaireAnswers) => Promise<void>,
  setAnswers: (answers: QuestionnaireAnswers) => void,
) {
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const answersRef = useRef(answers)
  answersRef.current = answers

  // Cleanup timeout on unmount
  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }, [])

  // Flush pending save on tab hide (P2-07)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden' && saveTimeout.current) {
        clearTimeout(saveTimeout.current)
        saveTimeout.current = undefined
        saveFn(answersRef.current)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [saveFn])

  const handleAnswer = useCallback((questionId: string, value: AnswerValue | undefined) => {
    const newAnswers: QuestionnaireAnswers = { ...answersRef.current, [questionId]: value }
    setAnswers(newAnswers)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveFn(newAnswers), DEBOUNCE_MS)
  }, [saveFn, setAnswers])

  const flushPending = useCallback(async () => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
      saveTimeout.current = undefined
    }
    await saveFn(answersRef.current)
  }, [saveFn])

  return { handleAnswer, flushPending }
}
