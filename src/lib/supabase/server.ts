// Supabase server client (used in API routes + server components)
// Uses cookies to bind to the incoming request's session.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(toSet) {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Called from a Server Component — ignored if middleware refreshes sessions
          }
        },
      },
    }
  )
}

// Service-role client (bypasses RLS) — for admin operations only.
// NEVER expose this to the browser.
import { createClient as createSupaClient } from '@supabase/supabase-js'

export function createServiceSupabase() {
  return createSupaClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

// Default export: service client (most API routes use this for read access)
export const supabase = createServiceSupabase()
