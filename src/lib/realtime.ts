/**
 * Customer app — Realtime + Push Notification module.
 *
 * Subscribes to Supabase Realtime postgres_changes on:
 *   - `orders` (filter: user_id=eq.<userId>) — order status updates from admin/vendor
 *   - `user_notifications` (filter: user_id=eq.<userId>) — admin broadcasts + 1:1 messages
 *
 * On any event:
 *   1. Calls the provided callback (so the calling screen can refetch).
 *   2. Shows a local push notification via expo-notifications (if permission granted).
 *
 * This is the customer-facing half of the integrated order flow:
 *   customer places order → admin/vendor updates status → realtime fires here →
 *   customer UI refreshes + sees a banner.
 */

import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Configure how incoming notifications are presented while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface RealtimeChannel {
  unsubscribe: () => void;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Platform.isNative) return null;

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch (e) {
    return null;
  }
}

/**
 * Subscribe to realtime updates for the signed-in customer.
 * Returns { status } — SUBSCRIBED / CONNECTING / CLOSED / ERROR.
 */
export function useCustomerRealtime(
  userId: string | null | undefined,
  onOrderUpdate: (orderId: string, newStatus: string) => void,
  onNotification: (n: { title: string; description: string; type: string; data?: any }) => void,
) {
  const [status, setStatus] = useState<'connecting' | 'subscribed' | 'closed' | 'error'>('connecting');
  const cbRef = useRef({ onOrderUpdate, onNotification });
  cbRef.current = { onOrderUpdate, onNotification };

  useEffect(() => {
    if (!userId || !isSupabaseConfigured) {
      setStatus('closed');
      return;
    }

    let ordersChannel: any;
    let notifChannel: any;

    const ordersFilter = `user_id=eq.${userId}`;
    ordersChannel = supabase
      .channel(`customer:orders:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: ordersFilter },
        (payload: any) => {
          const row = payload.new || {};
          cbRef.current.onOrderUpdate(String(row.id || ''), String(row.order_status || ''));
          // Show a local notification while the app is open
          if (payload.eventType === 'UPDATE' || payload.type === 'UPDATE') {
            const statusMessages: Record<string, { title: string; body: string }> = {
              confirmed: { title: 'Order Confirmed 🎉', body: 'The restaurant confirmed your order.' },
              processing: { title: 'Preparing your order 🍳', body: 'The restaurant is preparing your food.' },
              handover: { title: 'Order ready for pickup 📦', body: 'Your order is ready and waiting for the delivery partner.' },
              picked_up: { title: 'On the way 🛵', body: 'Your delivery partner picked up your order.' },
              delivered: { title: 'Order delivered ✅', body: 'Enjoy your meal!' },
              canceled: { title: 'Order canceled', body: 'Your order has been canceled.' },
            };
            const msg = statusMessages[row.order_status];
            if (msg) {
              Notifications.scheduleNotificationAsync({
                content: { title: msg.title, body: msg.body, sound: 'default' },
                trigger: null,
              }).catch(() => {});
            }
          }
        },
      )
      .subscribe((s: string) => setStatus(s === 'SUBSCRIBED' ? 'subscribed' : s === 'CHANNEL_ERROR' || s === 'TIMED_OUT' ? 'error' : 'connecting'));

    const notifFilter = `user_id=eq.${userId}`;
    notifChannel = supabase
      .channel(`customer:notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: notifFilter },
        (payload: any) => {
          const row = payload.new || {};
          cbRef.current.onNotification({
            title: row.title || 'Notification',
            description: row.description || '',
            type: row.notification_type || 'general',
            data: row.data,
          });
          if (row.title) {
            Notifications.scheduleNotificationAsync({
              content: { title: row.title, body: row.description || '', sound: 'default' },
              trigger: null,
            }).catch(() => {});
          }
        },
      )
      .subscribe();

    return () => {
      try { ordersChannel?.unsubscribe?.(); } catch {}
      try { notifChannel?.unsubscribe?.(); } catch {}
    };
  }, [userId]);

  return { status };
}
