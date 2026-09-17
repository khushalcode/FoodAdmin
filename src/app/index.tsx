// Onboarding entry screen — language selection.
// First-time users pick their preferred language here.

import { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { LANGUAGES } from '@/constants/categories';
import { useAuth } from '@/store/auth';
import { StatusBar } from '@/components/ui/status-bar';
import { Button } from '@/components/ui/button';

export default function LanguageScreen() {
  const router = useRouter();
  const { updateProfile } = useAuth();
  const [selected, setSelected] = useState('en');

  const handleContinue = async () => {
    await updateProfile({ preferred_language: selected });
    router.replace('/onboarding/welcome');
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero illustration area */}
        <View style={styles.illustrationArea}>
          <View style={styles.illustrationCircle}>
            <LanguageIllustration />
          </View>
        </View>

        {/* White content card */}
        <View style={styles.card}>
          <Text style={styles.title}>Select Language</Text>
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

          <Button label="Continue" block size="lg" onPress={handleContinue} style={styles.continueBtn} />
        </View>
      </ScrollView>
    </View>
  );
}

// Simple illustration representing translation
function LanguageIllustration() {
  return (
    <View style={illusStyles.container}>
      <View style={illusStyles.screen}>
        <Ionicons name="sync-outline" size={48} color={Colors.primary} />
      </View>
      <View style={illusStyles.cardLeft}>
        <Text style={illusStyles.helloText}>HELLO!</Text>
      </View>
      <View style={illusStyles.cardA}>
        <Text style={illusStyles.aText}>A</Text>
      </View>
      <View style={illusStyles.cardChar}>
        <Text style={illusStyles.charText}>文</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
  },
  scroll: {
    flexGrow: 1,
  },
  illustrationArea: {
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
  },
  illustrationCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.xl,
    marginTop: Spacing.xl,
    minHeight: 460,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  langList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
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
  continueBtn: {
    marginTop: 'auto',
  },
});

const illusStyles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    width: 100,
    height: 130,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLeft: {
    position: 'absolute',
    left: 8,
    bottom: 30,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  helloText: {
    color: 'white',
    fontSize: 12,
    fontWeight: FontWeight.bold,
  },
  cardA: {
    position: 'absolute',
    right: 14,
    bottom: 30,
    backgroundColor: Colors.primaryLight,
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aText: {
    color: Colors.primaryDark,
    fontSize: 22,
    fontWeight: FontWeight.bold,
  },
  cardChar: {
    position: 'absolute',
    right: 14,
    top: 10,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charText: {
    color: 'white',
    fontSize: 22,
    fontWeight: FontWeight.bold,
  },
});
