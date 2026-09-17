// Popular Items screen — V4.0 port of Flutter lib/features/item/screens/popular_item_screen.dart
// Horizontal/grid view of popular items with add-to-cart.

import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState, DiscountBadge, Rating, AddButton, FavoriteButton } from '@/components/ui/index';
import { fetchProducts } from '@/lib/data';
import { useCart } from '@/store/cart';
import { useFavorites } from '@/store/favorites';
import { getItemImageUrl, getItemOriginalPrice, getItemDiscountPct } from '@/types';
import type { Product } from '@/types';

export default function PopularItemsScreen() {
  const router = useRouter();
  const { addItemLegacy } = useCart();
  const { isProductFavorite, toggleProduct } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const p = await fetchProducts({ popular: true, limit: 20 });
      if (mounted) {
        setProducts(p);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Popular Items</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
      ) : products.length === 0 ? (
        <EmptyState icon="fire" title="No popular items" subtitle="Check back later for trending products." />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {products.map((p) => (
              <PopularItemCard
                key={p.id}
                product={p}
                onPress={() => router.push(`/product/${p.id}`)}
                onAdd={() => addItemLegacy(p)}
                fav={isProductFavorite(p.id)}
                onFav={() => toggleProduct(p)}
              />
            ))}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

function PopularItemCard({ product, onPress, onAdd, fav, onFav }: { product: Product; onPress: () => void; onAdd: () => void; fav: boolean; onFav: () => void }) {
  const img = getItemImageUrl(product);
  const origPrice = getItemOriginalPrice(product);
  const discountPct = getItemDiscountPct(product);
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.imageWrap}>
        {img ? (
          <Image source={{ uri: img }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="image-outline" size={28} color={Colors.textTertiary} />
          </View>
        )}
        {discountPct > 0 && (
          <View style={styles.badgeWrap}><DiscountBadge percent={discountPct} /></View>
        )}
        <Pressable style={styles.favBtn} onPress={onFav} hitSlop={8}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={16} color={fav ? Colors.danger : Colors.text} />
        </Pressable>
      </Pressable>
      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.storeName} numberOfLines={1}>{product.store_name}</Text>
        <View style={styles.ratingRow}>
          <Rating value={product.rating} count={product.rating_count} size="sm" />
        </View>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {origPrice && <Text style={styles.origPrice}>${origPrice.toFixed(2)}</Text>}
          </View>
          <Text style={styles.unit}>{product.unit}</Text>
        </View>
        <AddButton onPress={onAdd} style={styles.addBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 },
  imageWrap: { width: '100%', aspectRatio: 1, backgroundColor: Colors.surfaceAlt, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  badgeWrap: { position: 'absolute', top: 8, left: 8 },
  favBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: Spacing.sm },
  name: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: 2 },
  storeName: { fontSize: 10, color: Colors.textTertiary, marginBottom: 4 },
  ratingRow: { marginBottom: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.xs },
  price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  origPrice: { fontSize: 10, color: Colors.textTertiary, textDecorationLine: 'line-through' },
  unit: { fontSize: 10, color: Colors.textSecondary },
  addBtn: { alignSelf: 'flex-end' },
});
