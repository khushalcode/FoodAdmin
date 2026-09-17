// Favourite screen — matches PDF page 56 design.
// Items/Stores segmented control at top + count + empty state "No favourite data found".

import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState, DiscountBadge, AddButton, VerifiedBadge, DeliveryTimePill, Rating } from '@/components/ui/index';
import { useFavorites } from '@/store/favorites';
import { useCart } from '@/store/cart';
import { fetchProducts, fetchVendors } from '@/lib/data';
import { getItemImageUrl, getItemOriginalPrice, getItemDiscountPct } from '@/types';
import type { Product, Vendor } from '@/types';

interface FavouriteScreenProps {
  onTabNavigate?: (k: any) => void;
}

type Tab = 'items' | 'stores';

export function FavouriteScreen({ onTabNavigate }: FavouriteScreenProps) {
  const router = useRouter();
  const { items: favItems, stores: favStores, toggleItem, toggleStore } = useFavorites();
  const { addItemLegacy } = useCart();
  const [tab, setTab] = useState<Tab>('items');
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const allProducts = await fetchProducts();
      const allVendors = await fetchVendors();
      if (mounted) {
        const favItemIds = new Set(favItems.map((i) => i.id));
        const favStoreIds = new Set(favStores.map((s) => s.id));
        setProducts(allProducts.filter((p) => favItemIds.has(p.id)));
        setVendors(allVendors.filter((v) => favStoreIds.has(v.id)));
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [favItems, favStores]);

  const itemCount = products.length;
  const storeCount = vendors.length;
  const isEmpty = tab === 'items' ? itemCount === 0 : storeCount === 0;

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => onTabNavigate?.('home')} />
        <Text style={styles.headerTitle}>Favourite</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Items / Stores segmented control */}
      <View style={styles.segRow}>
        <Pressable
          style={[styles.segBtn, tab === 'items' && styles.segBtnActive]}
          onPress={() => setTab('items')}
        >
          <Text style={[styles.segText, tab === 'items' && styles.segTextActive]}>Items</Text>
        </Pressable>
        <Pressable
          style={[styles.segBtn, tab === 'stores' && styles.segBtnActive]}
          onPress={() => setTab('stores')}
        >
          <Text style={[styles.segText, tab === 'stores' && styles.segTextActive]}>Stores</Text>
        </Pressable>
      </View>

      {/* Count */}
      <Text style={styles.countText}>
        {tab === 'items' ? `${itemCount} ${itemCount === 1 ? 'Item' : 'Items'}` : `${storeCount} ${storeCount === 1 ? 'Store' : 'Stores'}`}
      </Text>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
      ) : isEmpty ? (
        <EmptyState
          icon="heart-outline"
          title="No favourite data found"
          subtitle={`Tap the heart icon on any ${tab === 'items' ? 'product' : 'store'} to save it here.`}
        />
      ) : tab === 'items' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {products.map((p) => (
              <FavProductCard
                key={p.id}
                product={p}
                onPress={() => router.push(`/product/${p.id}`)}
                onAdd={() => addItemLegacy(p)}
                onFav={() => toggleItem(p)}
              />
            ))}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {vendors.map((v) => (
            <FavVendorCard
              key={v.id}
              vendor={v}
              onPress={() => router.push(`/vendor/${v.id}`)}
              onFav={() => toggleStore(v)}
            />
          ))}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}

function FavProductCard({ product, onPress, onAdd, onFav }: { product: Product; onPress: () => void; onAdd: () => void; onFav: () => void }) {
  const img = getItemImageUrl(product);
  const orig = getItemOriginalPrice(product);
  const discPct = getItemDiscountPct(product);
  return (
    <View style={styles.productCard}>
      <Pressable onPress={onPress} style={styles.productImageWrap}>
        {img ? (
          <Image source={{ uri: img }} style={styles.productImage} resizeMode="contain" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <MaterialCommunityIcons name="image-outline" size={28} color={Colors.textTertiary} />
          </View>
        )}
        {discPct > 0 && (
          <View style={styles.badgeWrap}>
            <DiscountBadge percent={discPct} />
          </View>
        )}
        <Pressable style={styles.favBtn} onPress={onFav} hitSlop={8}>
          <Ionicons name="heart" size={16} color={Colors.danger} />
        </Pressable>
      </Pressable>
      <View style={styles.productBody}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productUnit}>{product.unit}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {orig && <Text style={styles.origPrice}>${orig.toFixed(2)}</Text>}
        </View>
        <AddButton onPress={onAdd} style={styles.addBtn} />
      </View>
    </View>
  );
}

function FavVendorCard({ vendor, onPress, onFav }: { vendor: Vendor; onPress: () => void; onFav: () => void }) {
  return (
    <Pressable style={styles.vendorCard} onPress={onPress}>
      <View style={styles.vendorImageWrap}>
        {vendor.logo_url ? (
          <Image source={{ uri: vendor.logo_url }} style={styles.vendorImage} resizeMode="cover" />
        ) : (
          <View style={styles.vendorImagePlaceholder}>
            <MaterialCommunityIcons name="store-outline" size={32} color={Colors.primary} />
          </View>
        )}
        <Pressable style={styles.favBtn} onPress={onFav} hitSlop={8}>
          <Ionicons name="heart" size={18} color={Colors.danger} />
        </Pressable>
      </View>
      <View style={styles.vendorBody}>
        <View style={styles.vendorNameRow}>
          {vendor.is_verified && <VerifiedBadge size={14} />}
          <Text style={styles.vendorName} numberOfLines={1}>{vendor.name}</Text>
        </View>
        <Text style={styles.vendorTagline} numberOfLines={1}>{vendor.tagline ?? vendor.description ?? ''}</Text>
        <View style={styles.vendorMeta}>
          <Rating value={vendor.rating} count={vendor.rating_count} size="sm" />
          <Text style={styles.metaDot}>·</Text>
          <DeliveryTimePill minutes={`${vendor.delivery_time_min}-${vendor.delivery_time_max} min`} distanceKm={vendor.distance_km} />
        </View>
        {(vendor.discount_pct ?? 0) > 0 && (
          <View style={styles.discountRow}>
            <Ionicons name="pricetag" size={11} color={Colors.danger} />
            <Text style={styles.discountText}>{((vendor.discount_pct ?? 0) * 100).toFixed(0)}% OFF</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  segRow: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm },
  segBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, alignItems: 'center', backgroundColor: Colors.surfaceAlt },
  segBtnActive: { backgroundColor: Colors.primary },
  segText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  segTextActive: { color: Colors.textInverse, fontWeight: FontWeight.bold },
  countText: { fontSize: FontSize.sm, color: Colors.textSecondary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 },
  productImageWrap: { width: '100%', aspectRatio: 1, backgroundColor: Colors.surfaceAlt, position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  badgeWrap: { position: 'absolute', top: 8, left: 8 },
  favBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  productBody: { padding: Spacing.sm },
  productName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: 2 },
  productUnit: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  origPrice: { fontSize: FontSize.xs, color: Colors.textTertiary, textDecorationLine: 'line-through' },
  addBtn: { alignSelf: 'flex-end' },
  vendorCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 },
  vendorImageWrap: { width: '100%', height: 120, backgroundColor: Colors.primaryLight, position: 'relative' },
  vendorImage: { width: '100%', height: '100%' },
  vendorImagePlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  vendorBody: { padding: Spacing.md },
  vendorNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  vendorName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, flex: 1 },
  vendorTagline: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  vendorMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  metaDot: { color: Colors.textTertiary },
  discountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs, backgroundColor: Colors.dangerBg, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { fontSize: 10, color: Colors.danger, fontWeight: FontWeight.bold },
});
