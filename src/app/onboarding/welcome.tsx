// Welcome onboarding carousel — 3 slides describing the app's value proposition.
// Uses a horizontal ScrollView with pagingEnabled (works on iOS, Android, and web).

import { useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { ONBOARDING_SLIDES } from '@/constants/categories';
import { StatusBar } from '@/components/ui/status-bar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeOnboarding() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const handleSkip = () => {
    router.replace('/auth');
  };

  const handleNext = () => {
    if (page < ONBOARDING_SLIDES.length - 1) {
      const next = page + 1;
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      setPage(next);
    } else {
      router.replace('/auth');
    }
  };

  const handleBack = () => {
    if (page > 0) {
      const prev = page - 1;
      scrollRef.current?.scrollTo({ x: prev * SCREEN_WIDTH, animated: true });
      setPage(prev);
    }
  };

  const handleScroll = (e: any) => {
    const newPage = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (newPage !== page) setPage(newPage);
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.skipWrap}>
        <Pressable onPress={handleSkip} hitSlop={10}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {ONBOARDING_SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.illustrationWrap}>
              <View style={styles.illustrationCircle}>
                <MaterialCommunityIcons
                  name={slide.illustration as any}
                  size={80}
                  color={Colors.primary}
                />
              </View>
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <Pressable onPress={handleBack} hitSlop={12} disabled={page === 0}>
          <View style={[styles.navCircle, page === 0 && styles.navCircleDisabled]}>
            <Ionicons name="arrow-back" size={20} color={page === 0 ? Colors.textTertiary : Colors.text} />
          </View>
        </Pressable>

        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === page && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable onPress={handleNext} hitSlop={12}>
          <View style={styles.navCircleActive}>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
  },
  skipWrap: {
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  illustrationWrap: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  illustrationCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  textWrap: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl + 16,
  },
  navCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navCircleDisabled: {
    backgroundColor: Colors.surfaceAlt,
  },
  navCircleActive: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 22,
  },
});
