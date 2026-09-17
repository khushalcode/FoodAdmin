// Rental screen — matches PDF page 41/42 design.
// Search bar "Choose Where To Go?" + 30% off promo banner + Browse by Categories
// (vehicle types) + blue Pro Plan subscription banner + Ready to Ride cards.

import { StyleSheet, View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { DEMO_VEHICLES } from '@/data/demo-data';
import type { Vehicle } from '@/types';

const VEHICLE_CATEGORIES = [
  { name: 'Luxury Minibus', icon: 'bus' },
  { name: 'Crossover', icon: 'car' },
  { name: 'SUV', icon: 'car-side' },
  { name: 'Sedan', icon: 'car' },
  { name: 'Bike', icon: 'motorbike' },
  { name: 'Truck', icon: 'truck' },
];

export default function RentalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Rental</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput placeholder="Choose Where To Go?" style={styles.searchInput} placeholderTextColor={Colors.textTertiary} />
        </View>

        {/* 30% off promo banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoLeft}>
            <Text style={styles.promoTitle}>30% OFF Car Rentals</Text>
            <Text style={styles.promoSubtitle}>Limited time offer — book now and save big!</Text>
          </View>
          <MaterialCommunityIcons name="car-key" size={48} color={Colors.textInverse} />
        </View>

        {/* Browse by Categories */}
        <Text style={styles.sectionTitle}>Browse by Categories</Text>
        <View style={styles.catRow}>
          {VEHICLE_CATEGORIES.map((c) => (
            <Pressable key={c.name} style={styles.catCard} onPress={() => router.push('/ride-share')}>
              <View style={styles.catIconWrap}>
                <MaterialCommunityIcons name={c.icon as any} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* Pro Plan subscription banner */}
        <View style={styles.proBanner}>
          <View style={styles.proLeft}>
            <View style={styles.proBadge}>
              <MaterialCommunityIcons name="crown" size={12} color={Colors.textInverse} />
              <Text style={styles.proBadgeText}>PRO PLAN</Text>
            </View>
            <Text style={styles.proTitle}>Subscribe & Save More</Text>
            <Text style={styles.proSubtitle}>Unlimited rides, priority booking, exclusive discounts</Text>
            <Pressable style={styles.proBtn}>
              <Text style={styles.proBtnText}>Subscribe Now</Text>
            </Pressable>
          </View>
          <MaterialCommunityIcons name="crown" size={56} color={Colors.textInverse} style={{ opacity: 0.3 }} />
        </View>

        {/* Ready to Ride */}
        <Text style={styles.sectionTitle}>Ready to Ride</Text>
        {DEMO_VEHICLES.map((v) => (
          <RentalCard key={v.id} vehicle={v} onBook={() => router.push('/ride-share/book')} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function RentalCard({ vehicle, onBook }: { vehicle: Vehicle; onBook: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onBook}>
      <View style={styles.cardImageWrap}>
        <MaterialCommunityIcons
          name={vehicle.type === 'bike' ? 'motorbike' : vehicle.type === 'car' ? 'car' : vehicle.type === 'auto' ? 'rickshaw' : 'truck'}
          size={48}
          color={Colors.primary}
        />
        {vehicle.is_top_rated && (
          <View style={styles.topRatedBadge}>
            <MaterialCommunityIcons name="star" size={9} color={Colors.textInverse} />
            <Text style={styles.topRatedText}>TOP RATED</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1, padding: Spacing.md }}>
        <Text style={styles.name}>{vehicle.name}</Text>
        <Text style={styles.brand}>{vehicle.brand} · {vehicle.model}</Text>
        <View style={styles.specRow}>
          <View style={styles.spec}><Ionicons name="people" size={11} color={Colors.textSecondary} /><Text style={styles.specText}>{vehicle.seats} seats</Text></View>
          {vehicle.ac && <View style={styles.spec}><Ionicons name="snow" size={11} color={Colors.textSecondary} /><Text style={styles.specText}>AC</Text></View>}
          <View style={styles.spec}><Ionicons name="star" size={11} color={Colors.star} /><Text style={styles.specText}>{vehicle.rating} ({vehicle.rating_count})</Text></View>
        </View>
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>${vehicle.base_price.toFixed(2)}</Text>
            <Text style={styles.priceMeta}>+ ${vehicle.per_km_price.toFixed(2)}/km</Text>
          </View>
          <Pressable style={styles.bookBtn} onPress={onBook}>
            <Text style={styles.bookBtnText}>Book Now</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, marginBottom: Spacing.md },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text, padding: 0 },
  promoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.md },
  promoLeft: { flex: 1 },
  promoTitle: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  promoSubtitle: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginTop: 4 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.lg },
  catCard: { width: '33%', alignItems: 'center', marginBottom: Spacing.md },
  catIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catName: { fontSize: FontSize.xs, color: Colors.text, fontWeight: FontWeight.medium, textAlign: 'center' },
  proBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.info, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.md, overflow: 'hidden' },
  proLeft: { flex: 1 },
  proBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  proBadgeText: { color: Colors.textInverse, fontSize: 9, fontWeight: FontWeight.bold },
  proTitle: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: Spacing.xs },
  proSubtitle: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginTop: 4, marginBottom: Spacing.md },
  proBtn: { backgroundColor: Colors.textInverse, borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, alignSelf: 'flex-start' },
  proBtnText: { color: Colors.info, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  card: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden' },
  cardImageWrap: { width: 120, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  topRatedBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.warning, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  topRatedText: { color: Colors.textInverse, fontSize: 8, fontWeight: FontWeight.bold },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  brand: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  specRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xs },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  specText: { fontSize: 10, color: Colors.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: Spacing.sm },
  price: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  priceMeta: { fontSize: 10, color: Colors.textTertiary },
  bookBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
  bookBtnText: { color: Colors.textInverse, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
