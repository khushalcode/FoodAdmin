// Parcel screen — matches PDF page 43 design.
// "Pickup At" location header at top, category tab bar (Parcel selected),
// "Deliver To" search field, mint-green promo banner, grid of parcel type cards.

import { StyleSheet, View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { DEMO_PARCEL_CATEGORIES } from '@/data/demo-data';

const TABS = ['Grocery', 'Pharmacy', 'Shop', 'Food', 'Parcel', 'Rental'];

export default function ParcelScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Parcel</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Pickup At location */}
        <Pressable style={styles.locationCard}>
          <View style={styles.locationLeft}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <View>
              <Text style={styles.locationLabel}>PICKUP AT</Text>
              <Text style={styles.locationValue} numberOfLines={1}>Choose pickup location</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
        </Pressable>

        {/* Category tab bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map((t) => {
            const isActive = t === 'Parcel';
            return (
              <Pressable key={t} style={[styles.tab, isActive && styles.tabActive]}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Deliver To search */}
        <View style={styles.deliverToCard}>
          <View style={styles.deliverLeft}>
            <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>DELIVER TO</Text>
              <TextInput placeholder="Choose delivery location" style={styles.deliverInput} placeholderTextColor={Colors.textTertiary} />
            </View>
          </View>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
        </View>

        {/* Mint-green promo banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoTitle}>Send Anything, Anywhere</Text>
            <Text style={styles.promoSubtitle}>Quick and reliable parcel delivery across the city</Text>
          </View>
          <MaterialCommunityIcons name="package-variant-closed" size={48} color={Colors.textInverse} />
        </View>

        {/* Parcel type grid */}
        <View style={styles.grid}>
          {DEMO_PARCEL_CATEGORIES.map((cat) => (
            <Pressable key={cat.id} style={styles.parcelCard} onPress={() => router.push('/parcel/send')}>
              <View style={styles.parcelIconWrap}>
                <MaterialCommunityIcons name="package-variant" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.parcelName}>{cat.name}</Text>
              <Text style={styles.parcelDesc} numberOfLines={2}>{cat.description}</Text>
              <Text style={styles.parcelPrice}>From ${cat.base_price.toFixed(2)}</Text>
            </Pressable>
          ))}
          {/* Add empty placeholder cards to maintain grid layout */}
          <View style={styles.parcelCardEmpty} />
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
  locationCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  locationLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  locationValue: { fontSize: FontSize.md, color: Colors.text, marginTop: 2, fontWeight: FontWeight.medium },
  tabsRow: { paddingVertical: Spacing.sm, gap: Spacing.md },
  tab: { paddingVertical: 6, paddingHorizontal: Spacing.md, borderRadius: Radius.pill, backgroundColor: Colors.surfaceAlt },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  tabTextActive: { color: Colors.textInverse, fontWeight: FontWeight.bold },
  deliverToCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  deliverLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  deliverInput: { fontSize: FontSize.md, color: Colors.text, padding: 0, marginTop: 2 },
  promoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.md },
  promoLeft: { flex: 1 },
  promoTitle: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  promoSubtitle: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  parcelCard: { width: '48%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' },
  parcelCardEmpty: { width: '48%' },
  parcelIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  parcelName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  parcelDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  parcelPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold, marginTop: Spacing.xs },
});
