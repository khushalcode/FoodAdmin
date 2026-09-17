// Language selection screen — accessible from settings.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { LANGUAGES } from '@/constants/categories';
import { StatusBar } from '@/components/ui/status-bar';
import { BackButton } from '@/components/ui/index';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/auth';

export default function LanguageScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [selected, setSelected] = useState('en');

  const handleSave = async () => {
    await updateProfile({ preferred_language: selected });
    Alert.alert('Saved', 'Your language preference has been updated.');
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Select Language</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Choose your preferred language to use the app.</Text>

        <View style={styles.langList}>
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <Pressable
                key={lang.code}
                onPress={() => lang.available && setSelected(lang.code)}
                disabled={!lang.available}
                style={[
                  styles.langRow,
                  isSelected && styles.langRowSelected,
                  !lang.available && styles.langRowDisabled,
                ]}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={styles.langTextWrap}>
                  <Text style={styles.langLabel}>{lang.label}</Text>
                  <Text style={styles.langNative}>{lang.nativeLabel}</Text>
                </View>
                {isSelected ? (
                  <View style={styles.radioSelected}>
                    <Ionicons name="checkmark" size={14} color="white" />
                  </View>
                ) : (
                  <View style={styles.radioEmpty} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Button
          label="Save"
          block
          size="lg"
          onPress={handleSave}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
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
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  langList: {
    gap: Spacing.md,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.md,
  },
  langRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  langRowDisabled: {
    opacity: 0.4,
  },
  flag: {
    fontSize: 28,
  },
  langTextWrap: {
    flex: 1,
  },
  langLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  langNative: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
