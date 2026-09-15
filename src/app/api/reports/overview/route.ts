import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/reports/overview — dashboard overview stats
// Returns: totalRevenue, totalOrders, totalCustomers, totalVendors, todayRevenue,
// todayOrders, weekRevenue, monthRevenue, growthRate, topStores[], orderStatusCounts{},
// recentOrders[]
export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const prevMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()

    // Counts + revenue windows in parallel (defensive — each returns count: 0 on error)
    const safeCount = async (table: string, filter?: [string, any]) => {
      try {
        let q = adminSupabase.from(table).select('id', { count: 'exact', head: true })
        if (filter) q = q.eq(filter[0], filter[1])
        const { count } = await q
        return count || 0
      } catch {
        return 0
      }
    }

    const [
      totalCustomers,
      totalVendors,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      canceledOrders,
    ] = await Promise.all([
      safeCount('users'),
      safeCount('vendors'),
      safeCount('orders'),
      safeCount('orders', ['order_status', 'pending']),
      safeCount('orders', ['order_status', 'confirmed']),
      safeCount('orders', ['order_status', 'delivered']),
      safeCount('orders', ['order_status', 'canceled']),
    ])

    // Fetch order rows for revenue windows
    const safeOrders = async (since?: string) => {
      try {
        let q = adminSupabase
          .from('orders')
          .select('order_amount, order_status, store_id, created_at')
        if (since) q = q.gte('created_at', since)
        const { data } = await q
        return data || []
      } catch {
        return []
      }
    }

    const [todayRows, weekRows, monthRows, prevMonthRows, allRows] = await Promise.all([
      safeOrders(todayStart),
      safeOrders(weekStart),
      safeOrders(monthStart),
      safeOrders(prevMonthStart),
      safeOrders(),
    ])

    const revenueOf = (rows: any[]) =>
      rows
        .filter((o) => o.order_status === 'delivered')
        .reduce((s, o) => s + Number(o.order_amount || 0), 0)

    const todayRevenue = revenueOf(todayRows)
    const weekRevenue = revenueOf(weekRows)
    const monthRevenue = revenueOf(monthRows)
    const prevMonthRevenue = revenueOf(prevMonthRows.filter((o) => o.created_at < monthStart))
    const totalRevenue = revenueOf(allRows)

    const growthRate = prevMonthRevenue > 0
      ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
      : monthRevenue > 0 ? 100 : 0

    // Top stores by delivered revenue (last 30d)
    const storeRevenueMap = new Map<number, { revenue: number; orders: number }>()
    for (const o of monthRows) {
      if (o.order_status !== 'delivered' || !o.store_id) continue
      const cur = storeRevenueMap.get(o.store_id) || { revenue: 0, orders: 0 }
      cur.revenue += Number(o.order_amount || 0)
      cur.orders += 1
      storeRevenueMap.set(o.store_id, cur)
    }
    const topStoreIds = [...storeRevenueMap.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([id]) => id)

    let topStores: any[] = []
    if (topStoreIds.length) {
      try {
        const { data: storeRows } = await adminSupabase
          .from('stores')
          .select('id, name, logo')
          .in('id', topStoreIds)
        topStores = (storeRows || []).map((s: any) => ({
          storeId: String(s.id),
          storeName: s.name,
          logo: s.logo,
          revenue: Number(storeRevenueMap.get(s.id)?.revenue || 0),
          orders: Number(storeRevenueMap.get(s.id)?.orders || 0),
        })).sort((a, b) => b.revenue - a.revenue)
      } catch {}
    }

    // Recent orders
    let recentOrders: any[] = []
    try {
      const { data: recentRaw } = await adminSupabase
        .from('orders')
        .select(`
          id, order_amount, order_status, payment_status, created_at,
          store:stores!orders_store_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)
      recentOrders = (recentRaw || []).map((o: any) => ({
        id: String(o.id),
        code: `#${o.id}`,
        amount: Number(o.order_amount || 0),
        status: o.order_status,
        paymentStatus: o.payment_status,
        store: o.store?.name || '—',
        createdAt: o.created_at,
      }))
    } catch {}

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalVendors,
      todayRevenue,
      todayOrders: todayRows.length,
      weekRevenue,
      monthRevenue,
      growthRate: Number(growthRate.toFixed(2)),
      topStores,
      orderStatusCounts: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        delivered: deliveredOrders,
        canceled: canceledOrders,
      },
      recentOrders,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
