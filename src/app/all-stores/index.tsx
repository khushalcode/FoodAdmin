// All Stores screen — V4.0 port of Flutter lib/features/store/screens/all_store_screen.dart
// Browse all stores with filter chips + sort tabs (All/Newly Joined/Popular/Top Rated).

import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState, Rating, VerifiedBadge, DeliveryTimePill } from '@/components/ui/index';
import { fetchVendors } from '@/lib/data';
import type { Vendor } from '@/types';
import { getItemImageUrl } from '@/types';

type SortKey = 'all' | 'newly_joined' | 'popular' | 'top_rated';

export default function AllStoresScreen() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('all');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const v = await fetchVendors();
      if (mounted) {
        setVendors(v);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...vendors];
    if (sort === 'top_rated') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') list.sort((a, b) => b.order_count - a.order_count);
    else if (sort === 'newly_joined') list.sort((a, b) => new Date(b.created_at ?? Date.now()).getTime() - new Date(a.created_at ?? Date.now()).getTime());
    return list;
  }, [vendors, sort]);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>All Stores</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Search bar */}
      <Pressable style={styles.searchBar} onPress={() => router.push('/search')}>
        <Ionicons name="search" size={18} color={Colors.textTertiary} />
        <Text style={styles.searchPlaceholder}>Search stores...</Text>
      </Pressable>

      {/* Sort tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {([
          { key: 'all', label: 'All' },
          { key: 'newly_joined', label: 'Newly Joined' },
          { key: 'popular', label: 'Popular' },
          { key: 'top_rated', label: 'Top Rated' },
        ] as { key: SortKey; label: string }[]).map((t) => {
          const isActive = t.key === sort;
          return (
            <Pressable key={t.key} style={[styles.tab, isActive && styles.tabActive]} onPress={() => setSort(t.key)}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.resultCount}>{filtered.length} {filtered.length === 1 ? 'store' : 'stores'}</Text>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
      ) : filtered.length === 0 ? (
        <EmptyState icon="store-outline" title="No stores found" subtitle="Try a different filter or check back later." />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {filtered.map((v) => (
            <StoreCard key={v.id} vendor={v} onPress={() => router.push(`/vendor/${v.id}`)} />
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

function StoreCard({ vendor, onPress }: { vendor: Vendor; onPress: () => void }) {
  const logo = vendor.logo_url;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardImageWrap}>
        {logo ? (
          <Image source={{ uri: logo }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <MaterialCommunityIcons name="store-outline" size={32} color={Colors.primary} />
          </View>
        )}
        {(vendor.discount_pct ?? 0) > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{((vendor.discount_pct ?? 0) * 100).toFixed(0)}% OFF</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          {vendor.is_verified && <VerifiedBadge size={14} />}
          <Text style={styles.name} numberOfLines={1}>{vendor.name}</Text>
          {vendor.is_promoted && <Text style={styles.adBadge}>AD</Text>}
        </View>
        <Text style={styles.tagline} numberOfLines={1}>{vendor.tagline ?? vendor.description ?? ''}</Text>
        <View style={styles.metaRow}>
          <Rating value={vendor.rating} count={vendor.rating_count} size="sm" />
          <Text style={styles.dot}>·</Text>
          <DeliveryTimePill minutes={`${vendor.delivery_time_min}-${vendor.delivery_time_max} min`} distanceKm={vendor.distance_km} />
        </View>
        <View style={styles.tagsRow}>
          {vendor.free_delivery && <View style={[styles.tag, { backgroundColor: Colors.primaryLight }]}><Text style={[styles.tagText, { color: Colors.primary }]}>Free Delivery</Text></View>}
          {vendor.is_featured === 1 && <View style={[styles.tag, { backgroundColor: Colors.catYellow }]}><Text style={[styles.tagText, { color: '#92400E' }]}>Featured</Text></View>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  searchPlaceholder: { fontSize: FontSize.sm, color: Colors.textTertiary },
  tabsRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, gap: Spacing.sm },
  tab: { paddingVertical: 6, paddingHorizontal: Spacing.md, borderRadius: Radius.pill, backgroundColor: Colors.surface },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  tabTextActive: { color: Colors.textInverse, fontWeight: FontWeight.bold },
  resultCount: { fontSize: FontSize.sm, color: Colors.textSecondary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  scrollContent: { paddingHorizontal: Spacing.lg },
  card: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 },
  cardImageWrap: { width: 100, backgroundColor: Colors.primaryLight, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: Colors.textInverse, fontSize: 9, fontWeight: FontWeight.bold },
  cardBody: { flex: 1, padding: Spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, flex: 1 },
  adBadge: { fontSize: 9, color: Colors.textTertiary, fontWeight: FontWeight.bold, backgroundColor: Colors.surfaceAlt, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2 },
  tagline: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  dot: { color: Colors.textTertiary },
  tagsRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 10, fontWeight: FontWeight.bold },
});
