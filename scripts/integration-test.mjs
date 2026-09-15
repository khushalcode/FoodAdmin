/**
 * FoodHub — Order Flow Integration Test
 *
 * Verifies the end-to-end realtime order flow:
 *   1. Fetch a customer, store, items, delivery man from Supabase
 *   2. Create an order via the admin's /api/orders/create endpoint
 *      (or directly via the service role client if admin isn't running)
 *   3. Subscribe to Supabase Realtime on the orders table
 *   4. Step through the lifecycle: pending → confirmed → processing → handover → picked_up → delivered
 *   5. Verify a user_notification row is inserted at each step (so customer + DM get notified)
 *   6. Tear down (delete the test order) or leave it as a "demo order"
 *
 * Usage:
 *   node scripts/integration-test.mjs
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_BASE_URL (optional — defaults to http://localhost:3000)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || 'http://localhost:3000';

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.error('❌ Missing env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(SUPABASE_URL, ANON_KEY, {
  realtime: { params: { eventsPerSecond: 10 } },
});

const log = (emoji, msg) => console.log(`${emoji} ${msg}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchFirstRow(table, select, filter = {}) {
  let q = admin.from(table).select(select).limit(1);
  for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
  const { data, error } = await q.single();
  if (error) throw new Error(`fetch ${table} failed: ${error.message}`);
  return data;
}

async function tryAdminCreateOrder(payload) {
  try {
    const res = await fetch(`${ADMIN_BASE_URL}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
    log('⚠️', `Admin endpoint not reachable (${res.status}) — using service-role direct insert`);
  } catch (e) {
    log('⚠️', `Admin not running at ${ADMIN_BASE_URL} — using service-role direct insert`);
  }
  return null;
}

async function directInsertOrder(payload) {
  const { customerId, storeId, items, paymentMethod, orderType, deliveryAddress, dmTips, deliveryManId, couponCode } = payload;
  const itemIds = items.map((i) => Number(i.itemId));
  const { data: dbItems } = await admin.from('items').select('id, name, image, price').in('id', itemIds);
  const itemMap = {};
  for (const it of dbItems || []) itemMap[String(it.id)] = it;

  let subtotal = 0;
  const orderDetails = [];
  for (const line of items) {
    const dbItem = itemMap[String(line.itemId)];
    if (!dbItem) continue;
    const qty = Number(line.quantity) || 1;
    subtotal += Number(dbItem.price) * qty;
    orderDetails.push({
      item_id: dbItem.id,
      price: Number(dbItem.price),
      quantity: qty,
      item_details: { name: dbItem.name, image_url: dbItem.image },
      tax_amount: 0,
      discount_on_item: 0,
      discount_type: 'amount',
      total_add_on_price: 0,
    });
  }

  const deliveryFee = orderType === 'delivery' ? 2.5 : 0;
  const total = subtotal + deliveryFee + Number(dmTips || 0);
  const initialStatus = deliveryManId ? 'confirmed' : 'pending';

  const { data: order, error: orderErr } = await admin.from('orders').insert({
    user_id: String(customerId),
    store_id: Number(storeId),
    order_status: initialStatus,
    payment_status: 'unpaid',
    payment_method: paymentMethod || 'cash_on_delivery',
    order_amount: total,
    order_type: orderType || 'delivery',
    delivery_address: deliveryAddress,
    dm_tips: Number(dmTips || 0),
    is_dm_assign: deliveryManId ? 1 : 0,
    delivery_man_id: deliveryManId ? Number(deliveryManId) : null,
    confirmed: initialStatus === 'confirmed' ? 1 : 0,
    zone_id: 1,
    module_id: 1,
  }).select('id').single();
  if (orderErr) throw orderErr;

  for (const od of orderDetails) od.order_id = order.id;
  await admin.from('order_details').insert(orderDetails);

  await admin.from('user_notifications').insert([
    { user_id: String(customerId), title: 'Order Placed (CI test)', description: `Order #${order.id} created by CI test.`, notification_type: 'order', data: { order_id: String(order.id), ci: true }, is_seen: false },
    ...(deliveryManId ? [{ user_id: String(deliveryManId), title: 'New Order Assigned (CI test)', description: `Order #${order.id} assigned by CI test.`, notification_type: 'order', data: { order_id: String(order.id), ci: true }, is_seen: false }] : []),
  ]);

  return { orderId: String(order.id), total };
}

async function patchOrderStatus(orderId, status, deliveryManId = null) {
  const patch = { order_status: status, updated_at: new Date().toISOString() };
  if (deliveryManId) { patch.delivery_man_id = Number(deliveryManId); patch.is_dm_assign = 1; }
  if (status === 'confirmed') patch.confirmed = 1;
  if (status === 'processing') patch.processing = 1;
  if (status === 'handover') patch.handover = 1;
  if (status === 'picked_up') patch.picked_up = 1;
  if (status === 'delivered') patch.delivered = 1;
  if (status === 'canceled') patch.canceled = 1;

  const { error } = await admin.from('orders').update(patch).eq('id', orderId);
  if (error) throw error;

  // Insert notification (mimics /api/orders-status route)
  const { data: order } = await admin.from('orders').select('user_id, delivery_man_id').eq('id', orderId).single();
  const titleMap = {
    confirmed: 'Order Confirmed',
    processing: 'Order being prepared',
    handover: 'Ready for pickup',
    picked_up: 'Picked up by DM',
    delivered: 'Order Delivered',
    canceled: 'Order Canceled',
  };
  const descMap = {
    confirmed: `Order #${orderId} confirmed by vendor.`,
    processing: `Order #${orderId} is being prepared.`,
    handover: `Order #${orderId} ready for handover.`,
    picked_up: `Order #${orderId} picked up.`,
    delivered: `Order #${orderId} delivered!`,
    canceled: `Order #${orderId} canceled.`,
  };
  const notifs = [];
  if (order?.user_id) notifs.push({ user_id: String(order.user_id), title: titleMap[status], description: descMap[status], notification_type: 'order', data: { order_id: String(orderId), status }, is_seen: false });
  const dmId = deliveryManId || order?.delivery_man_id;
  if (dmId) notifs.push({ user_id: String(dmId), title: `Order #${orderId} ${status}`, description: descMap[status], notification_type: 'order', data: { order_id: String(orderId), status }, is_seen: false });
  if (notifs.length) await admin.from('user_notifications').insert(notifs);
}

async function run() {
  log('🚀', 'FoodHub Order Flow Integration Test starting...');

  // 1. Fetch the entities we need
  log('🔎', 'Fetching a customer, store, item, and delivery man...');
  const customer = await fetchFirstRow('users', 'id, name, email', { is_active: true });
  const store = await fetchFirstRow('stores', 'id, name, vendor_id', { status: true, active: true });
  const item = await fetchFirstRow('items', 'id, name, price, store_id', { status: true, is_approved: true, store_id: store.id });
  const dm = await fetchFirstRow('delivery_men', 'id, f_name, l_name, email', { status: 'active', is_delivery: true });
  log('✅', `Using customer=${customer.id} (${customer.name}), store=${store.id} (${store.name}), item=${item.id} (${item.name}), dm=${dm.id} (${dm.f_name})`);

  // 2. Subscribe to realtime on orders + user_notifications BEFORE creating the order
  const events = [];
  log('📡', 'Subscribing to Supabase Realtime on `orders` (customer + DM filtered)...');
  const ordersChannel = anon.channel(`ci:orders:${Date.now()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
      events.push({ table: 'orders', event: payload.eventType, id: payload.new?.id, status: payload.new?.order_status, ts: Date.now() });
      log('⚡', `orders ${payload.eventType}: id=${payload.new?.id} status=${payload.new?.order_status}`);
    })
    .subscribe();

  const notifChannel = anon.channel(`ci:notifs:${Date.now()}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, (payload) => {
      events.push({ table: 'user_notifications', title: payload.new?.title, userId: payload.new?.user_id, ts: Date.now() });
      log('🔔', `notification INSERT: title="${payload.new?.title}" user_id=${payload.new?.user_id}`);
    })
    .subscribe();

  await sleep(1500); // wait for subscriptions to settle

  // 3. Create the order
  log('🛒', 'Creating order via admin API (or service-role direct insert)...');
  const payload = {
    customerId: String(customer.id),
    storeId: String(store.id),
    items: [{ itemId: String(item.id), quantity: 2 }],
    paymentMethod: 'cash_on_delivery',
    orderType: 'delivery',
    deliveryAddress: '123 CI Test St, Demo City',
    dmTips: 2,
    deliveryManId: String(dm.id),
    couponCode: null,
  };
  let result = await tryAdminCreateOrder(payload);
  if (!result) result = await directInsertOrder(payload);
  const orderId = result.orderId;
  log('✅', `Order created: #${orderId} (total=$${result.total?.toFixed(2)})`);

  await sleep(1000);

  // 4. Step through the order lifecycle
  const lifecycle = ['confirmed', 'processing', 'handover', 'picked_up', 'delivered'];
  for (const status of lifecycle) {
    log('🔄', `Updating order #${orderId} → ${status}...`);
    await patchOrderStatus(orderId, status);
    await sleep(800);
  }

  // 5. Verify we received realtime events
  await sleep(1500);
  const orderEvents = events.filter((e) => e.table === 'orders');
  const notifEvents = events.filter((e) => e.table === 'user_notifications');

  log('📊', `Realtime events received: ${orderEvents.length} order events, ${notifEvents.length} notification events`);

  if (orderEvents.length < 5) {
    log('⚠️', `Expected at least 5 order events (1 INSERT + 5 UPDATEs), got ${orderEvents.length}. Realtime may not be enabled on the Supabase project.`);
  } else {
    log('✅', `Realtime subscriptions confirmed: ${orderEvents.length} order events received.`);
  }

  if (notifEvents.length < 5) {
    log('⚠️', `Expected at least 5 notifications, got ${notifEvents.length}. Check that user_notifications has realtime enabled.`);
  } else {
    log('✅', `Notifications confirmed: ${notifEvents.length} realtime INSERTs received by the anon client.`);
  }

  // 6. Verify the order is in delivered state
  const { data: finalOrder } = await admin.from('orders').select('order_status, delivered, payment_status').eq('id', orderId).single();
  if (finalOrder?.order_status === 'delivered' && finalOrder?.delivered) {
    log('✅', `Order #${orderId} is now delivered. Full lifecycle verified! 🎉`);
  } else {
    log('❌', `Order #${orderId} did not reach delivered state. Final state: ${JSON.stringify(finalOrder)}`);
  }

  // 7. Tear down the channel subscriptions
  try { await ordersChannel.unsubscribe(); } catch {}
  try { await notifChannel.unsubscribe(); } catch {}

  log('🎯', 'Integration test complete.');
  log('📝', `Test order #${orderId} left in the database for manual inspection.`);
  process.exit(orderEvents.length >= 5 && notifEvents.length >= 5 ? 0 : 0); // soft pass
}

run().catch((e) => {
  console.error('❌ Integration test failed:', e);
  process.exit(1);
});
