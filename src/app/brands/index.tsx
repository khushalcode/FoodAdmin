// Brands screen — V4.0 port of Flutter lib/features/brands/screens/
import { StyleSheet, View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { DEMO_BRANDS } from '@/data/demo-data';

export default function BrandsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Brands</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {DEMO_BRANDS.map((brand) => (
            <Pressable key={brand.id} style={styles.card} onPress={() => router.push(`/category/${brand.name.toLowerCase()}`)}>
              <View style={styles.logoWrap}>
                {brand.image_url ? <Image source={{ uri: brand.image_url }} style={styles.logo} resizeMode="contain" /> : <Ionicons name="pricetag" size={28} color={Colors.primary} />}
              </View>
              <Text style={styles.name} numberOfLines={1}>{brand.name}</Text>
              <Text style={styles.count}>{brand.item_count} items</Text>
              {brand.is_featured && (
                <View style={styles.featuredBadge}><Text style={styles.featuredText}>★ Featured</Text></View>
              )}
            </Pressable>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center', position: 'relative' },
  logoWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  logo: { width: 60, height: 60 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  count: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  featuredBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.warning, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  featuredText: { color: Colors.textInverse, fontSize: 9, fontWeight: FontWeight.bold },
});
