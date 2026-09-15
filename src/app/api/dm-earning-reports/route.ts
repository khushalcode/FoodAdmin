import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/dm-earning-reports?period=today|7d|30d|all&deliveryManId=
// Returns: totalEarnings, totalDeliveries, avgEarningPerDelivery,
// breakdown: [{deliveryManId, name, earnings, deliveries}]
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const period = url.searchParams.get('period') || 'all'
    const deliveryManId = url.searchParams.get('deliveryManId')

    const now = new Date()
    let since: string | undefined
    if (period === 'today') {
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    } else if (period === '7d') {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    } else if (period === '30d') {
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Defensive: fetch delivered orders with delivery_man_id set
    let orders: any[] = []
    try {
      let q = adminSupabase
        .from('orders')
        .select(`
          id, order_amount, dm_tips, delivery_type_charge, delivery_man_id,
          order_status, created_at
        `)
        .eq('order_status', 'delivered')
        .not('delivery_man_id', 'is', null)
      if (since) q = q.gte('created_at', since)
      if (deliveryManId) q = q.eq('delivery_man_id', deliveryManId)
      const { data } = await q.limit(5000)
      orders = data || []
    } catch {
      orders = []
    }

    // Aggregate earnings per delivery man (dm_tips + delivery_type_charge as earnings proxy)
    const dmMap = new Map<number, { deliveryManId: number; name: string; earnings: number; deliveries: number }>()

    // Fetch delivery man names in one shot
    const dmIds = [...new Set(orders.map((o) => Number(o.delivery_man_id)).filter(Boolean))]
    const dmNameMap = new Map<number, string>()
    if (dmIds.length) {
      try {
        const { data: dmRows } = await adminSupabase
          .from('delivery_men')
          .select('id, f_name, l_name')
          .in('id', dmIds)
        for (const d of dmRows || []) {
          dmNameMap.set(Number(d.id), `${d.f_name || ''} ${d.l_name || ''}`.trim() || `DM ${d.id}`)
        }
      } catch {}
    }

    for (const o of orders) {
      const dmId = Number(o.delivery_man_id)
      if (!dmId) continue
      const earning = Number(o.dm_tips || 0) + Number(o.delivery_type_charge || 0)
      const cur = dmMap.get(dmId) || {
        deliveryManId: dmId,
        name: dmNameMap.get(dmId) || `DM ${dmId}`,
        earnings: 0,
        deliveries: 0,
      }
      cur.earnings += earning
      cur.deliveries += 1
      dmMap.set(dmId, cur)
    }

    const breakdown = [...dmMap.values()]
      .sort((a, b) => b.earnings - a.earnings)
      .map((d) => ({
        deliveryManId: String(d.deliveryManId),
        name: d.name,
        earnings: Number(d.earnings.toFixed(2)),
        deliveries: d.deliveries,
      }))

    const totalEarnings = breakdown.reduce((s, d) => s + d.earnings, 0)
    const totalDeliveries = breakdown.reduce((s, d) => s + d.deliveries, 0)
    const avgEarningPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0

    return NextResponse.json({
      totalEarnings: Number(totalEarnings.toFixed(2)),
      totalDeliveries,
      avgEarningPerDelivery: Number(avgEarningPerDelivery.toFixed(2)),
      breakdown,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
