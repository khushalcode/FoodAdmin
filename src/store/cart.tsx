// Cart store — ported from Flutter lib/features/cart/ + lib/helper/cart.repo logic.
// Supports vendor-grouped cart, variations, add-ons, and persistence via AsyncStorage.
// Falls back to local-only mode when REST backend is unavailable.

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConstants } from '@/constants/app_constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/store/auth';
import type { CartItem, CartGroup, Item } from '@/types';

const CART_STORAGE_KEY = AppConstants.cartList;

export interface AddToCartPayload {
  product: Item;
  quantity?: number;
  variationKey?: string;
  variationLabel?: string;
  variationPrice?: number;
  addOnIds?: number[];
  addOnNames?: string[];
  addOnPrice?: number;
  note?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  deliveryFee: number;
  grandTotal: number;
  cartGroups: CartGroup[];
  storeCount: number;
  addItem: (payload: AddToCartPayload) => Promise<void>;
  // Legacy alias — accepts Item directly (old screens pass product, not {product})
  addItemLegacy: (product: Item, quantity?: number) => Promise<void>;
  // Legacy: old screens use productId (string | number) to look up cart items.
  // We accept either type and find the matching cart line.
  updateQuantity: (cartItemIdOrProductId: string | number, quantity: number) => Promise<void>;
  removeItem: (cartItemIdOrProductId: string | number) => Promise<void>;
  clear: () => Promise<void>;
  clearStore: (storeId: number) => Promise<void>;
  isInCart: (productId: string | number, variationKey?: string) => boolean;
  getQuantity: (productId: string | number, variationKey?: string) => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Helper: persist cart to local storage (and best-effort push to backend)
async function persistCart(items: CartItem[]) {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } else {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  } catch {}
}

async function loadCartFromStorage(): Promise<CartItem[]> {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function computeItemPrice(item: CartItem): number {
  const unit = item.variation_price ?? item.product.price;
  return (unit + (item.add_on_price || 0)) * item.quantity;
}

function computeItemDiscount(item: CartItem): number {
  if (item.product.discount_type === 'percent') {
    return (item.product.price * item.product.discount / 100) * item.quantity;
  }
  return item.product.discount * item.quantity;
}

function computeItemTax(item: CartItem): number {
  if (item.product.tax_type === 'include') return 0;
  const taxable = computeItemPrice(item);
  return (taxable * item.product.tax) / 100;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    let mounted = true;
    loadCartFromStorage().then((loaded) => {
      if (mounted) setItems(loaded);
    });
    return () => { mounted = false; };
  }, []);

  // Pull from Supabase `carts` table when authenticated (unified with admin DB)
  useEffect(() => {
    if (!isSupabaseConfigured || !session.user || session.user.is_guest) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('carts')
          .select('*, items(*, stores(id, name, logo))')
          .eq('user_id', session.user!.id);
        if (!mounted || !data) return;
        const remote: CartItem[] = data
          .filter((row: any) => row.items)
          .map((row: any) => ({
            id: String(row.id),
            product_id: row.item_id,
            product: row.items as Item,
            store_id: row.store_id ?? row.items.store_id,
            store_name: row.items.stores?.name ?? '',
            variation_key: undefined,
            variation_label: undefined,
            variation_price: undefined,
            add_on_ids: [],
            add_on_names: [],
            add_on_price: 0,
            quantity: row.quantity,
            unit_price: Number(row.items.price ?? 0),
            total_price: Number(row.items.price ?? 0) * row.quantity,
            discount_amount: 0,
            tax_amount: 0,
            note: undefined,
          }));
        setItems(remote);
        await persistCart(remote);
      } catch {}
    })();
    return () => { mounted = false; };
  }, [session.user]);

  useEffect(() => {
    persistCart(items);
  }, [items]);

  const addItem = useCallback(async (payload: AddToCartPayload) => {
    const { product, quantity = 1, variationKey, variationLabel, variationPrice, addOnIds = [], addOnNames = [], addOnPrice = 0, note } = payload;

    setItems((prev) => {
      // Key: productId + variation + addOns (so different variations are separate cart lines)
      const existing = prev.find((i) =>
        i.product_id === product.id &&
        i.variation_key === variationKey &&
        i.add_on_ids.join(',') === addOnIds.join(',')
      );

      const cartItemId = existing?.id ?? `${product.id}-${variationKey ?? 'default'}-${addOnIds.join('-') || 'none'}-${Date.now()}`;
      const unitPrice = variationPrice ?? product.price;
      const totalPrice = (unitPrice + addOnPrice) * quantity;
      const discountAmount = product.discount_type === 'percent'
        ? (product.price * product.discount / 100) * quantity
        : product.discount * quantity;
      const taxAmount = product.tax_type === 'include' ? 0 : (totalPrice * product.tax) / 100;

      const newItem: CartItem = {
        id: cartItemId,
        product_id: product.id,
        product,
        store_id: product.store_id,
        store_name: product.store_name ?? '',
        variation_key: variationKey,
        variation_label: variationLabel,
        variation_price: variationPrice,
        add_on_ids: addOnIds,
        add_on_names: addOnNames,
        add_on_price: addOnPrice,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        note,
      };

      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? {
                ...i,
                quantity: i.quantity + quantity,
                total_price: (i.unit_price + i.add_on_price) * (i.quantity + quantity),
                discount_amount: i.discount_amount + discountAmount,
                tax_amount: i.tax_amount + taxAmount,
              }
            : i
        );
      }
      return [...prev, newItem];
    });

    // Sync to Supabase `carts` table (unified with admin DB)
    if (isSupabaseConfigured && session.user && !session.user.is_guest) {
      try {
        const { data: existingRow } = await supabase
          .from('carts')
          .select('id, quantity')
          .eq('user_id', session.user.id)
          .eq('item_id', product.id)
          .maybeSingle();
        if (existingRow) {
          await supabase.from('carts').update({
            quantity: ((existingRow as any).quantity ?? 0) + quantity,
          }).eq('id', (existingRow as any).id);
        } else {
          await supabase.from('carts').insert({
            user_id: session.user.id,
            item_id: product.id,
            store_id: product.store_id,
            quantity,
            price: product.price,
          });
        }
      } catch {}
    }
  }, [session.user]);

  // Legacy: addItemLegacy(product, quantity) — wraps addItem({product, quantity})
  const addItemLegacy = useCallback((product: Item, quantity = 1) => {
    return addItem({ product, quantity });
  }, [addItem]);

  const updateQuantity = useCallback(async (cartItemIdOrProductId: string | number, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(cartItemIdOrProductId);
    }
    let targetProduct: CartItem | undefined;
    setItems((prev) => {
      // Match by cart item id OR by product id (legacy screens pass product.id)
      const target = prev.find((i) => i.id === String(cartItemIdOrProductId) || String(i.product_id) === String(cartItemIdOrProductId));
      targetProduct = target;
      if (!target) return prev;
      const unit = target.variation_price ?? target.product.price;
      const totalPrice = (unit + target.add_on_price) * quantity;
      const discountAmount = target.product.discount_type === 'percent'
        ? (target.product.price * target.product.discount / 100) * quantity
        : target.product.discount * quantity;
      const taxAmount = target.product.tax_type === 'include' ? 0 : (totalPrice * target.product.tax) / 100;
      return prev.map((i) => i.id === target.id ? {
        ...i,
        quantity,
        total_price: totalPrice,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
      } : i);
    });
    // Sync to Supabase
    if (targetProduct && isSupabaseConfigured && session.user && !session.user.is_guest) {
      try {
        await supabase.from('carts')
          .update({ quantity })
          .eq('user_id', session.user.id)
          .eq('item_id', targetProduct.product_id);
      } catch {}
    }
  }, [session.user]);

  const removeItem = useCallback(async (cartItemIdOrProductId: string | number) => {
    const target = items.find((i) => i.id === String(cartItemIdOrProductId) || String(i.product_id) === String(cartItemIdOrProductId));
    setItems((prev) => prev.filter((i) =>
      i.id !== String(cartItemIdOrProductId) &&
      String(i.product_id) !== String(cartItemIdOrProductId)
    ));
    // Sync to Supabase
    if (target && isSupabaseConfigured && session.user && !session.user.is_guest) {
      try {
        await supabase.from('carts')
          .delete()
          .eq('user_id', session.user.id)
          .eq('item_id', target.product_id);
      } catch {}
    }
  }, [items, session.user]);

  const clear = useCallback(async () => {
    setItems([]);
  }, []);

  const clearStore = useCallback(async (storeId: number) => {
    setItems((prev) => prev.filter((i) => i.store_id !== storeId));
  }, []);

  const isInCart = useCallback((productId: string | number, variationKey?: string) =>
    items.some((i) => String(i.product_id) === String(productId) && (variationKey === undefined || i.variation_key === variationKey)),
    [items]
  );

  const getQuantity = useCallback((productId: string | number, variationKey?: string) =>
    items.filter((i) => String(i.product_id) === String(productId) && (variationKey === undefined || i.variation_key === variationKey))
      .reduce((s, i) => s + i.quantity, 0),
    [items]
  );

  // Computed totals
  const subtotal = useMemo(() => items.reduce((s, i) => s + computeItemPrice(i), 0), [items]);
  const totalDiscount = useMemo(() => items.reduce((s, i) => s + computeItemDiscount(i), 0), [items]);
  const totalTax = useMemo(() => items.reduce((s, i) => s + computeItemTax(i), 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  // Cart groups by store
  const cartGroups = useMemo<CartGroup[]>(() => {
    const map = new Map<number, CartGroup>();
    for (const item of items) {
      const existing = map.get(item.store_id);
      if (existing) {
        existing.items.push(item);
        existing.subtotal += computeItemPrice(item);
        existing.discount += computeItemDiscount(item);
      } else {
        map.set(item.store_id, {
          store_id: item.store_id,
          store_name: item.store_name,
          store_logo: item.product.store_image_url ?? null,
          items: [item],
          subtotal: computeItemPrice(item),
          discount: computeItemDiscount(item),
          delivery_fee: 0,
          total: 0,
        });
      }
    }
    // Finalize totals per group
    for (const group of map.values()) {
      group.delivery_fee = group.subtotal >= 50 ? 0 : 5; // free delivery over $50
      const bulkDiscount = group.subtotal >= 100 ? group.subtotal * 0.05 : 0; // 5% off over $100
      group.discount += bulkDiscount;
      group.total = group.subtotal - group.discount + group.delivery_fee;
    }
    return Array.from(map.values());
  }, [items]);

  const deliveryFee = useMemo(() => cartGroups.reduce((s, g) => s + g.delivery_fee, 0), [cartGroups]);
  const grandTotal = useMemo(() => cartGroups.reduce((s, g) => s + g.total, 0), [cartGroups]);
  const storeCount = useMemo(() => cartGroups.length, [cartGroups]);

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    totalDiscount,
    totalTax,
    deliveryFee,
    grandTotal,
    cartGroups,
    storeCount,
    addItem,
    addItemLegacy,
    updateQuantity,
    removeItem,
    clear,
    clearStore,
    isInCart,
    getQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
