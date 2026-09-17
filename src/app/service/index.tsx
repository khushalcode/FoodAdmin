// Service screen — V4.0 port of Flutter lib/features/service_module/screens/
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, Rating } from '@/components/ui/index';
import { DEMO_SERVICES } from '@/data/demo-data';
import type { Service } from '@/types';

export default function ServiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Home Services</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <MaterialCommunityIcons name="wrench" size={64} color={Colors.textInverse} />
          <Text style={styles.heroTitle}>Services at your doorstep</Text>
          <Text style={styles.heroSubtitle}>Cleaning, repair, salon, and more</Text>
        </View>

        <Text style={styles.sectionTitle}>Popular Services</Text>
        <View style={styles.grid}>
          {DEMO_SERVICES.map((s) => (
            <ServiceCard key={s.id} service={s} onPress={() => router.push(`/service/${s.id}`)} />
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function ServiceCard({ service, onPress }: { service: Service; onPress: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <MaterialCommunityIcons name="home-outline" size={32} color={Colors.primary} />
      </View>
      <Text style={styles.name} numberOfLines={2}>{service.name}</Text>
      <Text style={styles.category}>{service.category}</Text>
      <Text style={styles.description} numberOfLines={2}>{service.description}</Text>
      <View style={styles.footer}>
        <Rating value={service.rating} count={service.rating_count} size="sm" />
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${service.base_price.toFixed(2)}</Text>
        <Text style={styles.duration}>~{service.duration_min} min</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  heroCard: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  heroTitle: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginTop: Spacing.md, textAlign: 'center' },
  heroSubtitle: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginTop: Spacing.xs, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  imageWrap: { height: 80, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  category: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.bold, marginTop: 2 },
  description: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  footer: { marginTop: Spacing.xs },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs, alignItems: 'center' },
  price: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  duration: { fontSize: 10, color: Colors.textTertiary },
});
