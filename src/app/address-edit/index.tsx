// Address edit / add screen — form for editing/adding an address.

import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddressEditScreen() {
  const router = useRouter();
  const [label, setLabel] = useState('Home');
  const [address, setAddress] = useState('');
  const [plusCode, setPlusCode] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    if (!address.trim()) {
      Alert.alert('Missing address', 'Please enter your full address.');
      return;
    }
    Alert.alert('Saved', 'Your address has been saved successfully.');
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Add Address</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Address Type</Text>
          <View style={styles.labelChips}>
            {['Home', 'Work', 'Other'].map((l) => {
              const isActive = label === l;
              return (
                <Pressable
                  key={l}
                  style={[styles.labelChip, isActive && styles.labelChipActive]}
                  onPress={() => setLabel(l)}
                >
                  <Text style={[styles.labelChipText, isActive && styles.labelChipTextActive]}>{l}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.formCard}>
          <Input
            label="Full Address"
            value={address}
            onChangeText={setAddress}
            placeholder="House no, Street, Area..."
            multiline
            numberOfLines={3}
          />
          <Input
            label="Plus Code"
            value={plusCode}
            onChangeText={setPlusCode}
            placeholder="V48M+7J3"
            icon="location-outline"
          />
          <Input
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="Siroliya"
          />
          <Input
            label="Pincode"
            value={pincode}
            onChangeText={setPincode}
            placeholder="460001"
            keyboardType="numeric"
          />
        </View>

        <Pressable style={styles.defaultRow} onPress={() => setIsDefault(!isDefault)}>
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
          <Text style={styles.defaultLabel}>Set as default address</Text>
        </Pressable>

        <Button
          label="Save Address"
          block
          size="lg"
          onPress={handleSave}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>
    </View>
  );
}

import { Pressable } from 'react-native';

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
  labelRow: {
    marginBottom: Spacing.lg,
  },
  labelText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  labelChips: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  labelChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  labelChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  labelChipText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  labelChipTextActive: {
    color: 'white',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  defaultLabel: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
});
