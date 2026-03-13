import { supabase } from '../supabase.ts'

/** Verify an advisor owns a specific client */
export async function verifyAdvisorRelation(advisorId: string, clientId: string) {
  return supabase
    .from('advisor_clients')
    .select('id')
    .eq('advisor_id', advisorId)
    .eq('client_id', clientId)
    .single()
}

/** Fetch advisor's clients with profile data */
export async function fetchAdvisorClients(advisorId: string) {
  return supabase
    .from('advisor_clients')
    .select(`
      client_id,
      profiles!advisor_clients_client_id_fkey (first_name, last_name, email)
    `)
    .eq('advisor_id', advisorId)
}

/** Fetch a client's profile */
export async function fetchClientProfile(clientId: string) {
  return supabase
    .from('profiles')
    .select('first_name, last_name, email, phone')
    .eq('id', clientId)
    .single()
}
