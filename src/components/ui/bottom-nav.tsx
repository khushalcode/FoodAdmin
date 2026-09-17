// Bottom navigation bar (floating pill style) — matches the PDF design.
// Tabs: Offers, Orders, Favourite, Profile (Home is the root, not in bottom nav).

import { StyleSheet, Pressable, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '@/constants/theme';
import { BOTTOM_TABS } from '@/constants/categories';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomNavProps {
  active: 'offers' | 'orders' | 'favourite' | 'profile';
  onNavigate: (key: 'offers' | 'orders' | 'favourite' | 'profile') => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
      <View style={styles.pill}>
        {BOTTOM_TABS.map((tab) => {
          const isActive = active === tab.key;
          const iconName = (isActive ? tab.activeIcon : tab.icon) as keyof typeof MaterialCommunityIcons.glyphMap;
          return (
            <Pressable
              key={tab.key}
              style={styles.tabBtn}
              onPress={() => onNavigate(tab.key as BottomNavProps['active'])}
              hitSlop={6}
            >
              {isActive && <View style={styles.activeIndicator} />}
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons
                  name={iconName}
                  size={22}
                  color={isActive ? Colors.primary : Colors.textTertiary}
                />
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    position: 'relative',
  },
  iconWrap: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    top: 2,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});
