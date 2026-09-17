// Favorites store — ported from Flutter lib/features/favourite/.
// Supports both item favorites and store favorites.

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConstants } from '@/constants/app_constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/store/auth';
import type { Item, Store } from '@/types';

const STORAGE_KEY = AppConstants.wishList;

export type FavoriteType = 'item' | 'store';

interface FavoriteEntry {
  id: number;
  type: FavoriteType;
  item?: Item;
  store?: Store;
  created_at: string;
}

interface FavoritesContextValue {
  items: Item[];
  stores: Store[];
  favoriteIds: Set<number>;
  toggleItem: (item: Item) => Promise<void>;
  toggleStore: (store: Store) => Promise<void>;
  isFavoriteItem: (itemId: number) => boolean;
  isFavoriteStore: (storeId: number) => boolean;
  clearAll: () => Promise<void>;
  // Legacy aliases (old screens use these names)
  productIds: Set<number>;
  vendorIds: Set<number>;
  toggleProduct: (item: Item) => Promise<void>;
  toggleVendor: (store: Store) => Promise<void>;
  isProductFavorite: (itemId: number) => boolean;
  isVendorFavorite: (storeId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

async function loadFromStorage(): Promise<FavoriteEntry[]> {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function persist(entries: FavoriteEntry[]) {
  try {
    const s = JSON.stringify(entries);
    if (Platform.OS === 'web') localStorage.setItem(STORAGE_KEY, s);
    else await AsyncStorage.setItem(STORAGE_KEY, s);
  } catch {}
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [entries, setEntries] = useState<FavoriteEntry[]>([]);

  useEffect(() => {
    let mounted = true;
    loadFromStorage().then((e) => { if (mounted) setEntries(e); });
    return () => { mounted = false; };
  }, []);

  // Pull from Supabase `wishlists` table when authenticated
  useEffect(() => {
    if (!isSupabaseConfigured || !session.user || session.user.is_guest) return;
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('wishlists')
          .select('*, items(*), stores(*)')
          .eq('user_id', session.user!.id);
        if (!mounted || !data) return;
        const remote: FavoriteEntry[] = data.map((row: any) => ({
          id: row.is_item ? row.item_id : row.store_id,
          type: row.is_item ? 'item' : 'store',
          item: row.items ?? undefined,
          store: row.stores ?? undefined,
          created_at: row.created_at,
        }));
        setEntries(remote);
        // Cache to AsyncStorage for offline use
        await persist(remote);
      } catch {}
    })();
    return () => { mounted = false; };
  }, [session.user]);

  useEffect(() => {
    persist(entries);
  }, [entries]);

  const toggleItem = useCallback(async (item: Item) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.type === 'item' && e.id === item.id);
      if (existing) return prev.filter((e) => e !== existing);
      return [...prev, {
        id: item.id,
        type: 'item' as const,
        item,
        created_at: new Date().toISOString(),
      }];
    });
    // Sync to Supabase
    if (isSupabaseConfigured && session.user && !session.user.is_guest) {
      try {
        const { data } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('item_id', item.id)
          .maybeSingle();
        if (data) {
          await supabase.from('wishlists').delete().eq('id', (data as any).id);
        } else {
          await supabase.from('wishlists').insert({
            user_id: session.user.id,
            item_id: item.id,
            is_item: true,
          });
        }
      } catch {}
    }
  }, [session.user]);

  const toggleStore = useCallback(async (store: Store) => {
    setEntries((prev) => {
      const existing = prev.find((e) => e.type === 'store' && e.id === store.id);
      if (existing) return prev.filter((e) => e !== existing);
      return [...prev, {
        id: store.id,
        type: 'store' as const,
        store,
        created_at: new Date().toISOString(),
      }];
    });
    // Sync to Supabase
    if (isSupabaseConfigured && session.user && !session.user.is_guest) {
      try {
        const { data } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('store_id', store.id)
          .maybeSingle();
        if (data) {
          await supabase.from('wishlists').delete().eq('id', (data as any).id);
        } else {
          await supabase.from('wishlists').insert({
            user_id: session.user.id,
            store_id: store.id,
            is_item: false,
          });
        }
      } catch {}
    }
  }, [session.user]);

  const isFavoriteItem = useCallback((itemId: number) =>
    entries.some((e) => e.type === 'item' && e.id === itemId),
    [entries]
  );

  const isFavoriteStore = useCallback((storeId: number) =>
    entries.some((e) => e.type === 'store' && e.id === storeId),
    [entries]
  );

  const clearAll = useCallback(async () => {
    setEntries([]);
  }, []);

  const items = useMemo(() => entries.filter((e) => e.type === 'item').map((e) => e.item!).filter(Boolean), [entries]);
  const stores = useMemo(() => entries.filter((e) => e.type === 'store').map((e) => e.store!).filter(Boolean), [entries]);
  const favoriteIds = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);
  const productIds = useMemo(() => new Set(entries.filter((e) => e.type === 'item').map((e) => e.id)), [entries]);
  const vendorIds = useMemo(() => new Set(entries.filter((e) => e.type === 'store').map((e) => e.id)), [entries]);

  const value: FavoritesContextValue = {
    items,
    stores,
    favoriteIds,
    toggleItem,
    toggleStore,
    isFavoriteItem,
    isFavoriteStore,
    clearAll,
    // Legacy aliases
    productIds,
    vendorIds,
    toggleProduct: toggleItem,
    toggleVendor: toggleStore,
    isProductFavorite: isFavoriteItem,
    isVendorFavorite: isFavoriteStore,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
