import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const last7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Counts — run in parallel (real schema: stores, items, user_profiles, orders)
    const [
      { count: totalCustomers },
      { count: totalVendors },
      { count: totalProducts },
      { count: totalOrders },
      { count: totalCategories },
      { count: totalDeliveryMen },
      { count: pendingOrders },
      { count: confirmedOrders },
      { count: deliveredOrders },
      { count: canceledOrders },
    ] = await Promise.all([
      adminSupabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      adminSupabase.from('stores').select('id', { count: 'exact', head: true }),
      adminSupabase.from('items').select('id', { count: 'exact', head: true }),
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }),
      adminSupabase.from('categories').select('id', { count: 'exact', head: true }),
      adminSupabase.from('delivery_men').select('id', { count: 'exact', head: true }),
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'pending'),
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'confirmed'),
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'delivered'),
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'canceled'),
    ])

    // Fetch order data for revenue (orders.order_amount, orders.order_status, orders.created_at)
    const [
      { data: todayOrders },
      { data: last7Orders },
      { data: last30Orders },
    ] = await Promise.all([
      adminSupabase.from('orders').select('order_amount, order_status, created_at').gte('created_at', todayStart),
      adminSupabase.from('orders').select('order_amount, order_status, created_at').gte('created_at', last7Start),
      adminSupabase.from('orders').select('order_amount, order_status, created_at').gte('created_at', last30Start),
    ])

    const todayOrdersList = todayOrders || []
    const last7List = last7Orders || []
    const last30List = last30Orders || []

    const todayRevenue = todayOrdersList.filter((o: any) => o.order_status === 'delivered').reduce((s: number, o: any) => s + Number(o.order_amount || 0), 0)
    const todayOrderCount = todayOrdersList.length
    const avgOrderValue = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0
    const last7Revenue = last7List.filter((o: any) => o.order_status === 'delivered').reduce((s: number, o: any) => s + Number(o.order_amount || 0), 0)
    const last30Revenue = last30List.filter((o: any) => o.order_status === 'delivered').reduce((s: number, o: any) => s + Number(o.order_amount || 0), 0)

    // Hourly series (last 24h)
    const hourlySeries: { label: string; value: number }[] = []
    for (let h = 23; h >= 0; h--) {
      const hourStart = new Date(now.getTime() - h * 60 * 60 * 1000)
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
      const ordersInHour = todayOrdersList.filter((o: any) => {
        const t = new Date(o.created_at).getTime()
        return t >= hourStart.getTime() && t < hourEnd.getTime() && o.order_status === 'delivered'
      })
      const rev = ordersInHour.reduce((s: number, o: any) => s + Number(o.order_amount || 0), 0)
      hourlySeries.push({ label: hourStart.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }), value: Math.round(rev) })
    }

    // Weekly series (last 7 days)
    const weeklySeries: { label: string; value: number }[] = []
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let d = 6; d >= 0; d--) {
      const dayStart = new Date(now.getTime() - d * 24 * 60 * 60 * 1000)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      const ordersInDay = last7List.filter((o: any) => {
        const t = new Date(o.created_at).getTime()
        return t >= dayStart.getTime() && t < dayEnd.getTime() && o.order_status === 'delivered'
      })
      const rev = ordersInDay.reduce((s: number, o: any) => s + Number(o.order_amount || 0), 0)
      weeklySeries.push({ label: days[dayStart.getDay()], value: Math.round(rev) })
    }

    const statusBreakdown = [
      { name: 'Pending', value: pendingOrders || 0, color: '#F59E0B' },
      { name: 'Confirmed', value: confirmedOrders || 0, color: '#3B82F6' },
      { name: 'Delivered', value: deliveredOrders || 0, color: '#10B981' },
      { name: 'Canceled', value: canceledOrders || 0, color: '#EF4444' },
    ]

    // Recent orders — real schema: orders + stores + order_details (line items)
    const { data: recentOrdersRaw } = await adminSupabase
      .from('orders')
      .select(`
        id, order_amount, order_status, payment_status, created_at,
        store:stores!orders_store_id_fkey(name),
        order_details(id)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    const recentOrders = (recentOrdersRaw || []).map((o: any) => ({
      id: String(o.id),
      code: `#${o.id}`,
      customer: 'Customer', // user_id is a varchar that may be bigint or uuid — we'll skip the join for simplicity
      vendor: o.store?.name || '—',
      total: Number(o.order_amount),
      status: o.order_status,
      paymentStatus: o.payment_status,
      items: o.order_details?.length || 0,
      time: o.created_at,
    }))

    // Top products — real schema: items table with order_count + avg_rating
    const { data: topProductsRaw } = await adminSupabase
      .from('items')
      .select('id, name, image, order_count, avg_rating, price, stock, store:stores!items_store_id_fkey(name)')
      .eq('status', true)
      .order('order_count', { ascending: false })
      .limit(5)

    const topProducts = (topProductsRaw || []).map((p: any) => ({
      id: String(p.id), name: p.name, image: p.image, sold: p.order_count || 0,
      rating: Number(p.avg_rating) || 0, price: Number(p.price), vendor: p.store?.name || '—', stock: p.stock || 0,
    }))

    // Low stock
    const { data: lowStockRaw } = await adminSupabase
      .from('items')
      .select('id, name, stock, store:stores!items_store_id_fkey(name)')
      .lt('stock', 25)
      .eq('status', true)
      .limit(5)

    const lowStock = (lowStockRaw || []).map((p: any) => ({
      id: String(p.id), name: p.name, stock: p.stock, vendor: p.store?.name,
    }))

    // Recent activities — use a placeholder since the real schema doesn't have an activity_logs table
    // We'll synthesize from recent orders
    const recentActivities = (recentOrdersRaw || []).slice(0, 8).map((o: any, i: number) => ({
      id: `act-${o.id}`,
      message: `Order #${o.id} ${o.order_status} — $${Number(o.order_amount).toFixed(2)}`,
      type: o.order_status === 'delivered' ? 'order' : o.order_status === 'canceled' ? 'system' : 'order',
      time: o.created_at,
    }))

    // New customers (recent users)
    const { data: newCustomersRaw } = await adminSupabase
      .from('users')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    const newCustomers = (newCustomersRaw || []).map((c: any) => ({
      id: String(c.id), name: c.name || c.email, email: c.email, joinedAt: c.created_at,
    }))

    return NextResponse.json({
      kpis: {
        totalRevenue: last30Revenue,
        todayRevenue,
        totalOrders: totalOrders || 0,
        todayOrders: todayOrderCount,
        totalCustomers: totalCustomers || 0,
        totalVendors: totalVendors || 0,
        totalProducts: totalProducts || 0,
        totalCategories: totalCategories || 0,
        totalDeliveryMen: totalDeliveryMen || 0,
        avgOrderValue,
        last7Revenue,
        pendingOrders: pendingOrders || 0,
        confirmedOrders: confirmedOrders || 0,
        deliveredOrders: deliveredOrders || 0,
        canceledOrders: canceledOrders || 0,
        conversionRate: totalOrders && deliveredOrders ? (deliveredOrders / totalOrders) * 100 : 0,
      },
      charts: { hourlySeries, weeklySeries, statusBreakdown },
      recentOrders,
      topProducts,
      lowStock,
      newCustomers,
      recentActivities,
    })
  } catch (e: any) {
    console.error('Dashboard stats error:', e)
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
