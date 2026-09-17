// Store Menu screen — V4.0 port of Flutter lib/features/menu/screens/menu_screen.dart
// Shows the in-store menu categories (used inside vendor detail page).
// Horizontal scrollable sticky tabs + items per category.

import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image, ActivityIndicator, SectionList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState, AddButton, DiscountBadge, Rating } from '@/components/ui/index';
import { fetchProducts, fetchVendorById } from '@/lib/data';
import { useCart } from '@/store/cart';
import { getItemImageUrl, getItemOriginalPrice, getItemDiscountPct } from '@/types';
import type { Product, Vendor } from '@/types';

interface MenuSection {
  id: string;
  title: string;
  data: Product[];
}

export default function StoreMenuScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItemLegacy } = useCart();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [v, items] = await Promise.all([
        fetchVendorById(id || '1'),
        fetchProducts({ vendorId: id }),
      ]);
      if (!mounted) return;
      setVendor(v);
      // Group by subcategory
      const grouped = new Map<string, Product[]>();
      for (const p of items) {
        const cat = (p as any).subcategory || 'All Items';
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat)!.push(p);
      }
      const secs: MenuSection[] = Array.from(grouped.entries()).map(([cat, items]) => ({ id: cat, title: cat, data: items }));
      setSections(secs);
      if (secs.length > 0) setActiveSection(secs[0].id);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar />
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Menu</Text>
          <View style={{ width: 38 }} />
        </View>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xxxl }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>{vendor?.name ?? 'Store'} Menu</Text>
        <Pressable onPress={() => router.push('/search')} hitSlop={8}>
          <Ionicons name="search" size={20} color={Colors.text} />
        </Pressable>
      </View>

      {sections.length === 0 ? (
        <EmptyState icon="book-outline" title="No menu items" subtitle="This store hasn't added any items yet." />
      ) : (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Left: category tabs */}
          <View style={styles.sideBar}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {sections.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <Pressable
                    key={sec.id}
                    style={[styles.sideItem, isActive && styles.sideItemActive]}
                    onPress={() => setActiveSection(sec.id)}
                  >
                    {isActive && <View style={styles.sideIndicator} />}
                    <Text style={[styles.sideText, isActive && styles.sideTextActive]}>{sec.title}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Right: items in active section */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.itemsScroll}>
            <Text style={styles.sectionTitle}>{activeSection} ({sections.find(s => s.id === activeSection)?.data.length ?? 0})</Text>
            {sections.find(s => s.id === activeSection)?.data.map((p) => (
              <MenuItemRow
                key={p.id}
                product={p}
                onPress={() => router.push(`/product/${p.id}`)}
                onAdd={() => addItemLegacy(p)}
              />
            ))}
            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function MenuItemRow({ product, onPress, onAdd }: { product: Product; onPress: () => void; onAdd: () => void }) {
  const img = getItemImageUrl(product);
  const origPrice = getItemOriginalPrice(product);
  const discountPct = getItemDiscountPct(product);
  return (
    <View style={styles.menuItem}>
      <Pressable style={styles.itemInfo} onPress={onPress}>
        <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{product.description}</Text>
        <View style={styles.ratingRow}>
          <Rating value={product.rating} count={product.rating_count} size="sm" />
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {origPrice && <Text style={styles.origPrice}>${origPrice.toFixed(2)}</Text>}
          <Text style={styles.unit}> · {product.unit}</Text>
        </View>
        {discountPct > 0 && <DiscountBadge percent={discountPct} />}
      </Pressable>
      <View style={styles.itemImageWrap}>
        {img ? (
          <Image source={{ uri: img }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <MaterialCommunityIcons name="image-outline" size={24} color={Colors.textTertiary} />
          </View>
        )}
        <AddButton onPress={onAdd} style={styles.addBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  sideBar: { width: 110, backgroundColor: Colors.surface },
  sideItem: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, position: 'relative' },
  sideItemActive: { backgroundColor: Colors.surfaceAlt },
  sideIndicator: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, backgroundColor: Colors.primary, borderRadius: 2 },
  sideText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sideTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  itemsScroll: { flex: 1, padding: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  menuItem: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, padding: Spacing.md, gap: Spacing.md },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  itemDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  ratingRow: { marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  origPrice: { fontSize: FontSize.xs, color: Colors.textTertiary, textDecorationLine: 'line-through', marginLeft: Spacing.xs },
  unit: { fontSize: FontSize.xs, color: Colors.textSecondary },
  itemImageWrap: { width: 80, height: 80, borderRadius: Radius.md, backgroundColor: Colors.surfaceAlt, position: 'relative' },
  itemImage: { width: '100%', height: '100%', borderRadius: Radius.md },
  itemImagePlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  addBtn: { position: 'absolute', bottom: -8, right: -8 },
});
