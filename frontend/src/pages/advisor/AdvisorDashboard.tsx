import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { fetchAdvisorClients } from '../../lib/api/advisor.ts'
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
      const { data } = await fetchAdvisorClients(profile.id)

      if (data) {
        const rows = data as unknown as ClientRow[]
        const clientIds = rows.map(r => r.client_id)

        // Single batch query instead of N+1 (P11)
        const { data: allDiags } = clientIds.length > 0
          ? await supabase
              .from('diagnostics')
              .select('profile_id, global_score, created_at')
              .in('profile_id', clientIds)
              .order('created_at', { ascending: false })
          : { data: [] }

        // Keep only the latest diagnostic per client
        const latestByClient = new Map<string, { global_score: number; created_at: string }>()
        for (const d of allDiags || []) {
          if (!latestByClient.has(d.profile_id)) {
            latestByClient.set(d.profile_id, { global_score: d.global_score, created_at: d.created_at })
          }
        }

        const enriched = rows.map(row => ({
          ...row,
          latest_diagnostic: latestByClient.get(row.client_id) || undefined,
        }))
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
          <h2 className="text-lg font-bold text-primary-700">Mes clients</h2>
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
          <div className="divide-y divide-grey-100">
            {filtered.map(client => (
              <Link
                key={client.client_id}
                to={`/conseiller/clients/${client.client_id}`}
                className="flex items-center justify-between py-4 px-3 -mx-3 hover:bg-primary-50/30 rounded-lg transition-colors duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-grey-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-grey-400">
                      {(client.profiles.first_name?.[0] || '?').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-primary-700 text-sm">
                      {client.profiles.first_name || ''} {client.profiles.last_name || ''}
                    </span>
                    <span className="text-sm text-grey-300 ml-2">{client.profiles.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {client.latest_diagnostic ? (
                    <>
                      <Badge color={client.latest_diagnostic.global_score <= 25 ? 'green' : client.latest_diagnostic.global_score <= 50 ? 'orange' : 'red'}>
                        Score: {client.latest_diagnostic.global_score}
                      </Badge>
                      <span className="text-xs text-grey-300">
                        {new Date(client.latest_diagnostic.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </>
                  ) : (
                    <Badge color="gray">Pas de diagnostic</Badge>
                  )}
                  <Icon name="chevron-right" size={16} strokeWidth={2} className="text-grey-300 group-hover:text-primary-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
