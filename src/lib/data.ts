// Data access layer — unified with the FoodHub admin panel database.
//
// Both apps now read from the SAME Supabase project, using the SAME tables:
//   - stores          (was: vendors)
//   - items           (was: products)
//   - categories      (added)
//   - banners         (added)
//   - customer_addresses  (was: addresses)
//   - carts           (was: cart_items)
//   - wishlists       (was: favorites)
//   - orders + order_details   (was: orders + order_items)
//
// Fallback chain:
//   1. Supabase (if isSupabaseConfigured)
//   2. REST API (if base url is configured and reachable)
//   3. Demo data (always available, used for offline/preview)

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { apiClient, ApiChecker } from '@/lib/api_client';
import { AppConstants } from '@/constants/app_constants';
import { DEMO_STORES, DEMO_ITEMS, DEMO_CATEGORIES, DEMO_BANNERS } from '@/data/demo-data';
import type { Store, Item, Category, Banner, CategoryKey } from '@/types';

// Accept either string or number IDs (route params come as strings; demo data uses numbers).
type IdType = string | number;

function matchId(rowId: IdType, target: IdType): boolean {
  return String(rowId) === String(target);
}

function moduleKeyToCategoryKey(moduleType?: string | null): CategoryKey | undefined {
  if (!moduleType) return undefined;
  const m = moduleType.toLowerCase();
  if (m === 'grocery') return 'grocery';
  if (m === 'pharmacy') return 'pharmacy';
  if (m === 'shop') return 'shop';
  if (m === 'food') return 'food';
  if (m === 'parcel') return 'parcel';
  return undefined;
}

// Look up the module's `module_type` from its id, so we can map store/item rows back to a CategoryKey.
async function lookupModuleType(moduleId?: number | null): Promise<string | null> {
  if (!moduleId) return null;
  try {
    const { data } = await supabase
      .from('modules')
      .select('module_type')
      .eq('id', moduleId)
      .maybeSingle();
    return (data as any)?.module_type ?? null;
  } catch {
    return null;
  }
}

// ---- Stores / Vendors ----

export async function fetchVendors(opts?: {
  category?: CategoryKey;
  featured?: boolean;
  limit?: number;
}): Promise<Store[]> {
  // 1. Supabase (primary — unified with admin DB)
  if (isSupabaseConfigured) {
    try {
      // Join with modules to filter by module_type when `category` is given.
      let query = supabase
        .from('stores')
        .select('*, modules!inner(module_type, module_name)')
        .eq('status', true)
        .eq('active', true);

      if (opts?.category) {
        query = query.eq('modules.module_type', opts.category);
      }
      if (opts?.featured) {
        query = query.eq('featured', true);
      }
      if (opts?.limit) {
        query = query.limit(opts.limit);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row: any) => mapStoreRow(row, row.modules?.module_type));
      }
    } catch {}
  }

  // 2. REST API fallback
  try {
    const res = await apiClient.getData<Store[]>(AppConstants.storeUri, {
      category: opts?.category,
      featured: opts?.featured ? 1 : undefined,
      limit: opts?.limit,
    });
    if (ApiChecker.isSuccess(res.code) && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch {}

  // 3. Demo fallback
  let result = [...DEMO_STORES];
  if (opts?.category) {
    result = result.filter(
      (v) =>
        moduleKeyToCategoryKey(String((v as any).module_type)) === opts.category ||
        (v as any).category === opts.category,
    );
  }
  if (opts?.featured) {
    result = result.filter((v) => v.is_featured === 1 || (v as any).is_featured === true);
  }
  if (opts?.limit) result = result.slice(0, opts.limit);
  return result;
}

export async function fetchVendorById(id: IdType): Promise<Store | null> {
  // 1. Supabase
  if (isSupabaseConfigured) {
    try {
      const numericId = Number(id);
      const isNumeric = !isNaN(numericId) && String(numericId) === String(id);
      let query = supabase
        .from('stores')
        .select('*, modules(module_type, module_name)')
        .or(isNumeric ? `id.eq.${numericId},slug.eq.${id}` : `slug.eq.${id}`);

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return mapStoreRow(data as any, (data as any).modules?.module_type);
      }
    } catch {}
  }

  // 2. REST
  try {
    const res = await apiClient.getData<Store>(AppConstants.storeDetailsUri + id);
    if (ApiChecker.isSuccess(res.code) && res.data) {
      return res.data;
    }
  } catch {}

  // 3. Demo
  return (
    DEMO_STORES.find((v) => matchId(v.id, id) || matchId((v as any).slug ?? '', id)) ?? null
  );
}

// ---- Items / Products ----

export async function fetchProducts(opts?: {
  category?: CategoryKey;
  vendorId?: IdType;
  subcategory?: string;
  featured?: boolean;
  popular?: boolean;
  search?: string;
  limit?: number;
}): Promise<Item[]> {
  // 1. Supabase (primary — unified with admin DB)
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('items')
        .select('*, stores!inner(id, name, logo), modules!inner(module_type)')
        .eq('status', true)
        .eq('is_approved', true);

      if (opts?.category) {
        query = query.eq('modules.module_type', opts.category);
      }
      if (opts?.vendorId) {
        const sid = Number(opts.vendorId);
        if (!isNaN(sid)) query = query.eq('store_id', sid);
      }
      if (opts?.featured) query = query.eq('featured', true);
      if (opts?.popular) query = query.order('order_count', { ascending: false });
      if (opts?.search) query = query.ilike('name', `%${opts.search}%`);
      if (opts?.limit) query = query.limit(opts.limit);
      else query = query.limit(50);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row: any) =>
          mapItemRow(row, row.modules?.module_type, row.stores?.name, row.stores?.logo),
        );
      }
    } catch {}
  }

  // 2. REST fallback
  try {
    let uri: string = AppConstants.storeItemUri;
    if (opts?.popular) uri = AppConstants.popularItemUri;
    const res = await apiClient.getData<Item[]>(uri, {
      category: opts?.category,
      store_id: opts?.vendorId as any,
      featured: opts?.featured ? 1 : undefined,
      search: opts?.search,
      limit: opts?.limit,
    });
    if (ApiChecker.isSuccess(res.code) && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch {}

  // 3. Demo fallback
  let result = [...DEMO_ITEMS];
  if (opts?.category) {
    result = result.filter(
      (p) =>
        (p as any).category === opts.category ||
        moduleKeyToCategoryKey(String((p as any).module_id)) === opts.category,
    );
  }
  if (opts?.vendorId) {
    result = result.filter(
      (p) => matchId(p.store_id, opts.vendorId!) || matchId((p as any).vendor_id ?? '', opts.vendorId!),
    );
  }
  if (opts?.subcategory) {
    result = result.filter((p) => (p as any).subcategory === opts.subcategory);
  }
  if (opts?.featured) {
    result = result.filter((p) => p.is_featured === 1 || (p as any).is_featured === true);
  }
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q),
    );
  }
  if (opts?.limit) result = result.slice(0, opts.limit);
  return result;
}

export async function fetchProductById(id: IdType): Promise<Item | null> {
  // 1. Supabase
  if (isSupabaseConfigured) {
    try {
      const numericId = Number(id);
      if (!isNaN(numericId) && String(numericId) === String(id)) {
        const { data, error } = await supabase
          .from('items')
          .select('*, stores(id, name, logo), modules(module_type)')
          .eq('id', numericId)
          .maybeSingle();
        if (!error && data) {
          return mapItemRow(
            data as any,
            (data as any).modules?.module_type,
            (data as any).stores?.name,
            (data as any).stores?.logo,
          );
        }
      }
    } catch {}
  }

  // 2. REST
  try {
    const res = await apiClient.getData<Item>(AppConstants.itemDetailsUri + id);
    if (ApiChecker.isSuccess(res.code) && res.data) {
      return res.data;
    }
  } catch {}

  // 3. Demo
  return DEMO_ITEMS.find((p) => matchId(p.id, id)) ?? null;
}

// ---- Categories ----
export async function fetchCategories(moduleId?: number): Promise<Category[]> {
  // 1. Supabase
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('categories').select('*').eq('status', true);
      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }
      query = query.order('position', { ascending: true });
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(mapCategoryRow);
      }
    } catch {}
  }

  // 2. REST fallback
  try {
    const res = await apiClient.getData<Category[]>(AppConstants.categoryUri, { module_id: moduleId });
    if (ApiChecker.isSuccess(res.code) && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch {}

  // 3. Demo
  return DEMO_CATEGORIES;
}

// ---- Banners ----
export async function fetchBanners(moduleId?: number): Promise<Banner[]> {
  // 1. Supabase
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('banners').select('*').eq('status', true);
      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(mapBannerRow);
      }
    } catch {}
  }

  // 2. REST fallback
  try {
    const res = await apiClient.getData<Banner[]>(AppConstants.bannerUri, { module_id: moduleId });
    if (ApiChecker.isSuccess(res.code) && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch {}

  // 3. Demo
  return DEMO_BANNERS;
}

// ---- Mappers ----

function mapStoreRow(row: any, moduleType?: string): Store {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    module_id: row.module_id ?? 0,
    module_name: row.module_name ?? (row.modules?.module_name ?? undefined),
    category_id: row.category_id ?? 0,
    category_ids: row.category_ids ?? [],
    logo_url: row.logo ?? row.logo_url ?? null,
    cover_photo_url: row.cover_photo ?? row.cover_photo_url ?? null,
    description: row.description ?? row.announcement ?? null,
    address: row.address ?? '',
    latitude: Number(row.lat ?? row.latitude ?? 0),
    longitude: Number(row.lng ?? row.longitude ?? 0),
    phone: row.phone ?? '',
    email: row.email ?? '',
    rating: Number(row.rating ?? 0),
    rating_count: row.rating_count ?? 0,
    order_count: row.order_count ?? 0,
    is_featured: row.featured ? 1 : 0,
    is_active: row.active ?? row.is_active ?? true,
    is_open: row.status ?? row.is_open ?? true,
    is_promoted: row.is_promoted ?? false,
    is_verified: row.is_verified ?? (row.store_business_model !== 'none'),
    delivery_time_min: row.delivery_time_min ?? 20,
    delivery_time_max: row.delivery_time_max ?? 45,
    delivery_fee: Number(row.per_km_shipping_charge ?? row.delivery_charge ?? 0),
    minimum_order_amount: Number(row.minimum_order ?? 0),
    free_delivery: row.free_delivery ?? false,
    distance_km: Number(row.distance_km ?? 0),
    discount_pct: Number(row.discount_pct ?? 0) / 100,
    discount_amount: Number(row.discount_amount ?? 0),
    discount_type: row.discount_type ?? 'percent',
    self_delivery_system: row.self_delivery_system ?? false,
    zone_id: row.zone_id ?? 1,
    // Convenience fields for legacy callers
    category: moduleType ? moduleKeyToCategoryKey(moduleType) : undefined,
    tagline: row.tagline ?? row.announcement ?? '',
    verified: row.is_verified ?? (row.store_business_model !== 'none'),
  } as Store;
}

function mapItemRow(row: any, moduleType?: string, storeName?: string, storeLogo?: string): Item {
  const imagesArr: string[] = (() => {
    if (Array.isArray(row.images)) return row.images;
    if (Array.isArray(row.images_url_full_path)) return row.images_url_full_path;
    if (row.image) return [row.image];
    return [];
  })();
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image_url: row.image ?? (imagesArr.length > 0 ? imagesArr[0] : null),
    image_url_legacy: row.image,
    images_url_full_path: imagesArr,
    category_id: row.category_id ?? 0,
    category_ids: row.category_ids ?? [],
    module_id: row.module_id ?? 0,
    unit_type: row.unit_type ?? '',
    unit: row.unit ?? '',
    price: Number(row.price ?? 0),
    discount: Number(row.discount ?? 0),
    discount_type: row.discount_type ?? 'amount',
    store_id: row.store_id,
    store_name: storeName,
    store_image_url: storeLogo,
    rating: Number(row.avg_rating ?? 0),
    rating_count: row.rating_count ?? 0,
    order_count: row.order_count ?? 0,
    is_featured: row.featured ? 1 : 0,
    is_popular: row.order_count > 50 ? 1 : 0,
    is_recommended: row.recommended ? 1 : 0,
    add_ons: row.add_ons ?? [],
    variations: row.food_variations ?? row.variations ?? [],
    stock: row.stock ?? 0,
    tax: Number(row.tax ?? 0),
    tax_type: row.tax_type ?? 'exclude',
    status: row.status ?? true,
    // Legacy aliases
    vendor_id: row.store_id,
    original_price: row.price ? Number(row.price) + Number(row.discount ?? 0) : null,
    discount_pct: row.discount_type === 'percent' ? Number(row.discount ?? 0) / 100 : 0,
    subcategory: row.subcategory,
    category: moduleType ? moduleKeyToCategoryKey(moduleType) : undefined,
    is_veg: row.veg ?? false,
    is_halal: row.is_halal ?? false,
    is_organic: row.organic ?? false,
  } as Item;
}

function mapCategoryRow(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    image_url: row.image ?? null,
    module_id: row.module_id ?? 0,
    position: row.position ?? 0,
    parent_id: row.parent_id ?? null,
    priority: row.priority ?? 'low',
    status: row.status ?? true,
    item_count: row.item_count ?? 0,
    stores_count: row.stores_count ?? 0,
  } as Category;
}

function mapBannerRow(row: any): Banner {
  return {
    id: row.id,
    title: row.title,
    image_url: row.image,
    type: row.type ?? 'app',
    module_id: row.module_id ?? 0,
    data: row.data ?? null,
    store_id: row.store_id ?? null,
    item_id: row.item_id ?? null,
    category_id: row.category_id ?? null,
    background_color: row.background_color ?? null,
    redirect_link: row.redirect_link ?? row.default_link ?? null,
  } as Banner;
}

// Backwards-compat aliases
export const fetchStores = fetchVendors;
export const fetchStoreById = fetchVendorById;
export const fetchItems = fetchProducts;
export const fetchItemById = fetchProductById;

// Re-export mappers for the stores layer to use
export { mapStoreRow, mapItemRow };
