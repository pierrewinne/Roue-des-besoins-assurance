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
  const answersRef = useRef(answers)
  answersRef.current = answers

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

  // Auto-save debounced with visible error feedback (P2-02)
  const saveAnswers = useCallback(async (newAnswers: Record<string, unknown>) => {
    if (!user) return
    const rid = responseIdRef.current
    if (rid) {
      const { error: err } = await supabase
        .from('questionnaire_responses')
        .update({ responses: newAnswers })
        .eq('id', rid)
        .eq('profile_id', user.id)
      if (err) {
        setError('La sauvegarde automatique a échoué. Vos réponses seront sauvegardées au prochain changement.')
        return
      }
    } else {
      const { data, error: err } = await supabase
        .from('questionnaire_responses')
        .insert({ profile_id: user.id, responses: newAnswers })
        .select('id')
        .single()
      if (err) {
        setError('La sauvegarde automatique a échoué. Vos réponses seront sauvegardées au prochain changement.')
        return
      }
      if (data) {
        responseIdRef.current = data.id
      }
    }
    setError(null)
  }, [user])

  // Flush pending save on tab close (P2-07)
  useEffect(() => {
    function handleBeforeUnload() {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
        saveTimeout.current = undefined
        saveAnswers(answersRef.current)
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saveAnswers])

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
    } catch {
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
        {/* RGPD notice (CRIT-3) */}
        <div className="mb-6 p-4 bg-info-light rounded-xl ring-1 ring-info/10 text-xs text-grey-500 leading-relaxed">
          <p className="font-bold text-grey-600 mb-1">Protection de vos données</p>
          <p>
            Les informations recueillies dans ce questionnaire sont traitées par Baloise Assurances Luxembourg S.A. pour l'analyse de vos besoins en assurance.
            Conformément au RGPD, vous pouvez exercer vos droits d'accès, de rectification et de suppression depuis votre tableau de bord.
            Vos données ne sont partagées qu'avec votre conseiller attitré.
          </p>
        </div>

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
            <div className="mt-6 p-3 bg-danger-light text-danger text-sm rounded-lg ring-1 ring-danger/10">
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
