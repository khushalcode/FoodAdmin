import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Real schema doesn't have an activity_logs table — synthesize from recent orders
    const { data: orders } = await adminSupabase
      .from('orders')
      .select('id, order_amount, order_status, created_at, store:stores!orders_store_id_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(15)

    const activities = (orders || []).map((o: any) => {
      let type = 'order'
      let message = `Order #${o.id} placed`
      if (o.order_status === 'delivered') {
        message = `Order #${o.id} delivered to customer`
      } else if (o.order_status === 'canceled') {
        message = `Order #${o.id} was canceled`
        type = 'system'
      } else if (o.order_status === 'pending') {
        message = `New order #${o.id} received from ${o.store?.name || 'store'}`
      } else {
        message = `Order #${o.id} is now ${o.order_status}`
      }
      return {
        id: `act-${o.id}`,
        message,
        type,
        time: o.created_at,
      }
    })

    return NextResponse.json(activities)
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}

export async function POST() {
  // No-op in real schema (no activity_logs table) — return success
  return NextResponse.json({ ok: true })
}
