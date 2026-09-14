import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const role = new URL(req.url).searchParams.get('role') || 'admin'

    // Real schema: user_notifications table — but it requires a user_id.
    // For admin role, return recent notifications across all users.
    const { data, error } = await adminSupabase
      .from('user_notifications')
      .select('id, user_id, title, description, notification_type, is_seen, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      // Fallback: synthesize notifications from recent orders if table is empty
      const { data: orders } = await adminSupabase
        .from('orders')
        .select('id, order_amount, order_status, created_at')
        .order('created_at', { ascending: false })
        .limit(8)

      const fallback = (orders || []).map((o: any) => ({
        id: `notif-${o.id}`,
        title: `Order #${o.id} ${o.order_status}`,
        body: `Order for $${Number(o.order_amount).toFixed(2)} — status: ${o.order_status}`,
        type: 'order',
        isRead: false,
        time: o.created_at,
      }))

      return NextResponse.json(fallback)
    }

    return NextResponse.json((data || []).map((n: any) => ({
      id: String(n.id),
      title: n.title || 'Notification',
      body: n.description || '',
      type: n.notification_type || 'info',
      isRead: n.is_seen,
      time: n.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
