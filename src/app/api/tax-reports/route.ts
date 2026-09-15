import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/tax-reports?period=today|7d|30d|all
// Returns: totalTaxCollected, taxBreakdown: [{date, taxAmount, orderCount}],
// byStore: [{storeId, storeName, taxCollected}]
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const period = url.searchParams.get('period') || 'all'

    const now = new Date()
    let since: string | undefined
    if (period === 'today') {
      since = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    } else if (period === '7d') {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    } else if (period === '30d') {
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    let orderRows: any[] = []
    try {
      let q = adminSupabase
        .from('orders')
        .select(`
          id, order_amount, order_status, tax_percentage, store_id, created_at,
          store:stores!orders_store_id_fkey(id, name)
        `)
      if (since) q = q.gte('created_at', since)
      const { data } = await q.order('created_at', { ascending: false }).limit(5000)
      orderRows = data || []
    } catch {
      orderRows = []
    }

    const delivered = orderRows.filter((o) => o.order_status === 'delivered')
    const rows = delivered.length ? delivered : orderRows

    // tax per order = order_amount * tax_percentage / 100 (if tax_percentage > 0)
    const taxOf = (o: any) => {
      const pct = Number(o.tax_percentage || 0)
      return pct ? Number(o.order_amount || 0) * pct / 100 : 0
    }

    const totalTaxCollected = rows.reduce((s, o) => s + taxOf(o), 0)

    // by day
    const dayMap = new Map<string, { taxAmount: number; orderCount: number }>()
    for (const o of rows) {
      const key = new Date(o.created_at).toISOString().slice(0, 10)
      const cur = dayMap.get(key) || { taxAmount: 0, orderCount: 0 }
      cur.taxAmount += taxOf(o)
      cur.orderCount += 1
      dayMap.set(key, cur)
    }
    const taxBreakdown = [...dayMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({
        date,
        taxAmount: Number(v.taxAmount.toFixed(2)),
        orderCount: v.orderCount,
      }))

    // by store
    const storeMap = new Map<number, { storeId: number; storeName: string; taxCollected: number }>()
    for (const o of rows) {
      const sid = o.store_id
      if (!sid) continue
      const cur = storeMap.get(sid) || {
        storeId: sid,
        storeName: o.store?.name || `Store ${sid}`,
        taxCollected: 0,
      }
      cur.taxCollected += taxOf(o)
      storeMap.set(sid, cur)
    }
    const byStore = [...storeMap.values()]
      .sort((a, b) => b.taxCollected - a.taxCollected)
      .map((s) => ({
        storeId: String(s.storeId),
        storeName: s.storeName,
        taxCollected: Number(s.taxCollected.toFixed(2)),
      }))

    return NextResponse.json({
      totalTaxCollected: Number(totalTaxCollected.toFixed(2)),
      taxBreakdown,
      byStore,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
