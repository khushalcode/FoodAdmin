// Reusable Button component matching the design system.
// Variants: primary (green), secondary (mint), outline, ghost, danger.

import { StyleSheet, Pressable, ActivityIndicator, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize, FontWeight } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  block?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  block = false,
  style,
}: ButtonProps) {
  const bg = bgForVariant(variant);
  const fg = fgForVariant(variant);
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg },
        sizeStyles[size],
        isOutline && styles.outline,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        block && styles.block,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <Ionicons name={icon} size={iconSize(size)} color={fg} style={styles.iconLeft} />}
          <Text style={[styles.label, { color: fg }, sizeLabelStyles[size]]}>{label}</Text>
          {icon && iconPosition === 'right' && <Ionicons name={icon} size={iconSize(size)} color={fg} style={styles.iconRight} />}
        </View>
      )}
    </Pressable>
  );
}

function bgForVariant(v: Variant): string {
  switch (v) {
    case 'primary': return Colors.primary;
    case 'secondary': return Colors.primaryLight;
    case 'outline': return 'transparent';
    case 'ghost': return 'transparent';
    case 'danger': return Colors.danger;
    case 'dark': return Colors.text;
  }
}

function fgForVariant(v: Variant): string {
  switch (v) {
    case 'primary': return Colors.textInverse;
    case 'secondary': return Colors.primaryDark;
    case 'outline': return Colors.text;
    case 'ghost': return Colors.text;
    case 'danger': return Colors.textInverse;
    case 'dark': return Colors.textInverse;
  }
}

function iconSize(s: Size): number {
  switch (s) {
    case 'sm': return 14;
    case 'md': return 16;
    case 'lg': return 18;
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
  label: {
    fontWeight: FontWeight.semibold,
  },
  outline: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  block: {
    alignSelf: 'stretch',
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  md: {
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
});

const sizeLabelStyles = StyleSheet.create({
  sm: { fontSize: FontSize.sm },
  md: { fontSize: FontSize.md },
  lg: { fontSize: FontSize.lg },
});
