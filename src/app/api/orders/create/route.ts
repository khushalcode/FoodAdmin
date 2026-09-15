import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// POST /api/orders/create
//
// Admin-side order creation. Triggers the full realtime flow:
//   1. Inserts orders row (status='pending' by default, or 'confirmed' if delivery man assigned)
//   2. Inserts order_details rows for each line item (with item_details JSON snapshot)
//   3. Inserts user_notification for the customer → triggers Supabase Realtime
//   4. If deliveryManId provided: inserts a notification for the delivery man too
//   5. Returns the new order id so the admin UI can navigate/refresh
//
// This endpoint is also used by the CI/CD smoke test to verify end-to-end flow.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerId, storeId, items, paymentMethod, orderType, deliveryAddress, dmTips, deliveryManId, couponCode, scheduleAt } = body

    if (!customerId || !storeId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'customerId, storeId, items[] required' }, { status: 400 })
    }

    // Validate each item and compute totals
    const itemIds = items.map((i: any) => Number(i.itemId)).filter(Boolean)
    if (itemIds.length === 0) return NextResponse.json({ error: 'no valid items' }, { status: 400 })

    const { data: dbItems, error: itemsErr } = await adminSupabase
      .from('items')
      .select('id, name, image, price, store_id, tax, tax_type, discount, discount_type')
      .in('id', itemIds)
    if (itemsErr) throw itemsErr

    const itemMap: Record<string, any> = {}
    for (const it of dbItems || []) itemMap[String(it.id)] = it

    let subtotal = 0
    const orderDetails: any[] = []
    for (const line of items) {
      const dbItem = itemMap[String(line.itemId)]
      if (!dbItem) continue
      const qty = Number(line.quantity) || 1
      const linePrice = Number(dbItem.price) * qty
      subtotal += linePrice
      orderDetails.push({
        item_id: dbItem.id,
        price: Number(dbItem.price),
        quantity: qty,
        item_details: { name: dbItem.name, image_url: dbItem.image },
        tax_amount: 0,
        discount_on_item: 0,
        discount_type: 'amount',
        total_add_on_price: 0,
      })
    }

    // Apply coupon if provided
    let couponDiscountAmount = 0
    if (couponCode) {
      const { data: coupon } = await adminSupabase
        .from('coupons')
        .select('id, code, discount_type, discount, min_purchase, max_discount, status, expire_date, total_uses')
        .eq('code', couponCode.toUpperCase())
        .eq('status', true)
        .single()
      if (coupon && new Date(coupon.expire_date) > new Date() && subtotal >= Number(coupon.min_purchase || 0)) {
        couponDiscountAmount = coupon.discount_type === 'percentage'
          ? (subtotal * Number(coupon.discount)) / 100
          : Number(coupon.discount)
        if (coupon.max_discount && couponDiscountAmount > Number(coupon.max_discount)) {
          couponDiscountAmount = Number(coupon.max_discount)
        }
        await adminSupabase.from('coupons').update({ total_uses: (coupon.total_uses || 0) + 1 }).eq('id', coupon.id)
      }
    }

    const deliveryFee = orderType === 'delivery' ? 2.5 : 0
    const total = subtotal - couponDiscountAmount + deliveryFee + Number(dmTips || 0)
    const initialStatus = deliveryManId ? 'confirmed' : 'pending'

    // Insert orders row
    const { data: order, error: orderErr } = await adminSupabase
      .from('orders')
      .insert({
        user_id: String(customerId),
        store_id: Number(storeId),
        order_status: initialStatus,
        payment_status: 'unpaid',
        payment_method: paymentMethod || 'cash_on_delivery',
        order_amount: total,
        order_type: orderType || 'delivery',
        delivery_address: deliveryAddress || null,
        coupon_code: couponCode || null,
        coupon_discount_amount: couponDiscountAmount,
        dm_tips: Number(dmTips || 0),
        distance: 5.0,
        additional_charge: 0,
        is_dm_assign: deliveryManId ? 1 : 0,
        delivery_man_id: deliveryManId ? Number(deliveryManId) : null,
        schedule_at: scheduleAt || null,
        confirmed: initialStatus === 'confirmed' ? 1 : 0,
        zone_id: 1,
        module_id: 1,
      })
      .select('id')
      .single()

    if (orderErr) throw orderErr
    const orderId = order.id

    // Insert order_details with the order_id
    for (const od of orderDetails) od.order_id = orderId
    const { error: odErr } = await adminSupabase.from('order_details').insert(orderDetails)
    if (odErr) throw odErr

    // Insert notifications (triggers Realtime to customer + delivery man)
    const notifications: any[] = [{
      user_id: String(customerId),
      title: 'Order Placed',
      description: `Your order #${orderId} has been placed successfully. Total: $${total.toFixed(2)}.`,
      notification_type: 'order',
      data: { order_id: String(orderId), status: initialStatus, total },
      is_seen: false,
    }]
    if (deliveryManId) {
      notifications.push({
        user_id: String(deliveryManId),
        title: 'New Order Assigned',
        description: `Order #${orderId} has been assigned to you. Please accept and proceed.`,
        notification_type: 'order',
        data: { order_id: String(orderId), status: 'confirmed', store_id: storeId },
        is_seen: false,
      })
    }
    await adminSupabase.from('user_notifications').insert(notifications)

    // Best-effort increment store.order_count
    try {
      const { data: storeRow } = await adminSupabase.from('stores').select('order_count').eq('id', storeId).single()
      await adminSupabase
        .from('stores')
        .update({ order_count: (storeRow?.order_count || 0) + 1 })
        .eq('id', storeId)
    } catch {}

    return NextResponse.json({
      ok: true,
      orderId: String(orderId),
      total,
      subtotal,
      couponDiscount: couponDiscountAmount,
      deliveryFee,
      status: initialStatus,
      notificationsInserted: notifications.length,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
