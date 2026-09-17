// Input / Text Field component matching the design system.

import { StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize, FontWeight } from '@/constants/theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: string;
  helper?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  icon,
  rightIcon,
  onRightIconPress,
  error,
  helper,
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  style,
}: InputProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, !!error && styles.inputWrapError]}>
        {icon ? (
          <Ionicons name={icon} size={18} color={Colors.textTertiary} style={styles.leftIcon} />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.input, multiline && styles.multiline]}
        />
        {rightIcon ? (
          <PressableRightIcon name={rightIcon} onPress={onRightIconPress} />
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {helper && !error ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
}

import { Pressable } from 'react-native';
function PressableRightIcon({ name, onPress }: { name: keyof typeof Ionicons.glyphMap; onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8} style={styles.rightIcon}>
        <Ionicons name={name} size={18} color={Colors.textTertiary} />
      </Pressable>
    );
  }
  return (
    <View style={styles.rightIcon}>
      <Ionicons name={name} size={18} color={Colors.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  inputWrapError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerBg,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    padding: Spacing.xs,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    paddingVertical: Spacing.sm,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  helperText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
