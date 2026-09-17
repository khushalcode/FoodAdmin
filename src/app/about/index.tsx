// About screen — app info, terms, privacy policy.

import { StyleSheet, View, Text, ScrollView, Linking, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';

export default function AboutScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="storefront" size={56} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>Customar</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Customar is a multi-vendor marketplace that brings groceries, pharmacy, restaurants, shopping, and parcel delivery — all in one app.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <PressableRow
            icon="document-text-outline"
            label="Terms & Conditions"
            onPress={() => {}}
          />
          <PressableRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <PressableRow
            icon="cash-outline"
            label="Refund Policy"
            onPress={() => {}}
          />
          <PressableRow
            icon="star-outline"
            label="Rate Our App"
            onPress={() => {}}
          />
          <PressableRow
            icon="share-social-outline"
            label="Share App"
            onPress={() => {}}
            last
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialRow}>
            <Pressable style={[styles.socialBtn, { backgroundColor: '#1877F2' + '20' }]}>
              <Ionicons name="logo-facebook" size={22} color="#1877F2" />
            </Pressable>
            <Pressable style={[styles.socialBtn, { backgroundColor: '#E4405F' + '20' }]}>
              <Ionicons name="logo-instagram" size={22} color="#E4405F" />
            </Pressable>
            <Pressable style={[styles.socialBtn, { backgroundColor: '#1DA1F2' + '20' }]}>
              <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
            </Pressable>
            <Pressable style={[styles.socialBtn, { backgroundColor: '#FF0000' + '20' }]}>
              <Ionicons name="logo-youtube" size={22} color="#FF0000" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.copyright}>
          © 2026 Customar. All rights reserved.
        </Text>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function PressableRow({
  icon,
  label,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={Colors.info} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  appVersion: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  appDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyright: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xl,
  },
});
