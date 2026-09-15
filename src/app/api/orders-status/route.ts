import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// PATCH /api/orders-status — update an order's status (and optionally assign a delivery man)
// This is the CRITICAL endpoint in the order flow:
//   customer places order → vendor accepts → admin/vendor assigns delivery man →
//   delivery picks up → delivered
//
// Every status change:
//   1. Updates the orders row
//   2. Flips the matching boolean column (confirmed/processing/handover/picked_up/delivered/canceled)
//   3. Inserts a user_notification row → triggers Supabase Realtime to customer + delivery man
//   4. Returns the new state for the admin UI
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { orderId, status, deliveryManId, cancellationReason, note } = body
    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status required' }, { status: 400 })
    }

    const allowedStatuses = ['pending', 'confirmed', 'processing', 'handover', 'picked_up', 'delivered', 'canceled']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 })
    }

    // Fetch the existing order (so we know customer_id + store_id)
    const { data: order, error: fetchErr } = await adminSupabase
      .from('orders')
      .select('id, user_id, store_id, delivery_man_id, order_status, order_amount')
      .eq('id', orderId)
      .single()
    if (fetchErr) throw fetchErr
    if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 })

    const patch: Record<string, any> = {
      order_status: status,
      updated_at: new Date().toISOString(),
    }
    if (deliveryManId !== undefined) {
      patch.delivery_man_id = deliveryManId
      patch.is_dm_assign = 1
    }
    if (cancellationReason) patch.cancellation_reason = cancellationReason

    // Flip the matching boolean column (matches vendor app's logic)
    if (status === 'confirmed') patch.confirmed = 1
    if (status === 'processing') patch.processing = 1
    if (status === 'handover') patch.handover = 1
    if (status === 'picked_up') patch.picked_up = 1
    if (status === 'delivered') patch.delivered = 1
    if (status === 'canceled') patch.canceled = 1

    const { error: updErr } = await adminSupabase.from('orders').update(patch).eq('id', orderId)
    if (updErr) throw updErr

    // Insert notifications for everyone who needs to know about this change
    const titleMap: Record<string, string> = {
      confirmed: 'Order Confirmed',
      processing: 'Order is being prepared',
      handover: 'Order is ready for handover',
      picked_up: 'Delivery partner picked up your order',
      delivered: 'Order Delivered',
      canceled: 'Order Canceled',
    }
    const descMap: Record<string, string> = {
      confirmed: `Your order #${orderId} has been confirmed by the restaurant.`,
      processing: `The restaurant is preparing your order #${orderId}.`,
      handover: `Order #${orderId} is ready and waiting for the delivery partner.`,
      picked_up: `Your order #${orderId} is on the way!`,
      delivered: `Your order #${orderId} has been delivered. Enjoy!`,
      canceled: `Your order #${orderId} has been canceled. Reason: ${cancellationReason || 'N/A'}`,
    }

    const notifications: any[] = []
    if (order.user_id) {
      notifications.push({
        user_id: String(order.user_id),
        title: titleMap[status],
        description: descMap[status],
        notification_type: 'order',
        data: { order_id: String(orderId), status, note },
        is_seen: false,
      })
    }
    if (deliveryManId || order.delivery_man_id) {
      const dmId = deliveryManId || order.delivery_man_id
      notifications.push({
        user_id: String(dmId),
        title: `Order #${orderId} ${status}`,
        description: `Order #${orderId} status updated to ${status}. ${note || ''}`.trim(),
        notification_type: 'order',
        data: { order_id: String(orderId), status, store_id: order.store_id },
        is_seen: false,
      })
    }

    if (notifications.length > 0) {
      await adminSupabase.from('user_notifications').insert(notifications)
    }

    return NextResponse.json({
      ok: true,
      orderId: String(orderId),
      status,
      deliveryManId: patch.delivery_man_id || order.delivery_man_id,
      notificationsInserted: notifications.length,
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', detail: e.message }, { status: 500 })
  }
}
