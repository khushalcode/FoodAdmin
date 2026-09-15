import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/maintenance-mode — return the single-row maintenance mode config
export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('maintenance_mode')
      .select('id, is_enabled, message, scheduled_until, updated_at')
      .eq('id', 1)
      .single()

    if (error) {
      // If the row doesn't exist yet, return safe defaults
      if (error.code === 'PGRST116') {
        return NextResponse.json({ isEnabled: false, message: '', scheduledUntil: null })
      }
      throw error
    }

    return NextResponse.json({
      isEnabled: Boolean(data?.is_enabled),
      message: data?.message || '',
      scheduledUntil: data?.scheduled_until || null,
      updatedAt: data?.updated_at || null,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

// PATCH /api/maintenance-mode — update the maintenance mode config
// Body: { isEnabled, message?, scheduledUntil? }
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { isEnabled, message, scheduledUntil } = body

    const patch: Record<string, any> = {}
    if (isEnabled !== undefined) patch.is_enabled = Boolean(isEnabled)
    if (message !== undefined) patch.message = message
    if (scheduledUntil !== undefined) patch.scheduled_until = scheduledUntil

    const { error } = await adminSupabase
      .from('maintenance_mode')
      .update(patch)
      .eq('id', 1)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
