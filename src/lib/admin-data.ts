/**
 * Customer app — Live admin-controlled data fetchers.
 *
 * Pulls banners / coupons / campaigns / flash sales / categories directly from
 * the shared Supabase project (same one the admin panel writes to). Falls back
 * to demo data when Supabase is not configured or the query fails.
 *
 * These are the "admin-controlled features" the customer app must surface:
 *   - banners       (home hero carousel)
 *   - coupons       (offers tab + checkout apply)
 *   - campaigns     (campaigns screen)
 *   - flash_sales   (flash sale countdown)
 *   - categories    (home category grid)
 *
 * All tables are read via the anon key — they have public SELECT RLS policies
 * already defined in admin_panel/supabase/base_schema.sql.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  DEMO_BANNERS,
  DEMO_COUPONS,
  DEMO_CAMPAIGNS,
  DEMO_CATEGORIES,
} from '@/data/demo-data';
import {
  DEMO_FLASH_SALES,
} from '@/data/food_features_demo';
import type { Banner, Category, CategoryKey } from '@/types';

// ---- Banners (admin-controlled, customer displays) ----
export async function fetchLiveBanners(opts?: { moduleId?: string; onlyActive?: boolean; limit?: number }): Promise<Banner[]> {
  if (!isSupabaseConfigured) return DEMO_BANNERS.slice(0, opts?.limit || 8);
  try {
    let q = supabase
      .from('banners')
      .select('id, title, image, type, data, default_link, status, featured, module_id, zone_id, background_color, start_date, end_date')
      .eq('status', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    if (opts?.moduleId) q = q.eq('module_id', opts.moduleId);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error || !data || data.length === 0) return DEMO_BANNERS.slice(0, opts?.limit || 8);
    return data.map((b: any) => ({
      id: String(b.id),
      title: b.title,
      image_url: b.image,
      url: b.default_link || b.data,
      redirect_link: b.default_link || b.data,
      type: b.type,
      is_active: b.status,
      priority: b.featured ? 1 : 0,
      background_color: b.background_color,
      start_date: b.start_date,
      end_date: b.end_date,
      module_id: b.module_id,
      zone_id: b.zone_id,
    })) as Banner[];
  } catch {
    return DEMO_BANNERS.slice(0, opts?.limit || 8);
  }
}

// ---- Coupons (admin-controlled, customer applies at checkout) ----
export interface LiveCoupon {
  id: string;
  title: string;
  code: string;
  // DB enum is 'amount' | 'percent' (NOT 'percentage' — the discount_type_enum
  // is the 6amMart default which uses 'percent'). We expose both for safety.
  discountType: 'percent' | 'amount' | 'percentage';
  discount: number;
  minPurchase: number;
  maxDiscount: number;
  couponType: string;
  limit: number | null;
  used: number;
  startDate: string;
  endDate: string;
  status: boolean;
  moduleId?: string;
  storeId?: string;
}

export async function fetchLiveCoupons(opts?: { storeId?: string; onlyActive?: boolean; limit?: number }): Promise<LiveCoupon[]> {
  if (!isSupabaseConfigured) return [];
  try {
    let q = supabase
      .from('coupons')
      .select('id, title, code, start_date, expire_date, min_purchase, max_discount, discount, discount_type, coupon_type, limit, total_uses, status, module_id, store_id')
      .eq('status', true)
      .order('created_at', { ascending: false });
    if (opts?.storeId) q = q.eq('store_id', opts.storeId);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error || !data) return [];
    return data.map((c: any) => ({
      id: String(c.id),
      title: c.title,
      code: c.code,
      discountType: c.discount_type,
      discount: Number(c.discount || 0),
      minPurchase: Number(c.min_purchase || 0),
      maxDiscount: Number(c.max_discount || 0),
      couponType: c.coupon_type,
      limit: c.limit,
      used: c.total_uses || 0,
      startDate: c.start_date,
      endDate: c.expire_date,
      status: c.status,
      moduleId: c.module_id,
      storeId: c.store_id,
    }));
  } catch {
    return [];
  }
}

// Validate + compute discount for a coupon code entered at checkout
export async function validateAndApplyCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; coupon?: LiveCoupon; reason?: string }> {
  if (!isSupabaseConfigured) {
    // Demo: pretend WELCOME20 = 20% off
    if (code.toUpperCase() === 'WELCOME20' && subtotal >= 20) {
      return { valid: true, discount: Math.min(subtotal * 0.2, 50) };
    }
    return { valid: false, discount: 0, reason: 'Invalid or expired coupon' };
  }
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('id, title, code, start_date, expire_date, min_purchase, max_discount, discount, discount_type, coupon_type, limit, total_uses, status')
      .eq('code', code.toUpperCase())
      .eq('status', true)
      .maybeSingle();
    if (error || !data) return { valid: false, discount: 0, reason: 'Invalid or expired coupon' };
    if (new Date(data.expire_date) < new Date()) return { valid: false, discount: 0, reason: 'Coupon has expired' };
    if (subtotal < Number(data.min_purchase || 0)) return { valid: false, discount: 0, reason: `Minimum purchase is $${data.min_purchase}` };
    // DB enum is 'percent' (6amMart default) — also accept 'percentage' for forward-compat.
    const isPercentage = data.discount_type === 'percent' || data.discount_type === 'percentage';
    let discount = isPercentage
      ? (subtotal * Number(data.discount)) / 100
      : Number(data.discount);
    if (data.max_discount && discount > Number(data.max_discount)) discount = Number(data.max_discount);
    return {
      valid: true,
      discount,
      coupon: {
        id: String(data.id),
        title: data.title,
        code: data.code,
        discountType: data.discount_type,
        discount: Number(data.discount),
        minPurchase: Number(data.min_purchase || 0),
        maxDiscount: Number(data.max_discount || 0),
        couponType: data.coupon_type,
        limit: data.limit,
        used: data.total_uses || 0,
        startDate: data.start_date,
        endDate: data.expire_date,
        status: data.status,
      },
    };
  } catch {
    return { valid: false, discount: 0, reason: 'Could not validate coupon' };
  }
}

// ---- Campaigns (admin-controlled, vendor joins) ----
export interface LiveCampaign {
  id: string;
  title: string;
  image?: string;
  description?: string;
  status: string;
  startDate: string;
  endDate: string;
  moduleId?: string;
  slug?: string;
}

export async function fetchLiveCampaigns(opts?: { onlyRunning?: boolean; limit?: number }): Promise<LiveCampaign[]> {
  if (!isSupabaseConfigured) return DEMO_CAMPAIGNS.slice(0, opts?.limit || 10).map((c: any) => ({
    id: String(c.id || Math.random()),
    title: c.title,
    image: c.image,
    description: c.description,
    status: 'running',
    startDate: c.start_date || new Date().toISOString(),
    endDate: c.end_date || new Date().toISOString(),
  }));
  try {
    let q = supabase
      .from('campaigns')
      .select('id, title, image, description, status, start_date, end_date, module_id, slug')
      .order('created_at', { ascending: false });
    if (opts?.onlyRunning) q = q.eq('status', 'running');
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error || !data) return [];
    return data.map((c: any) => ({
      id: String(c.id),
      title: c.title,
      image: c.image,
      description: c.description,
      status: c.status,
      startDate: c.start_date,
      endDate: c.end_date,
      moduleId: c.module_id,
      slug: c.slug,
    }));
  } catch {
    return [];
  }
}

// ---- Flash Sales (admin-controlled, customer sees countdown) ----
export interface LiveFlashSale {
  id: string;
  title: string;
  adminDiscountPercentage: number;
  vendorDiscountPercentage: number;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  slug?: string;
}

export async function fetchLiveFlashSales(opts?: { onlyPublished?: boolean; limit?: number }): Promise<LiveFlashSale[]> {
  if (!isSupabaseConfigured) return DEMO_FLASH_SALES.slice(0, opts?.limit || 5).map((f: any) => ({
    id: String(f.id || Math.random()),
    title: f.title,
    adminDiscountPercentage: Number(f.discount_percent || 20),
    vendorDiscountPercentage: 0,
    startDate: f.start_date || new Date().toISOString(),
    endDate: f.end_date || new Date(Date.now() + 86400000).toISOString(),
    isPublished: true,
  }));
  try {
    let q = supabase
      .from('flash_sales')
      .select('id, title, is_publish, admin_discount_percentage, vendor_discount_percentage, start_date, end_date, slug')
      .order('created_at', { ascending: false });
    if (opts?.onlyPublished) q = q.eq('is_publish', true);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error || !data) return [];
    return data.map((f: any) => ({
      id: String(f.id),
      title: f.title,
      adminDiscountPercentage: Number(f.admin_discount_percentage || 0),
      vendorDiscountPercentage: Number(f.vendor_discount_percentage || 0),
      startDate: f.start_date,
      endDate: f.end_date,
      isPublished: f.is_publish,
      slug: f.slug,
    }));
  } catch {
    return [];
  }
}

// ---- Categories (admin-controlled, customer home grid) ----
export async function fetchLiveCategories(opts?: { moduleId?: string; onlyActive?: boolean; limit?: number }): Promise<Category[]> {
  if (!isSupabaseConfigured) return DEMO_CATEGORIES.slice(0, opts?.limit || 12);
  try {
    let q = supabase
      .from('categories')
      .select('id, name, image, parent_id, position, priority, status, module_id, slug, featured')
      .eq('status', true)
      .order('position', { ascending: true });
    if (opts?.moduleId) q = q.eq('module_id', opts.moduleId);
    if (opts?.limit) q = q.limit(opts.limit);
    const { data, error } = await q;
    if (error || !data || data.length === 0) return DEMO_CATEGORIES.slice(0, opts?.limit || 12);
    return data.map((c: any) => ({
      id: String(c.id),
      name: c.name,
      image: c.image,
      parentId: c.parent_id,
      position: c.position,
      priority: c.priority,
      status: c.status,
      moduleId: c.module_id,
      slug: c.slug,
      featured: c.featured,
      category: 'food' as CategoryKey,
      item_count: 0,
      stores_count: 0,
    })) as Category[];
  } catch {
    return DEMO_CATEGORIES.slice(0, opts?.limit || 12);
  }
}
