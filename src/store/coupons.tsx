// Coupon store — ported from Flutter lib/features/coupon/.
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { apiClient, ApiChecker } from '@/lib/api_client';
import { AppConstants } from '@/constants/app_constants';
import type { Coupon } from '@/types';

interface CouponContextValue {
  coupons: Coupon[];
  loading: boolean;
  refresh: () => Promise<void>;
  apply: (code: string, orderAmount: number) => Promise<{ success: boolean; message?: string; discount?: number; coupon?: Coupon }>;
  getById: (id: number) => Coupon | undefined;
}

const CouponContext = createContext<CouponContextValue | undefined>(undefined);

const MOCK_COUPONS: Coupon[] = [
  { id: 1, title: '20% Off First Order', code: 'WELCOME20', description: 'Get 20% off on your first order. Max discount $50.', module_id: 0, coupon_type: 'first_order', min_purchase: 30, max_discount: 50, discount: 20, discount_type: 'percent', store_id: null, category_id: null, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 0, total_use_count: 1000, image_url: null },
  { id: 2, title: 'Flat $5 Off', code: 'SAVE5', description: 'Flat $5 off on orders above $25.', module_id: 0, coupon_type: 'default', min_purchase: 25, max_discount: 5, discount: 5, discount_type: 'amount', store_id: null, category_id: null, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 12, total_use_count: 500, image_url: null },
  { id: 3, title: 'Free Delivery', code: 'FREEDEL', description: 'Free delivery on orders above $20.', module_id: 0, coupon_type: 'default', min_purchase: 20, max_discount: 10, discount: 5, discount_type: 'amount', store_id: null, category_id: null, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 5, total_use_count: 200, image_url: null },
  { id: 4, title: '15% Off Grocery', code: 'GROCERY15', description: '15% off on grocery items. Max discount $30.', module_id: 1, coupon_type: 'category_base', min_purchase: 50, max_discount: 30, discount: 15, discount_type: 'percent', store_id: null, category_id: 1, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 0, total_use_count: 1000, image_url: null },
  { id: 5, title: 'Fresh Foods $10 Off', code: 'FRESH10', description: '$10 off on orders from Fresh Foods Store above $40.', module_id: 0, coupon_type: 'store_base', min_purchase: 40, max_discount: 10, discount: 10, discount_type: 'amount', store_id: 1, store_name: 'Fresh Foods Store', category_id: null, item_id: null, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), is_expired: false, used_count: 0, total_use_count: 100, image_url: null },
];

export function CouponProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await apiClient.getData<Coupon[]>(AppConstants.couponUri);
      if (ApiChecker.isSuccess(res.code) && Array.isArray(res.data)) {
        setCoupons(res.data);
        setLoading(false);
        return;
      }
    } catch {}
    setCoupons(MOCK_COUPONS);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const apply = useCallback(async (code: string, orderAmount: number) => {
    try {
      const res = await apiClient.getData<{ discount: number; coupon: Coupon }>(AppConstants.couponApplyUri + code, { order_amount: orderAmount });
      if (ApiChecker.isSuccess(res.code)) {
        return { success: true, discount: res.data.discount, coupon: res.data.coupon };
      }
      return { success: false, message: res.message ?? 'Invalid coupon' };
    } catch (e: any) {
      // Mock apply
      const coupon = MOCK_COUPONS.find((c) => c.code.toLowerCase() === code.toLowerCase());
      if (!coupon) return { success: false, message: 'Coupon code not found' };
      if (coupon.is_expired) return { success: false, message: 'Coupon has expired' };
      if (orderAmount < coupon.min_purchase) return { success: false, message: `Minimum order amount $${coupon.min_purchase} required` };
      let discount = coupon.discount_type === 'percent'
        ? (orderAmount * coupon.discount) / 100
        : coupon.discount;
      if (discount > coupon.max_discount) discount = coupon.max_discount;
      return { success: true, discount, coupon };
    }
  }, []);

  const getById = useCallback((id: number) => coupons.find((c) => c.id === id), [coupons]);

  const value: CouponContextValue = {
    coupons,
    loading,
    refresh,
    apply,
    getById,
  };

  return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>;
}

export function useCoupons() {
  const ctx = useContext(CouponContext);
  if (!ctx) throw new Error('useCoupons must be used within CouponProvider');
  return ctx;
}
