// Profile screen — shows user info, stats, and menu items.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { useAuth } from '@/store/auth';

interface ProfileScreenProps {
  onTabNavigate?: (k: any) => void;
}

export function ProfileScreen({ onTabNavigate }: ProfileScreenProps) {
  const router = useRouter();
  const { session, signOut, isConfigured } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const displayName = session.user?.name || session.user?.email || session.user?.phone || 'Guest User';
  const joinedDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => onTabNavigate?.('home')} />
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>
              {session.user?.email || session.user?.phone || 'Guest account'}
            </Text>
            <Text style={styles.userJoined}>Joined: {joinedDate}</Text>
          </View>
          <Pressable onPress={() => router.push('/edit-profile')} hitSlop={8}>
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="star"
            iconColor={Colors.star}
            label="Loyalty Point"
            value={String(session.user?.loyalty_points ?? 0)}
            onPress={() => router.push('/loyalty')}
          />
          <StatCard
            icon="wallet-outline"
            iconColor={Colors.info}
            label="Wallet"
            value={`$${(session.user?.wallet_balance ?? 0).toFixed(2)}`}
            onPress={() => router.push('/wallet')}
          />
        </View>

        {/* General section */}
        <View style={styles.menuCard}>
          <Text style={styles.menuHeader}>General</Text>
          <MenuItem
            icon="create-outline"
            iconColor={Colors.info}
            label="Edit Profile"
            onPress={() => router.push('/edit-profile')}
          />
          <MenuItem
            icon="location-outline"
            iconColor={Colors.info}
            label="My Address"
            onPress={() => router.push('/address-list')}
          />
          <MenuItem
            icon="card-outline"
            iconColor={Colors.info}
            label="My Subscription"
            onPress={() => router.push('/pro')}
          />
          <MenuItem
            icon="calendar-outline"
            iconColor={Colors.info}
            label="Monthly Cart List"
            onPress={() => router.push('/cart')}
          />
          <MenuItem
            icon="settings-outline"
            iconColor={Colors.info}
            label="Settings"
            onPress={() => router.push('/settings')}
            last
          />
        </View>

        {/* Earnings section */}
        <View style={styles.menuCard}>
          <Text style={styles.menuHeader}>Earnings</Text>
          <MenuItem
            icon="gift-outline"
            iconColor={Colors.warning}
            label="Coupon"
            onPress={() => router.push('/coupon')}
          />
          <MenuItem
            icon="star-outline"
            iconColor={Colors.star}
            label="Loyalty Points"
            onPress={() => router.push('/loyalty')}
          />
          <MenuItem
            icon="wallet-outline"
            iconColor={Colors.info}
            label="My Wallet"
            onPress={() => router.push('/wallet')}
          />
          <MenuItem
            icon="share-social-outline"
            iconColor={Colors.primary}
            label="Refer & Earn"
            onPress={() => router.push('/refer-earn')}
          />
          <MenuItem
            icon="bicycle-outline"
            iconColor={Colors.primaryDark}
            label="Join as a Delivery Man"
            onPress={() => router.push('/delivery-register')}
          />
          <MenuItem
            icon="storefront-outline"
            iconColor={Colors.primaryDark}
            label="Open Vendor"
            onPress={() => router.push('/vendor-register')}
            last
          />
        </View>

        {/* Help & Support */}
        <View style={styles.menuCard}>
          <Text style={styles.menuHeader}>Help & Support</Text>
          <MenuItem
            icon="chatbubbles-outline"
            iconColor={Colors.primary}
            label="Live Chat"
            onPress={() => router.push('/chat')}
          />
          <MenuItem
            icon="headset-outline"
            iconColor={Colors.info}
            label="Help & Support"
            onPress={() => router.push('/help')}
          />
          <MenuItem
            icon="document-text-outline"
            iconColor={Colors.textSecondary}
            label="Terms & Conditions"
            onPress={() => router.push('/html/type?type=terms')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            iconColor={Colors.textSecondary}
            label="Privacy Policy"
            onPress={() => router.push('/html/type?type=privacy')}
          />
          <MenuItem
            icon="cash-outline"
            iconColor={Colors.warning}
            label="Refund Policy"
            onPress={() => router.push('/html/type?type=refund')}
            last
          />
        </View>

        {!isConfigured && (
          <View style={styles.demoBanner}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
            <Text style={styles.demoText}>
              Demo mode active. Configure Supabase to enable cloud sync, OTP, and persistent sessions.
            </Text>
          </View>
        )}

        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <Text style={styles.version}>Version 1.0.0</Text>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({
  icon,
  iconColor,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.statCard} onPress={onPress}>
      <View style={styles.statLeft}>
        <View style={[styles.statIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    </Pressable>
  );
}

function MenuItem({
  icon,
  iconColor,
  label,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      style={[styles.menuItem, last && styles.menuItemLast]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
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
    paddingTop: Spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  userEmail: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userJoined: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuHeader: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    paddingVertical: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#DBEAFE',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  demoText: {
    fontSize: FontSize.xs,
    color: Colors.info,
    flex: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.dangerBg,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  signOutText: {
    color: Colors.danger,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});
