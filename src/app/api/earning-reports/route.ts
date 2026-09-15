import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/earning-reports?period=today|7d|30d|all&storeId=
// Returns: totalRevenue, platformCommission, vendorPayouts, deliveryFees,
// dmTips, taxCollected, netProfit, breakdown: { byDay, byStore }
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const period = url.searchParams.get('period') || 'all'
    const storeId = url.searchParams.get('storeId')

    const now = new Date()
    let since: string | undefined
    if (period === 'today') {
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    } else if (period === '7d') {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    } else if (period === '30d') {
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Defensive order fetch
    let orderRows: any[] = []
    try {
      let q = adminSupabase
        .from('orders')
        .select(`
          id, order_amount, order_status, tax_percentage, dm_tips,
          delivery_type_charge, additional_charge, store_id, created_at,
          store:stores!orders_store_id_fkey(id, name, comission)
        `)
      if (since) q = q.gte('created_at', since)
      if (storeId) q = q.eq('store_id', storeId)
      const { data } = await q.order('created_at', { ascending: false }).limit(5000)
      orderRows = data || []
    } catch {
      orderRows = []
    }

    // Only delivered orders count toward revenue (defensive — fall back to all if no delivered)
    const delivered = orderRows.filter((o) => o.order_status === 'delivered')
    const revenueRows = delivered.length ? delivered : []

    const totalRevenue = revenueRows.reduce((s, o) => s + Number(o.order_amount || 0), 0)

    // Platform commission = sum(order_amount * store.comission / 100)
    let platformCommission = 0
    for (const o of revenueRows) {
      const rate = Number(o.store?.comission || 0)
      platformCommission += Number(o.order_amount || 0) * rate / 100
    }

    const vendorPayouts = Math.max(totalRevenue - platformCommission, 0)
    const deliveryFees = revenueRows.reduce((s, o) => s + Number(o.delivery_type_charge || 0), 0)
    const dmTips = revenueRows.reduce((s, o) => s + Number(o.dm_tips || 0), 0)

    // Tax: use tax_percentage * order_amount / 100 if available; else fallback 0
    const taxCollected = revenueRows.reduce((s, o) => {
      const pct = Number(o.tax_percentage || 0)
      return s + (pct ? Number(o.order_amount || 0) * pct / 100 : 0)
    }, 0)

    const netProfit = platformCommission + deliveryFees - dmTips * 0 + taxCollected * 0 // simplified

    // byDay aggregation
    const dayMap = new Map<string, { revenue: number; orders: number }>()
    for (const o of revenueRows) {
      const d = new Date(o.created_at)
      const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
      const cur = dayMap.get(key) || { revenue: 0, orders: 0 }
      cur.revenue += Number(o.order_amount || 0)
      cur.orders += 1
      dayMap.set(key, cur)
    }
    const byDay = [...dayMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ date, revenue: Number(v.revenue.toFixed(2)), orders: v.orders }))

    // byStore aggregation
    const storeMap = new Map<number, { storeId: number; storeName: string; revenue: number; orders: number }>()
    for (const o of revenueRows) {
      const sid = o.store_id
      if (!sid) continue
      const cur = storeMap.get(sid) || {
        storeId: sid,
        storeName: o.store?.name || `Store ${sid}`,
        revenue: 0,
        orders: 0,
      }
      cur.revenue += Number(o.order_amount || 0)
      cur.orders += 1
      storeMap.set(sid, cur)
    }
    const byStore = [...storeMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .map((s) => ({
        storeId: String(s.storeId),
        storeName: s.storeName,
        revenue: Number(s.revenue.toFixed(2)),
        orders: s.orders,
      }))

    return NextResponse.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      platformCommission: Number(platformCommission.toFixed(2)),
      vendorPayouts: Number(vendorPayouts.toFixed(2)),
      deliveryFees: Number(deliveryFees.toFixed(2)),
      dmTips: Number(dmTips.toFixed(2)),
      taxCollected: Number(taxCollected.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      breakdown: { byDay, byStore },
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
