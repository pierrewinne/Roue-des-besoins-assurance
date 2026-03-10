import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import QuestionField from '../../components/questionnaire/QuestionField.tsx'
import Button from '../../components/ui/Button.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import { getProfilQuestions, isProfilComplete } from '../../shared/questionnaire/universe-mapping.ts'
import { isQuestionVisible } from '../../shared/questionnaire/schema.ts'

export default function ProfilPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [responseId, setResponseId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
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
        setResponseId(data.id)
        // If profil already done, go to dashboard
        if (data.profil_completed) {
          navigate('/dashboard', { replace: true })
          return
        }
      }
    }
    load()
  }, [user, navigate])

  // Auto-save debounced
  const saveAnswers = useCallback(async (newAnswers: Record<string, unknown>, rid: string | null) => {
    if (!user) return
    if (rid) {
      await supabase
        .from('questionnaire_responses')
        .update({ responses: newAnswers, updated_at: new Date().toISOString() })
        .eq('id', rid)
        .eq('profile_id', user.id)
    } else {
      const { data } = await supabase
        .from('questionnaire_responses')
        .insert({ profile_id: user.id, responses: newAnswers })
        .select('id')
        .single()
      if (data) setResponseId(data.id)
    }
  }, [user])

  function handleAnswer(questionId: string, value: unknown) {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => saveAnswers(newAnswers, responseId), 1500)
  }

  async function handleComplete() {
    if (!user) return
    setSaving(true)

    let rid = responseId
    if (rid) {
      await supabase
        .from('questionnaire_responses')
        .update({ responses: answers, profil_completed: true, updated_at: new Date().toISOString() })
        .eq('id', rid)
        .eq('profile_id', user.id)
    } else {
      const { data } = await supabase
        .from('questionnaire_responses')
        .insert({ profile_id: user.id, responses: answers, profil_completed: true })
        .select('id')
        .single()
      rid = data?.id ?? null
    }

    setSaving(false)
    navigate('/dashboard')
  }

  const isValid = isProfilComplete(answers)

  return (
    <div>
      <PageHeader
        title="Votre profil"
        subtitle="Quelques questions pour mieux vous connaitre avant d'explorer vos besoins."
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

          <div className="flex justify-end mt-10 pt-6 border-t border-grey-100">
            <Button onClick={handleComplete} disabled={!isValid || saving} size="lg">
              {saving ? 'Enregistrement...' : 'Decouvrir ma roue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
