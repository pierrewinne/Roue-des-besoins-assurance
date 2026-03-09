import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import Button from '../../components/ui/Button.tsx'
import Card from '../../components/ui/Card.tsx'

interface PastDiagnostic {
  id: string
  global_score: number
  created_at: string
}

export default function ClientDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [diagnostics, setDiagnostics] = useState<PastDiagnostic[]>([])
  const [hasIncomplete, setHasIncomplete] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: diags } = await supabase
        .from('diagnostics')
        .select('id, global_score, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      if (diags) setDiagnostics(diags)

      const { data: incomplete } = await supabase
        .from('questionnaire_responses')
        .select('id')
        .eq('completed', false)
        .limit(1)
      setHasIncomplete(!!incomplete?.length)
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour{profile?.first_name ? `, ${profile.first_name}` : ''} !
        </h1>
        <p className="text-gray-500 mt-1">Bienvenue dans votre espace diagnostic assurance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">
            {hasIncomplete ? 'Reprendre mon diagnostic' : 'Nouveau diagnostic'}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {hasIncomplete
              ? 'Vous avez un questionnaire en cours. Reprenez là où vous vous êtes arrêté.'
              : 'Répondez à quelques questions pour découvrir vos besoins en assurance.'}
          </p>
          <Button onClick={() => navigate('/questionnaire')}>
            {hasIncomplete ? 'Reprendre' : 'Commencer'}
          </Button>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Mes diagnostics</h2>
          {diagnostics.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun diagnostic réalisé pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {diagnostics.map(d => (
                <Link
                  key={d.id}
                  to={`/results/${d.id}`}
                  className="block p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className={`text-sm font-semibold ${
                      d.global_score <= 25 ? 'text-green-600' :
                      d.global_score <= 50 ? 'text-orange-500' : 'text-red-500'
                    }`}>
                      Score: {d.global_score}/100
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
