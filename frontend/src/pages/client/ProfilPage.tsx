import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import QuestionField from '../../components/questionnaire/QuestionField.tsx'
import Button from '../../components/ui/Button.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import { getProfilQuestions, isProfilComplete } from '../../shared/questionnaire/quadrant-mapping.ts'
import { isQuestionVisible } from '../../shared/questionnaire/schema.ts'

export default function ProfilPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const responseIdRef = useRef<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => { if (saveTimeout.current) clearTimeout(saveTimeout.current) }, [])

  const questions = getProfilQuestions()
  const visibleQuestions = questions.filter(q => isQuestionVisible(q, answers))

  // Load existing incomplete questionnaire
  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from('questionnaire_responses')
        .select('id, responses, profil_completed')
        .eq('profile_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setAnswers((data.responses as Record<string, unknown>) || {})
        responseIdRef.current = data.id
        if (data.profil_completed) {
          navigate('/dashboard', { replace: true })
          return
        }
      }
    }
    load()
  }, [user, navigate])

  // Auto-save debounced with error handling (ANO-06)
  const saveAnswers = useCallback(async (newAnswers: Record<string, unknown>) => {
    if (!user) return
    const rid = responseIdRef.current
    if (rid) {
      const { error } = await supabase
        .from('questionnaire_responses')
        .update({ responses: newAnswers })
        .eq('id', rid)
        .eq('profile_id', user.id)
      if (error) console.error('Auto-save failed:', error)
    } else {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .insert({ profile_id: user.id, responses: newAnswers })
        .select('id')
        .single()
      if (error) {
        console.error('Auto-save failed:', error)
        return
      }
      if (data) {
        responseIdRef.current = data.id
      }
    }
  }, [user])

  function handleAnswer(questionId: string, value: unknown) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveAnswers(newAnswers), 1500)
  }

  async function handleComplete() {
    if (!user) return
    setSaving(true)
    setError(null)

    // Flush pending debounce
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
      saveTimeout.current = undefined
    }

    try {
      const rid = responseIdRef.current
      if (rid) {
        const { error: err } = await supabase
          .from('questionnaire_responses')
          .update({ responses: answers, profil_completed: true })
          .eq('id', rid)
          .eq('profile_id', user.id)
        if (err) throw err
      } else {
        const { data, error: err } = await supabase
          .from('questionnaire_responses')
          .insert({ profile_id: user.id, responses: answers, profil_completed: true })
          .select('id')
          .single()
        if (err) throw err
        if (data) responseIdRef.current = data.id
      }

      navigate('/dashboard')
    } catch (err) {
      console.error('Save failed:', err)
      setError('Impossible de sauvegarder votre profil. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  const isValid = isProfilComplete(answers)


  return (
    <div>
      <PageHeader
        title="Votre profil"
        subtitle="Quelques questions pour mieux vous connaître avant d'explorer vos besoins."
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-card p-8">
          <div className="space-y-7">
            {visibleQuestions.map(q => (
              <QuestionField
                key={q.id}
                question={q}
                value={answers[q.id]}
                onChange={(val) => handleAnswer(q.id, val)}
              />
            ))}
          </div>

          {error && (
            <div className="mt-6 p-3 bg-[#ffeef1] text-[#d9304c] text-sm rounded-lg ring-1 ring-[#d9304c]/10">
              {error}
            </div>
          )}

          <div className="flex justify-end mt-10 pt-6 border-t border-grey-100">
            <Button onClick={handleComplete} disabled={!isValid || saving} size="lg">
              {saving ? 'Enregistrement...' : 'Découvrir ma roue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
