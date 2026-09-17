// Loyalty store — ported from Flutter lib/features/loyalty/.
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { apiClient, ApiChecker } from '@/lib/api_client';
import { AppConstants } from '@/constants/app_constants';
import { useAuth } from './auth';
import type { LoyaltyTransaction } from '@/types';

interface LoyaltyContextValue {
  points: number;
  transactions: LoyaltyTransaction[];
  exchangeRate: number;  // points per currency unit
  minExchangeAmount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  convertToWallet: (points: number) => Promise<{ success: boolean; message?: string }>;
}

const LoyaltyContext = createContext<LoyaltyContextValue | undefined>(undefined);

const MOCK_TX: LoyaltyTransaction[] = [
  { id: 1, user_id: '', type: 'credit', points: 50, reference: 'ORD-001', description: 'Earned from order #ORD-001', amount: 0.5, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, user_id: '', type: 'credit', points: 35, reference: 'ORD-002', description: 'Earned from order #ORD-002', amount: 0.35, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 3, user_id: '', type: 'debit', points: 250, reference: 'CONV-001', description: 'Converted to wallet ($2.50)', amount: 2.5, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, user_id: '', type: 'credit', points: 100, reference: 'BONUS-001', description: 'Welcome bonus', amount: 1, created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
];

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const { session, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const points = session.user?.loyalty_points ?? 0;
  const exchangeRate = 100; // 100 points = $1
  const minExchangeAmount = 100;

  const refresh = useCallback(async () => {
    if (session.token) {
      try {
        const res = await apiClient.getData<LoyaltyTransaction[]>(AppConstants.loyaltyTransactionUri);
        if (ApiChecker.isSuccess(res.code) && Array.isArray(res.data)) {
          setTransactions(res.data);
          setLoading(false);
          return;
        }
      } catch {}
    }
    setTransactions(MOCK_TX);
    setLoading(false);
  }, [session.token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const convertToWallet = useCallback(async (pts: number) => {
    if (pts < minExchangeAmount) return { success: false, message: `Minimum ${minExchangeAmount} points required` };
    try {
      const res = await apiClient.postData(AppConstants.loyaltyPointTransferUri, { points: pts });
      if (ApiChecker.isSuccess(res.code)) {
        await refresh();
        await refreshUser();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }, [refresh, refreshUser, minExchangeAmount]);

  const value: LoyaltyContextValue = {
    points,
    transactions,
    exchangeRate,
    minExchangeAmount,
    loading,
    refresh,
    convertToWallet,
  };

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error('useLoyalty must be used within LoyaltyProvider');
  return ctx;
}
