// Category listing screen — shown when user taps a category from the home screen.
// Pages 9, 13, 14, 15, 16, 17, 18 of the PDF design mockup.
// Includes: search, quick filter chips, subcategory grid, promo banner,
// hero carousel, today's deals horizontal scroll, fresh finds carousel.

import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, SectionHeader, DiscountBadge, FavoriteButton, AddButton, VerifiedBadge, DeliveryTimePill, EmptyState, AdBadge, Rating } from '@/components/ui/index';
import { SUB_CATEGORIES, QUICK_FILTERS } from '@/constants/categories';
import { fetchProducts, fetchVendors } from '@/lib/data';
import { useCart } from '@/store/cart';
import { useFavorites } from '@/store/favorites';
import type { Vendor, Product, CategoryKey } from '@/types'; import { getItemImageUrl } from '@/types';

const { width } = Dimensions.get('window');

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const cat = category as CategoryKey;
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCats, setShowAllCats] = useState(false);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetchProducts({ category: cat }),
      fetchVendors({ category: cat }),
    ]).then(([p, v]) => {
      if (mounted) {
        setProducts(p);
        setVendors(v);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [cat]);

  const subCats = SUB_CATEGORIES.filter((s) => s.parent === cat);
  const visibleProducts = selectedSub ? products.filter((p) => p.subcategory === selectedSub) : products;

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{capitalize(cat)}</Text>
        <Pressable onPress={() => router.push('/cart')} hitSlop={8}>
          <Ionicons name="cart-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <Pressable style={styles.searchBar} onPress={() => router.push('/search')}>
          <Text style={styles.searchPlaceholder}>
            Search for '<Text style={styles.searchTerm}>{capitalize(cat)}</Text>'
          </Text>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
        </Pressable>

        {/* Quick filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {QUICK_FILTERS.map((f) => (
            <Pressable key={f.id} style={styles.chip} onPress={() => {}}>
              <MaterialCommunityIcons name={f.icon as any} size={14} color={f.color} />
              <Text style={styles.chipText}>{f.label}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.seeMoreChip} onPress={() => setShowAllCats(true)}>
            <Text style={styles.seeMoreText}>See More</Text>
            <Ionicons name="chevron-down" size={12} color={Colors.info} />
          </Pressable>
        </ScrollView>

        {/* Promo banner: Get Items up to 45% OFF! */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <MaterialCommunityIcons name="fire" size={24} color="#F97316" />
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>Get Items up to 45% OFF!</Text>
              <Text style={styles.promoSubtitle} numberOfLines={1}>Don't miss out, order your favorites now!</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color={Colors.text} />
        </View>

        {/* Subcategory grid */}
        {subCats.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Shop by Categories" />
            <View style={styles.subCatGrid}>
              {subCats.slice(0, 8).map((s) => {
                const isActive = selectedSub === s.id;
                return (
                  <Pressable
                    key={s.id}
                    style={styles.subCat}
                    onPress={() => setSelectedSub(isActive ? null : s.id)}
                  >
                    <View style={[styles.subCatCircle, { backgroundColor: s.bg }, isActive && styles.subCatCircleActive]}>
                      <MaterialCommunityIcons name={s.icon as any} size={26} color={Colors.primaryDark} />
                    </View>
                    <Text style={[styles.subCatLabel, isActive && styles.subCatLabelActive]} numberOfLines={1}>
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.seeMoreRow} onPress={() => setShowAllCats(true)}>
              <Text style={styles.seeMoreText}>See More</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.info} />
            </Pressable>
          </View>
        )}

        {/* Hero carousel */}
        <HeroCarouselMini />

        {/* Featured Stores */}
        {vendors.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Featured Stores" actionLabel="See All" onActionPress={() => router.push('/(tabs)/offers')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
              {vendors.map((v) => (
                <VendorCard key={v.id} vendor={v} onPress={() => router.push(`/vendor/${v.id}`)} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Today's Deals */}
        {visibleProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.dealsHeader}>
              <Text style={styles.dealsTitle}>Today's Deals</Text>
              <Text style={styles.dealsSubtitle}>Grab The Offer Before End The Time.</Text>
            </View>
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.md }}>
                {visibleProducts.slice(0, 8).map((p) => (
                  <ProductCardSmall
                    key={p.id}
                    product={p}
                    onPress={() => router.push(`/product/${p.id}`)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* All Products */}
        {visibleProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title={selectedSub ? `${subCats.find(s => s.id === selectedSub)?.label}` : 'All Products'} />
            <View style={styles.productGrid}>
              {visibleProducts.map((p) => (
                <ProductCardSmall
                  key={p.id}
                  product={p}
                  onPress={() => router.push(`/product/${p.id}`)}
                  fullSize
                />
              ))}
            </View>
          </View>
        )}

        {!loading && visibleProducts.length === 0 && (
          <EmptyState
            icon="store-off-outline"
            title="Nothing here yet"
            subtitle={`No products found in the ${capitalize(cat)} category.`}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* All Categories bottom sheet modal */}
      <Modal visible={showAllCats} transparent animationType="slide" onRequestClose={() => setShowAllCats(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>All Categories</Text>
              <Pressable onPress={() => setShowAllCats(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </Pressable>
            </View>
            <View style={styles.allCatGrid}>
              {SUB_CATEGORIES.map((s) => {
                const isActive = selectedSub === s.id;
                return (
                  <Pressable
                    key={s.id}
                    style={styles.allCat}
                    onPress={() => {
                      setSelectedSub(isActive ? null : s.id);
                      setShowAllCats(false);
                    }}
                  >
                    <View style={[styles.allCatCircle, { backgroundColor: s.bg }, isActive && styles.allCatCircleActive]}>
                      <MaterialCommunityIcons name={s.icon as any} size={28} color={Colors.primaryDark} />
                    </View>
                    <Text style={styles.allCatLabel} numberOfLines={2}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
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

// --- Hero Carousel mini ---
function HeroCarouselMini() {
  return (
    <View style={styles.heroCarousel}>
      <View style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>Fresh Groceries Just A Click Away!</Text>
          <Text style={styles.heroSubtitle}>
            Your grocery store is now in your pocket. Order anytime from anywhere!
          </Text>
        </View>
        <MaterialCommunityIcons name="cart-variant" size={56} color={Colors.primaryDark} />
      </View>
      <View style={styles.dots}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// --- Vendor Card ---
function VendorCard({ vendor, onPress }: { vendor: Vendor; onPress: () => void }) {
  const { isVendorFavorite, toggleVendor } = useFavorites();
  const fav = isVendorFavorite(vendor.id);
  return (
    <Pressable style={styles.vendorCard} onPress={onPress}>
      <View style={[styles.vendorBanner, { backgroundColor: bgForCategory((vendor.category ?? 'grocery')) }]}>
        <FavoriteButton active={fav} onPress={() => toggleVendor(vendor)} style={styles.vendorFav} />
        <MaterialCommunityIcons
          name={iconForCategory((vendor.category ?? 'grocery')) as any}
          size={48}
          color={Colors.primaryDark}
        />
        {vendor.is_promoted && <AdBadge />}
        <Text style={styles.vendorBannerText}>{vendor.tagline}</Text>
      </View>
      <View style={styles.vendorInfo}>
        <View style={styles.vendorNameRow}>
          {vendor.verified && <VerifiedBadge size={14} />}
          <Text style={styles.vendorName} numberOfLines={1}>{vendor.name}</Text>
        </View>
        <View style={styles.vendorMetaRow}>
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

// --- Product card small ---
function ProductCardSmall({
  product,
  onPress,
  fullSize,
}: {
  product: Product;
  onPress: () => void;
  fullSize?: boolean;
}) {
  const { addItem, addItemLegacy } = useCart();
  const { isProductFavorite, toggleProduct } = useFavorites();
  const fav = isProductFavorite(product.id);

  return (
    <View style={[styles.productCard, fullSize && styles.productCardFull]}>
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
        <Text style={styles.productVendor} numberOfLines={1}>{vendorName(product)}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  searchPlaceholder: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  searchTerm: {
    color: Colors.text,
    fontWeight: FontWeight.semibold,
  },
  chipRow: {
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: FontSize.xs,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  seeMoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  seeMoreText: {
    fontSize: FontSize.sm,
    color: Colors.info,
    fontWeight: FontWeight.medium,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.catYellow,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  promoTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  promoSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  subCatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  subCat: {
    width: '23%',
    alignItems: 'center',
  },
  subCatCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  subCatCircleActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  subCatLabel: {
    fontSize: FontSize.xs,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
  subCatLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
  seeMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.md,
  },
  heroCarousel: {
    marginBottom: Spacing.lg,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.lg,
    minHeight: 130,
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
  },
  heroSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.text,
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.text,
    width: 18,
  },
  dealsHeader: {
    backgroundColor: Colors.catYellow,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  dealsTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#B45309',
  },
  dealsSubtitle: {
    fontSize: FontSize.xs,
    color: '#B45309',
    marginTop: 2,
  },
  vendorCard: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  vendorBanner: {
    height: 120,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  vendorFav: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  vendorBannerText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  vendorInfo: {
    padding: Spacing.md,
  },
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  vendorName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
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
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  productCard: {
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
  productCardFull: {
    flex: 0,
    width: '48%',
  },
  productImageWrap: {
    position: 'relative',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    height: 120,
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
  productVendor: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  productName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    minHeight: 36,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingBottom: Spacing.xxxl,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  sheetTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  allCatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  allCat: {
    width: '23%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  allCatCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  allCatCircleActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  allCatLabel: {
    fontSize: FontSize.xs,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },
});
