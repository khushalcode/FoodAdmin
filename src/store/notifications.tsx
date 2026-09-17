// Notifications store — ported from Flutter lib/features/notification/.
// Uses mock data with REST fallback.

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { apiClient, ApiChecker } from '@/lib/api_client';
import { AppConstants } from '@/constants/app_constants';
import { useAuth } from './auth';
import type { AppNotification } from '@/types';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: 'Order Confirmed',
    body: 'Your order #ORD-2024-001 has been confirmed by the store.',
    type: 'order',
    is_read: false,
    data: { order_id: 1 },
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: 'Flash Sale Live Now!',
    body: 'Up to 50% off on grocery items. Limited time only.',
    type: 'promotion',
    is_read: false,
    image_url: 'assets/images/flutter/flash_sell_bg.png',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: 'New Coupon Available',
    body: 'Use code WELCOME20 for 20% off your next order.',
    type: 'coupon',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    title: 'Order Delivered',
    body: 'Your order #ORD-2024-000 was delivered successfully. Rate your experience!',
    type: 'order',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Try REST
    if (session.token) {
      try {
        const res = await apiClient.getData<AppNotification[]>(AppConstants.notificationUri);
        if (ApiChecker.isSuccess(res.code) && Array.isArray(res.data)) {
          setNotifications(res.data);
          setLoading(false);
          return;
        }
      } catch {}
    }
    // Mock fallback
    setNotifications(MOCK_NOTIFICATIONS);
    setLoading(false);
  }, [session.token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = useCallback(async (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const remove = useCallback(async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
    remove,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
