import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/login-setups — list all configured login providers
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('login_setups')
      .select('id, provider, is_enabled, client_id, client_secret, redirect_url, config')
      .order('id', { ascending: true })

    if (error) throw error

    return NextResponse.json((data || []).map((p: any) => ({
      id: String(p.id),
      provider: p.provider,
      isEnabled: p.is_enabled,
      clientId: p.client_id,
      clientSecret: p.client_secret,
      redirectUrl: p.redirect_url,
      config: p.config,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/login-setups — update an existing login provider config (no POST — providers pre-seeded)
// Body: { id, isEnabled?, clientId?, clientSecret?, redirectUrl?, config? }
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, isEnabled, clientId, clientSecret, redirectUrl, config } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const patch: Record<string, any> = {}
    if (isEnabled !== undefined) patch.is_enabled = isEnabled
    if (clientId !== undefined) patch.client_id = clientId
    if (clientSecret !== undefined) patch.client_secret = clientSecret
    if (redirectUrl !== undefined) patch.redirect_url = redirectUrl
    if (config !== undefined) patch.config = config

    const { error } = await adminSupabase.from('login_setups').update(patch).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
