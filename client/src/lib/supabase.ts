import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Ensure URL has proper format
let formattedUrl = supabaseUrl
if (!formattedUrl.startsWith('http')) {
  formattedUrl = `https://${formattedUrl}`
}

// Validate URL format
try {
  console.log('Attempting to connect to Supabase project at:', formattedUrl)
  new URL(formattedUrl)
} catch (error) {
  console.error('Invalid Supabase URL format. Please ensure the URL is correct.')
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient(formattedUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})