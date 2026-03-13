import { supabase } from '../supabase.ts'

/** Export all user data (GDPR) — audit is handled server-side */
export async function exportMyData() {
  return supabase.rpc('export_my_data')
}

/** Delete all user data and auth record (GDPR) */
export async function deleteMyData() {
  return supabase.rpc('delete_my_data')
}
