// Service detail screen — V4.0 port of Flutter lib/features/service_module/screens/service_detail_screen.dart
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, Rating } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { DEMO_SERVICES } from '@/data/demo-data';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = DEMO_SERVICES.find((s) => String(s.id) === String(id));

  if (!service) {
    return (
      <View style={styles.container}>
        <StatusBar />
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Service</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.empty}><Text>Service not found.</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroImage}>
          <MaterialCommunityIcons name="home-outline" size={80} color={Colors.primary} />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.name}>{service.name}</Text>
          <View style={styles.ratingRow}>
            <Rating value={service.rating} count={service.rating_count} size="md" />
            <View style={styles.categoryBadge}><Text style={styles.categoryText}>{service.category}</Text></View>
          </View>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={20} color={Colors.primary} />
            <Text style={styles.detailLabel}>Base Price</Text>
            <Text style={styles.detailValue}>${service.base_price.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>~{service.duration_min} min</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="star-outline" size={20} color={Colors.primary} />
            <Text style={styles.detailLabel}>Rating</Text>
            <Text style={styles.detailValue}>{service.rating} ({service.rating_count})</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>What's included</Text>
        <View style={styles.includesCard}>
          <Text style={styles.includeItem}>✓ Professional service provider</Text>
          <Text style={styles.includeItem}>✓ All required tools & materials</Text>
          <Text style={styles.includeItem}>✓ Satisfaction guarantee</Text>
          <Text style={styles.includeItem}>✓ Easy rescheduling</Text>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Starting from</Text>
          <Text style={styles.bottomPrice}>${service.base_price.toFixed(2)}</Text>
        </View>
        <Button label="Book Now" icon="calendar-outline" size="lg" onPress={() => {
          Alert.alert('Booked!', 'Your service request has been submitted.', [{ text: 'OK', onPress: () => router.back() }]);
        }} style={{ flex: 1, marginLeft: Spacing.lg }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  heroImage: { height: 200, backgroundColor: Colors.primaryLight, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  infoCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  categoryBadge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  categoryText: { color: Colors.primary, fontSize: 10, fontWeight: FontWeight.bold },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.sm },
  detailCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  detailLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  detailValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  includesCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg },
  includeItem: { fontSize: FontSize.sm, color: Colors.text, paddingVertical: Spacing.xs },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  bottomPrice: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
});
