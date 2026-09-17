// Order success screen — shown after placing an order.

import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { Button } from '@/components/ui/button';

export default function OrderSuccessScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={56} color="white" />
        </View>
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Thank you for your order. We'll send you a confirmation shortly. Track your order in real time from the Orders tab.
        </Text>
        <View style={styles.etaCard}>
          <MaterialCommunityIcons name="moped" size={28} color={Colors.primary} />
          <View>
            <Text style={styles.etaLabel}>Estimated delivery time</Text>
            <Text style={styles.etaValue}>30-40 minutes</Text>
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          label="Track Order"
          icon="navigate-outline"
          block
          size="lg"
          onPress={() => router.replace('/(tabs)/orders')}
          style={{ marginBottom: Spacing.md }}
        />
        <Button
          label="Continue Shopping"
          variant="outline"
          block
          size="lg"
          onPress={() => router.replace('/(tabs)/home')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 20,
    paddingHorizontal: Spacing.xl,
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xl,
  },
  etaLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  etaValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
  },
  actions: {
    paddingBottom: Spacing.xxxl,
  },
});
