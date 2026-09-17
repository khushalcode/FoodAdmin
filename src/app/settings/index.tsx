// Settings screen — language, notifications, location, dark mode toggles.

import { StyleSheet, View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { useState } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <ToggleRow
            icon="language-outline"
            iconColor={Colors.info}
            label="Language"
            value="English"
            onPress={() => router.push('/language')}
            chevron
          />
          <ToggleRow
            icon="moon-outline"
            iconColor={Colors.text}
            label="Dark Mode"
            value="Off"
            onPress={() => {}}
            chevron
          />
          <ToggleRow
            icon="location-outline"
            iconColor={Colors.primary}
            label="Default Delivery Address"
            value="Siroliya..."
            onPress={() => router.push('/address-list')}
            chevron
            last
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SwitchRow
            icon="notifications-outline"
            iconColor={Colors.warning}
            label="Push Notifications"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SwitchRow
            icon="mail-outline"
            iconColor={Colors.info}
            label="Email Updates"
            value={emailUpdates}
            onValueChange={setEmailUpdates}
          />
          <SwitchRow
            icon="chatbubble-outline"
            iconColor={Colors.success}
            label="SMS Alerts"
            value={smsAlerts}
            onValueChange={setSmsAlerts}
            last
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <ToggleRow
            icon="shield-checkmark-outline"
            iconColor={Colors.success}
            label="App Permissions"
            onPress={() => {}}
            chevron
          />
          <ToggleRow
            icon="lock-closed-outline"
            iconColor={Colors.textSecondary}
            label="Change Password"
            onPress={() => {}}
            chevron
            last
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <ToggleRow
            icon="information-circle-outline"
            iconColor={Colors.info}
            label="About Customar"
            onPress={() => router.push('/about')}
            chevron
          />
          <ToggleRow
            icon="headset-outline"
            iconColor={Colors.primary}
            label="Help & Support"
            onPress={() => router.push('/help')}
            chevron
          />
          <ToggleRow
            icon="document-text-outline"
            iconColor={Colors.textSecondary}
            label="Terms & Privacy Policy"
            onPress={() => router.push('/about')}
            chevron
            last
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function ToggleRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  chevron,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value?: string;
  onPress: () => void;
  chevron?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>}
      {chevron && <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />}
    </Pressable>
  );
}

function SwitchRow({
  icon,
  iconColor,
  label,
  value,
  onValueChange,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor="white"
      />
    </View>
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
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  rowValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    maxWidth: 100,
  },
});
