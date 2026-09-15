import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// POST /api/realtime-event
//
// Helper used by CI/CD and admin to broadcast a realtime payload. Useful for:
//   - forcing a customer to refresh their order list
//   - forcing delivery app to refresh order queue
//   - "ping" all apps after a bulk data update
//
// Strategy: insert a special row into user_notifications, which triggers the
// Supabase Realtime postgres_changes event for any client subscribed to
// `user_id=eq.<userId>` on the user_notifications table.
//
// Body: { userId, event, payload }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, event, payload, broadcastToRole } = body
    if (!event) return NextResponse.json({ error: 'event required' }, { status: 400 })

    const rows: any[] = []
    const insertOne = (uid: string) => rows.push({
      user_id: uid,
      title: `Realtime event: ${event}`,
      description: JSON.stringify(payload || {}),
      notification_type: 'realtime',
      data: { event, payload, ts: Date.now() },
      is_seen: false,
    })

    if (broadcastToRole) {
      let q = adminSupabase.from('user_profiles').select('user_id')
      if (broadcastToRole === 'customer') q = q.eq('role', 'customer')
      else if (broadcastToRole === 'vendor') q = q.in('role', ['vendor', 'store-owner'])
      else if (broadcastToRole === 'delivery') q = q.in('role', ['delivery-man', 'rider'])
      const { data, error } = await q.limit(2000)
      if (error) throw error
      for (const p of data || []) insertOne(String(p.user_id))
    } else if (Array.isArray(userId)) {
      userId.forEach((u: string) => insertOne(String(u)))
    } else if (userId) {
      insertOne(String(userId))
    } else {
      return NextResponse.json({ error: 'userId or broadcastToRole required' }, { status: 400 })
    }

    if (rows.length === 0) return NextResponse.json({ ok: true, broadcast: 0 })

    const { error } = await adminSupabase.from('user_notifications').insert(rows)
    if (error) throw error

    return NextResponse.json({ ok: true, broadcast: rows.length, event })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
