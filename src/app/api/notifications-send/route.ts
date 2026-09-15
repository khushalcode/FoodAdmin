import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// POST /api/notifications-send
//
// Admin sends a notification to one or more users. Triggers Supabase Realtime
// inserts on the user_notifications table — every customer/vendor/delivery
// app subscribed to their own user_id channel receives the update instantly.
//
// Body: { userId | userIds, title, description, type, data }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, userIds, title, description, type, data, broadcastToRole } = body
    if (!title || !description) {
      return NextResponse.json({ error: 'title and description required' }, { status: 400 })
    }

    const notificationType = type || 'general'
    const notificationData = data || {}
    const rows: any[] = []

    if (userIds && Array.isArray(userIds)) {
      for (const id of userIds) {
        rows.push({
          user_id: String(id),
          title,
          description,
          notification_type: notificationType,
          data: notificationData,
          is_seen: false,
        })
      }
    } else if (userId) {
      rows.push({
        user_id: String(userId),
        title,
        description,
        notification_type: notificationType,
        data: notificationData,
        is_seen: false,
      })
    } else if (broadcastToRole) {
      // Broadcast to all users with a given role
      let q = adminSupabase.from('user_profiles').select('user_id')
      if (broadcastToRole === 'customer') q = q.eq('role', 'customer')
      else if (broadcastToRole === 'vendor') q = q.in('role', ['vendor', 'store-owner'])
      else if (broadcastToRole === 'delivery') q = q.in('role', ['delivery-man', 'rider'])
      const { data: profiles, error } = await q.limit(1000)
      if (error) throw error
      for (const p of profiles || []) {
        rows.push({
          user_id: String(p.user_id),
          title,
          description,
          notification_type: notificationType,
          data: notificationData,
          is_seen: false,
        })
      }
    } else {
      return NextResponse.json({ error: 'userId or userIds or broadcastToRole required' }, { status: 400 })
    }

    if (rows.length === 0) return NextResponse.json({ ok: true, inserted: 0 })

    const { error } = await adminSupabase.from('user_notifications').insert(rows)
    if (error) throw error

    return NextResponse.json({ ok: true, inserted: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
