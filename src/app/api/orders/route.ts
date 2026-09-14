import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await adminSupabase
      .from('orders')
      .select(`
        id, order_amount, order_status, payment_status, payment_method,
        delivery_address, created_at, user_id,
        store:stores!orders_store_id_fkey(name),
        delivery_man:delivery_men!orders_delivery_man_id_fkey(f_name, l_name),
        order_details(id)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // Look up customer name from users table (user_id may be bigint string or uuid)
    const userIds = [...new Set((data || []).map((o: any) => String(o.user_id)).filter(Boolean))]
    let userMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: users } = await adminSupabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds.filter(id => /^\d+$/.test(id))) // bigint IDs only
      for (const u of users || []) userMap[String(u.id)] = u.name || u.email

      // For UUID user_ids, look up via auth.users admin API (skip for now — use email prefix)
      for (const id of userIds) {
        if (!/^\d+$/.test(id) && !userMap[id]) {
          userMap[id] = 'Customer'
        }
      }
    }

    return NextResponse.json((data || []).map((o: any) => ({
      id: String(o.id), code: `#${o.id}`,
      customer: userMap[String(o.user_id)] || 'Customer',
      customerEmail: '',
      vendor: o.store?.name || '—',
      deliveryMan: o.delivery_man ? `${o.delivery_man.f_name || ''} ${o.delivery_man.l_name || ''}`.trim() : undefined,
      items: o.order_details?.length || 0,
      total: Number(o.order_amount),
      subtotal: Number(o.order_amount),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      status: o.order_status,
      address: o.delivery_address,
      time: o.created_at,
    })))
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
