// Orders store — ported from Flutter lib/features/order/.
// Supports multiple vendors per order (grouped), tracking timeline, cancellation.

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { apiClient, ApiChecker } from '@/lib/api_client';
import { AppConstants } from '@/constants/app_constants';
import { useAuth } from '@/store/auth';
import type { CartGroup, Order, OrderItem, OrderStatus, OrderStatusTimeline, PaymentMethod } from '@/types';

const ORDERS_STORAGE_KEY = 'foodhub.orders';

interface OrderContextValue {
  orders: Order[];
  loading: boolean;
  placeOrder: (params: {
    cartGroups: CartGroup[];
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    couponDiscount?: number;
    dmTips?: number;
    scheduledAt?: string | null;
    orderType?: 'delivery' | 'take_away' | 'parcel';
  }) => Promise<Order[]>;
  cancelOrder: (orderId: number, reason?: string) => Promise<void>;
  refresh: () => Promise<void>;
  getById: (id: number) => Order | undefined;
  getTimeline: (order: Order) => OrderStatusTimeline[];
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    let loaded: Order[] = [];

    // 1. Try REST backend
    if (session.token) {
      try {
        const res = await apiClient.getData<Order[]>(AppConstants.allOrderList);
        if (ApiChecker.isSuccess(res.code) && Array.isArray(res.data)) {
          loaded = res.data;
        }
      } catch {}
    }

    // 2. Try Supabase — unified with admin's `orders` + `order_details` tables
    if (loaded.length === 0 && isSupabaseConfigured && session.user && !session.user.is_guest) {
      try {
        const { data } = await supabase
          .from('orders')
          .select('*, order_details(*), stores(id, name, logo)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if (data) loaded = data.map(mapOrderRow);
      } catch {}
    }

    // 3. Fall back to local
    if (loaded.length === 0) {
      try {
        const raw = Platform.OS === 'web'
          ? localStorage.getItem(ORDERS_STORAGE_KEY)
          : await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
        if (raw) loaded = JSON.parse(raw);
      } catch {}
    }

    setOrders(loaded);
    setLoading(false);
  }, [session.user, session.token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const placeOrder = useCallback(async (params: {
    cartGroups: CartGroup[];
    deliveryAddress: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    couponDiscount?: number;
    dmTips?: number;
    scheduledAt?: string | null;
    orderType?: 'delivery' | 'take_away' | 'parcel';
  }): Promise<Order[]> => {
    const newOrders: Order[] = [];

    for (const group of params.cartGroups) {
      const orderItems: OrderItem[] = group.items.map((ci) => ({
        id: ci.product_id,
        product_id: ci.product_id,
        name: ci.product.name,
        image_url: Array.isArray(ci.product.image_url) ? ci.product.image_url[0] : ci.product.image_url,
        price: ci.unit_price,
        variation_label: ci.variation_label,
        variation_price: ci.variation_price,
        add_on_names: ci.add_on_names,
        add_on_price: ci.add_on_price,
        quantity: ci.quantity,
        total: ci.total_price,
        tax_amount: ci.tax_amount,
        discount_amount: ci.discount_amount,
      }));

      const subtotal = group.subtotal;
      const deliveryFee = group.delivery_fee;
      const discount = group.discount + (params.couponDiscount ?? 0);
      const taxAmount = group.items.reduce((s, i) => s + i.tax_amount, 0);
      const dmTips = params.dmTips ?? 0;
      const total = subtotal - discount + deliveryFee + taxAmount + dmTips;

      const newOrder: Order = {
        id: Date.now() + group.store_id,
        order_code: `ORD-${Date.now()}-${group.store_id}`,
        user_id: session.user?.id ?? 'guest',
        user_name: session.user?.name ?? 'Guest',
        user_phone: session.user?.phone ?? '',
        store_id: group.store_id,
        store_name: group.store_name,
        store_logo_url: group.store_logo ?? null,
        module_id: 0,
        module_name: undefined,
        items: orderItems,
        item_count: orderItems.reduce((s, i) => s + i.quantity, 0),
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        coupon_discount: params.couponDiscount ?? 0,
        coupon_code: params.couponCode,
        tax_amount: taxAmount,
        dm_tips: dmTips,
        additional_charge: 0,
        total,
        payment_method: params.paymentMethod,
        payment_status: params.paymentMethod === 'cod' ? 'unpaid' : 'paid',
        order_status: 'placed',
        order_type: params.orderType ?? 'delivery',
        delivery_address: params.deliveryAddress,
        estimated_delivery_time: '45 min',
        estimated_delivery_at: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        scheduled_at: params.scheduledAt ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Persist to Supabase (unified with admin DB) — insert into `orders` + `order_details`
      if (isSupabaseConfigured && session.user && !session.user.is_guest) {
        try {
          const orderCode = `ORD-${Date.now()}-${group.store_id}`;
          const { data: orderRow, error: orderErr } = await supabase
            .from('orders')
            .insert({
              order_code: orderCode,
              user_id: session.user.id,
              store_id: group.store_id,
              order_status: 'pending',
              payment_status: params.paymentMethod === 'cod' ? 'unpaid' : 'paid',
              payment_method: params.paymentMethod === 'cod' ? 'cash_on_delivery' : (params.paymentMethod as any),
              order_amount: total,
              order_type: (params.orderType ?? 'delivery') as any,
              delivery_address: params.deliveryAddress,
              coupon_code: params.couponCode,
              coupon_discount_amount: params.couponDiscount ?? 0,
              dm_tips: dmTips,
              distance: 0,
              additional_charge: 0,
            })
            .select()
            .single();
          if (!orderErr && orderRow) {
            Object.assign(newOrder, { id: orderRow.id, order_code: orderRow.order_code });

            // Insert order_details rows
            const detailRows = orderItems.map((oi) => ({
              order_id: orderRow.id,
              item_id: oi.product_id,
              price: oi.price,
              quantity: oi.quantity,
              tax_amount: oi.tax_amount ?? 0,
              discount_on_item: oi.discount_amount ?? 0,
              item_details: { name: oi.name, image_url: oi.image_url },
            }));
            await supabase.from('order_details').insert(detailRows);
          }
        } catch {}
      }

      // Try REST backend
      if (session.token) {
        try {
          const res = await apiClient.postData<Order>(AppConstants.placeOrderUri, {
            store_id: group.store_id,
            items: orderItems,
            address: params.deliveryAddress,
            payment_method: params.paymentMethod,
            coupon_code: params.couponCode,
            dm_tips: dmTips,
            scheduled_at: params.scheduledAt,
            order_type: params.orderType ?? 'delivery',
          });
          if (ApiChecker.isSuccess(res.code) && res.data) {
            Object.assign(newOrder, res.data);
          }
        } catch {}
      }

      newOrders.push(newOrder);
    }

    setOrders((prev) => {
      const next = [...newOrders, ...prev];
      const s = JSON.stringify(next);
      if (Platform.OS === 'web') localStorage.setItem(ORDERS_STORAGE_KEY, s);
      else AsyncStorage.setItem(ORDERS_STORAGE_KEY, s).catch(() => {});
      return next;
    });

    return newOrders;
  }, [session.user, session.token]);

  const cancelOrder = useCallback(async (orderId: number, reason?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, order_status: 'cancelled', cancel_reason: reason ?? null, updated_at: new Date().toISOString() }
          : o
      )
    );

    if (session.token) {
      try {
        await apiClient.postData(AppConstants.orderCancelUri, { order_id: orderId, reason });
      } catch {}
    }
  }, [session.token]);

  const getById = useCallback((id: number) => orders.find((o) => o.id === id), [orders]);

  const getTimeline = useCallback((order: Order): OrderStatusTimeline[] => {
    const statuses: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    if (order.order_status === 'cancelled') {
      return [
        { status: 'placed', label: 'Order Placed', icon: 'cart-arrow-down', completed: true, timestamp: order.created_at },
        { status: 'cancelled', label: 'Cancelled', icon: 'close-circle', completed: true, timestamp: order.updated_at },
      ];
    }
    const currentIndex = statuses.indexOf(order.order_status);
    return statuses.map((status, i) => ({
      status,
      label: statusLabel(status),
      icon: statusIcon(status),
      completed: i <= currentIndex,
      timestamp: i === currentIndex ? order.updated_at : undefined,
    }));
  }, []);

  const value: OrderContextValue = {
    orders,
    loading,
    placeOrder,
    cancelOrder,
    refresh,
    getById,
    getTimeline,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}

function statusLabel(s: OrderStatus): string {
  switch (s) {
    case 'placed': return 'Order Placed';
    case 'confirmed': return 'Order Confirmed';
    case 'preparing': return 'Preparing';
    case 'out_for_delivery': return 'Out for Delivery';
    case 'delivered': return 'Delivered';
    case 'cancelled':
    case 'canceled': return 'Cancelled';
    case 'refunded': return 'Refunded';
    case 'failed': return 'Failed';
    default: return s;
  }
}

function statusIcon(s: OrderStatus): string {
  switch (s) {
    case 'placed': return 'cart-arrow-down';
    case 'confirmed': return 'check-circle';
    case 'preparing': return 'food-variant';
    case 'out_for_delivery': return 'bike-fast';
    case 'delivered': return 'package-variant-closed-check';
    case 'cancelled':
    case 'canceled': return 'close-circle';
    case 'refunded': return 'cash-refund';
    case 'failed': return 'alert-circle';
    default: return 'circle-medium';
  }
}

function mapOrderRow(row: any): Order {
  const details = row.order_details ?? row.order_items ?? [];
  const store = row.stores;
  return {
    id: row.id,
    order_code: row.order_code ?? `ORD-${row.id}`,
    user_id: row.user_id,
    user_name: row.user_name ?? '',
    user_phone: row.user_phone ?? '',
    store_id: row.store_id ?? row.vendor_id,
    store_name: store?.name ?? row.store_name ?? row.vendor_name ?? '',
    store_logo_url: store?.logo ?? row.store_logo_url ?? null,
    module_id: row.module_id ?? 0,
    items: details.map((i: any) => ({
      id: i.id,
      product_id: i.item_id ?? i.product_id,
      name: i.item_details?.name ?? i.name ?? '',
      image_url: i.item_details?.image_url ?? i.image_url ?? null,
      price: Number(i.price),
      variation_label: i.variation_label,
      variation_price: i.variation_price,
      add_on_names: i.add_on_names ?? [],
      add_on_price: i.add_on_price ?? 0,
      quantity: i.quantity,
      total: Number(i.total ?? i.price * i.quantity),
      tax_amount: Number(i.tax_amount ?? 0),
      discount_amount: Number(i.discount_on_item ?? i.discount_amount ?? 0),
    })),
    item_count: details.reduce((s: number, i: any) => s + (i.quantity ?? 0), 0),
    subtotal: Number(row.order_amount ?? row.subtotal ?? 0),
    delivery_fee: Number(row.delivery_fee ?? 0),
    discount: Number(row.discount ?? row.coupon_discount_amount ?? 0),
    coupon_discount: Number(row.coupon_discount_amount ?? row.coupon_discount ?? 0),
    coupon_code: row.coupon_code,
    tax_amount: Number(row.tax_amount ?? 0),
    dm_tips: Number(row.dm_tips ?? 0),
    additional_charge: Number(row.additional_charge ?? 0),
    total: Number(row.order_amount ?? row.total ?? 0),
    payment_method: row.payment_method === 'cash_on_delivery' ? 'cod' : (row.payment_method as any),
    payment_status: row.payment_status,
    order_status: (row.order_status ?? row.status ?? 'pending') as any,
    order_type: (row.order_type ?? 'delivery') as any,
    delivery_address: row.delivery_address,
    estimated_delivery_time: row.estimated_delivery_time ?? '45 min',
    estimated_delivery_at: row.estimated_delivery_at,
    scheduled_at: row.schedule_at ?? row.scheduled_at,
    created_at: row.created_at,
    updated_at: row.updated_at ?? row.created_at,
    cancel_reason: row.cancellation_reason ?? row.cancel_reason,
  };
}
