// Wallet store — ported from Flutter lib/features/wallet/.
// Tracks balance + transactions list.

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { apiClient, ApiChecker } from '@/lib/api_client';
import { AppConstants } from '@/constants/app_constants';
import { useAuth } from './auth';
import type { WalletTransaction } from '@/types';

interface WalletContextValue {
  balance: number;
  transactions: WalletTransaction[];
  loading: boolean;
  refresh: () => Promise<void>;
  addFunds: (amount: number) => Promise<{ success: boolean; message?: string }>;
  convertLoyaltyPoints: (points: number) => Promise<{ success: boolean; message?: string }>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const MOCK_TRANSACTIONS: WalletTransaction[] = [
  { id: 1, user_id: '', type: 'credit', amount: 100, reference: 'TOPUP-001', description: 'Wallet top-up via Card', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, user_id: '', type: 'debit', amount: 35.50, reference: 'ORD-001', description: 'Order #ORD-001 payment', order_id: 1, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, user_id: '', type: 'credit', amount: 25, reference: 'LOYALTY-001', description: 'Converted 250 loyalty points', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, user_id: '', type: 'debit', amount: 12.99, reference: 'ORD-002', description: 'Order #ORD-002 payment', order_id: 2, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 5, user_id: '', type: 'credit', amount: 50, reference: 'REFUND-001', description: 'Refund for cancelled order #ORD-003', order_id: 3, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const { session, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const balance = session.user?.wallet_balance ?? 0;

  const refresh = useCallback(async () => {
    if (session.token) {
      try {
        const res = await apiClient.getData<WalletTransaction[]>(AppConstants.walletTransactionUri);
        if (ApiChecker.isSuccess(res.code) && Array.isArray(res.data)) {
          setTransactions(res.data);
          setLoading(false);
          return;
        }
      } catch {}
    }
    setTransactions(MOCK_TRANSACTIONS);
    setLoading(false);
  }, [session.token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addFunds = useCallback(async (amount: number) => {
    if (amount <= 0) return { success: false, message: 'Amount must be greater than 0' };
    try {
      const res = await apiClient.postData(AppConstants.walletTransactionUri, { amount, type: 'credit' });
      if (ApiChecker.isSuccess(res.code)) {
        await refresh();
        await refreshUser();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }, [refresh, refreshUser]);

  const convertLoyaltyPoints = useCallback(async (points: number) => {
    if (points <= 0) return { success: false, message: 'Points must be greater than 0' };
    try {
      const res = await apiClient.postData(AppConstants.loyaltyPointTransferUri, { points });
      if (ApiChecker.isSuccess(res.code)) {
        await refresh();
        await refreshUser();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }, [refresh, refreshUser]);

  const value: WalletContextValue = {
    balance,
    transactions,
    loading,
    refresh,
    addFunds,
    convertLoyaltyPoints,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
