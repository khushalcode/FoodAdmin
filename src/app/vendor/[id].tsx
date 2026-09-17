// Vendor / Store detail screen — shows vendor info, products list, search.

import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, SectionHeader, DiscountBadge, FavoriteButton, AddButton, Rating, VerifiedBadge, DeliveryTimePill, EmptyState } from '@/components/ui/index';
import { fetchVendorById, fetchProducts } from '@/lib/data';
import { useCart } from '@/store/cart';
import { useFavorites } from '@/store/favorites';
import type { Vendor, Product } from '@/types'; import { getItemImageUrl } from '@/types';
import { FoodCopy, fill } from '@/constants/food_copy';

export default function VendorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { subtotal: cartSubtotal } = useCart();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      const v = await fetchVendorById(id);
      const p = await fetchProducts({ vendorId: id });
      if (mounted) {
        setVendor(v);
        setProducts(p);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!vendor) {
    return (
      <View style={styles.container}>
        <StatusBar />
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Store</Text>
          <View style={{ width: 38 }} />
        </View>
        <EmptyState icon="store-off-outline" title="Store not found" />
      </View>
    );
  }

  const filtered = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle} numberOfLines={1}>{vendor.name}</Text>
        <Pressable onPress={() => router.push('/cart')} hitSlop={8}>
          <Ionicons name="cart-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Vendor hero card */}
        <View style={styles.vendorHero}>
          <View style={styles.vendorHeroTop}>
            <View style={styles.vendorLogo}>
              <MaterialCommunityIcons
                name={iconForCategory((vendor.category ?? 'grocery') as any) as any}
                size={32}
                color={Colors.primary}
              />
            </View>
            <View style={styles.vendorHeroInfo}>
              <View style={styles.vendorNameRow}>
                {vendor.verified && <VerifiedBadge size={16} />}
                <Text style={styles.vendorName}>{vendor.name}</Text>
              </View>
              <Text style={styles.vendorTagline}>{vendor.tagline}</Text>
              <View style={styles.vendorMetaRow}>
                <Rating value={vendor.rating} count={vendor.rating_count} />
                <Text style={styles.metaDot}>·</Text>
                <DeliveryTimePill
                  minutes={formatDeliveryTime(vendor)}
                  distanceKm={vendor.distance_km}
                />
              </View>
            </View>
            <FavoriteButtonCircle vendorId={String(vendor.id)} />
          </View>

          {(vendor.discount_pct ?? 0) > 0 && (
            <View style={styles.discountBanner}>
              <MaterialCommunityIcons name="tag" size={16} color={Colors.danger} />
              <Text style={styles.discountText}>
                Get up to {((vendor.discount_pct ?? 0) * 100).toFixed(0)}% off on all items!
              </Text>
            </View>
          )}

          {/* ---- NEW V5.1: Kitchen badges strip (Top Rated / Express / 24h) ---- */}
          <View style={styles.kitchenBadgesRow}>
            {vendor.is_top_rated && <KitchenBadge icon="trophy"            label={FoodCopy.vendor.topRated}      color={Colors.warning} />}
            {vendor.is_express &&   <KitchenBadge icon="lightning-bolt"    label={FoodCopy.badges.expressDelivery} color={Colors.primary} />}
            {vendor.is_open_now_24h && <KitchenBadge icon="clock-check-outline" label="Open 24h" color={Colors.success} />}
            {vendor.free_delivery && <KitchenBadge icon="truck-fast"       label={FoodCopy.badges.freeDelivery}  color={Colors.success} />}
            {vendor.is_verified &&   <KitchenBadge icon="check-decagram"   label={FoodCopy.vendor.verifiedKitchen} color={Colors.info} />}
          </View>

          {/* ---- NEW V5.1: Stats strip (orders / rating / distance) ---- */}
          <View style={styles.statsStrip}>
            <StatCell icon="clipboard-text-outline" value={`${vendor.order_count ?? 0}+`} label="Orders" />
            <StatCell icon="star"                   value={vendor.rating.toFixed(1)}        label={`${vendor.rating_count} reviews`} />
            <StatCell icon="map-marker-distance"    value={`${vendor.distance_km.toFixed(1)} km`} label="Distance" />
            <StatCell icon="bike-fast"              value={formatDeliveryTime(vendor)}      label="Delivery" />
          </View>
        </View>

        {/* ---- NEW V5.1: Free-delivery progress bar ---- */}
        {vendor.free_delivery_over_amount && vendor.free_delivery_over_amount > 0 && (
          <FreeDeliveryProgress
            threshold={vendor.free_delivery_over_amount}
            cartSubtotal={cartSubtotal}
          />
        )}

        {/* ---- NEW V5.1: Bulk-order discount promo ---- */}
        {vendor.bulk_order_discount && (
          <View style={styles.bulkPromoCard}>
            <View style={styles.bulkPromoHeader}>
              <MaterialCommunityIcons name="tag-multiple" size={18} color={Colors.primary} />
              <Text style={styles.bulkPromoTitle}>{FoodCopy.vendor.bulkDiscountTitle}</Text>
            </View>
            <Text style={styles.bulkPromoSub}>{FoodCopy.vendor.bulkDiscountSub}</Text>
            <Text style={styles.bulkPromoDetail}>
              {fill('Order ${amount}+ and get {percent}% off your entire cart', {
                amount: vendor.bulk_order_discount.amount,
                percent: vendor.bulk_order_discount.percent,
              })}
            </Text>
          </View>
        )}

        {/* ---- NEW V5.1: Loyalty earn + cashback promo ---- */}
        <View style={styles.loyaltyPromoRow}>
          <View style={[styles.loyaltyCard, { backgroundColor: Colors.primaryLight }]}>
            <MaterialCommunityIcons name="star-circle" size={22} color={Colors.primary} />
            <View style={styles.loyaltyInfo}>
              <Text style={[styles.loyaltyTitle, { color: Colors.primary }]}>{FoodCopy.vendor.loyaltyTitle}</Text>
              <Text style={styles.loyaltySub}>
                {fill(FoodCopy.vendor.loyaltySub, {
                  points: Math.round(cartSubtotal * (vendor.loyalty_earn_rate ?? 1)),
                  amount: `$${(cartSubtotal * (vendor.loyalty_earn_rate ?? 1) / 100).toFixed(2)}`,
                })}
              </Text>
            </View>
          </View>
          {vendor.cashback_offer && (
            <View style={[styles.loyaltyCard, { backgroundColor: `${Colors.success}1A` }]}>
              <MaterialCommunityIcons name="cash-multiple" size={22} color={Colors.success} />
              <View style={styles.loyaltyInfo}>
                <Text style={[styles.loyaltyTitle, { color: Colors.success }]}>{FoodCopy.vendor.cashbackTitle}</Text>
                <Text style={styles.loyaltySub}>
                  {fill(FoodCopy.vendor.cashbackSub, { percent: vendor.cashback_offer.percent })}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ---- NEW V5.1: Schedule order + subscription CTA ---- */}
        <View style={styles.actionPromoRow}>
          <Pressable style={styles.actionPromoCard} onPress={() => router.push('/checkout')}>
            <MaterialCommunityIcons name="calendar-clock" size={20} color={Colors.text} />
            <Text style={styles.actionPromoTitle}>{FoodCopy.vendor.scheduleTitle}</Text>
            <Text style={styles.actionPromoSub}>{FoodCopy.vendor.scheduleSub}</Text>
          </Pressable>
          {vendor.subscription_enabled && (
            <Pressable
              style={[styles.actionPromoCard, { backgroundColor: Colors.primaryLight }]}
              onPress={() => router.push('/pro')}
            >
              <MaterialCommunityIcons name="calendar-sync" size={20} color={Colors.primary} />
              <Text style={[styles.actionPromoTitle, { color: Colors.primary }]}>{FoodCopy.vendor.subscriptionTitle}</Text>
              <Text style={styles.actionPromoSub}>{FoodCopy.vendor.subscriptionSub}</Text>
            </Pressable>
          )}
        </View>

        {/* Search within store */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput
            placeholder={`Search in ${vendor.name}`}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        {/* Products */}
        <View style={styles.section}>
          <SectionHeader title="Products" actionLabel={`${filtered.length} items`} />
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No products found.</Text>
          ) : (
            <View style={styles.productGrid}>
              {filtered.map((p) => (
                <VendorProductCard
                  key={p.id}
                  product={p}
                  onPress={() => router.push(`/product/${p.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function FavoriteButtonCircle({ vendorId }: { vendorId: string }) {
  const { isVendorFavorite, toggleVendor } = useFavorites();
  const fav = isVendorFavorite(Number(vendorId));
  return (
    <Pressable style={styles.favCircle} onPress={() => {
      // Look up the store from demo data to pass the full object to toggleVendor
      const { DEMO_STORES } = require('@/data/demo-data');
      const store = DEMO_STORES.find((s: any) => String(s.id) === String(vendorId));
      if (store) toggleVendor(store);
    }} hitSlop={8}>
      <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? Colors.danger : Colors.text} />
    </Pressable>
  );
}

function VendorProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const { addItem, addItemLegacy } = useCart();
  const { isProductFavorite, toggleProduct } = useFavorites();
  const fav = isProductFavorite(product.id);
  return (
    <View style={styles.productCard}>
      <View style={styles.productImageWrap}>
        <Pressable onPress={onPress} style={styles.productImagePress}>
          {product.image_url ? (
            <Image source={{ uri: getItemImageUrl(product) ?? undefined }} style={styles.productImage} resizeMode="contain" />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <MaterialCommunityIcons name="image-outline" size={28} color={Colors.textTertiary} />
            </View>
          )}
        </Pressable>
        <FavoriteButton active={fav} onPress={() => toggleProduct(product)} style={styles.productFav} />
        <AddButton onPress={() => addItemLegacy(product)} style={styles.productAdd} />
        {(product.discount_pct ?? 0) > 0 && (
          <View style={styles.productDiscount}>
            <DiscountBadge percent={product.discount_pct ?? 0} />
          </View>
        )}
      </View>
      <Pressable onPress={onPress}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productDesc} numberOfLines={1}>{product.unit}</Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          {(product.original_price ?? null) && (
            <Text style={styles.productOriginal}>${(product.original_price ?? 0).toFixed(2)}</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

import { TextInput } from 'react-native';

function iconForCategory(c: string): string {
  switch (c) {
    case 'grocery': return 'cart-variant';
    case 'pharmacy': return 'medical-bag';
    case 'shop': return 'shopping-outline';
    case 'food': return 'food-apple-outline';
    case 'parcel': return 'package-variant-closed';
    default: return 'store-outline';
  }
}

function formatDeliveryTime(v: Vendor): string {
  if (v.delivery_time_min >= 60) {
    return `${Math.round(v.delivery_time_min / 60)}-${Math.round(v.delivery_time_max / 60)} hours`;
  }
  return `${v.delivery_time_min}-${v.delivery_time_max} min`;
}

// ============================================================================
// NEW V5.1 — Grocery-ported sub-components
// ============================================================================

function KitchenBadge({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={[styles.kitchenBadge, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
      <MaterialCommunityIcons name={icon as any} size={11} color={color} />
      <Text style={[styles.kitchenBadgeText, { color }]}>{label}</Text>
    </View>
  );
}

function StatCell({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statCell}>
      <MaterialCommunityIcons name={icon as any} size={16} color={Colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function FreeDeliveryProgress({ threshold, cartSubtotal }: { threshold: number; cartSubtotal: number }) {
  const progress = Math.min(1, cartSubtotal / threshold);
  const remaining = Math.max(0, threshold - cartSubtotal);
  const unlocked = remaining === 0;
  return (
    <View style={styles.freeDeliveryCard}>
      <View style={styles.freeDeliveryHeader}>
        <MaterialCommunityIcons name="truck-fast" size={18} color={unlocked ? Colors.success : Colors.primary} />
        <Text style={[styles.freeDeliveryTitle, { color: unlocked ? Colors.success : Colors.text }]}>
          {unlocked ? FoodCopy.vendor.freeDeliveryUnlocked : FoodCopy.vendor.freeDeliveryTitle}
        </Text>
      </View>
      {!unlocked && (
        <Text style={styles.freeDeliverySub}>
          {fill(FoodCopy.vendor.freeDeliverySub, { remaining: `$${remaining.toFixed(2)}` })}
        </Text>
      )}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: unlocked ? Colors.success : Colors.primary }]} />
      </View>
    </View>
  );
}

// ============================================================================
// Styles — V5.0 preserved + new V5.1 grocery-feature styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  vendorHero: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  vendorHeroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  vendorLogo: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorHeroInfo: {
    flex: 1,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  vendorName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  vendorTagline: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  vendorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  metaDot: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
  },
  favCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: Colors.dangerBg,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  discountText: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  productImageWrap: {
    position: 'relative',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    height: 130,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImagePress: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  productImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productFav: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  productAdd: {
    position: 'absolute',
    bottom: 6,
    right: 6,
  },
  productDiscount: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  productName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    minHeight: 36,
    marginBottom: 2,
  },
  productDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  productPrice: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  productOriginal: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.xxxl,
  },

  // =========================== NEW V5.1 styles ===========================
  kitchenBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  kitchenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
  kitchenBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  freeDeliveryCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  freeDeliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  freeDeliveryTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  freeDeliverySub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  bulkPromoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bulkPromoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  bulkPromoTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  bulkPromoSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bulkPromoDetail: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: FontWeight.semibold,
  },
  loyaltyPromoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  loyaltyCard: {
    flex: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loyaltyInfo: {
    flex: 1,
  },
  loyaltyTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  loyaltySub: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 13,
  },
  actionPromoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  actionPromoCard: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 4,
  },
  actionPromoTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: 4,
  },
  actionPromoSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 13,
  },
});
