import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import Card from '../../components/ui/Card.tsx'
import Badge from '../../components/ui/Badge.tsx'

interface ClientRow {
  client_id: string
  profiles: {
    first_name: string | null
    last_name: string | null
    email: string | null
  }
  latest_diagnostic?: {
    global_score: number
    created_at: string
  }
}

export default function AdvisorDashboard() {
  const { profile } = useAuth()
  const [clients, setClients] = useState<ClientRow[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data } = await supabase
        .from('advisor_clients')
        .select(`
          client_id,
          profiles!advisor_clients_client_id_fkey (first_name, last_name, email)
        `)
        .eq('advisor_id', profile.id)

      if (data) {
        // Fetch latest diagnostic for each client
        const enriched = await Promise.all(
          (data as unknown as ClientRow[]).map(async (row) => {
            const { data: diag } = await supabase
              .from('diagnostics')
              .select('global_score, created_at')
              .eq('profile_id', row.client_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single()
            return { ...row, latest_diagnostic: diag || undefined }
          })
        )
        setClients(enriched)
      }
    }
    load()
  }, [profile])

  const filtered = clients.filter(c => {
    if (!search) return true
    const name = `${c.profiles.first_name || ''} ${c.profiles.last_name || ''} ${c.profiles.email || ''}`.toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord conseiller</h1>
        <p className="text-gray-500 mt-1">Gérez vos clients et suivez leurs diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{clients.length}</div>
          <div className="text-sm text-gray-500 mt-1">Clients</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {clients.filter(c => c.latest_diagnostic).length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Diagnostics réalisés</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-500">
            {clients.filter(c => c.latest_diagnostic && c.latest_diagnostic.global_score > 50).length}
          </div>
          <div className="text-sm text-gray-500 mt-1">Actions requises</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mes clients</h2>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Aucun client trouvé.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(client => (
              <Link
                key={client.client_id}
                to={`/advisor/clients/${client.client_id}`}
                className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div>
                  <span className="font-medium text-gray-900">
                    {client.profiles.first_name || ''} {client.profiles.last_name || ''}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">{client.profiles.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  {client.latest_diagnostic ? (
                    <>
                      <Badge color={client.latest_diagnostic.global_score <= 25 ? 'green' : client.latest_diagnostic.global_score <= 50 ? 'orange' : 'red'}>
                        Score: {client.latest_diagnostic.global_score}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(client.latest_diagnostic.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </>
                  ) : (
                    <Badge color="gray">Pas de diagnostic</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
