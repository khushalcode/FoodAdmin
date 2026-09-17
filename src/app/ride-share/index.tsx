// Ride-share screen — V4.0 port of Flutter lib/features/ride_share_module/screens/
import { StyleSheet, View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, Rating } from '@/components/ui/index';
import { DEMO_VEHICLES } from '@/data/demo-data';
import type { Vehicle } from '@/types';

export default function RideShareScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Book a Ride</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputCard}>
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <TextInput placeholder="Pickup location" style={styles.input} />
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
            <TextInput placeholder="Where to?" style={styles.input} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Available Vehicles</Text>
        {DEMO_VEHICLES.map((v) => (
          <VehicleCard key={v.id} vehicle={v} onBook={() => router.push('/ride-share/book')} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

import { TextInput } from 'react-native';

function VehicleCard({ vehicle, onBook }: { vehicle: Vehicle; onBook: () => void }) {
  return (
    <Pressable style={styles.vehicleCard} onPress={onBook}>
      <View style={styles.vehicleImageWrap}>
        <MaterialCommunityIcons name={vehicle.type === 'bike' ? 'motorbike' : vehicle.type === 'car' ? 'car' : vehicle.type === 'auto' ? 'rickshaw' : 'truck'} size={36} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.vehicleHeader}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          {vehicle.is_top_rated && <View style={styles.topRatedBadge}><Text style={styles.topRatedText}>★ Top Rated</Text></View>}
        </View>
        <Text style={styles.vehicleMeta}>{vehicle.brand} · {vehicle.seats} seats{vehicle.ac ? ' · AC' : ''}</Text>
        <View style={styles.vehicleFooter}>
          <Rating value={vehicle.rating} count={vehicle.rating_count} size="sm" />
          <Text style={styles.vehiclePrice}>${vehicle.base_price.toFixed(2)} + ${vehicle.per_km_price.toFixed(2)}/km</Text>
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
  inputCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  dottedLine: { marginLeft: 5, borderLeftWidth: 1, borderStyle: 'dashed', borderColor: Colors.border, height: 16 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.md },
  vehicleImageWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vehicleName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  vehicleHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  topRatedBadge: { backgroundColor: Colors.warning, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  topRatedText: { color: Colors.textInverse, fontSize: 10, fontWeight: FontWeight.bold },
  vehicleMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  vehicleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  vehiclePrice: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
});
