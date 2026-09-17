// Pro Plan subscription screen — V4.0 port of Flutter lib/features/pro/screens/
// Matches design: Pro Plan banner + 3 plans (Monthly/Quarterly/Yearly) + features list + subscribe button.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { Button } from '@/components/ui/button';

interface Plan {
  id: 'monthly' | 'quarterly' | 'yearly';
  name: string;
  price: number;
  perPeriod: string;
  originalPrice?: number;
  discount?: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  { id: 'monthly', name: 'Monthly', price: 9.99, perPeriod: '/month' },
  { id: 'quarterly', name: 'Quarterly', price: 24.99, perPeriod: '/3 months', originalPrice: 29.97, discount: 'Save 17%', popular: true },
  { id: 'yearly', name: 'Yearly', price: 79.99, perPeriod: '/year', originalPrice: 119.88, discount: 'Save 33%' },
];

const FEATURES = [
  { icon: 'truck-fast-outline', title: 'Free Unlimited Delivery', desc: 'On all orders above $10' },
  { icon: 'pricetag-outline', title: 'Exclusive Pro Discounts', desc: 'Up to 25% off on selected items' },
  { icon: 'headset-outline', title: 'Priority Customer Support', desc: '24/7 dedicated Pro support line' },
  { icon: 'calendar-outline', title: 'Scheduled Deliveries', desc: 'Plan orders up to 7 days in advance' },
  { icon: 'gift-outline', title: 'Welcome Bonus', desc: 'Get $10 wallet credit on signup' },
  { icon: 'star-outline', title: '2x Loyalty Points', desc: 'Earn double points on every order' },
];

export default function ProScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan['id']>('quarterly');

  const handleSubscribe = () => {
    Alert.alert(
      'Subscribe to Pro Plan',
      `You're subscribing to the ${PLANS.find(p => p.id === selectedPlan)?.name} plan. Payment will be processed via your selected method.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          Alert.alert('Welcome to Pro!', 'Your subscription is now active. Enjoy your benefits!', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Pro Plan</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="crown" size={14} color={Colors.textInverse} />
            <Text style={styles.heroBadgeText}>PRO PLAN</Text>
          </View>
          <MaterialCommunityIcons name="crown" size={80} color={Colors.textInverse} />
          <Text style={styles.heroTitle}>Unlock Premium Benefits</Text>
          <Text style={styles.heroSubtitle}>Get the most out of Customar with Pro membership</Text>
        </View>

        {/* Plans */}
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <Pressable
              key={plan.id}
              style={[styles.planCard, isSelected && styles.planCardActive, plan.popular && styles.planCardPopular]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <View style={styles.planLeft}>
                <View style={[styles.radio, isSelected && styles.radioActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View>
                  <View style={styles.planNameRow}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.popular && <View style={styles.popularBadge}><Text style={styles.popularText}>POPULAR</Text></View>}
                  </View>
                  <View style={styles.planPriceRow}>
                    <Text style={styles.planPrice}>${plan.price.toFixed(2)}</Text>
                    <Text style={styles.planPer}>{plan.perPeriod}</Text>
                    {plan.originalPrice && (
                      <Text style={styles.planOriginal}>${plan.originalPrice.toFixed(2)}</Text>
                    )}
                  </View>
                  {plan.discount && <Text style={styles.planDiscount}>{plan.discount}</Text>}
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* Features */}
        <Text style={styles.sectionTitle}>Pro Benefits</Text>
        <View style={styles.featuresCard}>
          {FEATURES.map((feat, i) => (
            <View key={feat.title} style={[styles.featureRow, i < FEATURES.length - 1 && styles.featureRowBorder]}>
              <View style={styles.featureIcon}>
                <Ionicons name={feat.icon as any} size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
          ))}
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms & Conditions. Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.
        </Text>

        <Button
          label="Subscribe Now"
          icon="star"
          size="lg"
          onPress={handleSubscribe}
          style={{ marginTop: Spacing.lg, marginBottom: Spacing.xxxl }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceAlt },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.background },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  heroCard: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg, position: 'relative' },
  heroBadge: { position: 'absolute', top: Spacing.md, right: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  heroBadgeText: { color: Colors.textInverse, fontSize: 9, fontWeight: FontWeight.bold },
  heroTitle: { color: Colors.textInverse, fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginTop: Spacing.md, textAlign: 'center' },
  heroSubtitle: { color: Colors.textInverse, opacity: 0.85, fontSize: FontSize.sm, marginTop: Spacing.xs, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  planCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 2, borderColor: 'transparent' },
  planCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  planCardPopular: { borderColor: Colors.warning },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  planNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  planName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  popularBadge: { backgroundColor: Colors.warning, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  popularText: { color: Colors.textInverse, fontSize: 9, fontWeight: FontWeight.bold },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.xs, marginTop: 4 },
  planPrice: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  planPer: { fontSize: FontSize.xs, color: Colors.textSecondary },
  planOriginal: { fontSize: FontSize.xs, color: Colors.textTertiary, textDecorationLine: 'line-through', marginLeft: Spacing.xs },
  planDiscount: { fontSize: 10, color: Colors.success, fontWeight: FontWeight.bold, marginTop: 4 },
  featuresCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  featureRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  featureIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  featureDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  termsText: { fontSize: FontSize.xs, color: Colors.textTertiary, lineHeight: 18, marginTop: Spacing.sm },
});
