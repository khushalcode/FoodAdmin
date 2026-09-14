import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const storeId = new URL(req.url).searchParams.get('vendorId')
    if (!storeId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const last7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Store (the storefront) — real schema uses stores table
    const { data: store, error: sErr } = await adminSupabase
      .from('stores')
      .select(`
        id, name, slug, phone, email, address, lat, lng,
        rating, rating_count, active, status, vendor_id,
        minimum_order, comission,
        vendor:vendors!stores_vendor_id_fkey(name, email)
      `)
      .eq('id', storeId)
      .single()

    if (sErr || !store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const vendorIdForWithdrawals = (store as any).vendor_id

    const [
      { count: totalOrders },
      { data: todayOrderList },
      { data: last7Orders },
      { data: last30Orders },
      { count: pendingOrders },
      { count: confirmedOrders },
      { count: deliveredOrders },
      { count: canceledOrders },
      { count: totalProducts },
      { data: lowStockRaw },
      { data: recentOrdersRaw },
      { data: topProductsRaw },
      { data: recentReviewsRaw },
      { data: pendingWithdrawalsRaw },
      { data: completedWithdrawalsRaw },
    ] = await Promise.all([
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
      adminSupabase.from('orders').select('order_amount, order_status, created_at, order_details(id)').eq('store_id', storeId).gte('created_at', todayStart),
      adminSupabase.from('orders').select('order_amount, order_status, created_at').eq('store_id', storeId).gte('created_at', last7Start),
      adminSupabase.from('orders').select('order_amount, order_status').eq('store_id', storeId).gte('created_at', last30Start),
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', storeId).eq('order_status', 'pending'),
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', storeId).eq('order_status', 'confirmed'),
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', storeId).eq('order_status', 'delivered'),
      adminSupabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', storeId).eq('order_status', 'canceled'),
      adminSupabase.from('items').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
      adminSupabase.from('items').select('id, name, stock, price').eq('store_id', storeId).lt('stock', 15).limit(5),
      adminSupabase.from('orders').select('id, order_amount, order_status, payment_status, created_at, order_details(id)').eq('store_id', storeId).order('created_at', { ascending: false }).limit(8),
      adminSupabase.from('items').select('id, name, image, order_count, avg_rating, price, stock').eq('store_id', storeId).order('order_count', { ascending: false }).limit(5),
      adminSupabase.from('reviews').select('id, user_id, rating, comment, reply, created_at').eq('store_id', storeId).order('created_at', { ascending: false }).limit(5),
      adminSupabase.from('withdraw_requests').select('amount').eq('vendor_id', vendorIdForWithdrawals).eq('status', 'pending'),
      adminSupabase.from('withdraw_requests').select('amount').eq('vendor_id', vendorIdForWithdrawals).eq('status', 'paid'),
    ])

    const todayList = todayOrderList || []
    const last7List = last7Orders || []
    const last30List = last30Orders || []

    const todayRevenue = todayList.filter((o: any) => o.order_status === 'delivered').reduce((s: number, o: any) => s + Number(o.order_amount || 0), 0)
    const last7Revenue = last7List.filter((o: any) => o.order_status === 'delivered').reduce((s: number, o: any) => s + Number(o.order_amount || 0), 0)
    const last30Revenue = last30List.filter((o: any) => o.order_status === 'delivered').reduce((s: number, o: any) => s + Number(o.order_amount || 0), 0)
    const avgOrderValue = totalOrders ? last30Revenue / (last30List.length || 1) : 0
    const pendingWithdrawalTotal = (pendingWithdrawalsRaw || []).reduce((s: number, w: any) => s + Number(w.amount), 0)
    const completedWithdrawalTotal = (completedWithdrawalsRaw || []).reduce((s: number, w: any) => s + Number(w.amount), 0)

    const weeklySeries: { label: string; value: number; orders: number }[] = []
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    for (let d = 6; d >= 0; d--) {
      const dayStart = new Date(now.getTime() - d * 24 * 60 * 60 * 1000)
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      const ordersInDay = last7List.filter((o: any) => {
        const t = new Date(o.created_at).getTime()
        return t >= dayStart.getTime() && t < dayEnd.getTime()
      })
      const rev = ordersInDay.filter((o: any) => o.order_status === 'delivered').reduce((s: number, o: any) => s + Number(o.order_amount || 0), 0)
      weeklySeries.push({ label: days[dayStart.getDay()], value: Math.round(rev), orders: ordersInDay.length })
    }

    const s: any = store
    return NextResponse.json({
      vendor: {
        id: String(s.id),
        storeName: s.name,
        slug: s.slug || String(s.id),
        description: '',
        phone: s.phone,
        email: s.email || s.vendor?.email,
        address: s.address,
        city: '',
        rating: Number(s.rating) || 0,
        reviewCount: s.rating_count || 0,
        isVerified: Boolean(s.active),
        openTime: '09:00',
        closeTime: '22:00',
        commissionPct: Number(s.comission) || 0,
        balance: 0,
        owner: s.vendor?.name || '',
        ownerEmail: s.vendor?.email || '',
      },
      kpis: {
        todayRevenue,
        last7Revenue,
        last30Revenue,
        todayOrders: todayList.length,
        totalOrders: totalOrders || 0,
        avgOrderValue,
        pendingOrders: pendingOrders || 0,
        confirmedOrders: confirmedOrders || 0,
        deliveredOrders: deliveredOrders || 0,
        canceledOrders: canceledOrders || 0,
        totalProducts: totalProducts || 0,
        lowStockCount: (lowStockRaw || []).length,
        balance: 0,
        pendingWithdrawals: pendingWithdrawalTotal,
        completedWithdrawals: completedWithdrawalTotal,
        rating: Number(s.rating) || 0,
      },
      charts: { weeklySeries },
      recentOrders: (recentOrdersRaw || []).map((o: any) => ({
        id: String(o.id), code: `#${o.id}`, customer: 'Customer',
        items: o.order_details?.length || 0, total: Number(o.order_amount),
        status: o.order_status, paymentStatus: o.payment_status, time: o.created_at,
      })),
      topProducts: (topProductsRaw || []).map((p: any) => ({
        id: String(p.id), name: p.name, image: p.image, sold: p.order_count || 0,
        rating: Number(p.avg_rating) || 0, price: Number(p.price), stock: p.stock || 0, isFeatured: false,
      })),
      lowStock: (lowStockRaw || []).map((p: any) => ({ id: String(p.id), name: p.name, stock: p.stock, price: Number(p.price) })),
      recentReviews: (recentReviewsRaw || []).map((r: any) => ({
        id: String(r.id), customer: `User ${String(r.user_id).slice(0, 6)}`, rating: r.rating,
        comment: r.comment, reply: r.reply, time: r.created_at,
      })),
    })
  } catch (e: any) {
    console.error('Vendor dashboard error:', e)
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
