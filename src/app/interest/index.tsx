// Interest selection screen — V4.0 port of Flutter lib/features/interest/screens/interest_screen.dart
// Shown during onboarding: user picks product categories they're interested in.
// Matches Flutter: grid of interest cards with checkmarks + Save button.

import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { StatusBar } from '@/components/ui/status-bar';
import { Button } from '@/components/ui/button';

interface InterestOption {
  id: string;
  name: string;
  icon: string;
  bg: string;
  color: string;
}

const INTERESTS: InterestOption[] = [
  { id: 'fruits_veg', name: 'Fruits & Vegetables', icon: 'fruit-watermelon', bg: Colors.catGreen, color: Colors.primary },
  { id: 'dairy_eggs', name: 'Dairy & Eggs', icon: 'bottle-tonic-outline', bg: Colors.catYellow, color: '#F59E0B' },
  { id: 'meat_fish', name: 'Meat & Fish', icon: 'food-drumstick', bg: Colors.catPink, color: '#EF4444' },
  { id: 'bakery', name: 'Bakery', icon: 'bread-slice-outline', bg: Colors.catOrange, color: '#F97316' },
  { id: 'beverages', name: 'Beverages', icon: 'bottle-soda-outline', bg: Colors.catBlue, color: '#3B82F6' },
  { id: 'snacks', name: 'Snacks', icon: 'cookie', bg: Colors.catYellow, color: '#EAB308' },
  { id: 'frozen', name: 'Frozen Foods', icon: 'snowflake', bg: Colors.catBlue, color: '#06B6D4' },
  { id: 'household', name: 'Household', icon: 'spray-bottle', bg: Colors.catLavender, color: '#7C3AED' },
  { id: 'personal_care', name: 'Personal Care', icon: 'shower-head', bg: Colors.catMint, color: '#10B981' },
  { id: 'baby_care', name: 'Baby Care', icon: 'baby-carriage', bg: Colors.catCream, color: '#F472B6' },
  { id: 'pet_supplies', name: 'Pet Supplies', icon: 'paw', bg: Colors.catOrange, color: '#A855F7' },
  { id: 'medicine', name: 'Medicine', icon: 'medical-bag', bg: Colors.catMint, color: '#0EA5E9' },
];

export default function InterestScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    if (selected.size === 0) {
      Alert.alert('Select Interests', 'Please pick at least one category to personalize your feed.');
      return;
    }
    // Save interests and continue
    router.replace('/(tabs)/home');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      {/* Header with skip */}
      <View style={styles.header}>
        <View style={{ width: 38 }} />
        <Text style={styles.headerTitle}>Your Interests</Text>
        <Pressable onPress={handleSkip} hitSlop={8}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          <MaterialCommunityIcons name="heart-outline" size={56} color={Colors.primary} />
          <Text style={styles.heroTitle}>Personalize Your Experience</Text>
          <Text style={styles.heroSubtitle}>
            Select categories you're interested in. We'll show you more of what you love.
          </Text>
        </View>

        {/* Interest grid */}
        <View style={styles.grid}>
          {INTERESTS.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <Pressable
                key={item.id}
                style={[styles.interestCard, isSelected && styles.interestCardActive]}
                onPress={() => toggle(item.id)}
              >
                <View style={[styles.interestIcon, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.interestName} numberOfLines={2}>{item.name}</Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={10} color={Colors.textInverse} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.selectedCount}>
          {selected.size} {selected.size === 1 ? 'interest' : 'interests'} selected
        </Text>

        <Button
          label="Save & Continue"
          icon="checkmark-circle-outline"
          size="lg"
          onPress={handleSave}
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
  skipText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  heroWrap: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.md },
  heroTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.md, textAlign: 'center' },
  heroSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center', lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  interestCard: { width: '31%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center', position: 'relative', borderWidth: 2, borderColor: 'transparent' },
  interestCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  interestIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  interestName: { fontSize: FontSize.xs, color: Colors.text, fontWeight: FontWeight.medium, textAlign: 'center' },
  checkBadge: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  selectedCount: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});
