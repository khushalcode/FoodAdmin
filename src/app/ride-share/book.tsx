// Ride booking confirmation screen
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function RideBookScreen() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet' | 'card'>('cash');

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Confirm Ride</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={80} color={Colors.primary} />
          <Text style={styles.mapText}>Map Preview</Text>
        </View>

        <View style={styles.tripCard}>
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>PICKUP</Text>
              <Text style={styles.locationValue}>123 Main Street, Springfield</Text>
            </View>
          </View>
          <View style={styles.dottedLine} />
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>DROP</Text>
              <Text style={styles.locationValue}>456 Park Ave, Riverton</Text>
            </View>
          </View>
        </View>

        <View style={styles.vehicleCard}>
          <Ionicons name="car" size={32} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.vehicleName}>Sedan Car</Text>
            <Text style={styles.vehicleMeta}>4 seats · AC · Toyota Camry</Text>
          </View>
          <Text style={styles.vehiclePrice}>$15.40</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentRow}>
          {(['cash', 'wallet', 'card'] as const).map((m) => (
            <Pressable key={m} style={[styles.paymentBtn, paymentMethod === m && styles.paymentBtnActive]} onPress={() => setPaymentMethod(m)}>
              <Ionicons name={m === 'cash' ? 'cash-outline' : m === 'wallet' ? 'wallet-outline' : 'card-outline'} size={20} color={paymentMethod === m ? Colors.textInverse : Colors.text} />
              <Text style={[styles.paymentText, paymentMethod === m && styles.paymentTextActive]}>{m === 'cash' ? 'Cash' : m === 'wallet' ? 'Wallet' : 'Card'}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.fareCard}>
          <View style={styles.fareRow}><Text style={styles.fareLabel}>Base fare</Text><Text style={styles.fareValue}>$5.00</Text></View>
          <View style={styles.fareRow}><Text style={styles.fareLabel}>Distance (5.2 km × $1.20)</Text><Text style={styles.fareValue}>$6.24</Text></View>
          <View style={styles.fareRow}><Text style={styles.fareLabel}>Service fee</Text><Text style={styles.fareValue}>$2.00</Text></View>
          <View style={styles.fareRow}><Text style={styles.fareLabel}>Discount</Text><Text style={[styles.fareValue, { color: Colors.success }]}>-$2.00</Text></View>
          <View style={styles.fareDivider} />
          <View style={styles.fareRow}><Text style={styles.fareTotalLabel}>Total</Text><Text style={styles.fareTotalValue}>$15.40</Text></View>
        </View>

        <Button label="Confirm Booking" icon="checkmark-circle-outline" size="lg" onPress={() => { router.back(); }} style={{ marginTop: Spacing.lg }} />
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
  mapPlaceholder: { height: 180, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  mapText: { color: Colors.primary, fontSize: FontSize.md, marginTop: Spacing.sm },
  tripCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  dot: { width: 12, height: 12, borderRadius: 6 },
  locationLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: FontWeight.bold },
  locationValue: { fontSize: FontSize.sm, color: Colors.text, marginTop: 2 },
  dottedLine: { marginLeft: 5, borderLeftWidth: 1, borderStyle: 'dashed', borderColor: Colors.border, height: 16 },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  vehicleName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  vehicleMeta: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  vehiclePrice: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  paymentRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  paymentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.surface, borderRadius: Radius.md, paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight },
  paymentBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  paymentText: { fontSize: FontSize.sm, color: Colors.text },
  paymentTextActive: { color: Colors.textInverse, fontWeight: FontWeight.bold },
  fareCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  fareLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  fareValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  fareDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.sm },
  fareTotalLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  fareTotalValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
});
