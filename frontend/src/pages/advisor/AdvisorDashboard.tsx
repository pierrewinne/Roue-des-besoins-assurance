import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { supabase } from '../../lib/supabase.ts'
import Card from '../../components/ui/Card.tsx'
import Badge from '../../components/ui/Badge.tsx'
import PageHeader from '../../components/ui/PageHeader.tsx'
import StatCard from '../../components/ui/StatCard.tsx'
import Input from '../../components/ui/Input.tsx'
import Icon from '../../components/ui/Icon.tsx'
import EmptyState from '../../components/ui/EmptyState.tsx'

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
      <PageHeader
        title="Tableau de bord conseiller"
        subtitle="Gérez vos clients et suivez leurs diagnostics."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <StatCard icon="users" value={clients.length} label="Clients" color="primary" />
        <StatCard icon="badge-check" value={clients.filter(c => c.latest_diagnostic).length} label="Diagnostics réalisés" color="emerald" />
        <StatCard icon="alert-triangle" value={clients.filter(c => c.latest_diagnostic && c.latest_diagnostic.global_score > 50).length} label="Actions requises" color="amber" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Mes clients</h2>
          <div className="w-72">
            <Input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Icon name="search" size={16} strokeWidth={2} />}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="users" description="Aucun client trouvé." />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(client => (
              <Link
                key={client.client_id}
                to={`/advisor/clients/${client.client_id}`}
                className="flex items-center justify-between py-4 px-3 -mx-3 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-500">
                      {(client.profiles.first_name?.[0] || '?').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900 text-sm">
                      {client.profiles.first_name || ''} {client.profiles.last_name || ''}
                    </span>
                    <span className="text-sm text-slate-400 ml-2">{client.profiles.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {client.latest_diagnostic ? (
                    <>
                      <Badge color={client.latest_diagnostic.global_score <= 25 ? 'green' : client.latest_diagnostic.global_score <= 50 ? 'orange' : 'red'}>
                        Score: {client.latest_diagnostic.global_score}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(client.latest_diagnostic.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </>
                  ) : (
                    <Badge color="gray">Pas de diagnostic</Badge>
                  )}
                  <Icon name="chevron-right" size={16} strokeWidth={2} className="text-slate-300 group-hover:text-primary-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
