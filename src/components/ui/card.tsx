// Card component - simple rounded white container with optional shadow.

import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  elevation?: boolean;
}

export function Card({ children, style, padded = true, elevation = true }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevation && styles.elevation,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  padded: {
    padding: Spacing.lg,
  },
  elevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
