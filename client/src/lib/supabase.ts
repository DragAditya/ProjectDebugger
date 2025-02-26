import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug log for environment variables (without exposing sensitive data)
console.log('Supabase URL exists:', !!supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Ensure URL has proper format
let formattedUrl = supabaseUrl
if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
  formattedUrl = `https://${formattedUrl}`
}

try {
  // Validate URL format
  new URL(formattedUrl)
  console.log('Attempting to connect to Supabase project...')
} catch (error) {
  console.error('Invalid Supabase URL format. Please check your VITE_SUPABASE_URL environment variable.')
  throw new Error('Invalid Supabase URL format')
}

// Create Supabase client with proper configuration
export const supabase = createClient(formattedUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Test the connection
supabase.auth.getSession().then(() => {
  console.log('Supabase client initialized successfully')
}).catch(error => {
  console.error('Error initializing Supabase client:', error.message)
})