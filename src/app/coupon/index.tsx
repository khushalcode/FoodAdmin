// Coupon list screen — V4.0 port of Flutter lib/features/coupon/screens/coupon_screen.dart
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { useCoupons } from '@/store/coupons';
import type { Coupon } from '@/types';

export default function CouponScreen() {
  const router = useRouter();
  const { coupons, loading } = useCoupons();

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Coupons & Offers</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {coupons.length === 0 && !loading ? (
          <EmptyState icon="ticket-outline" title="No coupons available" subtitle="Check back later for new offers." />
        ) : (
          coupons.map((c) => <CouponCard key={c.id} coupon={c} onApply={() => router.push('/checkout')} />)
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function CouponCard({ coupon, onApply }: { coupon: Coupon; onApply: () => void }) {
  const discountLabel = coupon.discount_type === 'percent' ? `${coupon.discount}% OFF` : `$${coupon.discount} OFF`;
  return (
    <View style={styles.couponCard}>
      <View style={styles.couponLeft}>
        <Text style={styles.discountValue}>{discountLabel}</Text>
        <Text style={styles.couponMaxDiscount}>Max ${coupon.max_discount}</Text>
      </View>
      <View style={styles.couponDotted} />
      <View style={styles.couponRight}>
        <Text style={styles.couponTitle} numberOfLines={1}>{coupon.title}</Text>
        <Text style={styles.couponDescription} numberOfLines={2}>{coupon.description}</Text>
        <View style={styles.couponCodeRow}>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{coupon.code}</Text>
          </View>
          <Pressable style={styles.copyBtn} onPress={() => {}}>
            <Ionicons name="copy-outline" size={16} color={Colors.primary} />
          </Pressable>
        </View>
        <View style={styles.couponMeta}>
          <MaterialCommunityIcons name="clock-outline" size={12} color={Colors.textTertiary} />
          <Text style={styles.couponMetaText}>Min ${coupon.min_purchase} · Exp {new Date(coupon.end_date).toLocaleDateString()}</Text>
        </View>
        <Pressable style={styles.applyBtn} onPress={onApply}>
          <Text style={styles.applyBtnText}>Apply Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  couponCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.md, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4 },
  couponLeft: { width: 100, backgroundColor: Colors.primary, padding: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  discountValue: { color: Colors.textInverse, fontSize: FontSize.lg, fontWeight: FontWeight.bold, textAlign: 'center' },
  couponMaxDiscount: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.xs, marginTop: Spacing.xs, textAlign: 'center' },
  couponDotted: { width: 1, borderStyle: 'dashed', borderColor: Colors.border, marginVertical: Spacing.sm },
  couponRight: { flex: 1, padding: Spacing.md },
  couponTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  couponDescription: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  couponCodeRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.xs },
  codeBox: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderWidth: 1, borderColor: Colors.borderLight, borderStyle: 'dashed' },
  codeText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary, textAlign: 'center' },
  copyBtn: { padding: Spacing.xs },
  couponMeta: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: 4 },
  couponMetaText: { fontSize: 10, color: Colors.textTertiary, marginLeft: 2 },
  applyBtn: { marginTop: Spacing.md, backgroundColor: Colors.primaryLight, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center' },
  applyBtnText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
