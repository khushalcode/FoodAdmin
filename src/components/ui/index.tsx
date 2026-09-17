// Reusable components: Rating, DiscountBadge, VerifiedBadge, SectionHeader, etc.

import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';

// Star rating display: ★ 4.5 (32)
export function Rating({ value, count, size = 'md' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  const fontSize = size === 'sm' ? FontSize.xs : FontSize.sm;
  return (
    <View style={styles.ratingRow}>
      <Ionicons name="star" size={size === 'sm' ? 11 : 13} color={Colors.star} />
      <Text style={[styles.ratingText, { fontSize }]}>{value.toFixed(1)}</Text>
      {count !== undefined && <Text style={[styles.ratingCount, { fontSize }]}>({count})</Text>}
    </View>
  );
}

// Discount badge: "-45.0%"
export function DiscountBadge({ percent, style }: { percent: number; style?: any }) {
  if (!percent || percent <= 0) return null;
  return (
    <View style={[styles.discountBadge, style]}>
      <Text style={styles.discountText}>-{(percent * 100).toFixed(1)}%</Text>
    </View>
  );
}

// Verified blue checkmark circle
export function VerifiedBadge({ size = 14 }: { size?: number }) {
  return (
    <View style={[styles.verified, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="checkmark" size={size * 0.75} color="white" />
    </View>
  );
}

// "AD" badge for promoted listings
export function AdBadge() {
  return (
    <View style={styles.adBadge}>
      <Text style={styles.adText}>AD</Text>
    </View>
  );
}

// Heart favorite toggle button
export function FavoriteButton({ active, onPress, style }: { active: boolean; onPress?: () => void; style?: any }) {
  return (
    <PressableCircle onPress={onPress} style={[styles.favBtn, style]}>
      <Ionicons name={active ? 'heart' : 'heart-outline'} size={18} color={active ? Colors.danger : Colors.text} />
    </PressableCircle>
  );
}

// Add-to-cart small circular "+" button
export function AddButton({ onPress, style }: { onPress?: () => void; style?: any }) {
  return (
    <PressableCircle onPress={onPress} style={[styles.addBtn, style]}>
      <Ionicons name="add" size={20} color={Colors.text} />
    </PressableCircle>
  );
}

// Back button (circular light gray with arrow)
export function BackButton({ onPress, style }: { onPress?: () => void; style?: any }) {
  return (
    <PressableCircle onPress={onPress} style={[styles.backBtn, style]}>
      <Ionicons name="chevron-back" size={20} color={Colors.text} />
    </PressableCircle>
  );
}

// Close button (circular with X)
export function CloseButton({ onPress, style }: { onPress?: () => void; style?: any }) {
  return (
    <PressableCircle onPress={onPress} style={[styles.backBtn, style]}>
      <Ionicons name="close" size={18} color={Colors.text} />
    </PressableCircle>
  );
}

// Section header with title + optional "See All" link
export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
  style,
}: {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: any;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <PressableText onPress={onActionPress} label={actionLabel} />
      ) : null}
    </View>
  );
}

// Delivery time pill (clock icon + "20-30 min")
export function DeliveryTimePill({ minutes, distanceKm }: { minutes: string; distanceKm?: number }) {
  return (
    <View style={styles.deliveryRow}>
      <MaterialCommunityIcons name="clock-outline" size={12} color={Colors.textSecondary} />
      <Text style={styles.deliveryText}>
        {minutes}
        {distanceKm !== undefined ? ` (${distanceKm.toFixed(1)} km)` : ''}
      </Text>
    </View>
  );
}

// Empty state component
export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.empty}>
      <MaterialCommunityIcons name={icon} size={56} color={Colors.textTertiary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={styles.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// --- Helpers ---
import { Pressable } from 'react-native';
function PressableCircle({ children, onPress, style }: { children: React.ReactNode; onPress?: () => void; style?: any }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={({ pressed }) => [style, pressed && { opacity: 0.6 }]}>
      {children}
    </Pressable>
  );
}

function PressableText({ onPress, label }: { onPress?: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: Colors.text,
    fontWeight: FontWeight.semibold,
  },
  ratingCount: {
    color: Colors.textTertiary,
  },
  discountBadge: {
    backgroundColor: Colors.dangerBg,
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  discountText: {
    color: Colors.danger,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  verified: {
    backgroundColor: Colors.info,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  adText: {
    color: 'white',
    fontSize: 9,
    fontWeight: FontWeight.bold,
  },
  favBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    color: Colors.info,
    fontWeight: FontWeight.medium,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deliveryText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
