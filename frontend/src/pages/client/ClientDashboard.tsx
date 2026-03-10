import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import Button from '../../components/ui/Button.tsx'
import Card from '../../components/ui/Card.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import Icon from '../../components/ui/Icon.tsx'
import EmptyState from '../../components/ui/EmptyState.tsx'
import { getScoreColorClass } from '../../lib/constants.ts'

interface PastDiagnostic {
  id: string
  global_score: number
  created_at: string
}

export default function ClientDashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [diagnostics, setDiagnostics] = useState<PastDiagnostic[]>([])
  const [hasIncomplete, setHasIncomplete] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      if (!user) return

      const [{ data: diags }, { data: incomplete }] = await Promise.all([
        supabase
          .from('diagnostics')
          .select('id, global_score, created_at')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('questionnaire_responses')
          .select('id')
          .eq('profile_id', user.id)
          .eq('completed', false)
          .limit(1),
      ])
      if (diags) setDiagnostics(diags)
      setHasIncomplete(!!incomplete?.length)
    }
    load()
  }, [user])

  async function handleExportData() {
    const { data, error } = await supabase.rpc('export_my_data')
    if (error) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mes-donnees-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)
    const { error } = await supabase.rpc('delete_my_data')
    if (!error) {
      await signOut()
      navigate('/login', { replace: true })
    }
    setIsDeleting(false)
  }

  return (
    <div>
      <PageHeader
        title={`Bonjour${profile?.first_name ? `, ${profile.first_name}` : ''} !`}
        subtitle="Bienvenue dans votre espace diagnostic assurance."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-5 ring-1 ring-primary-700/10">
            <Icon name="badge-check" size={28} className="text-primary-700" />
          </div>
          <h2 className="text-lg font-bold text-primary-700 mb-2">
            {hasIncomplete ? 'Reprendre mon diagnostic' : 'Nouveau diagnostic'}
          </h2>
          <p className="text-sm text-grey-400 mb-6 leading-relaxed max-w-xs">
            {hasIncomplete
              ? 'Vous avez un questionnaire en cours. Reprenez là où vous vous êtes arrêté.'
              : 'Répondez à quelques questions pour découvrir vos besoins en assurance.'}
          </p>
          <Button onClick={() => navigate('/questionnaire')} size="lg">
            {hasIncomplete ? 'Reprendre' : 'Commencer'}
          </Button>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-primary-700 mb-5">Mes diagnostics</h2>
          {diagnostics.length === 0 ? (
            <EmptyState icon="document" description="Aucun diagnostic réalisé pour le moment." />
          ) : (
            <div className="space-y-2">
              {diagnostics.map(d => (
                <Link
                  key={d.id}
                  to={`/results/${d.id}`}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-grey-100 hover:border-primary-200 hover:bg-primary-50/50 transition-all duration-300 group"
                >
                  <span className="text-sm text-grey-400 group-hover:text-primary-700 transition-colors">
                    {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${getScoreColorClass(d.global_score)}`}>
                      {d.global_score}/100
                    </span>
                    <Icon name="chevron-right" size={16} strokeWidth={2} className="text-grey-300 group-hover:text-primary-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* GDPR: Data management */}
      <div className="mt-10 pt-6 border-t border-grey-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-grey-400">Vos donnees personnelles</h3>
            <p className="text-xs text-grey-300 mt-0.5">Export ou suppression de vos donnees (RGPD).</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
            >
              Exporter mes donnees
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[#d9304c] border-[#d9304c]/20 hover:bg-[#ffeef1]"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Supprimer mon compte
            </Button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-[#ffeef1] rounded-xl ring-1 ring-[#d9304c]/10">
            <p className="text-sm text-[#d9304c] font-bold mb-2">Cette action est irreversible</p>
            <p className="text-xs text-grey-400 mb-4">
              Toutes vos donnees seront definitivement supprimees : profil, questionnaires, diagnostics et actions recommandees.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-[#d9304c] hover:bg-[#99172d]"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
              >
                {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
