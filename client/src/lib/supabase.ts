import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  }
})

// Initialize and test connection
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Initial auth state:', !!session)
}).catch(error => {
  console.error('Failed to get initial session:', error.message)
})

// Listen for auth state changes (keeps original functionality)
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event)
  console.log('Session exists:', !!session)
})