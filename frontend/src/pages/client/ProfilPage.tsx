import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../contexts/AuthContext.tsx'
import { fetchActiveQuestionnaire, saveAnswers as apiSaveAnswers, createQuestionnaire, markProfilCompleted } from '../../lib/api/questionnaire.ts'
import { useAutoSave } from '../../hooks/useAutoSave.ts'
import QuestionField from '../../components/questionnaire/QuestionField.tsx'
import Button from '../../components/ui/Button.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import { getProfilQuestions, isProfilComplete } from '../../shared/questionnaire/quadrant-mapping.ts'
import { isQuestionVisible, type QuestionnaireAnswers } from '../../shared/questionnaire/schema.ts'

export default function ProfilPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})
  const responseIdRef = useRef<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)

  const questions = getProfilQuestions()
  const visibleQuestions = questions.filter(q => isQuestionVisible(q, answers))

  // Load existing incomplete questionnaire
  useEffect(() => {
    async function load() {
      if (!user) return
      const q = await fetchActiveQuestionnaire(user.id)
      if (q) {
        setAnswers(q.responses)
        responseIdRef.current = q.id
        if (q.profil_completed) {
          navigate('/dashboard', { replace: true })
          return
        }
      }
    }
    load()
  }, [user, navigate])

  // Auto-save debounced with visible error feedback (P2-02)
  const saveAnswers = useCallback(async (newAnswers: QuestionnaireAnswers) => {
    if (!user) return
    const rid = responseIdRef.current
    if (rid) {
      const { error: err } = await apiSaveAnswers(rid, user.id, newAnswers)
      if (err) {
        setError('La sauvegarde automatique a échoué. Vos réponses seront sauvegardées au prochain changement.')
        return
      }
    } else {
      const { data, error: err } = await createQuestionnaire(user.id, newAnswers)
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

  const { handleAnswer, flushPending } = useAutoSave(answers, saveAnswers, setAnswers)

  async function handleComplete() {
    if (!user) return
    setSaving(true)
    setError(null)
    await flushPending()

    try {
      const rid = responseIdRef.current
      if (rid) {
        const { error: err } = await markProfilCompleted(rid, user.id, answers)
        if (err) throw err
      } else {
        const { data, error: err } = await createQuestionnaire(user.id, answers, true)
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

  const isValid = isProfilComplete(answers) && consent

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

          {/* RGPD consent checkbox (CRIT-3) */}
          <label htmlFor="rgpd-consent" className="flex items-start gap-3 mt-8 p-4 bg-grey-50 rounded-xl ring-1 ring-grey-100 cursor-pointer select-none">
            <input
              id="rgpd-consent"
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-grey-300 text-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300 flex-shrink-0"
            />
            <span className="text-xs text-grey-500 leading-relaxed">
              J'accepte que mes données soient traitées par Baloise Assurances Luxembourg S.A. dans le cadre de l'analyse de mes besoins en assurance,
              conformément au RGPD et à la politique de confidentialité. Je peux exercer mes droits d'accès, de rectification et de suppression à tout moment depuis mon tableau de bord.
            </span>
          </label>

          {error && (
            <div role="alert" className="mt-6 p-3 bg-danger-light text-danger text-sm rounded-lg ring-1 ring-danger/10">
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
