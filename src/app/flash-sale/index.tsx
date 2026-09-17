// Flash Sale screen — V4.0 port of Flutter lib/features/flash_sale/screens/flash_sale_screen.dart
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState, DiscountBadge, Rating } from '@/components/ui/index';
import { useCart } from '@/store/cart';
import { useFavorites } from '@/store/favorites';
import { DEMO_ITEMS } from '@/data/demo-data';
import { getItemImageUrl, getItemOriginalPrice, getItemDiscountPct } from '@/types';
import type { Item } from '@/types';

export default function FlashSaleScreen() {
  const router = useRouter();
  const { addItemLegacy } = useCart();
  const { isProductFavorite, toggleProduct } = useFavorites();
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const flashSaleItems = DEMO_ITEMS.filter((i) => i.discount > 0).slice(0, 10);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Flash Sale</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.timerBar}>
        <Ionicons name="flash" size={20} color={Colors.textInverse} />
        <Text style={styles.timerLabel}>Ends in</Text>
        <View style={styles.timerBoxes}>
          <View style={styles.timerBox}><Text style={styles.timerValue}>{String(timeLeft.hours).padStart(2, '0')}</Text></View>
          <Text style={styles.timerColon}>:</Text>
          <View style={styles.timerBox}><Text style={styles.timerValue}>{String(timeLeft.minutes).padStart(2, '0')}</Text></View>
          <Text style={styles.timerColon}>:</Text>
          <View style={styles.timerBox}><Text style={styles.timerValue}>{String(timeLeft.seconds).padStart(2, '0')}</Text></View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {flashSaleItems.length === 0 ? (
          <EmptyState icon="flash-outline" title="No flash sales right now" subtitle="Check back later for amazing deals!" />
        ) : (
          <View style={styles.grid}>
            {flashSaleItems.map((item) => (
              <FlashSaleCard key={item.id} item={item} onPress={() => router.push(`/product/${item.id}`)}
                onAdd={() => addItemLegacy(item)}
                fav={isProductFavorite(item.id)}
                onFav={() => toggleProduct(item)}
              />
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function FlashSaleCard({ item, onPress, onAdd, fav, onFav }: { item: Item; onPress: () => void; onAdd: () => void; fav: boolean; onFav: () => void }) {
  const img = getItemImageUrl(item);
  const origPrice = getItemOriginalPrice(item);
  const discountPct = getItemDiscountPct(item);
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={styles.imageWrap}>
        {img ? <Image source={{ uri: img }} style={styles.image} resizeMode="contain" /> : <View style={styles.imagePlaceholder}><Ionicons name="image-outline" size={24} color={Colors.textTertiary} /></View>}
        <View style={styles.badgeWrap}><DiscountBadge percent={discountPct} /></View>
        <Pressable style={styles.favBtn} onPress={onFav} hitSlop={8}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={16} color={fav ? Colors.danger : Colors.text} />
        </Pressable>
      </Pressable>
      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.unit}>{item.unit}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          {origPrice && <Text style={styles.origPrice}>${origPrice.toFixed(2)}</Text>}
        </View>
        <Pressable style={styles.addBtn} onPress={onAdd}>
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  timerBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.danger, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, justifyContent: 'center', gap: Spacing.sm },
  timerLabel: { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  timerBoxes: { flexDirection: 'row', alignItems: 'center' },
  timerBox: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, minWidth: 32 },
  timerValue: { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: FontWeight.bold, textAlign: 'center' },
  timerColon: { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginHorizontal: 4 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 },
  imageWrap: { width: '100%', aspectRatio: 1, backgroundColor: Colors.surfaceAlt, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  badgeWrap: { position: 'absolute', top: 8, left: 8 },
  favBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: Spacing.sm },
  name: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: 2 },
  unit: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  origPrice: { fontSize: FontSize.xs, color: Colors.textTertiary, textDecorationLine: 'line-through' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight, borderRadius: Radius.md, paddingVertical: Spacing.xs, gap: 4 },
  addBtnText: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});
