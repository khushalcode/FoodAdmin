// Address list screen — saved delivery addresses.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton, EmptyState } from '@/components/ui/index';
import { Button } from '@/components/ui/button';

interface Address {
  id: string;
  label: string;
  full_address: string;
  plus_code?: string;
  is_default: boolean;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'a1',
    label: 'Home',
    full_address: 'V48M+7J3, Siroliya, Madhya Pradesh, India',
    plus_code: 'V48M+7J3',
    is_default: true,
  },
  {
    id: 'a2',
    label: 'Work',
    full_address: '88 Market St, Riverton, Madhya Pradesh',
    is_default: false,
  },
];

export default function AddressListScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);

  const handleSetDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })));
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setAddresses((prev) => prev.filter((a) => a.id !== id)),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 38 }} />
      </View>

      {addresses.length === 0 ? (
        <EmptyState
          icon="map-marker-off-outline"
          title="No saved addresses"
          subtitle="Add a delivery address to get started."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {addresses.map((a) => (
            <View key={a.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressIcon}>
                  <Ionicons
                    name={a.label === 'Home' ? 'home-outline' : a.label === 'Work' ? 'briefcase-outline' : 'location-outline'}
                    size={18}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.addressLabel}>{a.label}</Text>
                {a.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressText}>{a.full_address}</Text>
              <View style={styles.addressActions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => router.push(`/address-edit?id=${a.id}`)}
                >
                  <Ionicons name="create-outline" size={16} color={Colors.info} />
                  <Text style={[styles.actionText, { color: Colors.info }]}>Edit</Text>
                </Pressable>
                {!a.is_default && (
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleSetDefault(a.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
                    <Text style={[styles.actionText, { color: Colors.success }]}>Set Default</Text>
                  </Pressable>
                )}
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => handleDelete(a.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                  <Text style={[styles.actionText, { color: Colors.danger }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <Button
            label="Add New Address"
            icon="add-circle-outline"
            block
            size="lg"
            onPress={() => router.push('/address-edit')}
            style={{ marginTop: Spacing.lg }}
          />
        </ScrollView>
      )}
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
    paddingTop: Spacing.lg,
  },
  addressCard: {
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
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  defaultText: {
    color: Colors.primaryDark,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  addressText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
