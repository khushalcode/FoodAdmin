import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/track-delivery?deliveryManId=&orderId=
// Returns live tracking info for a delivery man and their active orders.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const deliveryManId = url.searchParams.get('deliveryManId')
    const orderId = url.searchParams.get('orderId')

    if (!deliveryManId) {
      return NextResponse.json({ error: 'deliveryManId required' }, { status: 400 })
    }

    // 1. Fetch the delivery man profile (defensive — table may be missing columns)
    let deliveryMan: any = null
    try {
      const { data: dm, error: dmErr } = await adminSupabase
        .from('delivery_men')
        .select('id, f_name, l_name, phone, image, current_orders, active, status, type, is_delivery, is_ride')
        .eq('id', deliveryManId)
        .limit(1)
        .maybeSingle()
      if (dmErr) throw dmErr
      if (dm) {
        deliveryMan = {
          id: String(dm.id),
          name: `${dm.f_name || ''} ${dm.l_name || ''}`.trim() || 'Delivery Man',
          phone: dm.phone || '',
          image: dm.image || null,
          currentOrders: dm.current_orders ?? 0,
          active: dm.active ?? false,
          status: dm.status,
          type: dm.type,
        }
      }
    } catch {
      deliveryMan = null
    }

    // 2. Fetch active orders for this delivery man.
    //    Status set covers the in-flight stages per spec.
    let orders: any[] = []
    try {
      let q = adminSupabase
        .from('orders')
        .select('id, order_status, user_id, store_id, delivery_address, delivery_address_id, created_at')
        .eq('delivery_man_id', deliveryManId)
        .in('order_status', ['confirmed', 'processing', 'handover', 'picked_up'])
        .order('created_at', { ascending: false })

      if (orderId) q = q.eq('id', orderId)

      const { data: orderRows, error: ordersErr } = await q.limit(50)
      if (ordersErr) throw ordersErr

      orders = orderRows || []
    } catch {
      orders = []
    }

    // 3. Resolve customer names, store names, and lat/lng (via customer_addresses).
    const userIds = [...new Set(orders.map((o: any) => String(o.user_id)).filter(Boolean))]
      .filter((id) => /^\d+$/.test(id))
    const storeIds = [...new Set(orders.map((o: any) => o.store_id).filter(Boolean))]
    const addressIds = [...new Set(orders.map((o: any) => o.delivery_address_id).filter(Boolean))]

    let userMap: Record<string, string> = {}
    if (userIds.length > 0) {
      try {
        const { data: users } = await adminSupabase
          .from('users')
          .select('id, name, email')
          .in('id', userIds)
        for (const u of users || []) userMap[String(u.id)] = u.name || u.email || 'Customer'
      } catch {
        // ignore — map stays empty
      }
    }

    let storeMap: Record<string, string> = {}
    if (storeIds.length > 0) {
      try {
        const { data: stores } = await adminSupabase
          .from('stores')
          .select('id, name')
          .in('id', storeIds)
        for (const s of stores || []) storeMap[String(s.id)] = s.name || 'Store'
      } catch {
        // ignore
      }
    }

    let addressMap: Record<string, { lat?: string | null; lng?: string | null }> = {}
    if (addressIds.length > 0) {
      try {
        const { data: addrs } = await adminSupabase
          .from('customer_addresses')
          .select('id, latitude, longitude, lat, lng')
          .in('id', addressIds)
        for (const a of addrs || []) {
          addressMap[String(a.id)] = {
            lat: a.lat ?? a.latitude ?? null,
            lng: a.lng ?? a.longitude ?? null,
          }
        }
      } catch {
        // ignore
      }
    }

    const mappedOrders = orders.map((o: any) => {
      const coords = o.delivery_address_id ? addressMap[String(o.delivery_address_id)] : undefined
      return {
        id: String(o.id),
        status: o.order_status,
        customerName: (o.user_id && userMap[String(o.user_id)]) || 'Customer',
        storeName: (o.store_id && storeMap[String(o.store_id)]) || 'Store',
        deliveryAddress: o.delivery_address || null,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      }
    })

    return NextResponse.json({
      deliveryMan,
      orders: mappedOrders,
    })
  } catch (e: any) {
    // Defensive: return an empty shell so the UI doesn't crash.
    return NextResponse.json({ deliveryMan: null, orders: [] })
  }
}
