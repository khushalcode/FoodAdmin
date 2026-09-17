// Offers screen — shows All / Items / Stores filter.
// Pages 5-12 of the PDF design mockup.

import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, DiscountBadge, FavoriteButton, AddButton, Rating, VerifiedBadge, DeliveryTimePill, AdBadge, EmptyState } from '@/components/ui/index';
import { fetchVendors, fetchProducts } from '@/lib/data';
import { useCart } from '@/store/cart';
import { useFavorites } from '@/store/favorites';
import type { Vendor, Product, CategoryKey } from '@/types'; import { getItemImageUrl } from '@/types';

interface OffersScreenProps {
  onTabNavigate?: (k: any) => void;
}

type FilterKey = 'all' | 'items' | 'stores';

const CATEGORIES_TABS: CategoryKey[] = ['grocery', 'pharmacy', 'shop', 'food'];

export function OffersScreen({ onTabNavigate }: OffersScreenProps) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryKey>('grocery');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetchVendors({ category }),
      fetchProducts({ category }),
    ]).then(([v, p]) => {
      if (mounted) {
        setVendors(v);
        setProducts(p);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [category]);

  const filteredVendors = vendors.filter(v => filter === 'all' || filter === 'stores');
  const filteredProducts = products.filter(p => filter === 'all' || filter === 'items');
  const totalCount = filteredVendors.length + filteredProducts.length;

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => onTabNavigate?.('home')} />
        <Text style={styles.headerTitle}>Offers</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catTabsRow}>
        {CATEGORIES_TABS.map((c) => {
          const isActive = c === category;
          return (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.catTab, isActive && styles.catTabActive]}
              hitSlop={4}
            >
              <Text style={[styles.catTabText, isActive && styles.catTabTextActive]}>
                {capitalize(c)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search bar */}
      <Pressable style={styles.searchBar} onPress={() => router.push('/search')}>
        <Text style={styles.searchPlaceholder}>Search for offers</Text>
        <Ionicons name="search" size={18} color={Colors.textTertiary} />
      </Pressable>

      {/* Filter row */}
      <View style={styles.filterRow}>
        <Text style={styles.resultCount}>{totalCount} results</Text>
        <View style={styles.filterChips}>
          {(['all', 'items', 'stores'] as FilterKey[]).map((f) => {
            const isActive = f === filter;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                hitSlop={4}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {capitalize(f)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
        ) : (
          <>
            {filter !== 'items' && filteredVendors.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Store Result</Text>
                {filteredVendors.map((v) => (
                  <StoreOfferCard key={v.id} vendor={v} onPress={() => router.push(`/vendor/${v.id}`)} />
                ))}
              </View>
            )}
            {filter !== 'stores' && filteredProducts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Item Result</Text>
                <View style={styles.itemsGrid}>
                  {filteredProducts.map((p) => (
                    <ProductOfferCard
                      key={p.id}
                      product={p}
                      onPress={() => router.push(`/product/${p.id}`)}
                    />
                  ))}
                </View>
              </View>
            )}
            {!loading && totalCount === 0 && (
              <EmptyState
                icon="tag-off-outline"
                title="No offers yet"
                subtitle={`There are currently no offers in the ${capitalize(category)} category.`}
              />
            )}
          </>
        )}
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function vendorName(p: Product): string {
  const v = require('@/data/demo-data').DEMO_VENDORS.find((v: Vendor) => v.id === p.vendor_id);
  return v?.name ?? '';
}

// --- Store offer card (with promo banner) ---
function StoreOfferCard({ vendor, onPress }: { vendor: Vendor; onPress: () => void }) {
  const { isVendorFavorite, toggleVendor } = useFavorites();
  const fav = isVendorFavorite(vendor.id);
  const bg = bgForCategory((vendor.category ?? 'grocery'));

  return (
    <Pressable style={styles.storeCard} onPress={onPress}>
      <View style={[styles.storeBanner, { backgroundColor: bg }]}>
        <View style={styles.storeBannerContent}>
          <Text style={styles.storeBannerText}>{vendor.tagline}</Text>
        </View>
        <View style={styles.storeBannerIcon}>
          <MaterialCommunityIcons
            name={iconForCategory((vendor.category ?? 'grocery')) as any}
            size={48}
            color={Colors.primaryDark}
          />
        </View>
        <FavoriteButton active={fav} onPress={() => toggleVendor(vendor)} style={styles.storeFav} />
        {vendor.is_promoted && <AdBadge />}
      </View>
      <View style={styles.storeInfo}>
        <View style={styles.storeNameRow}>
          {vendor.verified && <VerifiedBadge size={14} />}
          <Text style={styles.storeName} numberOfLines={1}>{vendor.name}</Text>
        </View>
        <View style={styles.storeMetaRow}>
          <Rating value={vendor.rating} count={vendor.rating_count} size="sm" />
          <Text style={styles.metaDot}>·</Text>
          <DeliveryTimePill
            minutes={formatDeliveryTime(vendor)}
            distanceKm={vendor.distance_km}
          />
          {(vendor.discount_pct ?? 0) > 0 && <DiscountBadge percent={vendor.discount_pct ?? 0} />}
        </View>
      </View>
    </Pressable>
  );
}

function formatDeliveryTime(v: Vendor): string {
  if (v.delivery_time_min >= 60) {
    return `${Math.round(v.delivery_time_min / 60)}-${Math.round(v.delivery_time_max / 60)} hours`;
  }
  return `${v.delivery_time_min}-${v.delivery_time_max} min`;
}

function bgForCategory(c: CategoryKey): string {
  switch (c) {
    case 'grocery': return Colors.catYellow;
    case 'pharmacy': return Colors.catMint;
    case 'shop': return Colors.catPink;
    case 'food': return Colors.catOrange;
    case 'parcel': return Colors.catMint;
    default: return "";
  }
}

function iconForCategory(c: CategoryKey): string {
  switch (c) {
    case 'grocery': return 'cart-variant';
    case 'pharmacy': return 'medical-bag';
    case 'shop': return 'shopping-outline';
    case 'food': return 'food-apple-outline';
    case 'parcel': return 'package-variant-closed';
    default: return "";
  }
}

// --- Product offer card (with heart, +add, strikethrough) ---
function ProductOfferCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const router = useRouter();
  const { addItem, addItemLegacy } = useCart();
  const { isProductFavorite, toggleProduct } = useFavorites();
  const fav = isProductFavorite(product.id);

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemImageWrap}>
        <Pressable onPress={onPress} style={styles.itemImagePress}>
          {product.image_url ? (
            <Image source={{ uri: getItemImageUrl(product) ?? undefined }} style={styles.itemImage} resizeMode="contain" />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <MaterialCommunityIcons name="image-outline" size={28} color={Colors.textTertiary} />
            </View>
          )}
        </Pressable>
        <FavoriteButton active={fav} onPress={() => toggleProduct(product)} style={styles.itemFav} />
        <AddButton onPress={() => addItemLegacy(product)} style={styles.itemAdd} />
        {(product.discount_pct ?? 0) > 0 && (
          <View style={styles.itemDiscount}>
            <DiscountBadge percent={product.discount_pct ?? 0} />
          </View>
        )}
      </View>
      <Pressable onPress={onPress}>
        <Text style={styles.itemVendor} numberOfLines={1}>{vendorName(product)}</Text>
        <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.itemPriceRow}>
          <Text style={styles.itemPrice}>${product.price.toFixed(2)}</Text>
          {(product.original_price ?? null) && (
            <Text style={styles.itemOriginal}>${(product.original_price ?? 0).toFixed(2)}</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  catTabsRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  catTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.xs,
  },
  catTabActive: {
    backgroundColor: Colors.surfaceAlt,
  },
  catTabText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  catTabTextActive: {
    color: Colors.text,
    fontWeight: FontWeight.bold,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchPlaceholder: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  resultCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  filterChips: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xs,
  },
  filterChipText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  filterChipTextActive: {
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  storeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  storeBanner: {
    height: 140,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  storeBannerContent: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  storeBannerText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
  },
  storeBannerIcon: {
    padding: Spacing.sm,
  },
  storeFav: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  storeInfo: {
    padding: Spacing.md,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  storeName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  metaDot: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  itemCard: {
    width: 150,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImageWrap: {
    position: 'relative',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    height: 120,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImagePress: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '90%',
    height: '90%',
  },
  itemImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemFav: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  itemAdd: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  itemDiscount: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  itemVendor: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    minHeight: 36,
    marginBottom: 4,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  itemPrice: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  itemOriginal: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
});
