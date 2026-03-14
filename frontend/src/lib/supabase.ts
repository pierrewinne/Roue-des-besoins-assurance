import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY requises')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Bypass Web Locks API — prevents "Lock broken by another request with the 'steal' option"
    // errors caused by HMR creating competing lock requests in development
    lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn(),
  },
})
